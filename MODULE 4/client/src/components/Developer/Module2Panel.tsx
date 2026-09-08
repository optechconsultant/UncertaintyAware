import React, { useEffect, useState } from 'react';
import { Module2Response } from '../../types/module2';
import { evaluateWithModule2 } from '../../services/module2Service';

export const Module2Panel: React.FC = () => {
  const [data, setData] = useState<Module2Response | null>(null);

  useEffect(() => {
    evaluateWithModule2('REQ-1234', 'Example query', 'Example output', 0.25, 0.4, 0.5, 0.72)
      .then(setData)
      .catch((err) => {
        console.warn('Module 2 backend offline, using diagnostic mock:', err.message);
        setData({
          query_id: 'REQ-1234',
          OOD_status: 'In_domain',
          Decision: 'PASS',
          model_output: 'Wear appropriate PPE and safety goggles.',
          Drift_Detector: 'NO_Drift',
          Error: undefined,
          KS_Drift_Detector: 'Normal',
        });
      });
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.5rem',
      color: 'var(--text-primary)'
    }}>
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Module 2 Diagnostics</h3>
      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Decision:</span>
            <span style={{ 
              fontWeight: 'bold', 
              color: data.Decision === 'PASS' ? 'var(--success-text)' : (data.Decision === 'FLAG' ? '#ef4444' : '#eab308')
            }}>{data.Decision}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>OOD Status:</span>
            <span>{data.OOD_status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Drift Detector:</span>
            <span>{data.Drift_Detector}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>KS Drift Detector:</span>
            <span>{data.KS_Drift_Detector}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Error Code:</span>
            <span>{data.Error ?? 'None'}</span>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>Loading Module 2 data...</div>
      )}
    </div>
  );
};
