import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { pool, query } from '../db';
import { generateTempPassword, hashPassword } from '../utils/password';
import { sendTempPasswordEmail } from '../services/email';

const router = Router();

interface UserDbRow {
  id: string;
  email: string;
  username: string | null;
  role: string;
  must_change_password: boolean;
  created_at: Date;
  last_reset_requested_at: Date | null;
}

// POST /users/invite - Invite new user (admin only)
router.post(
  '/invite',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, username, role } = req.body;

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({ error: 'A valid email address is required' });
        return;
      }

      if (role !== undefined && role !== 'admin' && role !== 'developer') {
        res.status(400).json({ error: "Invalid role. Only 'admin' and 'developer' roles can be invited." });
        return;
      }

      const assignedRole: 'admin' | 'developer' = role === 'admin' ? 'admin' : 'developer';
      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existing = await query<UserDbRow>(
        'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1;',
        [normalizedEmail]
      );

      if (existing.rows.length > 0) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }

      // Generate credentials
      const tempPassword = generateTempPassword(16);
      const passwordHash = await hashPassword(tempPassword);
      const chosenUsername = username && typeof username === 'string' ? username.trim() : normalizedEmail.split('@')[0];

      // Insert new user
      const insertResult = await query<UserDbRow>(
        `INSERT INTO users (email, username, password_hash, role, must_change_password)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, email, username, role, must_change_password, created_at;`,
        [normalizedEmail, chosenUsername, passwordHash, assignedRole]
      );

      const createdUser = insertResult.rows[0];
      const userProfile = {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
        role: createdUser.role,
        mustChangePassword: createdUser.must_change_password,
        createdAt: createdUser.created_at,
      };

      // Dispatch invitation email via Brevo
      try {
        const roleLabel = assignedRole === 'admin' ? 'Admin' : 'Developer';
        await sendTempPasswordEmail(
          normalizedEmail,
          tempPassword,
          `Your ConformalGuard ${roleLabel} Access`,
          `Welcome to ConformalGuard (${roleLabel})`
        );

        res.status(201).json({
          success: true,
          user: userProfile,
          message: 'User invited successfully',
        });
      } catch (emailErr: unknown) {
        const warningMsg = emailErr instanceof Error ? emailErr.message : 'Email delivery failed';
        console.warn(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'warn',
            actor: req.user?.id || 'system',
            action: 'invite_email_failed',
            target_email: normalizedEmail,
            error: warningMsg,
          })
        );

        res.status(201).json({
          success: true,
          user: userProfile,
          warning: 'User created but email failed to send',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to invite user';
      res.status(500).json({ error: 'Internal server error', message });
    }
  }
);

// GET /users/developers - List all active accounts with role = 'developer' (admin only)
router.get(
  '/developers',
  requireAuth,
  requireRole('admin'),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await query<Pick<UserDbRow, 'id' | 'email' | 'username' | 'created_at'>>(
        `SELECT id, email, username, created_at
         FROM users
         WHERE role = 'developer'
         ORDER BY created_at ASC;`
      );

      const developers = result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        username: row.username,
        createdAt: row.created_at.toISOString(),
      }));

      res.status(200).json({ developers });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch developers';
      res.status(500).json({ error: 'Internal server error', message });
    }
  }
);

// POST /users/:userId/revoke-developer - Revoke developer access (downgrade to user) and audit (admin only)
router.post(
  '/:userId/revoke-developer',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!userId || !uuidRegex.test(userId)) {
        res.status(400).json({ error: 'A valid user ID is required' });
        return;
      }

      if (userId === req.user?.id) {
        res.status(400).json({ error: 'Admins cannot revoke developer access for their own account' });
        return;
      }

      const targetResult = await query<UserDbRow>(
        'SELECT id, email, role FROM users WHERE id = $1 LIMIT 1;',
        [userId]
      );

      if (targetResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const targetUser = targetResult.rows[0];

      if (targetUser.role !== 'developer') {
        res.status(400).json({
          error: `Cannot revoke developer access: user currently has role '${targetUser.role}', expected 'developer'`,
        });
        return;
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const updateRes = await client.query<UserDbRow>(
          `UPDATE users
           SET role = 'user', updated_at = NOW()
           WHERE id = $1 AND role = 'developer'
           RETURNING id, email, role;`,
          [userId]
        );

        if (updateRes.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(409).json({ error: 'User is no longer a developer' });
          return;
        }

        await client.query(
          `INSERT INTO developer_access_audit (target_user_id, performed_by, previous_role, new_role)
           VALUES ($1, $2, 'developer', 'user');`,
          [userId, req.user!.id]
        );

        await client.query('COMMIT');

        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            actor: req.user!.id,
            action: 'revoke_developer_access',
            resource_id: userId,
            target_email: targetUser.email,
            previous_role: 'developer',
            new_role: 'user',
          })
        );

        res.status(200).json({
          success: true,
          message: 'Developer access revoked successfully',
        });
      } catch (txErr: unknown) {
        await client.query('ROLLBACK');
        throw txErr;
      } finally {
        client.release();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to revoke developer access';
      res.status(500).json({ error: 'Internal server error', message });
    }
  }
);

// POST /users/request-password-reset - Public endpoint for password recovery
router.post('/request-password-reset', async (req: Request, res: Response): Promise<void> => {
  const genericSuccess = {
    success: true,
    message: 'If an account with that email exists, temporary login credentials have been sent.',
  };

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitSeconds = process.env.RESET_RATE_LIMIT_SECONDS
      ? parseInt(process.env.RESET_RATE_LIMIT_SECONDS, 10)
      : 60;

    // Look up user
    const result = await query<UserDbRow>(
      'SELECT id, email, last_reset_requested_at FROM users WHERE LOWER(email) = $1 LIMIT 1;',
      [normalizedEmail]
    );

   
    if (result.rows.length === 0) {
      res.status(200).json(genericSuccess);
      return;
    }

    const user = result.rows[0];

    // Check rate limit if previous reset timestamp exists
    if (user.last_reset_requested_at) {
      const lastResetTime = new Date(user.last_reset_requested_at).getTime();
      const elapsedSeconds = (Date.now() - lastResetTime) / 1000;

      if (elapsedSeconds < rateLimitSeconds) {
        const remainingSeconds = Math.ceil(rateLimitSeconds - elapsedSeconds);
        res.status(429).json({
          error: `Too many password reset requests. Please wait ${remainingSeconds} second${
            remainingSeconds === 1 ? '' : 's'
          } before trying again.`,
        });
        return;
      }
    }

    // Generate temporary password and update credentials
    const tempPassword = generateTempPassword(16);
    const passwordHash = await hashPassword(tempPassword);

    await query(
      `UPDATE users
       SET password_hash = $1, must_change_password = true, last_reset_requested_at = NOW(), updated_at = NOW()
       WHERE id = $2;`,
      [passwordHash, user.id]
    );

    // Attempt to send email via Brevo
    try {
      await sendTempPasswordEmail(
        normalizedEmail,
        tempPassword,
        'Your ConformalGuard Temporary Password',
        'Password Reset Request'
      );
    } catch (emailErr: unknown) {
      const emailErrMsg = emailErr instanceof Error ? emailErr.message : 'Email delivery error';
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          actor: 'anonymous',
          action: 'reset_email_failed',
          target_user_id: user.id,
          error: emailErrMsg,
        })
      );
    }

    // Always respond with generic success
    res.status(200).json(genericSuccess);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset request failed';
    res.status(500).json({ error: 'Internal server error', message });
  }
});

export default router;
