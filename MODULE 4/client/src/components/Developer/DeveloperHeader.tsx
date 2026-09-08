import React from 'react';
import { DeveloperSession } from '../../auth/authTypes';

interface DeveloperHeaderProps {
  session: DeveloperSession;
  onLogout: () => void;
}

export const DeveloperHeader: React.FC<DeveloperHeaderProps> = ({ session, onLogout }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Developer Dashboard</h1>
        <div style={{ color: 'var(--text-secondary)' }}>Developer: {session.user?.email || 'Unknown'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>Role: {session.role}</div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => window.location.href = '/'} className="btn-secondary">
          Back to App
        </button>
        <button onClick={onLogout} className="btn-primary">
          Logout
        </button>
      </div>
    </header>
  );
};
