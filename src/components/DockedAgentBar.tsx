import React from 'react';
import { Bot, Clock, XCircle, ArrowRight } from 'lucide-react';
import type { Club } from '../types';

interface DockedAgentBarProps {
  club: Club;
  stageName: string;
  stageIndex: number;
  totalStages: number;
  elapsedSeconds: number;
  progressPercent: number;
  onOpenFullView: () => void;
  onCancel: () => void;
}

export const DockedAgentBar: React.FC<DockedAgentBarProps> = ({
  club,
  stageName,
  stageIndex,
  totalStages,
  elapsedSeconds,
  progressPercent,
  onOpenFullView,
  onCancel,
}) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: '720px',
      backgroundColor: '#1b143a',
      border: '1px solid var(--primary-purple)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 20px',
      zIndex: 150,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        {/* Left: Bot avatar & title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            border: '1.5px solid var(--primary-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
          }}>
            <Bot size={20} style={{ color: '#c4b5fd' }} />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-emerald)',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
            }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {club.name}
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: '#c4b5fd',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                Demo Simulation
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>
                [{stageIndex + 1}/{totalStages}]
              </span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {stageName}...
              </span>
            </div>
          </div>
        </div>

        {/* Right: Elapsed timer & actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Clock size={13} />
            <span style={{ fontFamily: 'monospace', color: '#ffffff', fontWeight: 600 }}>
              {elapsedSeconds.toFixed(1)}s
            </span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenFullView}
            style={{ fontSize: '12px', padding: '6px 14px' }}
            id="docked-view-activity-btn"
          >
            <span>View Activity</span>
            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            style={{ fontSize: '12px', padding: '6px 10px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            title="Cancel Simulation"
            id="docked-cancel-btn"
          >
            <XCircle size={14} />
          </button>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
};
