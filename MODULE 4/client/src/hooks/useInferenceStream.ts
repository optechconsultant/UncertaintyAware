import { useState, useEffect, useCallback } from 'react';
import { InferenceRequest, LLMModelType, PolicyType } from '../types/inference';
import { fetchInitialRequests, generateMockInferenceRequest } from '../services/inferenceService';
import { evaluateWithModule2 } from '../services/module2Service';
import { auditLogger } from '../services/auditLogger';
import { normalizeModule2Response } from '../services/adapters';

export const useInferenceStream = (
  isStreaming: boolean,
  quantileThreshold: number | undefined,
  policy: PolicyType | undefined,
  globalModel: LLMModelType
) => {
  const [requests, setRequests] = useState<InferenceRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('REQ-1042');

  // Load initial mocked requests
  useEffect(() => {
    const loadRequests = async () => {
      const initial = await fetchInitialRequests();
      setRequests(initial);
      if (initial.length > 0) {
        setSelectedRequestId(initial[0].id);
      }
    };
    loadRequests();
  }, []);

  // Simulates the stream of incoming inference requests and evaluating them
  useEffect(() => {
    if (!isStreaming || quantileThreshold === undefined || !policy) return;

    const interval = setInterval(async () => {
      // 1. Generate incoming request (Module 1 simulation)
      const { id, rawScore, request } = generateMockInferenceRequest(globalModel, policy);

      // 2. Evaluate with Module 2
      const rawMod2Result = await evaluateWithModule2(
        id, 
        request.question || '', 
        'Simulated model output', 
        rawScore, 
        0.4, 
        0.5, 
        quantileThreshold
      );
      const mod2Result = normalizeModule2Response(rawMod2Result);

      const isPass = mod2Result.decision === 'PASS';
      const isFlag = mod2Result.decision === 'FLAG';

      const fullRequest: InferenceRequest = {
        ...request,
        decision: mod2Result.decision,
        stage: isPass ? 'Module 2' : 'Module 1',
        fullLogs: [
          ...(request.fullLogs || []),
          `[${new Date().toISOString()}] [Module 2] Threshold test vs q_hat (${quantileThreshold.toFixed(3)}) -> ${mod2Result.decision}`,
        ],
      } as InferenceRequest;

      setRequests((prev) => [fullRequest, ...prev.slice(0, 19)]); // Keep latest 20 items

      auditLogger.log('stream_engine', 'inference_request_received', id, {
        score: rawScore,
        decision: fullRequest.decision,
        ood_status: mod2Result.oodStatus,
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming, quantileThreshold, policy, globalModel]);

  const handleSelectRequest = useCallback((reqId: string) => {
    setSelectedRequestId(reqId);
    auditLogger.log('user', 'select_request', reqId, {});
  }, []);

  const handleModelChange = useCallback((model: LLMModelType) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === selectedRequestId ? { ...r, llmModel: model } : r))
    );
    auditLogger.log('user', 'change_llm_model', selectedRequestId, { newModel: model });
  }, [selectedRequestId]);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  return {
    requests,
    selectedRequest,
    handleSelectRequest,
    handleModelChange,
  };
};
