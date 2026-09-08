import React from 'react';
import { WidgetContextData } from '../types/widget';
import { HelpCircle, Sparkles } from 'lucide-react';

export const CurrentAnswerWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { selectedRequest, allRequests = [], onSelectRequest } = context;

  if (!selectedRequest) {
    return (
      <div className="panel-card widget-card">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Current Model Answer</h3>
            <div className="panel-subtitle">Latest active query evaluation</div>
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
          No active request selected.
        </div>
      </div>
    );
  }

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

  return (
    <div className="panel-card widget-card">
      <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
        <div>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--accent-primary)" />
            <span>Current Answer & Decision</span>
          </h3>
          <div className="panel-subtitle">Active request payload and evaluation status</div>
        </div>

        {onSelectRequest && allRequests.length > 0 && (
          <select
            className="select-input"
            value={selectedRequest.id}
            onChange={(e) => onSelectRequest(e.target.value)}
            style={{ width: 'auto', minWidth: '130px', fontWeight: 600, fontSize: '0.8125rem' }}
          >
            {allRequests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} ({r.decision})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="question-box" style={{ minHeight: '75px', padding: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Query Payload
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {selectedRequest.id} • {selectedRequest.llmModel}
          </span>
        </div>
        <h3 className="question-title" style={{ fontSize: '0.9375rem', margin: 0 }}>
          {selectedRequest.question}
        </h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Decision: <strong>{selectedRequest.decision}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Latency: <strong>{selectedRequest.executionTimeMs}ms</strong>
          </span>
        </div>
        <div>
          {getDecisionBadge(selectedRequest.decision)}
        </div>
      </div>
    </div>
  );
};
