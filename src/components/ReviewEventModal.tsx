import React, { useState } from 'react';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { DiscoveredEvent } from '../types';

interface ReviewEventModalProps {
  event: DiscoveredEvent;
  onClose: () => void;
  onSave: (updatedEvent: DiscoveredEvent) => void;
  onVerifyAndPublish: (eventId: string) => void;
}

export const ReviewEventModal: React.FC<ReviewEventModalProps> = ({
  event,
  onClose,
  onSave,
  onVerifyAndPublish,
}) => {
  const [formData, setFormData] = useState<DiscoveredEvent>({ ...event });

  const handleChange = (field: keyof DiscoveredEvent, value: any) => {
    setFormData((prev: DiscoveredEvent) => ({ ...prev, [field]: value }));
  };

  const handleSaveOnly = () => {
    onSave(formData);
    onClose();
  };

  const handleVerify = () => {
    const verified = { ...formData, verification_status: 'verified' as const };
    onSave(verified);
    onVerifyAndPublish(event.id);
    onClose();
  };

  const confidencePct = formData.confidence ? Math.round(formData.confidence * 100) : 90;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="category-tag">{formData.category}</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#c4b5fd',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              fontWeight: 600,
            }}>
              <span>Confidence: {confidencePct}%</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Poster preview */}
        <div style={{
          width: '100%',
          height: '190px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}>
          <img
            src={formData.image}
            alt={formData.event_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(8, 6, 18, 0.8)',
            backdropFilter: 'blur(6px)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <InstagramIcon size={13} />
            <span>Source: {formData.handle}</span>
          </div>
        </div>

        {/* Event Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Event Title
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => handleChange('event_name', e.target.value)}
              className="handle-text-input"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Event Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.date || ''}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="handle-text-input"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                  }}
                  placeholder="e.g. Nov 14, 2026"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Venue / Location
              </label>
              <input
                type="text"
                value={formData.venue || ''}
                onChange={(e) => handleChange('venue', e.target.value)}
                className="handle-text-input"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                }}
                placeholder="e.g. Main Auditorium"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="handle-text-input"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Registration URL
            </label>
            <input
              type="text"
              value={formData.registration_url || ''}
              onChange={(e) => handleChange('registration_url', e.target.value)}
              className="handle-text-input"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
              }}
              placeholder="https://..."
            />
          </div>

          {/* Social Source link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Source Post:
            </span>
            <a
              href={formData.source_url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '13px',
                color: 'var(--primary-purple)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <span>Open Instagram Announcement</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleSaveOnly}
          >
            Save Changes
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleVerify}
            id="verify-publish-single-btn"
          >
            <CheckCircle2 size={16} />
            <span>Verify & Publish to Campus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
