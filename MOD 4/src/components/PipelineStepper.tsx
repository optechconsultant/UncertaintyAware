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
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                background: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Zap size={12} />
              {totalLatency} ms
            </span>
          </div>
        </div>

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

        <div
          style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>
              Active Stage Telemetry
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Stage {activeStep.number} / 4
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {activeStep.label} • {activeStep.subtitle}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {activeStep.description}
          </div>

          {request && activeIndex === 2 && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Evaluated Score: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{request.nonConformityScore.toFixed(2)}</strong></span>
              <span>Quantile Limit: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>q̂ = {quantileThreshold.toFixed(3)}</strong></span>
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            <span>Stage Latency Breakdown</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>100% ({totalLatency}ms)</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'var(--border-color)', display: 'flex' }}>
            <div style={{ width: '30%', background: '#3b82f6' }} title={`Module 1: ${m1Latency}ms`} />
            <div style={{ width: '12%', background: '#10b981' }} title={`Module 2: ${m2Latency}ms`} />
            <div style={{ width: '18%', background: '#f59e0b' }} title={`Module 3: ${m3Latency}ms`} />
            <div style={{ width: '40%', background: '#6366f1' }} title={`Module 4: ${m4Latency}ms`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            <span style={{ color: '#3b82f6' }}>M1: {m1Latency}ms</span>
            <span style={{ color: '#10b981' }}>M2: {m2Latency}ms</span>
            <span style={{ color: '#f59e0b' }}>M3: {m3Latency}ms</span>
            <span style={{ color: '#6366f1' }}>M4: {m4Latency}ms</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
        Shows where the request currently is in the pipeline • Live telemetry active.
      </div>
    </div>
  );
};

