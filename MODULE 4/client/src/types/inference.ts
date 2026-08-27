export type DecisionType = 'PASS' | 'FLAG' | 'REJECT' | 'REVIEW';
export type StageType = 'Module 1' | 'Module 2' | 'Module 3' | 'Complete';
export type PolicyType = 'Confidence Band' | 'Adaptive Prediction Set' | 'Fixed Threshold' | 'Split Conformal' | 'Regularized APS (RAPS)' | 'Conformal Risk Control (CRC)';
export type LLMModelType = 'GPT-4o' | 'Claude 3.5 Sonnet' | 'Llama 3 70B' | 'Gemini 1.5 Pro';

export interface InferenceRequest {
  id: string;
  timestamp: string;
  question: string;
  nonConformityScore: number;
  decision: DecisionType;
  stage: StageType;
  provenance: 'Logged' | 'Pending Audit' | 'Verified';
  policy: PolicyType;
  llmModel: LLMModelType;
  executionTimeMs: number;
  fullLogs?: string[];
}

export interface PipelineStageInfo {
  stageNumber: number;
  name: string;
  subtitle: string;
  status: 'complete' | 'active' | 'pending';
  description: string;
}

export interface MetricsSummary {
  activeRequests: number;
  queuedRequests: number;
  currentStage: string;
  latestDecision: DecisionType;
  passPercentage: number;
  flagPercentage: number;
  llmModel: LLMModelType;
}


export interface AuditEvent {
  timestamp: string;
  actor: string;
  action: string;
  resource_id: string;
  details: Record<string, unknown>;
}
