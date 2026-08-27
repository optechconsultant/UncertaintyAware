import React from 'react';
import { InferenceRequest } from '../../types/inference';
import { Terminal, ShieldCheck, ChevronRight } from 'lucide-react';

interface SelectedRequestInspectorProps {
  request: InferenceRequest;
  allRequests: InferenceRequest[];
  onSelectRequest: (reqId: string) => void;
  onOpenTrace: () => void;
  quantileThreshold: number;
}

export const DecisionSummary: React.FC<SelectedRequestInspectorProps> = ({
  request,
  allRequests,
  onSelectRequest,
  onOpenTrace,
  quantileThreshold
}) => {
  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'PASS':
        return <span className="decision-badge pass">PASS</span>;
      case 'FLAG':
        return <span className="decision-badge flag">FLAG</span>;
      case 'REJECT':
        return <span className="decision-badge reject">REJECT</span>;
      default:
        return <span className="decision-badge pass">PASS</span>;
    }
  };

  const isBelowThreshold = request.nonConformityScore <= quantileThreshold;
  const scorePct = Math.min(100, Math.round(request.nonConformityScore * 100));

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Selected request</h2>
          <div className="panel-subtitle">Detailed evaluation breakdown for active pipeline item</div>
        </div>

        {/* Request selector dropdown */}
        <select
          className="select-input"
          value={request.id}
          onChange={(e) => onSelectRequest(e.target.value)}
          style={{ width: 'auto', minWidth: '140px', fontWeight: 600 }}
        >
          {allRequests.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} ({r.decision})
            </option>
          ))}
        </select>
      </div>

      <div className="request-meta-row">
        <div className="meta-item">
          <span className="meta-label">Request ID</span>
          <span className="meta-val">{request.id}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Time</span>
          <span className="meta-val">{request.timestamp}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Execution Time</span>
          <span className="meta-val">{request.executionTimeMs} ms</span>
        </div>
      </div>

      <div className="question-box" style={{ minHeight: '92px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
          Question
        </span>
        <h3 className="question-title">{request.question}</h3>
      </div>

      <div className="details-grid">
        {/* Module 1 • Non-conformity score */}
        <div>
          <div className="detail-item-title">Module 1 • Non-conformity score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="detail-item-value">{request.nonConformityScore.toFixed(2)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Threshold q̂ = {quantileThreshold.toFixed(3)})
            </span>
          </div>
          {/* Progress bar visual */}
          <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${scorePct}%`,
                height: '100%',
                backgroundColor: isBelowThreshold ? 'var(--accent-primary)' : 'var(--warning-text)',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Module 2 • Decision */}
        <div>
          <div className="detail-item-title">Module 2 • Decision</div>
          <div>{getDecisionBadge(request.decision)}</div>
        </div>

        {/* Module 3 • Provenance */}
        <div>
          <div className="detail-item-title">Module 3 • Provenance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--success-text)" />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              {request.provenance}
            </span>
          </div>
        </div>

        {/* Policy used */}
        <div>
          <div className="detail-item-title">Policy used</div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            {request.policy}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onOpenTrace}>
          <Terminal size={14} />
          <span>View Execution Logs</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
