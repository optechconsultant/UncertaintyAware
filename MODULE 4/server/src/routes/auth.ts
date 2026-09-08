import { Router, Request, Response } from 'express';
import { query } from '../db';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { requireAuth } from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

interface UserDbRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  must_change_password: boolean;
}

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await query<UserDbRow>(
      'SELECT id, email, password_hash, role, must_change_password FROM users WHERE LOWER(email) = $1 LIMIT 1;',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const passwordValid = await comparePassword(password, user.password_hash);

    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.must_change_password,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ error: 'Internal server error', message });
  }
});

// POST /auth/change-password
router.post('/change-password', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      res.status(400).json({ error: 'currentPassword and newPassword are required strings' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await query<UserDbRow>(
      'SELECT id, password_hash FROM users WHERE id = $1 LIMIT 1;',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const passwordValid = await comparePassword(currentPassword, user.password_hash);

    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid current password' });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await query(
      'UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2;',
      [newHash, userId]
    );

    res.status(200).json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to change password';
    res.status(500).json({ error: 'Internal server error', message });
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await query<UserDbRow>(
      'SELECT id, email, role, must_change_password FROM users WHERE id = $1 LIMIT 1;',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const profile = {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.must_change_password,
    };

    res.status(200).json({
      user: profile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user profile';
    res.status(500).json({ error: 'Internal server error', message });
  }
});

export default router;
