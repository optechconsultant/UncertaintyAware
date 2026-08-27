import React from 'react';
import { CalibrationParams } from '../../types/calibration';
import { generateDistributionData } from '../../services/mockData';
import { RefreshCw, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

interface CalibrationChartProps {
  params: CalibrationParams;
  isRecalibrating: boolean;
  onRecalibrateClick: () => void;
}

export const CalibrationChart: React.FC<CalibrationChartProps> = ({ params, isRecalibrating, onRecalibrateClick }) => {
  const distributionData = generateDistributionData(params.quantileThreshold);

  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
      <div className="panel-card">
        <div className="panel-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 className="panel-title">Calibration score distribution</h2>
            <div className="panel-subtitle">Module 1 • cal_scores[]</div>
          </div>
          <button className="btn-secondary" onClick={onRecalibrateClick} disabled={isRecalibrating} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
            <RefreshCw size={14} className={isRecalibrating ? 'animate-spin' : ''} />
            <span>{isRecalibrating ? 'Recalibrating...' : 'Recalibrate q̂'}</span>
          </button>
        </div>

        <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem 1rem 0.5rem 1rem', height: '280px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={distributionData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="range" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#dbeafe" radius={[4, 4, 0, 0]} />
              <ReferenceLine x="0.7-0.8" stroke="var(--accent-primary)" strokeWidth={2.5} label={{ value: 'q̂', fill: 'var(--accent-primary)', fontSize: 14, fontWeight: 700, position: 'top' }} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
            <span>Non-conformity score</span>
            <span>Threshold position within calibration scores</span>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 className="panel-title">Calibration outputs</h2>
            <div className="panel-subtitle">Values available from Module 1</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>q̂</span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{params.quantileThreshold.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>θ_low</span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>0.12</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>θ_high</span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>0.88</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Separation</span>
            <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>0.76</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>cal_scores</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Available <ArrowUpRight size={12} /></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>cal_labels</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Available <ArrowUpRight size={12} /></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Last calibrated</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>3 days ago</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>LLM model</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>From Module 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
