import React from 'react';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import type { DiscoveredEvent } from '../types';

interface ConfirmationModalProps {
  selectedEvents: DiscoveredEvent[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  selectedEvents,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-purple)'
            }}>
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
              Publish to Campus Events?
            </h3>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
          You are about to verify and add <strong>{selectedEvents.length}</strong> discovered event(s) to the official CampusConnect event feed. This will make them visible to all college students.
        </p>

        {/* Selected events list summary */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          maxHeight: '160px',
          overflowY: 'auto',
          marginBottom: '24px',
        }}>
          {selectedEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: '#ffffff' }}>{evt.event_name}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '12px' }}>
                  ({evt.date || 'TBD'})
                </span>
              </div>
              <span className="category-tag" style={{ fontSize: '11px', padding: '1px 8px' }}>
                {evt.category}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            id="cancel-publish-btn"
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            id="confirm-publish-btn"
          >
            <CheckCircle2 size={16} />
            <span>Confirm & Publish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
