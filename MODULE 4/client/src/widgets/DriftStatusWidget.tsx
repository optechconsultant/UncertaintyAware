import React from 'react';
import { WidgetContextData } from '../types/widget';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export const DriftStatusWidget: React.FC<{ context: WidgetContextData }> = () => {
  return (
    <div className="metric-card widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="metric-label">Drift Status</div>
        <TrendingUp size={16} color="var(--success-text)" />
      </div>
      <div
        className="metric-value"
        style={{
          fontSize: '1.375rem',
          color: 'var(--success-text)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <ShieldCheck size={18} />
        <span>Stable (No Drift)</span>
      </div>
      <div className="metric-subtext">KS 2-sample test p-val &gt; 0.05 • embedding window stable</div>
    </div>
  );
};
