import { DeveloperCredentials, DeveloperSession, User } from './authTypes';
import { apiClient, getToken, setToken } from '../lib/apiClient';

export const authService = {
  login: async (credentials: DeveloperCredentials): Promise<DeveloperSession> => {
    const res = await apiClient.login(credentials.email, credentials.password || '');
    setToken(res.token);

    const user: User = {
      id: res.user.id,
      email: res.user.email,
      role: res.user.role,
      mustChangePassword: res.user.mustChangePassword,
    };

    return {
      user,
      session: {
        access_token: res.token,
        token_type: 'bearer',
        user,
      },
      authenticated: true,
      role: user.role,
      must_change_password: !!user.mustChangePassword,
    };
  },

  logout: async (): Promise<void> => {
    setToken(null);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = getToken();
    if (!token) {
      return null;
    }

    try {
      const res = await apiClient.getMe();
      return {
        id: res.user.id,
        email: res.user.email,
        role: res.user.role,
        mustChangePassword: res.user.mustChangePassword,
      };
    } catch {
      // Token is invalid, expired, or server returned an error
      setToken(null);
      return null;
    }
  },

  getSession: async (): Promise<DeveloperSession | null> => {
    const user = await authService.getCurrentUser();
    const token = getToken();

    if (!user || !token) {
      return null;
    }

    return {
      user,
      session: {
        access_token: token,
        token_type: 'bearer',
        user,
      },
      authenticated: true,
      role: user.role,
      must_change_password: !!user.mustChangePassword,
    };
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.changePassword(currentPassword, newPassword);
  },

  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.requestPasswordReset(email);
    return {
      success: res.success,
      message: res.message || 'If an account with that email exists, temporary login credentials have been sent.',
    };
  },

  // Backward compatibility helper
  updatePassword: async (newPassword: string, currentPassword?: string): Promise<void> => {
    if (!currentPassword) {
      throw new Error('Current password is required to update credentials.');
    }
    await apiClient.changePassword(currentPassword, newPassword);
  },

  // Safe listener stub for legacy callers
  onAuthStateChange: (
    callback: (event: string, session: DeveloperSession | null) => void
  ) => {
    // Immediate callback with current session state
    authService.getSession().then((session) => {
      callback('INITIAL_SESSION', session);
    }).catch(() => {
      callback('INITIAL_SESSION', null);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },
};

export default authService;
