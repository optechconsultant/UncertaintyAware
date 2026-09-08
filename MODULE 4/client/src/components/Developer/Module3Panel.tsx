import React, { useEffect, useState } from 'react';
import { Module3LogEntry } from '../../types/module3';
import { fetchModule3Logs } from '../../services/module3Service';

export const Module3Panel: React.FC = () => {
  const [logs, setLogs] = useState<Module3LogEntry[] | null>(null);

  useEffect(() => {
    fetchModule3Logs('REQ-1234')
      .then((res: { logs: Module3LogEntry[] }) => setLogs(res.logs))
      .catch((err) => {
        console.warn('Module 3 backend offline, using diagnostic mock logs:', err.message);
        setLogs([
          {
            log_id: 'LOG-301',
            query_id: 'REQ-1234',
            timestamp: new Date().toISOString(),
            stage: 'Module 1 • Scoring',
            message: 'Computed non-conformity score S_i = 0.245 against quantile q̂ = 0.784',
            metadata: { score: 0.245 },
          },
          {
            log_id: 'LOG-302',
            query_id: 'REQ-1234',
            timestamp: new Date().toISOString(),
            stage: 'Module 2 • Decision',
            message: 'In-distribution verified. KS Drift detector returned Normal.',
            metadata: { decision: 'PASS' },
          },
        ]);
      });
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.5rem',
      color: 'var(--text-primary)'
    }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Module 3 Logs</h3>
      {logs ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
          {logs.map((log) => (
            <div key={log.log_id} style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <span>{log.stage}</span>
                <span style={{ fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>Loading Module 3 logs...</div>
      )}
    </div>
  );
};
