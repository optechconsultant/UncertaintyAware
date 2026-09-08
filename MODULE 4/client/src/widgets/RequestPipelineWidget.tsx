import React from 'react';
import { WidgetContextData } from '../types/widget';
import { PipelineStepper } from '../components/PipelineStepper';

export const RequestPipelineWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { selectedRequest, quantileThreshold = 0.784 } = context;
  const currentStage = selectedRequest ? selectedRequest.stage : 'Module 2';

  return (
    <PipelineStepper
      currentStage={currentStage}
      request={selectedRequest}
      quantileThreshold={quantileThreshold}
    />
  );
};
