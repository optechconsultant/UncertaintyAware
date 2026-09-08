import React, { useState } from 'react';
import { WIDGET_METADATA_LIST } from '../../widgets/WidgetRegistry';
import { Sliders, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface WidgetVisibilityPanelProps {
  isVisible: (widgetKey: string) => boolean;
  setVisible: (widgetKey: string, visible: boolean) => Promise<void>;
  resetAll: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const WidgetVisibilityPanel: React.FC<WidgetVisibilityPanelProps> = ({
  isVisible,
  setVisible,
  resetAll,
  loading = false,
  error = null,
}) => {
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const handleToggle = async (key: string, currentVisible: boolean) => {
    setTogglingKey(key);
    setActionSuccessMsg(null);
    try {
      await setVisible(key, !currentVisible);
    } catch {
      // Error handled by parent / hook
    } finally {
      setTogglingKey(null);
    }
  };

  const handleResetAll = async () => {
    setActionSuccessMsg(null);
    try {
      await resetAll();
      setActionSuccessMsg('All widgets reset to visible for your Developer Dashboard.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch {
      // Error handled by parent / hook
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'metrics':
        return 'badge-category-metrics';
      case 'diagnostics':
        return 'badge-category-diagnostics';
      case 'pipeline':
        return 'badge-category-pipeline';
      default:
        return 'badge-category-general';
    }
  };

  const visibleCount = WIDGET_METADATA_LIST.filter((meta) => isVisible(meta.key)).length;
  const hiddenCount = WIDGET_METADATA_LIST.length - visibleCount;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1.5rem',
        color: 'var(--text-primary)',
        gridColumn: '1 / -1', // Span full width
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sliders size={20} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
              Inference &amp; Calibration Widget Preferences
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Customize which diagnostic &amp; technical widgets appear when you view the Inference and Calibration dashboards.
            Changes only affect your personal view.
          </p>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResetAll}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8125rem',
            }}
            title="Revert all widgets to default-visible"
          >
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {actionSuccessMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success-text)',
            border: '1px solid var(--success-border)',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '6px',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-text)',
            border: '1px solid var(--danger-border)',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Widget Table */}
      <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '200px' }}>Widget Name</th>
              <th style={{ width: '130px' }}>Target Screen</th>
              <th style={{ width: '110px' }}>Category</th>
              <th>Description</th>
              <th style={{ width: '150px', textAlign: 'center' }}>My View</th>
            </tr>
          </thead>
          <tbody>
            {WIDGET_METADATA_LIST.map((meta) => {
              const visible = isVisible(meta.key);
              const isToggling = togglingKey === meta.key;

              return (
                <tr key={meta.key}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span>{meta.label}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {meta.screens.join(' & ')}
                    </span>
                  </td>
                  <td>
                    <span className={`category-tag ${getCategoryBadgeClass(meta.category)}`}>
                      {meta.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {meta.description}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => handleToggle(meta.key, visible)}
                        disabled={loading || isToggling}
                      />
                      <span className="toggle-slider round"></span>
                    </label>
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: visible ? 'var(--success-text)' : 'var(--text-muted)',
                      }}
                    >
                      {visible ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Total Available Widgets: <strong>{WIDGET_METADATA_LIST.length}</strong> • Visible in Your Workspace:{' '}
          <strong style={{ color: 'var(--success-text)' }}>{visibleCount}</strong> • Hidden:{' '}
          <strong style={{ color: 'var(--text-muted)' }}>{hiddenCount}</strong>
        </span>
      </div>
    </div>
  );
};

export default WidgetVisibilityPanel;
