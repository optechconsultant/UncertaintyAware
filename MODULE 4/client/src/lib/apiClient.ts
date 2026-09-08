const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface AuthUserResponse {
  id: string;
  email: string;
  role: 'admin' | 'developer' | 'user';
  mustChangePassword: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUserResponse;
}

export interface MeResponse {
  user: AuthUserResponse;
}

export interface GenericSuccessResponse {
  success: boolean;
  message?: string;
}

export interface InviteUserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    username: string | null;
    role: string;
    mustChangePassword: boolean;
    createdAt: string;
  };
  message?: string;
  warning?: string;
}

export interface WidgetPreferencesResponse {
  preferences: Record<string, boolean>;
}

export interface DeveloperUserItem {
  id: string;
  email: string;
  username: string | null;
  createdAt: string;
}

export interface DevelopersListResponse {
  developers: DeveloperUserItem[];
}

function getToken(): string | null {
  if (typeof window !== 'undefined' && window.location) {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    if (queryToken) {
      localStorage.setItem('cg_token', queryToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      return queryToken;
    }
  }
  return localStorage.getItem('cg_token');
}

function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('cg_token', token);
  } else {
    localStorage.removeItem('cg_token');
  }
}

async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // reason: response payload could be structured JSON error or null if empty
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMessage = data?.error || data?.message || `Request failed: ${res.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const apiClient = {
  // Auth endpoints
  login: (email: string, password: string): Promise<LoginResponse> =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: (): Promise<MeResponse> => apiFetch<MeResponse>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string): Promise<GenericSuccessResponse> =>
    apiFetch<GenericSuccessResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // User management endpoints
  inviteUser: (
    email: string,
    username?: string,
    role: 'admin' | 'developer' = 'developer'
  ): Promise<InviteUserResponse> =>
    apiFetch<InviteUserResponse>('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, username, role }),
    }),

  getDevelopers: (): Promise<DevelopersListResponse> =>
    apiFetch<DevelopersListResponse>('/users/developers'),

  revokeDeveloper: (userId: string): Promise<GenericSuccessResponse> =>
    apiFetch<GenericSuccessResponse>(
      `/users/${encodeURIComponent(userId)}/revoke-developer`,
      {
        method: 'POST',
      }
    ),

  requestPasswordReset: (email: string): Promise<GenericSuccessResponse> =>
    apiFetch<GenericSuccessResponse>('/users/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Developer personal widget preferences endpoints
  getWidgetPreferences: (): Promise<WidgetPreferencesResponse> =>
    apiFetch<WidgetPreferencesResponse>('/widget-preferences'),

  setWidgetPreference: (
    widgetKey: string,
    visible: boolean
  ): Promise<GenericSuccessResponse> =>
    apiFetch<GenericSuccessResponse>(
      `/widget-preferences/${encodeURIComponent(widgetKey)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ visible }),
      }
    ),

  resetWidgetPreferences: (): Promise<GenericSuccessResponse> =>
    apiFetch<GenericSuccessResponse>('/widget-preferences/reset', {
      method: 'POST',
    }),
};

export { apiFetch, getToken, setToken };
export default apiClient;
