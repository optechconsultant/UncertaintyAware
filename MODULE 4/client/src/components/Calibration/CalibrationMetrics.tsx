import React from 'react';
import { CalibrationParams } from '../../types/calibration';

interface CalibrationMetricsProps {
  params: CalibrationParams;
  processedFiles: number;
  totalFiles: number;
}

export const CalibrationMetrics: React.FC<CalibrationMetricsProps> = ({ params, processedFiles, totalFiles }) => {
  const uploadPct = Math.round((processedFiles / totalFiles) * 100);

  return (
    <div>
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="metric-card">
          <div className="metric-label">Calibration status</div>
          <div className="metric-value" style={{ color: 'var(--success-text)', fontSize: '1.5rem' }}>Completed</div>
          <div className="metric-subtext">Locked / completed / recalibration</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">q̂</div>
          <div className="metric-value" style={{ fontFamily: 'var(--font-mono)' }}>{params.quantileThreshold.toFixed(3)}</div>
          <div className="metric-subtext">Calibrated threshold</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">α</div>
          <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>{params.alpha.toFixed(2)}</div>
          <div className="metric-subtext">Configured significance level</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Drift status</div>
          <div className="metric-value" style={{ color: 'var(--text-primary)', fontSize: '1.35rem' }}>Normal</div>
          <div className="metric-subtext">Reported by Module 2</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Calibration file</div>
          <div className="metric-value" style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title="cal_scores_v4.jsonl">cal_scores_v4.jsonl</div>
          <div className="metric-subtext">Last calibrated data filename</div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Calibration file upload progress</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{processedFiles} of {totalFiles} files processed</span> ({totalFiles - processedFiles} files remaining)
          </div>
        </div>
        <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
          <div style={{ width: `${uploadPct}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
        </div>
      </div>
    </div>
  );
};
