import React from 'react';
import { WidgetContextData } from '../types/widget';
import { ShieldCheck } from 'lucide-react';

export const CoverageWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { calibrationParams } = context;
  const targetPct = calibrationParams ? Math.round((1 - calibrationParams.alpha) * 100) : 90;
  const empiricalPct = calibrationParams
    ? (calibrationParams.empiricalCoverage * 100).toFixed(1)
    : '90.2';

  return (
    <div className="metric-card widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="metric-label">Coverage Evaluation</div>
        <ShieldCheck size={16} color="var(--success-text)" />
      </div>
      <div className="metric-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--success-text)' }}>
        {empiricalPct}%
      </div>
      <div className="metric-subtext">
        Target: <strong>{targetPct}%</strong> • 1-α nominal
      </div>
    </div>
  );
};

export default CoverageWidget;
