export type DeveloperRole = 'developer' | 'admin' | 'user';

export interface DeveloperCredentials {
  email: string;
  password?: string;
}

export interface User {
  id: string;
  email: string;
  role: DeveloperRole;
  mustChangePassword?: boolean;
  username?: string;
}

export interface Session {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DeveloperProfile {
  id: string;
  email: string;
  username?: string;
  role: DeveloperRole;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeveloperSession {
  user: User | null;
  session: Session | null;
  authenticated: boolean;
  role: DeveloperRole | null;
  must_change_password: boolean;
}
