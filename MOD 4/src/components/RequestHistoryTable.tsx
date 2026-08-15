import React, { useState } from 'react';
import { InferenceRequest, DecisionType } from '../types/inference';
import { Search, Filter } from 'lucide-react';

interface RequestHistoryTableProps {
  requests: InferenceRequest[];
  selectedRequestId: string;
  onSelectRequest: (reqId: string) => void;
}

export const RequestHistoryTable: React.FC<RequestHistoryTableProps> = ({
  requests,
  selectedRequestId,
  onSelectRequest
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterDecision === 'ALL' || r.decision === filterDecision;
    return matchesSearch && matchesFilter;
  });

  const getDecisionBadgeClass = (d: DecisionType) => {
    switch (d) {
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
    <div className="panel-card" style={{ marginTop: '1.5rem' }}>
      <div className="panel-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="panel-title">Inference Telemetry Stream</h2>
          <div className="panel-subtitle">Live request stream and decision log history</div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem' }} />
            <input
              type="text"
              placeholder="Search request ID or question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="select-input"
              style={{ paddingLeft: '2rem', width: '220px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="select-input"
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="ALL">All Decisions</option>
              <option value="PASS">PASS Only</option>
              <option value="FLAG">FLAG Only</option>
              <option value="REJECT">REJECT Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Time</th>
              <th>Question / Payload Prompt</th>
              <th>Score (S_i)</th>
              <th>Decision</th>
              <th>Stage</th>
              <th>Model</th>
              <th>Latency</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No matching inference requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className={req.id === selectedRequestId ? 'selected' : ''}
                  onClick={() => onSelectRequest(req.id)}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{req.id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{req.timestamp}</td>
                  <td style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {req.question}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{req.nonConformityScore.toFixed(2)}</td>
                  <td>
                    <span className={`decision-badge ${getDecisionBadgeClass(req.decision)}`}>
                      {req.decision}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{req.stage}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{req.llmModel}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {req.executionTimeMs}ms
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

