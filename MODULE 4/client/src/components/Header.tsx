import React from 'react';
import { Shield, Sun, Moon, Play, Pause, Terminal, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: 'inference' | 'calibration';
  onTabChange: (tab: 'inference' | 'calibration') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenAuditLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
  isStreaming,
  onToggleStreaming,
  onOpenAuditLogs
}) => {
  return (
    <header className="header-container">
      <div className="header-top">
        <div className="header-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="brand-title">ConformalGuard</h1>
          </div>
          <span className="brand-subtitle">
            {activeTab === 'inference'
              ? 'Module 4 • Live inference and request monitoring'
              : 'Module 4 • Calibration, threshold and drift monitoring'}
          </span>
        </div>

        <div className="header-controls">
          <div className="status-badge" title="System latency 14ms | Pipeline throughput 42 req/s">
            <span className="status-dot"></span>
            <span>System healthy</span>
          </div>

          <button
            className="btn-secondary"
            onClick={onToggleStreaming}
            title={isStreaming ? 'Pause live inference stream' : 'Resume live inference stream'}
          >
            {isStreaming ? (
              <>
                <Pause size={14} color="#ef4444" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play size={14} color="#22c55e" />
                <span>Live Stream</span>
              </>
            )}
          </button>

          <button
            className="btn-secondary"
            onClick={onOpenAuditLogs}
            title="Open Structured Audit Trace Logs"
          >
            <Terminal size={14} />
            <span>Audit Logs</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ padding: '0.5rem' }}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'inference' ? 'active' : ''}`}
          onClick={() => onTabChange('inference')}
        >
          Inference
        </button>
        <button
          className={`tab-btn ${activeTab === 'calibration' ? 'active' : ''}`}
          onClick={() => onTabChange('calibration')}
        >
          Conformal / Calibration
        </button>
      </nav>
    </header>
  );
};
