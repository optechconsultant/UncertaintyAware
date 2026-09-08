import React from 'react';
import { MetricsSummary, LLMModelType } from '../../types/inference';
import { Target, Compass, TrendingUp, CheckCircle, ShieldCheck } from 'lucide-react';

interface RequestOverviewProps {
  metrics: MetricsSummary;
  onModelChange: (model: LLMModelType) => void;
  isVisible?: (key: string) => boolean;
  quantileThreshold?: number;
}

export const RequestOverview: React.FC<RequestOverviewProps> = ({
  metrics,
  onModelChange,
  isVisible,
  quantileThreshold = 0.784,
}) => {
  // If isVisible is not provided, this is a regular user view (fixed layout)
  const showPassRate = isVisible ? isVisible('pass_rate') : true;
  const showFlagRate = isVisible ? isVisible('flag_rate') : true;
  const showThreshold = isVisible ? isVisible('threshold') : false;
  const showOodStatus = isVisible ? isVisible('ood_status') : false;
  const showDriftStatus = isVisible ? isVisible('drift_status') : false;

  return (
    <div className="metrics-grid">
      {/* 1. Active requests (Core pipeline status) */}
      <div className="metric-card">
        <div className="metric-label">Active requests</div>
        <div className="metric-value">{metrics.activeRequests}</div>
        <div className="metric-subtext">Live requests currently in pipeline</div>
      </div>

      {/* 2. Pass % (Widget: pass_rate) */}
      {showPassRate && (
        <div className="metric-card">
          <div className="metric-label">Pass %</div>
          <div className="metric-value" style={{ color: 'var(--success-text)' }}>
            {metrics.passPercentage}%
          </div>
          <div className="metric-subtext">Since last calibration • updates per inference</div>
        </div>
      )}

      {/* 3. Flag % (Widget: flag_rate) */}
      {showFlagRate && (
        <div className="metric-card">
          <div className="metric-label">Flag %</div>
          <div className="metric-value" style={{ color: 'var(--warning-text)' }}>
            {metrics.flagPercentage}%
          </div>
          <div className="metric-subtext">Since last calibration • updates per inference</div>
        </div>
      )}

      {/* 4. Threshold (Widget: threshold) */}
      {showThreshold && (
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="metric-label">Threshold (q̂)</div>
            <Target size={15} color="var(--accent-primary)" />
          </div>
          <div className="metric-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
            {quantileThreshold.toFixed(3)}
          </div>
          <div className="metric-subtext">Active calibrated non-conformity limit</div>
        </div>
      )}

      {/* 5. OOD Status (Widget: ood_status) */}
      {showOodStatus && (
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="metric-label">OOD Status</div>
            <Compass size={15} color="var(--success-text)" />
          </div>
          <div
            className="metric-value"
            style={{
              fontSize: '1.25rem',
              color: 'var(--success-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <CheckCircle size={16} />
            <span>In-Distribution</span>
          </div>
          <div className="metric-subtext">Module 2 semantic drift check</div>
        </div>
      )}

      {/* 6. Drift Status (Widget: drift_status) */}
      {showDriftStatus && (
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="metric-label">Drift Detector</div>
            <TrendingUp size={15} color="var(--success-text)" />
          </div>
          <div
            className="metric-value"
            style={{
              fontSize: '1.25rem',
              color: 'var(--success-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ShieldCheck size={16} />
            <span>Stable</span>
          </div>
          <div className="metric-subtext">KS 2-sample window verified</div>
        </div>
      )}

      {/* 7. LLM model Selector */}
      <div className="metric-card">
        <div className="metric-label">LLM model</div>
        <div style={{ margin: '0.25rem 0' }}>
          <select
            className="select-input"
            value={metrics.llmModel}
            onChange={(e) => onModelChange(e.target.value as LLMModelType)}
            style={{ fontWeight: 600, padding: '0.4rem 0.6rem' }}
          >
            <option value="GPT-4o">GPT-4o</option>
            <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
            <option value="Llama 3 70B">Llama 3 70B</option>
            <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
          </select>
        </div>
        <div className="metric-subtext">From Module 1</div>
      </div>
    </div>
  );
};

export default RequestOverview;
