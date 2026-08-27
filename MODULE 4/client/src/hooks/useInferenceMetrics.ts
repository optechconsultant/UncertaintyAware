import { useMemo } from 'react';
import { InferenceRequest, LLMModelType, DecisionType } from '../types/inference';

export const useInferenceMetrics = (
  requests: InferenceRequest[],
  selectedRequest: InferenceRequest | undefined,
  lastCalibrationTime: Date
) => {
  // Only count requests evaluated AFTER the last calibration
  const requestsSinceCalibration = useMemo(() => {
    return requests.filter(r => {
      // Create a dummy date for comparison since timestamp is just HH:MM:SS
      const reqTimeStr = r.timestamp;
      const today = new Date();
      const reqDate = new Date(`${today.toDateString()} ${reqTimeStr}`);
      return reqDate >= lastCalibrationTime;
    });
  }, [requests, lastCalibrationTime]);

  const passes = requestsSinceCalibration.filter((r) => r.decision === 'PASS').length;
  const flags = requestsSinceCalibration.filter((r) => r.decision === 'FLAG').length;
  const total = requestsSinceCalibration.length || 1;

  const metrics = useMemo(() => {
    return {
      activeRequests: requests.filter((r) => r.stage !== 'Complete').length,
      queuedRequests: 7, // Mocked queue size
      currentStage: selectedRequest ? selectedRequest.stage : 'Module 2',
      latestDecision: selectedRequest ? selectedRequest.decision : 'PASS',
      passPercentage: Number(((passes / total) * 100).toFixed(0)),
      flagPercentage: Number(((flags / total) * 100).toFixed(0)),
      llmModel: selectedRequest ? selectedRequest.llmModel : 'GPT-4o',
    };
  }, [requests, selectedRequest, passes, flags, total]);

  return metrics;
};
