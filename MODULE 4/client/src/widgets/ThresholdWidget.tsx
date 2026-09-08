import React from 'react';
import { WidgetContextData } from '../types/widget';
import { Target } from 'lucide-react';

export const ThresholdWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { quantileThreshold = 0.784, calibrationParams } = context;
  const coveragePct = calibrationParams
    ? Math.round((1 - calibrationParams.alpha) * 100)
    : 95;

  return (
    <div className="metric-card widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="metric-label">Threshold (q̂)</div>
        <Target size={16} color="var(--accent-primary)" />
      </div>
      <div className="metric-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
        {quantileThreshold.toFixed(3)}
      </div>
      <div className="metric-subtext">
        Target coverage: <strong>{coveragePct}%</strong> • 1-α target
      </div>
    </div>
  );
};
