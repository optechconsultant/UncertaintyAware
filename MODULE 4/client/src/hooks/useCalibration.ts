import { useState, useEffect, useCallback } from 'react';
import { CalibrationParams } from '../types/calibration';
import { fetchCalibrationParams, triggerCalibration } from '../services/calibrationService';
import { auditLogger } from '../services/auditLogger';

export const useCalibration = () => {
  const [params, setParams] = useState<CalibrationParams | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastCalibrationTime, setLastCalibrationTime] = useState<Date>(new Date());
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  useEffect(() => {
    const loadInitialParams = async () => {
      setIsLoading(true);
      const initial = await fetchCalibrationParams();
      setParams(initial);
      setLastCalibrationTime(new Date());
      setIsLoading(false);
    };
    loadInitialParams();
  }, []);

  const handleRecalibrate = useCallback(async () => {
    if (!params) return;
    setIsRecalibrating(true);
    setIsLoading(true);
    
    try {
      const updated = await triggerCalibration(params);
      setParams(updated);
      setLastCalibrationTime(new Date());

      auditLogger.log('user', 'recalibrate_conformal_threshold', 'CAL-SET-01', {
        alpha: params.alpha,
        newQuantileThreshold: updated.quantileThreshold,
        achievedCoverage: updated.empiricalCoverage,
      });
    } finally {
      setIsRecalibrating(false);
    }
  }, [params]);

  const updateParams = useCallback((newParams: Partial<CalibrationParams>) => {
    setParams((prev) => (prev ? { ...prev, ...newParams } : null));
  }, []);

  return {
    params,
    lastCalibrationTime,
    isRecalibrating,
    updateParams,
    handleRecalibrate,
  };
};
