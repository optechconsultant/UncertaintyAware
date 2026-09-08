import React from 'react';
import { MetricsSummary, InferenceRequest, LLMModelType } from '../../types/inference';
import { RequestOverview } from './RequestOverview';
import { DecisionSummary } from './DecisionSummary';
import { RecentDecisions } from './RecentDecisions';
import { PipelineStepper } from '../PipelineStepper';
import { Module1Panel } from '../Developer/Module1Panel';
import { Module2Panel } from '../Developer/Module2Panel';
import { Module3Panel } from '../Developer/Module3Panel';
import { useDeveloperWidgetPreferences } from '../../hooks/useDeveloperWidgetPreferences';
import { Activity } from 'lucide-react';

interface InferenceDashboardProps {
  metrics: MetricsSummary;
  selectedRequest: InferenceRequest;
  allRequests: InferenceRequest[];
  onSelectRequest: (reqId: string) => void;
  onModelChange: (model: LLMModelType) => void;
  onOpenTrace: () => void;
  quantileThreshold: number;
  isDeveloper?: boolean;
}

export const InferenceDashboard: React.FC<InferenceDashboardProps> = ({
  metrics,
  selectedRequest,
  allRequests,
  onSelectRequest,
  onModelChange,
  onOpenTrace,
  quantileThreshold,
  isDeveloper = false,
}) => {
  const { isVisible } = useDeveloperWidgetPreferences();

  // If viewer is a developer or admin, use their personalized preferences; otherwise, regular user sees fixed set
  const activeIsVisible = isDeveloper ? isVisible : undefined;

  const showPipeline = isDeveloper && isVisible('request_pipeline');
  const showModule1 = isDeveloper && isVisible('module_1_details');
  const showModule2 = isDeveloper && isVisible('module_2_details');
  const showModule3 = isDeveloper && isVisible('module_3_logs');
  const hasExtraDiagnostics = showModule1 || showModule2 || showModule3;

  return (
    <div>
      {/* 1. Metrics Header (filtered by isVisible for developer, fixed set for user) */}
      <RequestOverview
        metrics={metrics}
        onModelChange={onModelChange}
        isVisible={activeIsVisible}
        quantileThreshold={quantileThreshold}
      />

      {/* 2. Main Selected Request Inspector & Optional Pipeline Stepper */}
      <div
        className="dashboard-grid"
        style={{
          gridTemplateColumns: showPipeline ? '1.1fr 0.9fr' : '1fr',
        }}
      >
        <DecisionSummary
          request={selectedRequest}
          allRequests={allRequests}
          onSelectRequest={onSelectRequest}
          onOpenTrace={onOpenTrace}
          quantileThreshold={quantileThreshold}
          isVisible={activeIsVisible}
        />

        {showPipeline && (
          <PipelineStepper
            currentStage={selectedRequest.stage}
            request={selectedRequest}
            quantileThreshold={quantileThreshold}
          />
        )}
      </div>

      {/* 3. Developer Diagnostics Stream (only rendered for developers when enabled) */}
      {hasExtraDiagnostics && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Activity size={18} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
              Developer Diagnostics Stream
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {showModule1 && <Module1Panel />}
            {showModule2 && <Module2Panel />}
            {showModule3 && <Module3Panel />}
          </div>
        </div>
      )}

      {/* 4. Telemetry Decisions Table */}
      <RecentDecisions
        requests={allRequests}
        selectedRequestId={selectedRequest.id}
        onSelectRequest={onSelectRequest}
      />
    </div>
  );
};

export default InferenceDashboard;
