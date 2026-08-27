import React from 'react';
import { MetricsSummary, InferenceRequest, LLMModelType } from '../../types/inference';
import { RequestOverview } from './RequestOverview';
import { DecisionSummary } from './DecisionSummary';
import { PipelineStepper } from '../PipelineStepper';
import { RecentDecisions } from './RecentDecisions';

interface InferenceDashboardProps {
  metrics: MetricsSummary;
  selectedRequest: InferenceRequest;
  allRequests: InferenceRequest[];
  onSelectRequest: (reqId: string) => void;
  onModelChange: (model: LLMModelType) => void;
  onOpenTrace: () => void;
  quantileThreshold: number;
}

export const InferenceDashboard: React.FC<InferenceDashboardProps> = ({
  metrics,
  selectedRequest,
  allRequests,
  onSelectRequest,
  onModelChange,
  onOpenTrace,
  quantileThreshold
}) => {
  return (
    <div>
      {/* Metrics Header Grid */}
      <RequestOverview metrics={metrics} onModelChange={onModelChange} />

      {/* Main Split Content Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Selected Request Inspector */}
        <DecisionSummary
          request={selectedRequest}
          allRequests={allRequests}
          onSelectRequest={onSelectRequest}
          onOpenTrace={onOpenTrace}
          quantileThreshold={quantileThreshold}
        />

        {/* Right Column: Pipeline Stepper */}
        <PipelineStepper
          currentStage={selectedRequest.stage}
          request={selectedRequest}
          quantileThreshold={quantileThreshold}
        />
      </div>

      {/* Bottom Table: Telemetry Log */}
      <RecentDecisions
        requests={allRequests}
        selectedRequestId={selectedRequest.id}
        onSelectRequest={onSelectRequest}
      />
    </div>
  );
};
