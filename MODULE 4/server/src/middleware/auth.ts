import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../types/auth';
import { query } from '../db';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  req.user = decoded;
  next();
}

export function requireRole(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      // Query active role from users table to guarantee instant revocation
      const result = await query<{ role: UserRole }>(
        'SELECT role FROM users WHERE id = $1 LIMIT 1;',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Unauthorized: user account not found' });
        return;
      }

      const activeRole = result.rows[0].role;
      req.user.role = activeRole;

      if (!roles.includes(activeRole)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      next();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Role verification error';
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          actor: req.user.id,
          action: 'require_role_check_failed',
          error: message,
        })
      );
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
