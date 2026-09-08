import React, { useState, useRef } from 'react';
import { CalibrationParams } from '../../types/calibration';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface CalibrationMetricsProps {
  params: CalibrationParams;
  processedFiles?: number;
  totalFiles?: number;
  isVisible?: (key: string) => boolean;
}

export const CalibrationMetrics: React.FC<CalibrationMetricsProps> = ({ 
  params, 
  processedFiles: initialProcessed = 3, 
  totalFiles: initialTotal = 8,
  isVisible,
}) => {
  const [activeFileName, setActiveFileName] = useState<string>('cal_scores_v4.jsonl');
  const [processedFiles, setProcessedFiles] = useState<number>(initialProcessed);
  const [totalFiles, setTotalFiles] = useState<number>(initialTotal);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    const validExtensions = ['.jsonl', '.json', '.csv', '.txt'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setUploadError(`Invalid file format '${file.name}'. Please upload .jsonl, .json, or .csv data.`);
      return;
    }

    setIsUploading(true);

    // Simulate dataset ingestion and score calculation
    setTimeout(() => {
      setIsUploading(false);
      setActiveFileName(file.name);
      const newProcessed = Math.min(processedFiles + 1, totalFiles + 1);
      const newTotal = Math.max(totalFiles, newProcessed);
      setProcessedFiles(newProcessed);
      setTotalFiles(newTotal);

      const sizeKb = (file.size / 1024).toFixed(1);
      setUploadSuccess(`Successfully uploaded '${file.name}' (${sizeKb} KB). Calibration scores updated!`);
      
      // Auto-hide success message after 6 seconds
      setTimeout(() => {
        setUploadSuccess(null);
      }, 6000);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const uploadPct = Math.round((processedFiles / totalFiles) * 100);

  const showThreshold = isVisible ? isVisible('threshold') : true;
  const showDriftStatus = isVisible ? isVisible('drift_status') : true;

  return (
    <div>
      {/* Metrics Grid */}
      <div
        className="metrics-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div className="metric-card">
          <div className="metric-label">Calibration status</div>
          <div className="metric-value" style={{ color: 'var(--success-text)', fontSize: '1.5rem' }}>Completed</div>
          <div className="metric-subtext">Locked / completed / recalibration</div>
        </div>

        {/* Threshold (q̂) card - respects threshold preference */}
        {showThreshold && (
          <div className="metric-card">
            <div className="metric-label">q̂</div>
            <div className="metric-value" style={{ fontFamily: 'var(--font-mono)' }}>{params.quantileThreshold.toFixed(3)}</div>
            <div className="metric-subtext">Calibrated threshold</div>
          </div>
        )}

        <div className="metric-card">
          <div className="metric-label">α</div>
          <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>{params.alpha.toFixed(2)}</div>
          <div className="metric-subtext">Configured significance level</div>
        </div>

        {/* Drift status card - respects drift_status preference */}
        {showDriftStatus && (
          <div className="metric-card">
            <div className="metric-label">Drift status</div>
            <div className="metric-value" style={{ color: 'var(--text-primary)', fontSize: '1.35rem' }}>Normal</div>
            <div className="metric-subtext">Reported by Module 2</div>
          </div>
        )}

        <div className="metric-card">
          <div className="metric-label">Active dataset</div>
          <div className="metric-value" style={{ fontSize: '1.05rem', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activeFileName}>
            {activeFileName}
          </div>
          <div className="metric-subtext">Current calibration input</div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".jsonl,.json,.csv,.txt" 
        style={{ display: 'none' }} 
      />

      {/* Upload Progress & Action Card */}
      <div 
        className="panel-card" 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          padding: '1.25rem 1.5rem', 
          marginBottom: '1.5rem',
          border: isDragging ? '2px dashed var(--accent-primary)' : '1px solid var(--border-color)',
          backgroundColor: isDragging ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Calibration File Dataset & Ingestion</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Upload non-conformity calibration scores (.jsonl, .json, .csv) to recalibrate q̂ threshold
            </div>
          </div>

          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleButtonClick}
            disabled={isUploading}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Ingesting file...</span>
              </>
            ) : (
              <>
                <Upload size={15} />
                <span>Upload Calibration File</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar & File Counter */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Batch Ingestion Progress:</span>
            <span style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{processedFiles} of {totalFiles} files processed</strong> ({Math.max(0, totalFiles - processedFiles)} remaining)
            </span>
          </div>

          <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
            <div 
              style={{ 
                width: `${uploadPct}%`, 
                height: '100%', 
                backgroundColor: 'var(--accent-primary)', 
                borderRadius: '4px', 
                transition: 'width 0.5s ease-in-out' 
              }} 
            />
          </div>
        </div>

        {/* Alert Feedback Messages */}
        {uploadSuccess && (
          <div style={{ 
            marginTop: '0.85rem', 
            padding: '0.6rem 0.85rem', 
            backgroundColor: 'var(--success-bg, rgba(34, 197, 94, 0.1))', 
            border: '1px solid var(--success-border, rgba(34, 197, 94, 0.2))', 
            borderRadius: '6px', 
            color: 'var(--success-text, #16a34a)', 
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div style={{ 
            marginTop: '0.85rem', 
            padding: '0.6rem 0.85rem', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '6px', 
            color: '#ef4444', 
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

