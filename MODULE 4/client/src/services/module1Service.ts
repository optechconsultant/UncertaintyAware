import { Module1Response } from '../types/module1';
import { authService } from '../auth/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const fetchModule1Data = async (queryId: string, query: string, modelOutput: string): Promise<Module1Response> => {
  const session = await authService.getSession();
  const token = session?.session?.access_token || '';

  const response = await fetch(`${API_BASE_URL}/module1/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query_id: queryId,
      query,
      model_output: modelOutput
    })
  });

  if (!response.ok) {
    throw new Error(`Module 1 API error: ${response.statusText}`);
  }

  return response.json();
};
