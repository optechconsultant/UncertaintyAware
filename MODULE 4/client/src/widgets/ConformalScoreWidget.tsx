import React from 'react';
import { WidgetContextData } from '../types/widget';
import { Activity } from 'lucide-react';

export const ConformalScoreWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { selectedRequest, quantileThreshold = 0.784 } = context;

  const nonConformityScore = selectedRequest ? selectedRequest.nonConformityScore : 0.42;
  const isBelowThreshold = nonConformityScore <= quantileThreshold;
  const scorePct = Math.min(100, Math.round(nonConformityScore * 100));

  return (
    <div className="panel-card widget-card">
      <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
        <div>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="var(--accent-primary)" />
            <span>Conformal Score (S_i)</span>
          </h3>
          <div className="panel-subtitle">Non-conformity score vs calibrated threshold</div>
        </div>
        <span
          className={`decision-badge ${isBelowThreshold ? 'pass' : 'flag'}`}
          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
        >
          {isBelowThreshold ? 'CONFORMAL (IN-SET)' : 'NON-CONFORMAL'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {nonConformityScore.toFixed(3)}
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Threshold q̂ = <strong>{quantileThreshold.toFixed(3)}</strong>
        </span>
      </div>

      {/* Visual progress bar */}
      <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${scorePct}%`,
            height: '100%',
            backgroundColor: isBelowThreshold ? 'var(--accent-primary)' : 'var(--warning-text)',
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>0.0 (High confidence)</span>
        <span>1.0 (Low confidence)</span>
      </div>
    </div>
  );
};
