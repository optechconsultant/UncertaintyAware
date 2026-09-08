import React from 'react';
import { CalibrationParams } from '../../types/calibration';
import { CalibrationMetrics } from './CalibrationMetrics';
import { CalibrationChart } from './CalibrationChart';
import { CalibrationEvaluation } from './CalibrationEvaluation';
import { useDeveloperWidgetPreferences } from '../../hooks/useDeveloperWidgetPreferences';

interface CalibrationDashboardProps {
  params: CalibrationParams;
  isRecalibrating: boolean;
  onRecalibrate: () => void;
  isDeveloper?: boolean;
}

export const CalibrationDashboard: React.FC<CalibrationDashboardProps> = ({
  params,
  isRecalibrating,
  onRecalibrate,
  isDeveloper = false,
}) => {
  const { isVisible } = useDeveloperWidgetPreferences();

  // If viewer is developer or admin, filter widgets; otherwise regular user sees hardcoded layout
  const activeIsVisible = isDeveloper ? isVisible : undefined;

  return (
    <div>
      <CalibrationMetrics 
        params={params} 
        processedFiles={3} 
        totalFiles={8} 
        isVisible={activeIsVisible}
      />
      <CalibrationChart 
        params={params} 
        isRecalibrating={isRecalibrating} 
        onRecalibrateClick={onRecalibrate} 
      />
      <CalibrationEvaluation 
        params={params} 
        isVisible={activeIsVisible}
      />
    </div>
  );
};

export default CalibrationDashboard;
