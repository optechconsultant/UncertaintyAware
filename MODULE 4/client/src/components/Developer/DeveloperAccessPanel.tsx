import React, { useEffect, useState, useCallback } from 'react';
import { apiClient, DeveloperUserItem } from '../../lib/apiClient';

interface DeveloperAccessPanelProps {
  refreshTrigger?: number;
}

export const DeveloperAccessPanel: React.FC<DeveloperAccessPanelProps> = ({ refreshTrigger }) => {
  const [developers, setDevelopers] = useState<DeveloperUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal confirmation state
  const [targetUser, setTargetUser] = useState<DeveloperUserItem | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);

  const fetchDevelopers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDevelopers();
      setDevelopers(data.developers || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch developer accounts.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers, refreshTrigger]);

  const handleConfirmRevoke = async () => {
    if (!targetUser) return;

    setIsRevoking(true);
    setActionMessage(null);

    try {
      await apiClient.revokeDeveloper(targetUser.id);
      // Remove revoked developer from local list immediately
      setDevelopers((prev) => prev.filter((d) => d.id !== targetUser.id));
      setActionMessage({
        type: 'success',
        text: `Developer access revoked for ${targetUser.email}. Account downgraded to regular user.`,
      });
      setTargetUser(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to revoke developer access.';
      setActionMessage({
        type: 'error',
        text: msg,
      });
      setTargetUser(null);
    } finally {
      setIsRevoking(false);
    }
  };

  const filteredDevelopers = developers.filter((dev) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      dev.email.toLowerCase().includes(q) ||
      (dev.username && dev.username.toLowerCase().includes(q))
    );
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1.5rem',
        color: 'var(--text-primary)',
        gridColumn: '1 / -1',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            Admin: Developer Access Management
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
            }}
          >
            Accounts holding developer privileges. Revoking downgrades an account to regular user.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter developers..."
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              fontSize: '0.85rem',
            }}
          />
          <button
            onClick={fetchDevelopers}
            disabled={loading}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '4px',
            backgroundColor: actionMessage.type === 'success' ? 'var(--success-bg, #064e3b)' : '#450a0a',
            color: actionMessage.type === 'success' ? 'var(--success-text, #34d399)' : '#f87171',
            border: `1px solid ${actionMessage.type === 'success' ? '#059669' : '#ef4444'}`,
            fontSize: '0.875rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '4px',
            backgroundColor: '#450a0a',
            color: '#f87171',
            border: '1px solid #ef4444',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {loading && developers.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}
        >
          Loading developer accounts...
        </div>
      ) : filteredDevelopers.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            border: '1px dashed var(--border-color)',
            borderRadius: '6px',
          }}
        >
          {searchQuery ? 'No developers match your search.' : 'No accounts currently hold developer role.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Username</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Role</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Joined Date</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevelopers.map((dev) => (
                <tr
                  key={dev.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{dev.email}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {dev.username || '—'}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}
                    >
                      developer
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(dev.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setTargetUser(dev)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        backgroundColor: 'transparent',
                        color: '#f87171',
                        border: '1px solid #ef4444',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {targetUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isRevoking) {
              setTargetUser(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card, #1e293b)',
              border: '1px solid var(--border-color, #334155)',
              borderRadius: '8px',
              padding: '1.75rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              color: 'var(--text-primary, #f8fafc)',
            }}
          >
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.15rem', color: '#ef4444' }}>
              Revoke Developer Access
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', lineHeight: 1.5 }}>
              This will downgrade <strong>{targetUser.email}</strong> to a regular user. Continue?
            </p>
            <p
              style={{
                margin: '0 0 1.5rem 0',
                fontSize: '0.85rem',
                color: 'var(--text-secondary, #94a3b8)',
                lineHeight: 1.4,
              }}
            >
              The user will keep their login credentials but immediately lose access to developer-only
              routes and diagnostic tools on their next request.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                disabled={isRevoking}
                onClick={() => setTargetUser(null)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleConfirmRevoke}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: isRevoking ? 'not-allowed' : 'pointer',
                  opacity: isRevoking ? 0.7 : 1,
                }}
              >
                {isRevoking ? 'Revoking...' : 'Confirm Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperAccessPanel;
