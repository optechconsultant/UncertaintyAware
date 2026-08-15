import React from 'react';
import { MetricsSummary, InferenceRequest, LLMModelType } from '../types/inference';
import { MetricsOverview } from './MetricsOverview';
import { SelectedRequestInspector } from './SelectedRequestInspector';
import { PipelineStepper } from './PipelineStepper';
import { RequestHistoryTable } from './RequestHistoryTable';

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
      <MetricsOverview metrics={metrics} onModelChange={onModelChange} />

      <div className="dashboard-grid">
        <SelectedRequestInspector
          request={selectedRequest}
          allRequests={allRequests}
          onSelectRequest={onSelectRequest}
          onOpenTrace={onOpenTrace}
          quantileThreshold={quantileThreshold}
        />

        <PipelineStepper
          currentStage={selectedRequest.stage}
          request={selectedRequest}
          quantileThreshold={quantileThreshold}
        />
      </div>

      <RequestHistoryTable
        requests={allRequests}
        selectedRequestId={selectedRequest.id}
        onSelectRequest={onSelectRequest}
      />
    </div>
  );
};

