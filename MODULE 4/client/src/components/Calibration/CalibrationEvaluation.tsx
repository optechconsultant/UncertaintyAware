import React from 'react';
import { CalibrationParams } from '../../types/calibration';

interface CalibrationEvaluationProps {
  params: CalibrationParams;
  isVisible?: (key: string) => boolean;
}

export const CalibrationEvaluation: React.FC<CalibrationEvaluationProps> = ({ params, isVisible }) => {
  const empiricalPct = (params.empiricalCoverage * 100).toFixed(1);
  const targetPct = ((1 - params.alpha) * 100).toFixed(0);

  const showCoverage = isVisible ? isVisible('coverage') : true;
  const showDrift = isVisible ? isVisible('drift_status') : true;

  if (!showCoverage && !showDrift) {
    return null;
  }

  return (
    <div
      className="dashboard-grid"
      style={{
        gridTemplateColumns: showCoverage && showDrift ? '1fr 1fr' : '1fr',
        gap: '1.5rem',
        alignItems: 'stretch',
      }}
    >
      {showCoverage && (
        <div className="panel-card">
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="panel-title">Coverage / calibration evaluation</h2>
              <div className="panel-subtitle">Use evaluation statistics available from the project</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Target coverage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>1 - α ({targetPct}%)</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Observed coverage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-text)' }}>{empiricalPct}%</div>
            </div>
          </div>

          <div style={{ background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ width: `${empiricalPct}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '5px' }} />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Placeholder visualization — replace with measured evaluation data. Calibration labels and scores can support further plots.
          </div>
        </div>
      )}

      {showDrift && (
        <div className="panel-card">
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="panel-title">Drift & recalibration</h2>
              <div className="panel-subtitle">Module 2 events + current pipeline state</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Drift status</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Normal (No drift)</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Drift type</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>None</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recalibration status</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--success-text)' }}>Up to date</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Recent events</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Timestamp • event • trigger</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>• 14:32:01 • Threshold locked • Auto-calibration trigger</div>
              <div>• 12:15:00 • Drift evaluation OK • Module 2 contract check</div>
              <div>• 09:00:00 • Data ingest complete • 1000 holdout samples loaded</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
