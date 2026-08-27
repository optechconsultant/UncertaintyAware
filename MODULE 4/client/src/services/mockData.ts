import { InferenceRequest } from '../types/inference';
import { CalibrationParams, CalibrationSample, DomainCoverageMetric } from '../types/calibration';
export const initialRequests: InferenceRequest[] = [
  {
    id: 'REQ-1042',
    timestamp: '14:32:01',
    question: 'What are the safety protocols for chemical handling?',
    nonConformityScore: 0.72,
    decision: 'PASS',
    stage: 'Module 2',
    provenance: 'Logged',
    policy: 'Confidence Band',
    llmModel: 'GPT-4o',
    executionTimeMs: 142,
    fullLogs: [
      '[14:32:00.812] [Module 1] Received inference payload (482 tokens)',
      '[14:32:00.910] [Module 1] Calculated raw embedding non-conformity vector score = 0.72',
      '[14:32:01.002] [Module 2] Evaluating score 0.72 against conformal quantile threshold q_hat = 0.784',
      '[14:32:01.015] [Module 2] Conformal test: 0.72 <= 0.784 -> Decision PASS (Target coverage 90%)',
      '[14:32:01.042] [Module 3] Emitted provenance log record to secure audit sink'
    ]
  },
  {
    id: 'REQ-1043',
    timestamp: '14:31:48',
    question: 'Synthesize standard procedures for high-voltage transformer maintenance',
    nonConformityScore: 0.81,
    decision: 'FLAG',
    stage: 'Module 2',
    provenance: 'Pending Audit',
    policy: 'Confidence Band',
    llmModel: 'GPT-4o',
    executionTimeMs: 185,
    fullLogs: [
      '[14:31:47.910] [Module 1] Received prompt payload (612 tokens)',
      '[14:31:48.102] [Module 1] Non-conformity score = 0.81',
      '[14:31:48.140] [Module 2] Score 0.81 exceeds threshold 0.784 -> Flagged for human verification',
      '[14:31:48.185] [Module 3] Flag event recorded. Routed to safety review queue'
    ]
  },
  {
    id: 'REQ-1044',
    timestamp: '14:31:22',
    question: 'Provide code snippet for parsing JWT tokens in Rust without validation',
    nonConformityScore: 0.94,
    decision: 'REJECT',
    stage: 'Module 1',
    provenance: 'Logged',
    policy: 'Adaptive Prediction Set',
    llmModel: 'Claude 3.5 Sonnet',
    executionTimeMs: 98,
    fullLogs: [
      '[14:31:22.012] [Module 1] Input received (128 tokens)',
      '[14:31:22.080] [Module 1] Score = 0.94. High risk non-conformity detected at pre-filter stage',
      '[14:31:22.098] [Module 1] Hard safety block triggered. Pipeline execution aborted.'
    ]
  },
  {
    id: 'REQ-1045',
    timestamp: '14:30:55',
    question: 'Summarize the Q3 financial revenue report highlights',
    nonConformityScore: 0.45,
    decision: 'PASS',
    stage: 'Complete',
    provenance: 'Logged',
    policy: 'Confidence Band',
    llmModel: 'GPT-4o',
    executionTimeMs: 210,
    fullLogs: [
      '[14:30:54.910] [Module 1] Score = 0.45',
      '[14:30:55.002] [Module 2] Conformal decision PASS',
      '[14:30:55.080] [Module 3] Provenance logged',
      '[14:30:55.120] [Module 4] Response delivered to user client'
    ]
  },
  {
    id: 'REQ-1046',
    timestamp: '14:30:10',
    question: 'Draft an email template for client onboarding welcome notes',
    nonConformityScore: 0.38,
    decision: 'PASS',
    stage: 'Complete',
    provenance: 'Logged',
    policy: 'Confidence Band',
    llmModel: 'Llama 3 70B',
    executionTimeMs: 165,
    fullLogs: [
      '[14:30:09.850] [Module 1] Score = 0.38',
      '[14:30:10.015] [Module 2] Decision PASS',
      '[14:30:10.050] [Module 3] Provenance logged',
      '[14:30:10.165] [Module 4] Response complete'
    ]
  }
];

export const initialCalibrationParams: CalibrationParams = {
  alpha: 0.10, // 90% confidence level
  calibrationSetSize: 1000,
  scoreFunction: 'Softmax Uncertainty',
  policy: 'Confidence Band',
  quantileThreshold: 0.784,
  empiricalCoverage: 0.902,
  avgSetSize: 1.18,
  temperatureScaling: 1.0,
  riskMetric: 'Misclassification Rate',
  passPct: 60.0,
  flagPct: 20.0,
  rejectPct: 20.0
};

export const initialCalibrationSamples: CalibrationSample[] = [
  {
    id: 'CAL-001',
    category: 'Safety & Bio',
    prompt: 'Determine standard operating limits for bio-containment hood airflow',
    score: 0.34,
    quantileRank: 0.28,
    inConformalSet: true,
    status: 'Passed'
  },
  {
    id: 'CAL-002',
    category: 'Safety & Bio',
    prompt: 'Instructions for handling concentrated nitric acid spills in lab',
    score: 0.72,
    quantileRank: 0.81,
    inConformalSet: true,
    status: 'Passed'
  },
  {
    id: 'CAL-003',
    category: 'Code Generation',
    prompt: 'Implement AES-256 GCM encryption wrapper in C++',
    score: 0.82,
    quantileRank: 0.89,
    inConformalSet: false,
    status: 'Flagged'
  },
  {
    id: 'CAL-004',
    category: 'Financial & Legal',
    prompt: 'Extract indemnification clause liability caps from contract PDF',
    score: 0.49,
    quantileRank: 0.52,
    inConformalSet: true,
    status: 'Passed'
  },
  {
    id: 'CAL-005',
    category: 'Medical QA',
    prompt: 'Dosage guidelines for pediatric acetaminophen administration',
    score: 0.77,
    quantileRank: 0.85,
    inConformalSet: true,
    status: 'Passed'
  },
  {
    id: 'CAL-006',
    category: 'Code Generation',
    prompt: 'Bypass CORS restriction headers on backend server script',
    score: 0.93,
    quantileRank: 0.97,
    inConformalSet: false,
    status: 'Rejected'
  },
  {
    id: 'CAL-007',
    category: 'General Knowledge',
    prompt: 'Explain the principles of quantum key distribution (QKD)',
    score: 0.29,
    quantileRank: 0.21,
    inConformalSet: true,
    status: 'Passed'
  },
  {
    id: 'CAL-008',
    category: 'Financial & Legal',
    prompt: 'Calculate effective annual interest rate given quarterly compounding',
    score: 0.41,
    quantileRank: 0.44,
    inConformalSet: true,
    status: 'Passed'
  }
];

export const initialDomainCoverage: DomainCoverageMetric[] = [
  { domain: 'Safety & Bio', sampleCount: 250, targetCoverage: 0.90, achievedCoverage: 0.908, avgSetSize: 1.12 },
  { domain: 'Code Generation', sampleCount: 300, targetCoverage: 0.90, achievedCoverage: 0.895, avgSetSize: 1.28 },
  { domain: 'Financial & Legal', sampleCount: 200, targetCoverage: 0.90, achievedCoverage: 0.915, avgSetSize: 1.15 },
  { domain: 'General Knowledge', sampleCount: 150, targetCoverage: 0.90, achievedCoverage: 0.901, avgSetSize: 1.05 },
  { domain: 'Medical QA', sampleCount: 100, targetCoverage: 0.90, achievedCoverage: 0.890, avgSetSize: 1.22 }
];

export const generateDistributionData = (threshold: number) => {
  const bins = [];
  for (let i = 0; i <= 10; i++) {
    const binMin = (i * 0.1).toFixed(1);
    const binMax = ((i + 1) * 0.1).toFixed(1);
    const center = i * 0.1 + 0.05;
    
    let count = 0;
    if (center < 0.3) count = Math.round(18 + Math.random() * 10);
    else if (center < 0.6) count = Math.round(82 + Math.random() * 20);
    else if (center < 0.8) count = Math.round(54 + Math.random() * 18);
    else count = Math.round(16 + Math.random() * 8);

    const isPassed = center <= threshold;
    bins.push({
      range: `${binMin}-${binMax}`,
      center: Number(center.toFixed(2)),
      count,
      status: isPassed ? 'Pass' : center <= threshold + 0.1 ? 'Flag' : 'Reject'
    });
  }
  return bins;
};

export const generateCoverageCurveData = () => {
  const points = [];
  for (let a = 0.01; a <= 0.30; a += 0.02) {
    const nominalCoverage = Number((1 - a).toFixed(2));
    const empiricalCoverage = Number((nominalCoverage + (Math.random() * 0.008 - 0.004)).toFixed(3));
    points.push({
      nominal: nominalCoverage,
      empirical: empiricalCoverage,
      targetLine: nominalCoverage
    });
  }
  return points;
};

export const generateSetSizeEfficiencyData = () => {
  const points = [];
  for (let a = 0.01; a <= 0.25; a += 0.02) {
    const cov = Number((1 - a).toFixed(2));
    // As coverage target increases (alpha decreases), prediction set size increases
    const avgSize = Number((1.0 + (1 - a) * 0.4 + (Math.random() * 0.02 - 0.01)).toFixed(2));
    points.push({
      coverageTarget: cov,
      avgSetSize: avgSize
    });
  }
  return points;
};
