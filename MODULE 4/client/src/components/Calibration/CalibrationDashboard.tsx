import React from 'react';
import { CalibrationParams } from '../../types/calibration';
import { CalibrationMetrics } from './CalibrationMetrics';
import { CalibrationChart } from './CalibrationChart';
import { CalibrationEvaluation } from './CalibrationEvaluation';

interface CalibrationDashboardProps {
  params: CalibrationParams;
  isRecalibrating: boolean;
  onRecalibrate: () => void;
}

export const CalibrationDashboard: React.FC<CalibrationDashboardProps> = ({
  params,
  isRecalibrating,
  onRecalibrate,
}) => {
  return (
    <div>
      <CalibrationMetrics 
        params={params} 
        processedFiles={3} 
        totalFiles={8} 
      />
      <CalibrationChart 
        params={params} 
        isRecalibrating={isRecalibrating} 
        onRecalibrateClick={onRecalibrate} 
      />
      <CalibrationEvaluation 
        params={params} 
      />
    </div>
  );
};
