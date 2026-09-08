import { Module3Response, Module3LogEntry } from '../types/module3';
import { authService } from '../auth/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const fetchModule3Logs = async (queryId: string): Promise<{ logs: Module3LogEntry[], status: Module3Response }> => {
  const session = await authService.getSession();
  const token = session?.session?.access_token || '';

  const response = await fetch(`${API_BASE_URL}/module3/logs/${queryId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Module 3 API error: ${response.statusText}`);
  }

  return response.json();
};
