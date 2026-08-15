import React, { useState, useRef } from 'react';
import { CalibrationParams } from '../types/inference';
import { generateDistributionData } from '../services/mockData';
import { auditLogger } from '../services/auditLogger';
import { RefreshCw, Download, FileText, CheckCircle2, ShieldAlert, ArrowUpRight, Upload } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

interface CalibrationDashboardProps {
  params: CalibrationParams;
  onUpdateParams: (newParams: Partial<CalibrationParams>) => void;
  onRecalibrate: () => void;
}

export const CalibrationDashboard: React.FC<CalibrationDashboardProps> = ({
  params,
  onUpdateParams,
  onRecalibrate
}) => {
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [processedFiles, setProcessedFiles] = useState(3);
  const [totalFiles, setTotalFiles] = useState(8);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const distributionData = generateDistributionData(params.quantileThreshold);

  const handleRecalibrateClick = () => {
    setIsRecalibrating(true);
    setTimeout(() => {
      onRecalibrate();
      setIsRecalibrating(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const addedCount = files.length;
    const newTotal = totalFiles + addedCount;
    setTotalFiles(newTotal);

    Array.from(files).forEach((file) => {
      auditLogger.log('user', 'upload_calibration_file', file.name, {
        sizeBytes: file.size,
        type: file.type
      });
    });

    let current = processedFiles;
    const interval = setInterval(() => {
      current += 1;
      setProcessedFiles(current);
      if (current >= newTotal) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 400);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPct = Math.round((processedFiles / totalFiles) * 100);

  return (
    <div>
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="metric-card">
          <div className="metric-label">Calibration status</div>
          <div className="metric-value" style={{ color: 'var(--success-text)', fontSize: '1.5rem' }}>
            Completed
          </div>
          <div className="metric-subtext">Locked / completed / recalibration</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">q̂</div>
          <div className="metric-value" style={{ fontFamily: 'var(--font-mono)' }}>
            {params.quantileThreshold.toFixed(3)}
          </div>
          <div className="metric-subtext">Calibrated threshold</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">α</div>
          <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>
            {params.alpha.toFixed(2)}
          </div>
          <div className="metric-subtext">Configured significance level</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Drift status</div>
          <div className="metric-value" style={{ color: 'var(--text-primary)', fontSize: '1.35rem' }}>
            Normal
          </div>
          <div className="metric-subtext">Reported by Module 2</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Calibration file</div>
          <div className="metric-value" style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title="cal_scores_v4.jsonl">
            cal_scores_v4.jsonl
          </div>
          <div className="metric-subtext">Last calibrated data filename</div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              Calibration file upload progress
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{processedFiles} of {totalFiles} files processed</span> ({Math.max(0, totalFiles - processedFiles)} files remaining)
            </div>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".jsonl,.json,.csv,.parquet"
              style={{ display: 'none' }}
            />
            <button
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Upload size={14} className={isUploading ? 'animate-spin' : ''} />
              <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
          <div
            style={{
              width: `${Math.min(100, uploadPct)}%`,
              height: '100%',
              backgroundColor: 'var(--accent-primary)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>


      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>
        <div className="panel-card">
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="panel-title">Calibration score distribution</h2>
              <div className="panel-subtitle">Module 1 • cal_scores[]</div>
            </div>
            <button className="btn-secondary" onClick={handleRecalibrateClick} disabled={isRecalibrating} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#dbeafe" radius={[4, 4, 0, 0]} />
                <ReferenceLine
                  x="0.7-0.8"
                  stroke="var(--accent-primary)"
                  strokeWidth={2.5}
                  label={{ value: 'q̂', fill: 'var(--accent-primary)', fontSize: 14, fontWeight: 700, position: 'top' }}
                />
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
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Available <ArrowUpRight size={12} />
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>cal_labels</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                Available <ArrowUpRight size={12} />
              </span>
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

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        <div className="panel-card">
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="panel-title">Coverage / calibration evaluation</h2>
              <div className="panel-subtitle">Use evaluation statistics available from the project</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Target coverage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>1 - α ({((1 - params.alpha) * 100).toFixed(0)}%)</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Observed coverage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-text)' }}>{(params.empiricalCoverage * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: `${(params.empiricalCoverage * 100).toFixed(1)}%`,
                height: '100%',
                backgroundColor: 'var(--accent-primary)',
                borderRadius: '5px'
              }}
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Measured evaluation data for conformal prediction sets.
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="panel-title">Drift & recalibration</h2>
              <div className="panel-subtitle">Module 2 events + current pipeline state</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '3rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Drift status</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Normal (No drift)</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Drift type</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>None</div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recalibration status</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--success-text)' }}>Up to date</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Recent events
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Timestamp • event • trigger
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>• 14:32:01 • Threshold locked • Auto-calibration trigger</div>
              <div>• 12:15:00 • Drift evaluation OK • Module 2 contract check</div>
              <div>• 09:00:00 • Data ingest complete • 1000 holdout samples loaded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

