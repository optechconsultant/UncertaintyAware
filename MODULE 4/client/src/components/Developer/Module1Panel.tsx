import React, { useEffect, useState } from 'react';
import { Module1Response } from '../../types/module1';
import { fetchModule1Data } from '../../services/module1Service';

export const Module1Panel: React.FC = () => {
  const [data, setData] = useState<Module1Response | null>(null);

  useEffect(() => {
    fetchModule1Data('REQ-1234', 'Example query', 'Example output')
      .then(setData)
      .catch((err) => {
        console.warn('Module 1 backend offline, using diagnostic mock:', err.message);
        setData({
          answer: 'Wear appropriate PPE and safety goggles when handling volatile reagents.',
          non_conformity_score: 0.245,
          q_hat: 0.784,
          theta_low: 0.12,
          theta_high: 0.88,
          cal_scores: [0.15, 0.22, 0.31, 0.44, 0.58],
          cal_labels: [1, 1, 1, 1, 0],
          separation: 0.76,
          llm_model: 'GPT-4o',
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
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Module 1 Diagnostics</h3>
      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>LLM Model:</span>
            <span>{data.llm_model}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>NC Score:</span>
            <span>{data.non_conformity_score.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>q_hat:</span>
            <span>{data.q_hat.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Theta Low/High:</span>
            <span>{data.theta_low} / {data.theta_high}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Separation:</span>
            <span>{data.separation.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Cal Scores (len):</span>
            <span>{data.cal_scores.length}</span>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>Loading Module 1 data...</div>
      )}
    </div>
  );
};
