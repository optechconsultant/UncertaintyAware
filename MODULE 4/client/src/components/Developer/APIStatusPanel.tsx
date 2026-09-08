import React from 'react';

export const APIStatusPanel: React.FC = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.5rem',
      color: 'var(--text-primary)'
    }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>API & Backend Status</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>API Connectivity:</span>
          <span style={{ color: 'var(--success-text)' }}>Connected</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Module 1 Node:</span>
          <span style={{ color: 'var(--success-text)' }}>Online</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Module 2 Node:</span>
          <span style={{ color: 'var(--success-text)' }}>Online</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Module 3 DB:</span>
          <span style={{ color: 'var(--success-text)' }}>Connected</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Last Error:</span>
          <span style={{ color: 'var(--text-muted)' }}>None</span>
        </div>
      </div>
    </div>
  );
};
