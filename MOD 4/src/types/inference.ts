export type DecisionType = 'PASS' | 'FLAG' | 'REJECT';
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

export interface CalibrationSample {
  id: string;
  category: 'Safety & Bio' | 'Code Generation' | 'Financial & Legal' | 'General Knowledge' | 'Medical QA';
  prompt: string;
  score: number;
  quantileRank: number;
  inConformalSet: boolean;
  status: 'Passed' | 'Flagged' | 'Rejected';
}

export interface DomainCoverageMetric {
  domain: string;
  sampleCount: number;
  targetCoverage: number;
  achievedCoverage: number;
  avgSetSize: number;
}

export interface CalibrationParams {
  alpha: number;
  calibrationSetSize: number;
  scoreFunction: 'Softmax Uncertainty' | 'Cosine Distance' | 'Perplexity Delta' | 'Ensemble Variance';
  policy: PolicyType;
  quantileThreshold: number;
  empiricalCoverage: number;
  avgSetSize: number;
  temperatureScaling: number;
  riskMetric: 'Misclassification Rate' | 'False Positive Rate' | 'Bounded Loss' | 'FDR Control';
  passPct: number;
  flagPct: number;
  rejectPct: number;
}

export interface AuditEvent {
  timestamp: string;
  actor: string;
  action: string;
  resource_id: string;
  details: Record<string, unknown>;
}

