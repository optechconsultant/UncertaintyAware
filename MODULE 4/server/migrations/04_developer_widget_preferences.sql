-- Drop the old end-user-facing widget config system entirely
DROP TABLE IF EXISTS user_widget_overrides;
DROP TABLE IF EXISTS dashboard_widget_config;

-- New: per-developer personal dashboard preferences
CREATE TABLE IF NOT EXISTS developer_widget_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  widget_key TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (developer_id, widget_key)
);

DROP TRIGGER IF EXISTS update_developer_widget_preferences_updated_at ON developer_widget_preferences;
CREATE TRIGGER update_developer_widget_preferences_updated_at
BEFORE UPDATE ON developer_widget_preferences
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
