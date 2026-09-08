-- Migration 05: Developer Access Audit table and role indexing
CREATE TABLE IF NOT EXISTS developer_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  previous_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign key indexes to prevent table scans on joins and cascades
CREATE INDEX IF NOT EXISTS idx_developer_access_audit_target_user_id ON developer_access_audit(target_user_id);
CREATE INDEX IF NOT EXISTS idx_developer_access_audit_performed_by ON developer_access_audit(performed_by);
CREATE INDEX IF NOT EXISTS idx_developer_access_audit_created_at ON developer_access_audit(created_at DESC);

-- Index on users.role to accelerate GET /users/developers queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
