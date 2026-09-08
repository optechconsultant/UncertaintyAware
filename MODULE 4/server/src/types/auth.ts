export type UserRole = 'admin' | 'developer' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
