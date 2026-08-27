import { Module2Response } from '../types/module2';

/**
 * Simulates evaluating an inference request using Module 2.
 * In the future, this will be an actual HTTP call to the Module 2 API.
 */
export const evaluateWithModule2 = async (
  queryId: string,
  score: number,
  threshold: number
): Promise<Module2Response> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isPass = score <= threshold;
      const isFlag = !isPass && score < threshold + 0.12;

      resolve({
        query_id: queryId,
        OOD_status: 'In_domain',
        Decision: isPass ? 'PASS' : isFlag ? 'FLAG' : 'REVIEW',
        Drift_Detector: 'NO_Drift',
        KS_Drift_Detector: 'Normal',
      });
    }, 150);
  });
};
