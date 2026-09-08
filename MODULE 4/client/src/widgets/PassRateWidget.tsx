import React from 'react';
import { WidgetContextData } from '../types/widget';

export const PassRateWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { metrics } = context;
  const passPercentage = metrics ? metrics.passPercentage : 0;

  return (
    <div className="metric-card widget-card">
      <div className="metric-label">Pass %</div>
      <div className="metric-value" style={{ color: 'var(--success-text)' }}>
        {passPercentage}%
      </div>
      <div className="metric-subtext">Since last calibration • updates per inference</div>
    </div>
  );
};
