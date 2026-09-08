CREATE TABLE IF NOT EXISTS dashboard_widget_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  screens TEXT[] NOT NULL DEFAULT '{}',
  enabled_for_users BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_dashboard_widget_config_updated_at ON dashboard_widget_config;
CREATE TRIGGER update_dashboard_widget_config_updated_at
BEFORE UPDATE ON dashboard_widget_config
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

INSERT INTO dashboard_widget_config (widget_key, label, screens, enabled_for_users) VALUES
  ('pass_rate', 'PASS Rate', '{inference}', true),
  ('flag_rate', 'FLAG Rate', '{inference}', true),
  ('current_answer', 'Current Answer', '{inference}', true),
  ('conformal_score', 'Conformal Score', '{inference}', false),
  ('ood_status', 'OOD Status', '{inference}', false),
  ('drift_status', 'Drift Status', '{calibration}', false),
  ('threshold', 'Threshold', '{calibration}', false),
  ('module_1_details', 'Module 1 Details', '{}', false),
  ('module_2_details', 'Module 2 Details', '{}', false),
  ('module_3_logs', 'Module 3 Logs', '{}', false),
  ('request_pipeline', 'Request Pipeline', '{inference}', false),
  ('calibration_status', 'Calibration Status', '{calibration}', false),
  ('last_calibrated', 'Last Calibrated', '{calibration}', false),
  ('calibration_data_filename', 'Calibration Data Filename', '{calibration}', false),
  ('q_hat', 'q̂', '{calibration}', false),
  ('theta_low', 'θ_low', '{calibration}', false),
  ('theta_high', 'θ_high', '{calibration}', false),
  ('coverage', 'Coverage', '{calibration}', false),
  ('llm_model', 'LLM Model', '{inference,calibration}', false)
ON CONFLICT (widget_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_widget_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  widget_key TEXT NOT NULL REFERENCES dashboard_widget_config(widget_key) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, widget_key)
);

DROP TRIGGER IF EXISTS update_user_widget_overrides_updated_at ON user_widget_overrides;
CREATE TRIGGER update_user_widget_overrides_updated_at
BEFORE UPDATE ON user_widget_overrides
FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
