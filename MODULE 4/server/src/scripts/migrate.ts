import fs from 'fs';
import path from 'path';
import { pool } from '../db';

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../../migrations/05_developer_access_audit.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Applying migration 05_developer_access_audit.sql...');
    await pool.query(sql);
    console.log('Migration 05 applied successfully.');
  } catch (err: unknown) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
