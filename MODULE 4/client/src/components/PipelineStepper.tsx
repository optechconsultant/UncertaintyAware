import React from 'react';
import { StageType, InferenceRequest } from '../types/inference';
import { ArrowRight, Check, Clock, Cpu, Zap, Activity, ShieldCheck } from 'lucide-react';

interface PipelineStepperProps {
  currentStage: StageType;
  request?: InferenceRequest;
  quantileThreshold?: number;
}

interface StepConfig {
  number: number;
  name: StageType;
  label: string;
  subtitle: string;
  description: string;
  latencyMs: number;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStage,
  request,
  quantileThreshold = 0.784
}) => {
  const getStageIndex = (stage: StageType) => {
    switch (stage) {
      case 'Module 1':
        return 1;
      case 'Module 2':
        return 2;
      case 'Module 3':
        return 3;
      case 'Complete':
        return 4;
      default:
        return 2;
    }
  };

  const activeIndex = getStageIndex(currentStage);
  const totalLatency = request ? request.executionTimeMs : 142;

  // Latency breakdown per stage
  const m1Latency = Math.round(totalLatency * 0.30);
  const m2Latency = Math.round(totalLatency * 0.12);
  const m3Latency = Math.round(totalLatency * 0.18);
  const m4Latency = totalLatency - m1Latency - m2Latency - m3Latency;

  const steps: StepConfig[] = [
    {
      number: 1,
      name: 'Module 1',
      label: 'Module 1',
      subtitle: 'Scoring',
      description: 'Computes raw embedding distance & non-conformity score S_i.',
      latencyMs: m1Latency
    },
    {
      number: 2,
      name: 'Module 2',
      label: 'Module 2',
      subtitle: 'Decision',
      description: 'Evaluates non-conformity score against calibrated quantile threshold q_hat.',
      latencyMs: m2Latency
    },
    {
      number: 3,
      name: 'Module 3',
      label: 'Module 3',
      subtitle: 'Logging',
      description: 'Emits immutable provenance logs and telemetry metadata.',
      latencyMs: m3Latency
    },
    {
      number: 4,
      name: 'Complete',
      label: 'Complete',
      subtitle: 'Response',
      description: 'Final response generated and delivered to consumer API.',
      latencyMs: m4Latency
    }
  ];

  const activeStep = steps.find((s) => s.number === activeIndex) || steps[1];

  return (
    <div className="panel-card">
      <div>
        <div className="panel-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 className="panel-title">Request pipeline</h2>
            <div className="panel-subtitle">Current request stage</div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="latency-badge">
              <Zap size={12} />
              {totalLatency} ms
            </span>
          </div>
        </div>

        {/* 4-Step Diagram */}
        <div className="pipeline-stepper" style={{ margin: '1rem 0 1.25rem 0' }}>
          {steps.map((step, index) => {
            const isComplete = step.number < activeIndex;
            const isActive = step.number === activeIndex;

            return (
              <React.Fragment key={step.number}>
                <div
                  className={`stepper-node ${isActive ? 'active' : isComplete ? 'complete' : ''}`}
                  title={step.description}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="node-number">{step.number}</span>
                    {isComplete && <Check size={12} color="var(--success-text)" />}
                    {isActive && <Clock size={12} color="var(--accent-primary)" className="animate-spin" />}
                  </div>
                  <div className="node-title">{step.label}</div>
                  <div className="node-subtitle">{step.subtitle}</div>
                </div>

                {index < steps.length - 1 && (
                  <div className="stepper-arrow">
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Active Stage Telemetry Box */}
        <div className="telemetry-box">
          <div className="telemetry-header">
            <span className="telemetry-title-label">
              Active Stage Telemetry
            </span>
            <span className="telemetry-title-stage">
              Stage {activeStep.number} / 4
            </span>
          </div>
          <div className="telemetry-main-title">
            {activeStep.label} • {activeStep.subtitle}
          </div>
          <div className="telemetry-desc">
            {activeStep.description}
          </div>

          {request && activeIndex === 2 && (
            <div className="telemetry-footer">
              <span>Evaluated Score: <strong>{request.nonConformityScore.toFixed(2)}</strong></span>
              <span>Quantile Limit: <strong>q̂ = {quantileThreshold.toFixed(3)}</strong></span>
            </div>
          )}
        </div>

        {/* Stage Latency Waterfall Bar */}
        <div>
          <div className="latency-container">
            <span>Stage Latency Breakdown</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>100% ({totalLatency}ms)</span>
          </div>
          <div className="latency-bar-wrapper">
            <div style={{ width: `${(m1Latency / totalLatency) * 100}%`, background: '#3b82f6' }} title={`Module 1: ${m1Latency}ms`} />
            <div style={{ width: `${(m2Latency / totalLatency) * 100}%`, background: '#10b981' }} title={`Module 2: ${m2Latency}ms`} />
            <div style={{ width: `${(m3Latency / totalLatency) * 100}%`, background: '#f59e0b' }} title={`Module 3: ${m3Latency}ms`} />
            <div style={{ width: `${(m4Latency / totalLatency) * 100}%`, background: '#6366f1' }} title={`Module 4: ${m4Latency}ms`} />
          </div>
          <div className="latency-legend">
            <span style={{ color: '#3b82f6' }}>M1: {m1Latency}ms</span>
            <span style={{ color: '#10b981' }}>M2: {m2Latency}ms</span>
            <span style={{ color: '#f59e0b' }}>M3: {m3Latency}ms</span>
            <span style={{ color: '#6366f1' }}>M4: {m4Latency}ms</span>
          </div>
        </div>
      </div>

      <div className="pipeline-stepper-footer">
        Shows where the request currently is in the pipeline • Live telemetry active.
      </div>
    </div>
  );
};
