import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from './authService';
import { DeveloperSession } from './authTypes';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [session, setSession] = useState<DeveloperSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const currentSession = await authService.getSession();
        if (isMounted) {
          setSession(currentSession);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isLoading) {
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
        Verifying session...
      </div>
    );
  }

  // 1. Authentication Check
  if (!session || !session.authenticated) {
    return <Navigate to="/developer/login" state={{ from: location }} replace />;
  }

  // 2. Authorization Check (Role must be developer or admin)
  if (session.role !== 'developer' && session.role !== 'admin') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          You do not have developer privileges to access this area.
        </p>
        <button className="btn-secondary" onClick={() => (window.location.href = '/')}>
          Return to Main Dashboard
        </button>
      </div>
    );
  }

  // 3. Temporary Password Check
  if (session.must_change_password && location.pathname !== '/developer/change-password') {
    return <Navigate to="/developer/change-password" replace />;
  }
  if (!session.must_change_password && location.pathname === '/developer/change-password') {
    return <Navigate to="/developer/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
