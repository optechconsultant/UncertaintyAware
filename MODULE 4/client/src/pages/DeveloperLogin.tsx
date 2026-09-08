import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../auth/authService';

export const DeveloperLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in, redirect to dashboard or appropriate route
    let isMounted = true;
    const checkSession = async () => {
      try {
        const session = await authService.getSession();
        if (isMounted) {
          if (session?.authenticated) {
            if (session.must_change_password) {
              navigate('/developer/change-password', { replace: true });
            } else {
              navigate('/developer/dashboard', { replace: true });
            }
          } else {
            setIsInitializing(false);
          }
        }
      } catch {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };
    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await authService.login({ email, password });

      // Navigate to change-password if required, otherwise intended destination or dashboard
      if (session.must_change_password) {
        navigate('/developer/change-password', { replace: true });
      } else {
        // reason: React Router state can contain an untyped previous navigation path
        const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/developer/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-muted)',
        }}
      >
        Loading...
      </div>
    );
  }

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
          Developer Access
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)' }}>Password</label>
              <Link
                to="/developer/forgot-password"
                style={{
                  color: 'var(--accent-primary)',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.75rem', width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/')}
            >
              Back to Main Dashboard
            </button>
          </div>

          {error && (
            <div
              style={{
                color: '#ef4444',
                textAlign: 'center',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DeveloperLogin;
