import readline from 'readline';
import dotenv from 'dotenv';
import { pool, query } from '../db';
import { hashPassword } from '../utils/password';

dotenv.config();

function prompt(questionText: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(questionText, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function run(): Promise<void> {
  try {
    let email = process.env.SEED_ADMIN_EMAIL?.trim();
    let password = process.env.SEED_ADMIN_PASSWORD?.trim();

    if (!email) {
      email = await prompt('Enter Admin Email: ');
    }

    if (!password) {
      password = await prompt('Enter Admin Password: ');
    }

    if (!email || !password) {
      console.error('Error: Both email and password are required.');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('Error: Password must be at least 8 characters long.');
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase();
    const passwordHash = await hashPassword(password);

    const result = await query<{ id: string; email: string; role: string }>(
      `INSERT INTO users (email, username, password_hash, role, must_change_password)
       VALUES ($1, $2, $3, 'admin', false)
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, role = 'admin', must_change_password = false, updated_at = NOW()
       RETURNING id, email, role;`,
      [normalizedEmail, normalizedEmail.split('@')[0], passwordHash]
    );

    const createdUser = result.rows[0];
    console.log(`Admin user seeded successfully!`);
    console.log(`ID:    ${createdUser.id}`);
    console.log(`Email: ${createdUser.email}`);
    console.log(`Role:  ${createdUser.role}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed to seed admin user:', message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
