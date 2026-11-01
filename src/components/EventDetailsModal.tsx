import React from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  CheckCircle2
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import type { CampusEvent } from '../types';

interface EventDetailsModalProps {
  event: CampusEvent;
  onClose: () => void;
  onEdit?: (event: CampusEvent) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  onEdit,
}) => {
  const isVerified = event.verificationStatus === 'verified';
  const isUnconfirmed = event.classification === 'unconfirmed' || !event.date;

  const formattedDiscoveryDate = event.discoveredAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(event.discoveredAt))
    : 'Recently';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="category-tag">{event.category}</span>
            {isVerified ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                border: '1px solid var(--accent-emerald)',
                fontWeight: 600,
              }}>
                <CheckCircle2 size={12} />
                Campus Verified
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                border: '1px solid var(--accent-amber)',
                fontWeight: 600,
              }}>
                <Clock size={12} />
                Under Review
              </span>
            )}
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

        {/* Poster image */}
        <div style={{
          width: '100%',
          height: '220px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '20px',
          position: 'relative',
          border: '1px solid var(--border-subtle)'
        }}>
          <img
            src={event.image}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/hero-illustration.png';
            }}
          />

          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(8, 6, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {event.platform === 'linkedin' ? <LinkedinIcon size={13} /> : <InstagramIcon size={13} />}
            <span>Source: {event.clubHandle}</span>
          </div>
        </div>

        {/* Title & Organizer */}
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
          {event.title}
        </h2>
        <div style={{ fontSize: '14px', color: 'var(--primary-purple)', fontWeight: 600, marginBottom: '18px' }}>
          Organized by {event.clubName} ({event.clubHandle})
        </div>

        {/* Key Event Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Event Date & Time
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: isUnconfirmed ? 'var(--accent-amber)' : '#ffffff' }}>
              <Calendar size={14} style={{ color: 'var(--primary-purple)' }} />
              <span>{isUnconfirmed ? 'Date not confirmed' : `${event.date}${event.time ? ` at ${event.time}` : ''}`}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Venue / Location
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#ffffff' }}>
              <MapPin size={14} style={{ color: 'var(--primary-purple)' }} />
              <span>{event.venue || 'Campus Venue'}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Discovered At
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {formattedDiscoveryDate}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
              Status Classification
            </span>
            <span style={{ 
              fontSize: '12.5px', 
              fontWeight: 700, 
              color: event.classification === 'ongoing' ? 'var(--accent-rose)' : '#c4b5fd',
              textTransform: 'capitalize'
            }}>
              {isUnconfirmed ? 'Date not confirmed' : event.classification}
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
            Event Description
          </h4>
          <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {event.description || 'No detailed description provided in social post.'}
          </p>
        </div>

        {/* Source Caption if extracted */}
        {event.sourceCaption && (
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Original Post Caption:
            </div>
            {event.sourceCaption}
          </div>
        )}

        {/* External Links Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '14px',
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          {/* Registration URL */}
          {event.registrationUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Official Registration:
              </span>
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ fontSize: '12.5px', padding: '6px 14px', textDecoration: 'none' }}
              >
                <span>Open Registration Form</span>
                <ExternalLink size={13} />
              </a>
            </div>
          ) : (
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              No external registration form link provided. Refer to the original announcement post.
            </div>
          )}

          {/* Source Post URL */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Source Post:
            </span>
            <a
              href={event.sourcePostUrl}
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
              <span>View Announcement on Instagram</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          {onEdit && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
            >
              Edit Details
            </button>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
