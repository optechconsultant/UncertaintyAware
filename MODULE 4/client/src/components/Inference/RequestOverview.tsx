import React from 'react';
import { MetricsSummary, LLMModelType } from '../../types/inference';

interface MetricsOverviewProps {
  metrics: MetricsSummary;
  onModelChange: (model: LLMModelType) => void;
}

export const RequestOverview: React.FC<MetricsOverviewProps> = ({ metrics, onModelChange }) => {
  const getDecisionClass = (decision: string) => {
    switch (decision) {
      case 'PASS':
        return 'pass';
      case 'FLAG':
        return 'flag';
      case 'REJECT':
        return 'reject';
      default:
        return 'pass';
    }
  };

  return (
    <div className="metrics-grid ">
      {/* 1. Active requests */}
      <div className="metric-card">
        <div className="metric-label">Active requests</div>
        <div className="metric-value">{metrics.activeRequests}</div>
        <div className="metric-subtext">Live requests currently in pipeline</div>
      </div>

      {/* 2. Queued requests */}
      {/* <div className="metric-card">
        <div className="metric-label">Queued requests</div>
        <div className="metric-value">{metrics.queuedRequests}</div>
        <div className="metric-subtext">Requests waiting to enter pipeline</div>
      </div> */}

      {/* 3. Current stage */}
      {/* <div className="metric-card">
        <div className="metric-label">Current stage</div>
        <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>
          {metrics.currentStage}
        </div>
        <div className="metric-subtext">Stage of selected request</div>
      </div> */}

      {/* 4. Decision */}
      {/* <div className="metric-card">
        <div className="metric-label">Decision</div>
        <div className="metric-value">
          <span className={`decision-badge ${getDecisionClass(metrics.latestDecision)}`} style={{ fontSize: '1.25rem', padding: '0.2rem 0.75rem' }}>
            {metrics.latestDecision}
          </span>
        </div>
        <div className="metric-subtext">Latest Module 2 decision</div>
      </div> */}

      {/* 5. Pass % */}
      <div className="metric-card">
        <div className="metric-label">Pass %</div>
        <div className="metric-value">{metrics.passPercentage}%</div>
        <div className="metric-subtext">Since last calibration • updates per inference</div>
      </div>

      {/* 6. Flag % */}
      <div className="metric-card">
        <div className="metric-label">Flag %</div>
        <div className="metric-value">{metrics.flagPercentage}%</div>
        <div className="metric-subtext">Since last calibration • updates per inference</div>
      </div>

      {/* 7. LLM model */}
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
