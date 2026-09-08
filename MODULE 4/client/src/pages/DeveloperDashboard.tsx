import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../auth/authService';
import { DeveloperSession } from '../auth/authTypes';

// Developer Components
import { DeveloperHeader } from '../components/Developer/DeveloperHeader';
import { WidgetVisibilityPanel } from '../components/Developer/WidgetVisibilityPanel';
import { AdminInvitePanel } from '../components/Developer/AdminInvitePanel';
import { DeveloperAccessPanel } from '../components/Developer/DeveloperAccessPanel';
import { RequestMonitor } from '../components/Developer/RequestMonitor';
import { APIStatusPanel } from '../components/Developer/APIStatusPanel';
import { DebugPanel } from '../components/Developer/DebugPanel';

// Dynamic Preference Hook
import { useDeveloperWidgetPreferences } from '../hooks/useDeveloperWidgetPreferences';

// Telemetry Data Hooks
import { useInferenceStream } from '../hooks/useInferenceStream';
import { useCalibration } from '../hooks/useCalibration';

// Lazy-loaded modal
const ExecutionTraceModal = React.lazy(() =>
  import('../components/ExecutionTraceModal').then((module) => ({
    default: module.ExecutionTraceModal,
  }))
);

export const DeveloperDashboard: React.FC = () => {
  const [session, setSession] = useState<DeveloperSession | null>(null);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState<boolean>(false);
  const [developerRefreshKey, setDeveloperRefreshKey] = useState<number>(0);
  const navigate = useNavigate();

  // Single top-level source of truth for personal widget preferences
  const { isVisible, setVisible, resetAll, loading, error } = useDeveloperWidgetPreferences();

  // Telemetry stream for execution trace modal inspection
  const { params: calibrationParams } = useCalibration();
  const { selectedRequest } = useInferenceStream(
    true,
    calibrationParams?.quantileThreshold,
    calibrationParams?.policy,
    'GPT-4o'
  );

  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      const currentSession = await authService.getSession();
      if (isMounted) {
        setSession(currentSession);
      }
    };
    fetchSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/developer/login', { replace: true });
  };

  if (!session) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-muted)',
          fontSize: '1rem',
        }}
      >
        Loading developer workspace...
      </div>
    );
  }



  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)',
        padding: '2rem',
      }}
    >
      <DeveloperHeader session={session} onLogout={handleLogout} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Admin Invite Panel (only rendered for admin role) */}
        <AdminInvitePanel
          session={session}
          onUserInvited={() => setDeveloperRefreshKey((k) => k + 1)}
        />

        {/* Admin Developer Access Management Panel (only rendered for admin role) */}
        {session.role === 'admin' && (
          <DeveloperAccessPanel refreshTrigger={developerRefreshKey} />
        )}

        {/* Developer Personal Widget Preferences Control Panel */}
        <WidgetVisibilityPanel
          isVisible={isVisible}
          setVisible={setVisible}
          resetAll={resetAll}
          loading={loading}
          error={error}
        />

        {/* Core Developer Diagnostics & Telemetry Utilities */}
        <div style={{ marginTop: '1rem' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--text-primary)',
            }}
          >
            Pipeline Utilities &amp; Live Inspection
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            <RequestMonitor />
            <APIStatusPanel />
            <DebugPanel />
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        {isTraceModalOpen && selectedRequest && (
          <ExecutionTraceModal
            isOpen={isTraceModalOpen}
            request={selectedRequest}
            onClose={() => setIsTraceModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
};

export default DeveloperDashboard;
