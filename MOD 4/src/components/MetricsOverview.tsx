import React from 'react';
import { MetricsSummary, LLMModelType } from '../types/inference';

interface MetricsOverviewProps {
  metrics: MetricsSummary;
  onModelChange: (model: LLMModelType) => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics, onModelChange }) => {
  return (
    <div className="metrics-grid ">
      <div className="metric-card">
        <div className="metric-label">Active requests</div>
        <div className="metric-value">{metrics.activeRequests}</div>
        <div className="metric-subtext">Live requests currently in pipeline</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Pass %</div>
        <div className="metric-value">{metrics.passPercentage}%</div>
        <div className="metric-subtext">Since last calibration • updates per inference</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Flag %</div>
        <div className="metric-value">{metrics.flagPercentage}%</div>
        <div className="metric-subtext">Since last calibration • updates per inference</div>
      </div>

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

