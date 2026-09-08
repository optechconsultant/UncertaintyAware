import React from 'react';
import { WidgetContextData } from '../types/widget';
import { Compass, CheckCircle, AlertTriangle } from 'lucide-react';

export const OodStatusWidget: React.FC<{ context: WidgetContextData }> = ({ context }) => {
  const { selectedRequest } = context;
  // If score is above 0.85 or flagged, treat as OOD warning for demonstration
  const isOod = selectedRequest ? selectedRequest.nonConformityScore > 0.85 : false;

  return (
    <div className="metric-card widget-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="metric-label">OOD Status</div>
        <Compass size={16} color={isOod ? 'var(--warning-text)' : 'var(--success-text)'} />
      </div>
      <div
        className="metric-value"
        style={{
          fontSize: '1.375rem',
          color: isOod ? 'var(--warning-text)' : 'var(--success-text)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        {isOod ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
        <span>{isOod ? 'OOD Detected' : 'In-Distribution'}</span>
      </div>
      <div className="metric-subtext">Module 2 semantic distance distribution check</div>
    </div>
  );
};
