import React, { useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { InferenceDashboard } from './components/Inference/InferenceDashboard';
import { CalibrationDashboard } from './components/Calibration/CalibrationDashboard';
import { auditLogger } from './services/auditLogger';

// Custom Hooks
import { useTheme } from './hooks/useTheme';
import { useCalibration } from './hooks/useCalibration';
import { useInferenceStream } from './hooks/useInferenceStream';
import { useInferenceMetrics } from './hooks/useInferenceMetrics';

// Developer Mode
import { authService } from './auth/authService';
import { DeveloperLogin } from './pages/DeveloperLogin';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { AuthGuard } from './auth/AuthGuard';
import { ForgotPassword } from './pages/ForgotPassword';
import { ChangePassword } from './pages/ChangePassword';


// Lazy loaded non-critical modals
const AuditLogModal = React.lazy(() => import('./components/AuditLogModal').then(module => ({ default: module.AuditLogModal })));
const ExecutionTraceModal = React.lazy(() => import('./components/ExecutionTraceModal').then(module => ({ default: module.ExecutionTraceModal })));

const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inference' | 'calibration'>('inference');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState<boolean>(false);
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);

  // Check viewer role via existing auth context / authService
  React.useEffect(() => {
    let isMounted = true;
    const checkViewerRole = async () => {
      try {
        const session = await authService.getSession();
        if (isMounted) {
          const role = session?.role;
          setIsDeveloper(role === 'developer' || role === 'admin');
        }
      } catch {
        if (isMounted) {
          setIsDeveloper(false);
        }
      }
    };
    checkViewerRole();
    return () => {
      isMounted = false;
    };
  }, []);

  // Use Custom Hooks for state orchestration
  const { isDarkMode, toggleTheme } = useTheme();
  
  const { 
    params: calibrationParams, 
    lastCalibrationTime,
    isRecalibrating, 
    handleRecalibrate 
  } = useCalibration();

  const { 
    requests, 
    selectedRequest, 
    handleSelectRequest, 
    handleModelChange 
  } = useInferenceStream(
    isStreaming, 
    calibrationParams?.quantileThreshold, 
    calibrationParams?.policy,
    'GPT-4o'
  );

  const metrics = useInferenceMetrics(requests, selectedRequest, lastCalibrationTime);

  const handleTabChange = (tab: 'inference' | 'calibration') => {
    setActiveTab(tab);
    auditLogger.log('user', 'switch_tab', tab, { activeTab: tab });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'inference' ? (
          selectedRequest ? (
            <InferenceDashboard
              metrics={metrics}
              selectedRequest={selectedRequest}
              allRequests={requests}
              onSelectRequest={handleSelectRequest}
              onModelChange={handleModelChange}
              onOpenTrace={() => setIsTraceModalOpen(true)}
              quantileThreshold={calibrationParams?.quantileThreshold || 0}
              isDeveloper={isDeveloper}
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading requests...
            </div>
          )
        ) : (
          calibrationParams ? (
            <CalibrationDashboard
              params={calibrationParams}
              isRecalibrating={isRecalibrating}
              onRecalibrate={handleRecalibrate}
              isDeveloper={isDeveloper}
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading calibration parameters...
            </div>
          )
        )}
      </main>

      <Suspense fallback={null}>
        {isAuditModalOpen && (
          <AuditLogModal
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
            logs={auditLogger.getLogs()}
          />
        )}
        
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

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/developer/login" element={<DeveloperLogin />} />
        <Route path="/developer/forgot-password" element={<ForgotPassword />} />
        <Route 

          path="/developer/dashboard" 
          element={
            <AuthGuard>
              <DeveloperDashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/developer/change-password" 
          element={
            <AuthGuard>
              <ChangePassword />
            </AuthGuard>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
