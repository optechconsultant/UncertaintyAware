import { Module2Response } from '../types/module2';
import { authService } from '../auth/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const evaluateWithModule2 = async (
  queryId: string,
  query: string,
  modelOutput: string,
  score: number,
  distanceFromCentroid: number,
  oodThreshold: number,
  conformalThreshold: number
): Promise<Module2Response> => {
  const session = await authService.getSession();
  const token = session?.session?.access_token || '';

  const response = await fetch(`${API_BASE_URL}/module2/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query_id: queryId,
      query,
      model_output: modelOutput,
      conformal_score: score,
      distance_from_centroid: distanceFromCentroid,
      OOD_Threshold: oodThreshold,
      Conformal_Threshold: conformalThreshold
    })
  });

  if (!response.ok) {
    throw new Error(`Module 2 API error: ${response.statusText}`);
  }

  return response.json();
};
