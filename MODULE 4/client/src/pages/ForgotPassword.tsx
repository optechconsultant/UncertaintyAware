import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../auth/authService';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const result = await authService.requestPasswordReset(email);
      setStatus('success');
      setMessage(
        result.message ||
          'If an account with that email exists, temporary login credentials have been sent.'
      );
    } catch (err: unknown) {
      setStatus('error');
      setMessage(
        err instanceof Error ? err.message : 'Failed to request password reset.'
      );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
      }}
    >
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2
          style={{
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          Reset Password
        </h2>

        {status === 'success' ? (
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <p
              style={{
                color: 'var(--success-text)',
                backgroundColor: 'var(--success-bg)',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            >
              {message}
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.75rem', width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/developer/login')}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              Enter your email address and we&apos;ll send you a temporary password to access your account.
            </p>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)',
                }}
              >
                Email
              </label>
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
                  borderRadius: '4px',
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.75rem', width: '100%', justifyContent: 'center' }}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Sending...' : 'Request Temporary Password'}
              </button>

              <Link
                to="/developer/login"
                style={{
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                Back to Login
              </Link>
            </div>

            {status === 'error' && (
              <div
                style={{
                  color: '#ef4444',
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
