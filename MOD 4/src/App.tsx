import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InferenceDashboard } from './components/InferenceDashboard';
import { CalibrationDashboard } from './components/CalibrationDashboard';
import { AuditLogModal } from './components/AuditLogModal';
import { ExecutionTraceModal } from './components/ExecutionTraceModal';

import { InferenceRequest, CalibrationParams, MetricsSummary, LLMModelType } from './types/inference';
import { initialRequests, initialCalibrationParams } from './services/mockData';
import { auditLogger } from './services/auditLogger';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inference' | 'calibration'>('inference');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  const [requests, setRequests] = useState<InferenceRequest[]>(initialRequests);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('REQ-1042');
  const [calibrationParams, setCalibrationParams] = useState<CalibrationParams>(initialCalibrationParams);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  const passes = requests.filter((r) => r.decision === 'PASS').length;
  const flags = requests.filter((r) => r.decision === 'FLAG').length;
  const total = requests.length || 1;

  const metrics: MetricsSummary = {
    activeRequests: requests.filter((r) => r.stage !== 'Complete').length,
    queuedRequests: 7,
    currentStage: selectedRequest ? selectedRequest.stage : 'Module 2',
    latestDecision: selectedRequest ? selectedRequest.decision : 'PASS',
    passPercentage: Number(((passes / total) * 100).toFixed(0)),
    flagPercentage: Number(((flags / total) * 100).toFixed(0)),
    llmModel: selectedRequest ? selectedRequest.llmModel : 'GPT-4o'
  };

  useEffect(() => {
    if (!isStreaming) return;

    const questionsPool = [
      'Analyze network packet anomaly metrics for port 8443',
      'Generate SQL query for user access audit reconciliation',
      'Validate OpenAPI specification schema for payment gateway',
      'Identify potential cross-site scripting vulnerabilities in template',
      'Summarize compliance guidelines for HIPAA patient data export'
    ];

    const interval = setInterval(() => {
      const newId = `REQ-${1047 + Math.floor(Math.random() * 8999)}`;
      const randomQ = questionsPool[Math.floor(Math.random() * questionsPool.length)];
      const rawScore = Number((0.2 + Math.random() * 0.75).toFixed(2));
      const isPass = rawScore <= calibrationParams.quantileThreshold;
      const isFlag = !isPass && rawScore < calibrationParams.quantileThreshold + 0.12;

      const newReq: InferenceRequest = {
        id: newId,
        timestamp: new Date().toTimeString().split(' ')[0],
        question: randomQ,
        nonConformityScore: rawScore,
        decision: isPass ? 'PASS' : isFlag ? 'FLAG' : 'REJECT',
        stage: isPass ? 'Module 2' : 'Module 1',
        provenance: 'Logged',
        policy: calibrationParams.policy,
        llmModel: selectedRequest.llmModel,
        executionTimeMs: Math.floor(120 + Math.random() * 140),
        fullLogs: [
          `[${new Date().toISOString()}] [Module 1] Received input payload for ${newId}`,
          `[${new Date().toISOString()}] [Module 1] Score S_i = ${rawScore}`,
          `[${new Date().toISOString()}] [Module 2] Threshold test vs q_hat (${calibrationParams.quantileThreshold.toFixed(3)}) -> ${isPass ? 'PASS' : isFlag ? 'FLAG' : 'REJECT'}`
        ]
      };

      setRequests((prev) => [newReq, ...prev.slice(0, 19)]);

      auditLogger.log('stream_engine', 'inference_request_received', newId, {
        score: rawScore,
        decision: newReq.decision
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming, calibrationParams.quantileThreshold, calibrationParams.policy, selectedRequest.llmModel]);

  const handleTabChange = (tab: 'inference' | 'calibration') => {
    setActiveTab(tab);
    auditLogger.log('user', 'switch_tab', tab, { activeTab: tab });
  };

  const handleModelChange = (model: LLMModelType) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === selectedRequestId ? { ...r, llmModel: model } : r))
    );
    auditLogger.log('user', 'change_llm_model', selectedRequestId, { newModel: model });
  };

  const handleSelectRequest = (reqId: string) => {
    setSelectedRequestId(reqId);
    auditLogger.log('user', 'select_request', reqId, {});
  };

  const handleRecalibrate = () => {
    const newThreshold = Number((1.0 - calibrationParams.alpha * 0.98).toFixed(3));
    const newCoverage = Number((1.0 - calibrationParams.alpha + (Math.random() * 0.006 - 0.003)).toFixed(3));

    const updatedParams: CalibrationParams = {
      ...calibrationParams,
      quantileThreshold: newThreshold,
      empiricalCoverage: newCoverage,
      passPct: Math.round(newThreshold * 75),
      flagPct: 15,
      rejectPct: Math.round((1 - newThreshold) * 75)
    };

    setCalibrationParams(updatedParams);

    setRequests((prev) =>
      prev.map((r) => {
        const isPass = r.nonConformityScore <= newThreshold;
        const isFlag = !isPass && r.nonConformityScore < newThreshold + 0.12;
        return {
          ...r,
          decision: isPass ? 'PASS' : isFlag ? 'FLAG' : 'REJECT',
          policy: updatedParams.policy
        };
      })
    );

    auditLogger.log('user', 'recalibrate_conformal_threshold', 'CAL-SET-01', {
      alpha: calibrationParams.alpha,
      newQuantileThreshold: newThreshold,
      achievedCoverage: newCoverage
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'inference' ? (
          <InferenceDashboard
            metrics={metrics}
            selectedRequest={selectedRequest}
            allRequests={requests}
            onSelectRequest={handleSelectRequest}
            onModelChange={handleModelChange}
            onOpenTrace={() => setIsTraceModalOpen(true)}
            quantileThreshold={calibrationParams.quantileThreshold}
          />
        ) : (
          <CalibrationDashboard
            params={calibrationParams}
            onUpdateParams={(newParams) => setCalibrationParams((prev) => ({ ...prev, ...newParams }))}
            onRecalibrate={handleRecalibrate}
          />
        )}
      </main>

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        logs={auditLogger.getLogs()}
      />

      <ExecutionTraceModal
        isOpen={isTraceModalOpen}
        request={selectedRequest}
        onClose={() => setIsTraceModalOpen(false)}
      />
    </div>
  );
};

export default App;

