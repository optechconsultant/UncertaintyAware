import { InferenceRequest, LLMModelType, PolicyType } from '../types/inference';
import { initialRequests } from './mockData';

const questionsPool = [
  'Analyze network packet anomaly metrics for port 8443',
  'Generate SQL query for user access audit reconciliation',
  'Validate OpenAPI specification schema for payment gateway',
  'Identify potential cross-site scripting vulnerabilities in template',
  'Summarize compliance guidelines for HIPAA patient data export',
];

/**
 * Service for handling inference requests.
 */
export const fetchInitialRequests = async (): Promise<InferenceRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(initialRequests);
    }, 300);
  });
};

export const generateMockInferenceRequest = (
  model: LLMModelType,
  policy: PolicyType
): { id: string; rawScore: number; request: Partial<InferenceRequest> } => {
  const newId = `REQ-${1047 + Math.floor(Math.random() * 8999)}`;
  const randomQ = questionsPool[Math.floor(Math.random() * questionsPool.length)];
  const rawScore = Number((0.2 + Math.random() * 0.75).toFixed(2));

  const partialReq: Partial<InferenceRequest> = {
    id: newId,
    timestamp: new Date().toTimeString().split(' ')[0],
    question: randomQ,
    nonConformityScore: rawScore,
    provenance: 'Logged',
    policy: policy,
    llmModel: model,
    executionTimeMs: Math.floor(120 + Math.random() * 140),
    fullLogs: [
      `[${new Date().toISOString()}] [Module 1] Received input payload for ${newId}`,
      `[${new Date().toISOString()}] [Module 1] Score S_i = ${rawScore}`,
    ],
  };

  return { id: newId, rawScore, request: partialReq };
};
