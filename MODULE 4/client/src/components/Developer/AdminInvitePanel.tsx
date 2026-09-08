import React, { useState } from 'react';
import { inviteDeveloper } from '../../services/developerInviteService';
import { DeveloperSession } from '../../auth/authTypes';

interface AdminInvitePanelProps {
  session: DeveloperSession;
  onUserInvited?: () => void;
}

export const AdminInvitePanel: React.FC<AdminInvitePanelProps> = ({ session, onUserInvited }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'developer' | 'admin'>('developer');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Only render for admins
  if (session.role !== 'admin') {
    return null;
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await inviteDeveloper(email, username, role);
      setStatus('success');
      setMessage(res.message);
      setEmail('');
      setUsername('');
      onUserInvited?.();
    } catch (err: unknown) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while sending the invite.';
      setMessage(errorMessage);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.5rem',
      color: 'var(--text-primary)',
      gridColumn: '1 / -1' // Span full width
    }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        Admin: Invite Team Member
      </h3>
      <form onSubmit={handleInvite} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '4px'
            }}
            required
            placeholder="developer@example.com"
          />
        </div>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Username (Optional)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '4px'
            }}
            placeholder="johndoe"
          />
        </div>
        <div style={{ flex: '0 0 160px', minWidth: '140px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'developer' | 'admin')}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '4px'
            }}
          >
            <option value="developer">Developer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '1.75rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={status === 'loading'}
            style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
          >
            {status === 'loading' ? 'Sending...' : `Send ${role === 'admin' ? 'Admin' : 'Developer'} Invite`}
          </button>
        </div>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          borderRadius: '4px', 
          backgroundColor: status === 'success' ? 'var(--success-bg)' : '#fef2f2',
          color: status === 'success' ? 'var(--success-text)' : '#ef4444',
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};
