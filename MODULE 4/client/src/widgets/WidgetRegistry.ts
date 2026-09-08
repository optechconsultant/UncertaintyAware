import React from 'react';
import { WidgetKey, WidgetMetadata, WidgetContextData } from '../types/widget';
import { PassRateWidget } from './PassRateWidget';
import { FlagRateWidget } from './FlagRateWidget';
import { CurrentAnswerWidget } from './CurrentAnswerWidget';
import { ConformalScoreWidget } from './ConformalScoreWidget';
import { OodStatusWidget } from './OodStatusWidget';
import { DriftStatusWidget } from './DriftStatusWidget';
import { ThresholdWidget } from './ThresholdWidget';
import { CoverageWidget } from './CoverageWidget';
import { Module1DetailsWidget } from './Module1DetailsWidget';
import { Module2DetailsWidget } from './Module2DetailsWidget';
import { Module3LogsWidget } from './Module3LogsWidget';
import { RequestPipelineWidget } from './RequestPipelineWidget';

export const WIDGET_REGISTRY: Record<WidgetKey, React.ComponentType<{ context: WidgetContextData }>> = {
  pass_rate: PassRateWidget,
  flag_rate: FlagRateWidget,
  current_answer: CurrentAnswerWidget,
  conformal_score: ConformalScoreWidget,
  ood_status: OodStatusWidget,
  drift_status: DriftStatusWidget,
  threshold: ThresholdWidget,
  coverage: CoverageWidget,
  module_1_details: Module1DetailsWidget,
  module_2_details: Module2DetailsWidget,
  module_3_logs: Module3LogsWidget,
  request_pipeline: RequestPipelineWidget,
};

export const WIDGET_METADATA_LIST: WidgetMetadata[] = [
  {
    key: 'pass_rate',
    label: 'PASS Rate',
    category: 'metrics',
    screens: ['inference'],
    description: 'Percentage of requests classified as PASS since last calibration',
    defaultUserVisible: true,
  },
  {
    key: 'flag_rate',
    label: 'FLAG Rate',
    category: 'metrics',
    screens: ['inference'],
    description: 'Percentage of requests flagged for uncertainty review',
    defaultUserVisible: true,
  },
  {
    key: 'current_answer',
    label: 'Current Answer',
    category: 'general',
    screens: ['inference'],
    description: 'Active question payload, model response, and evaluation status',
    defaultUserVisible: true,
  },
  {
    key: 'conformal_score',
    label: 'Conformal Score',
    category: 'diagnostics',
    screens: ['inference'],
    description: 'Non-conformity score S_i and quantile threshold comparison bar',
    defaultUserVisible: false,
  },
  {
    key: 'ood_status',
    label: 'OOD Status',
    category: 'diagnostics',
    screens: ['inference'],
    description: 'Out-of-distribution semantic shift detector status',
    defaultUserVisible: false,
  },
  {
    key: 'drift_status',
    label: 'Drift Status',
    category: 'diagnostics',
    screens: ['inference', 'calibration'],
    description: 'Kolmogorov-Smirnov two-sample drift detector status',
    defaultUserVisible: false,
  },
  {
    key: 'threshold',
    label: 'Threshold',
    category: 'diagnostics',
    screens: ['inference', 'calibration'],
    description: 'Active calibrated quantile threshold limit (q̂)',
    defaultUserVisible: false,
  },
  {
    key: 'coverage',
    label: 'Coverage Evaluation',
    category: 'diagnostics',
    screens: ['calibration'],
    description: 'Observed empirical coverage vs configured nominal coverage target (1 - α)',
    defaultUserVisible: true,
  },
  {
    key: 'module_1_details',
    label: 'Module 1 Details',
    category: 'diagnostics',
    screens: ['inference'],
    description: 'Module 1 embedding distance, scoring parameters, and theta bounds',
    defaultUserVisible: false,
  },
  {
    key: 'module_2_details',
    label: 'Module 2 Details',
    category: 'diagnostics',
    screens: ['inference'],
    description: 'Module 2 decision engine breakdown, drift indicators, and error status',
    defaultUserVisible: false,
  },
  {
    key: 'module_3_logs',
    label: 'Module 3 Logs',
    category: 'diagnostics',
    screens: ['inference'],
    description: 'Module 3 immutable audit and telemetry log feed',
    defaultUserVisible: false,
  },
  {
    key: 'request_pipeline',
    label: 'Request Pipeline',
    category: 'pipeline',
    screens: ['inference'],
    description: 'Interactive 4-stage pipeline stepper with active telemetry & latency waterfall',
    defaultUserVisible: false,
  },
];

export const getWidgetMetadata = (key: string): WidgetMetadata | undefined => {
  return WIDGET_METADATA_LIST.find((meta) => meta.key === key);
};
