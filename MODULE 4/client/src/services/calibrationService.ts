import { CalibrationParams } from '../types/calibration';
import { initialCalibrationParams } from './mockData';

/**
 * Service for fetching calibration parameters and performing recalibration.
 */
export const fetchCalibrationParams = async (): Promise<CalibrationParams> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(initialCalibrationParams);
    }, 200);
  });
};

export const triggerCalibration = async (
  currentParams: CalibrationParams
): Promise<CalibrationParams> => {
  // Simulates a call to the orchestrator/Module 1 to perform calibration.
  // The frontend does NOT perform the algorithm, it just receives the updated params.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...currentParams,
        // Mocking the updated values returned by the backend after calibration
        quantileThreshold: 0.15,
        empiricalCoverage: 0.96,
        passPct: 80,
        flagPct: 15,
        rejectPct: 5,
      });
    }, 600);
  });
};
