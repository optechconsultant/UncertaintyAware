import { query } from '../db';

interface PreferenceRow {
  widget_key: string;
  visible: boolean;
}

/**
 * Retrieves stored widget visibility preferences for a specific developer.
 *
 * NOTE: The returned map contains ONLY explicit user overrides.
 * Any widget key absent from this map MUST be treated as visible (default true) by the caller.
 */
export async function getPreferences(developerId: string): Promise<Record<string, boolean>> {
  const sql = `
    SELECT widget_key, visible
    FROM developer_widget_preferences
    WHERE developer_id = $1;
  `;

  const result = await query<PreferenceRow>(sql, [developerId]);
  const preferences: Record<string, boolean> = {};

  for (const row of result.rows) {
    preferences[row.widget_key] = row.visible;
  }

  return preferences;
}

/**
 * Sets or updates a single widget visibility preference for a specific developer.
 */
export async function setPreference(
  developerId: string,
  widgetKey: string,
  visible: boolean
): Promise<void> {
  const sql = `
    INSERT INTO developer_widget_preferences (developer_id, widget_key, visible, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (developer_id, widget_key)
    DO UPDATE SET visible = EXCLUDED.visible, updated_at = NOW();
  `;

  await query(sql, [developerId, widgetKey, visible]);
}

/**
 * Resets all preferences for a developer by deleting stored preference rows,
 * reverting every widget to default-visible (true).
 */
export async function resetAllPreferences(developerId: string): Promise<void> {
  const sql = `
    DELETE FROM developer_widget_preferences
    WHERE developer_id = $1;
  `;

  await query(sql, [developerId]);
}
