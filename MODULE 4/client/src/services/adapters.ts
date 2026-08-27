import { Module2Response } from '../types/module2';

export interface NormalizedModule2Data {
  queryId: string;
  oodStatus: 'In_domain' | 'Out_of_domain';
  decision: 'PASS' | 'REVIEW' | 'FLAG';
  modelOutput?: string;
  driftStatus: 'NO_Drift' | 'Drift';
  error?: number;
  ksDriftStatus: 'Normal' | 'Drift_alert';
}

/**
 * Normalizes raw Module 2 backend JSON into frontend-friendly camelCase properties.
 */
export const normalizeModule2Response = (
  raw: Module2Response
): NormalizedModule2Data => {
  return {
    queryId: raw.query_id,
    oodStatus: raw.OOD_status,
    decision: raw.Decision,
    modelOutput: raw.model_output,
    driftStatus: raw.Drift_Detector,
    error: raw.Error,
    ksDriftStatus: raw.KS_Drift_Detector,
  };
};
