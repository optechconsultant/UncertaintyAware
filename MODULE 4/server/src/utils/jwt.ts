import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRole } from '../types/auth';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing.');
}

export interface JwtPayloadData {
  id: string;
  email: string;
  role: UserRole;
}

export function signToken(payload: JwtPayloadData): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }

  return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): JwtPayloadData | null {
  if (!JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'id' in decoded &&
      'email' in decoded &&
      'role' in decoded
    ) {
      const candidate = decoded as Record<string, unknown>;
      const role = candidate.role;
      if (role === 'admin' || role === 'developer' || role === 'user') {
        return {
          id: String(candidate.id),
          email: String(candidate.email),
          role,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}
