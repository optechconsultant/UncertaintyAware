import React from 'react';
import { WidgetContextData } from '../types/widget';

export const FlagRateWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { metrics } = context;
  const flagPercentage = metrics ? metrics.flagPercentage : 0;

  return (
    <div className="metric-card widget-card">
      <div className="metric-label">Flag %</div>
      <div className="metric-value" style={{ color: 'var(--warning-text)' }}>
        {flagPercentage}%
      </div>
      <div className="metric-subtext">Since last calibration • updates per inference</div>
    </div>
  );
};
