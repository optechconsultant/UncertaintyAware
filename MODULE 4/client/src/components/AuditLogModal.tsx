import React from 'react';
import { AuditEvent } from '../types/inference';
import { Terminal, X, Download } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditEvent[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `conformalguard_audit_log_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Structured Audit Log Sink</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handleExportJSON} title="Download JSON Log File">
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Immutable event log stream tracking all pipeline actions, calibration score recalculations, and model routing.
        </div>

        <div className="code-block" style={{ maxHeight: '450px' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '1rem', borderBottom: index < logs.length - 1 ? '1px dashed var(--border-color)' : 'none', paddingBottom: '0.75rem' }}>
              <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                [{log.timestamp}] actor={log.actor} action={log.action} resource_id={log.resource_id}
              </div>
              <div style={{ color: 'var(--text-secondary)', marginLeft: '1rem', marginTop: '0.2rem' }}>
                {JSON.stringify(log.details)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
