import { useEffect, useState, useCallback } from 'react';
import { apiClient, getToken } from '../lib/apiClient';

export function useDeveloperWidgetPreferences() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setPreferences({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getWidgetPreferences();
      setPreferences(res.preferences || {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch widget preferences';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  /**
   * Determines if a widget should be rendered on this developer's dashboard.
   * By default, all registered widgets are visible (true) unless explicitly toggled off (false).
   */
  const isVisible = useCallback(
    (widgetKey: string): boolean => {
      if (preferences[widgetKey] !== undefined) {
        return preferences[widgetKey];
      }
      return true;
    },
    [preferences]
  );

  /**
   * Sets or updates visibility for a specific widget for the current developer.
   * Optimistically updates local state before persisting to backend.
   */
  const setVisible = async (widgetKey: string, visible: boolean): Promise<void> => {
    setError(null);

    // Optimistic update
    setPreferences((prev) => ({
      ...prev,
      [widgetKey]: visible,
    }));

    try {
      await apiClient.setWidgetPreference(widgetKey, visible);
    } catch (err: unknown) {
      // Rollback on failure
      const msg = err instanceof Error ? err.message : 'Failed to update widget preference';
      setError(msg);
      await fetchPreferences();
      throw err;
    }
  };

  /**
   * Resets all personal widget preferences for the current developer,
   * restoring all widgets to default-visible (true).
   */
  const resetAll = async (): Promise<void> => {
    setError(null);

    // Optimistic clear
    setPreferences({});

    try {
      await apiClient.resetWidgetPreferences();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset widget preferences';
      setError(msg);
      await fetchPreferences();
      throw err;
    }
  };

  return {
    preferences,
    isVisible,
    setVisible,
    resetAll,
    loading,
    error,
    refetch: fetchPreferences,
  };
}

export default useDeveloperWidgetPreferences;
