import { MetricsSummary, InferenceRequest, LLMModelType } from './inference';
import { CalibrationParams } from './calibration';

export type WidgetKey =
  | 'pass_rate'
  | 'flag_rate'
  | 'current_answer'
  | 'conformal_score'
  | 'ood_status'
  | 'drift_status'
  | 'threshold'
  | 'coverage'
  | 'module_1_details'
  | 'module_2_details'
  | 'module_3_logs'
  | 'request_pipeline';

export type WidgetScreen = 'inference' | 'calibration';

export interface WidgetMetadata {
  key: WidgetKey;
  label: string;
  category: 'metrics' | 'diagnostics' | 'pipeline' | 'general';
  screens: WidgetScreen[];
  description: string;
  defaultUserVisible: boolean;
}

export interface WidgetContextData {
  metrics?: MetricsSummary;
  selectedRequest?: InferenceRequest;
  allRequests?: InferenceRequest[];
  onSelectRequest?: (reqId: string) => void;
  onModelChange?: (model: LLMModelType) => void;
  onOpenTrace?: () => void;
  quantileThreshold?: number;
  calibrationParams?: CalibrationParams;
  isRecalibrating?: boolean;
  onRecalibrate?: () => void;
}
