import React from 'react';
import { InferenceRequest } from '../types/inference';
import { Terminal, X } from 'lucide-react';

interface ExecutionTraceModalProps {
  isOpen: boolean;
  request: InferenceRequest | null;
  onClose: () => void;
}

export const ExecutionTraceModal: React.FC<ExecutionTraceModalProps> = ({ isOpen, request, onClose }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} color="var(--accent-primary)" />
              Execution Trace Logs - {request.id}
            </h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Model: {request.llmModel} • Latency: {request.executionTimeMs}ms • Policy: {request.policy}
            </div>
          </div>

          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={16} />
          </button>
        </div>

        <div className="code-block" style={{ maxHeight: '420px', lineHeight: '1.7' }}>
          {request.fullLogs && request.fullLogs.length > 0 ? (
            request.fullLogs.map((line, idx) => (
              <div key={idx} style={{ color: line.includes('PASS') ? 'var(--success-text)' : line.includes('FLAG') || line.includes('REJECT') ? 'var(--warning-text)' : 'inherit' }}>
                {line}
              </div>
            ))
          ) : (
            <div>[No extended log payload attached for this item]</div>
          )}
        </div>
      </div>
    </div>
  );
};
