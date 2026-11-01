import React, { useState } from 'react';
import { ArrowLeft, Bot, Check, AlertCircle, RefreshCw, Eye, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import type { TimelineLog } from '../types';

interface AgentScanningViewProps {
  handle: string;
  onBack: () => void;
  onCancel: () => void;
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  isBlocked: boolean;
  blockedDetails?: any;
  timelineLogs: TimelineLog[];
  onRetry: () => void;
  onSwitchToPreview: () => void;
}

export const AgentScanningView: React.FC<AgentScanningViewProps> = ({
  handle,
  onBack,
  onCancel,
  currentStep,
  isBlocked,
  blockedDetails,
  timelineLogs,
  onRetry,
  onSwitchToPreview,
}) => {
  const [showLogs, setShowLogs] = useState(false);

  const steps = [
    { id: 1, label: 'Opening Instagram profile' },
    { id: 2, label: 'Reading recent posts (0/15)' },
    { id: 3, label: 'Identifying event announcements' },
    { id: 4, label: 'Extracting event details' },
    { id: 5, label: 'Preparing event results' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Back button */}
      <div className="top-nav" onClick={onBack} id="back-from-scanning">
        <ArrowLeft size={16} />
        <span>Event Discovery</span>
      </div>

      <div className="scanning-container">
        {/* Animated Scanner Avatar */}
        <div className="scanner-agent-avatar">
          <div className="agent-ring-outer" />
          <div className="agent-ring-pulse" />
          <div className="agent-center-circle">
            <Bot size={44} style={{ color: '#c4b5fd' }} />
          </div>
        </div>

        {/* Scanning Header */}
        <h2 className="scanning-title">TinyFish Agent is Scanning</h2>
        <p className="scanning-subtitle">
          Analyzing <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>{handle}</span> for event announcements...
        </p>

        {/* Inaccessible / Blocked State Handling (Honest Instagram Wall reporting) */}
        {isBlocked ? (
          <div style={{
            width: '100%',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            textAlign: 'left',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <AlertCircle size={22} style={{ color: 'var(--accent-rose)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                Instagram Access Restricted
              </h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              The TinyFish browser agent successfully navigated to Instagram, but was intercepted by Instagram's login challenge wall. Public guest access without saved session credentials is restricted.
            </p>

            {blockedDetails && (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#f87171',
                marginBottom: '18px',
                maxHeight: '100px',
                overflowY: 'auto',
              }}>
                {typeof blockedDetails === 'string' ? blockedDetails : JSON.stringify(blockedDetails)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={onSwitchToPreview}
                style={{ fontSize: '14px', padding: '10px 20px' }}
                id="view-verified-demo-btn"
              >
                <Eye size={16} />
                <span>Open Verified GCET Demo</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={onRetry}
                style={{ fontSize: '14px' }}
                id="retry-scan-btn"
              >
                <RefreshCw size={15} />
                <span>Retry Agent Scan</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={onCancel}
                style={{ fontSize: '14px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Live Progress Timeline Card */
          <div className="scanning-timeline-card">
            {steps.map((step) => {
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="timeline-step">
                  <div className="timeline-step-left">
                    <div
                      className={`timeline-icon-box ${
                        isDone ? 'done' : isActive ? 'active' : 'pending'
                      }`}
                    >
                      {isDone ? (
                        <Check size={14} />
                      ) : isActive ? (
                        <div className="spinner-sm" />
                      ) : (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                      )}
                    </div>

                    <span
                      className={`timeline-step-label ${
                        isDone ? 'done' : isActive ? 'active' : 'pending'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  <div className="timeline-step-status">
                    {isDone ? (
                      <span className="timeline-step-status done">
                        <Check size={14} />
                        Done
                      </span>
                    ) : isActive ? (
                      <span style={{ color: 'var(--primary-purple)', fontSize: '13px' }}>
                        In progress...
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Live Logs / Agent Diagnostics Toggle */}
        <div style={{ width: '100%', marginTop: '20px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowLogs(!showLogs)}
            style={{ fontSize: '13px', padding: '6px 14px', width: 'fit-content' }}
          >
            <Terminal size={14} />
            <span>{showLogs ? 'Hide Agent Logs' : 'View Agent Stream Logs'}</span>
            {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showLogs && (
            <div style={{
              marginTop: '12px',
              backgroundColor: '#0c0919',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontFamily: 'monospace',
              fontSize: '12.5px',
              textAlign: 'left',
              color: '#cbd5e1',
              maxHeight: '180px',
              overflowY: 'auto',
            }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase' }}>
                TinyFish Agent Real-Time Telemetry:
              </div>
              {timelineLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>Initializing browser runner session...</div>
              ) : (
                timelineLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>
                    <span style={{ color: 'var(--primary-purple)' }}>[{log.timestamp.slice(11, 19)}]</span>{' '}
                    <span>{log.text}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Cancel Scan Button */}
        {!isBlocked && (
          <div style={{ marginTop: '28px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              style={{ fontSize: '14px', padding: '8px 24px' }}
              id="cancel-scan-btn"
            >
              Cancel Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
