import { PolicyType } from './inference';

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
  alpha: number; // Significance level e.g. 0.10 (90% target coverage)
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
