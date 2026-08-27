import React, { useState, Suspense } from 'react';
import { Header } from './components/Header';
import { InferenceDashboard } from './components/Inference/InferenceDashboard';
import { CalibrationDashboard } from './components/Calibration/CalibrationDashboard';
import { auditLogger } from './services/auditLogger';

// Custom Hooks
import { useTheme } from './hooks/useTheme';
import { useCalibration } from './hooks/useCalibration';
import { useInferenceStream } from './hooks/useInferenceStream';
import { useInferenceMetrics } from './hooks/useInferenceMetrics';

// Lazy loaded non-critical modals
const AuditLogModal = React.lazy(() => import('./components/AuditLogModal').then(module => ({ default: module.AuditLogModal })));
const ExecutionTraceModal = React.lazy(() => import('./components/ExecutionTraceModal').then(module => ({ default: module.ExecutionTraceModal })));

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inference' | 'calibration'>('inference');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState<boolean>(false);

  // Use Custom Hooks for state orchestration
  const { isDarkMode, toggleTheme } = useTheme();
  
  const { 
    params: calibrationParams, 
    lastCalibrationTime,
    isRecalibrating, 
    handleRecalibrate 
  } = useCalibration();

  // We need to provide a default LLM model initially until requests load, 
  // but inferenceService uses globalModel state to generate requests.
  // Actually, handleModelChange updates it in stream hook, so we pass down an initial one if undefined.
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

  // Handler for Tab switching
  const handleTabChange = (tab: 'inference' | 'calibration') => {
    setActiveTab(tab);
    auditLogger.log('user', 'switch_tab', tab, { activeTab: tab });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
      />

      {/* Main Content Body */}
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
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading calibration parameters...
            </div>
          )
        )}
      </main>

      {/* Lazy Loaded Modals */}
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

export default App;
