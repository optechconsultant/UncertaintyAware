export interface Module2Response {
  query_id: string;
  OOD_status: 'In_domain' | 'Out_of_domain';
  Decision: 'PASS' | 'REVIEW' | 'FLAG';
  model_output?: string;
  Drift_Detector: 'NO_Drift' | 'Drift';
  Error?: number;
  KS_Drift_Detector: 'Normal' | 'Drift_alert';
}
