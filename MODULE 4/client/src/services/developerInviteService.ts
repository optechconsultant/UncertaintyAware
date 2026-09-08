import { apiClient } from '../lib/apiClient';

export const inviteDeveloper = async (
  email: string,
  username?: string,
  role: 'admin' | 'developer' = 'developer'
): Promise<{ success: boolean; message: string }> => {
  const res = await apiClient.inviteUser(email, username, role);
  return {
    success: res.success,
    message: res.message || `${role === 'admin' ? 'Admin' : 'Developer'} invited successfully`,
  };
};

export default inviteDeveloper;
