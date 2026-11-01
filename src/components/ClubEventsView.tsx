import React from 'react';
import { ArrowLeft, RefreshCw, Calendar, MapPin, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { Club, ClubEvent } from '../types';

interface ClubEventsViewProps {
  club: Club;
  events: ClubEvent[];
  onBack: () => void;
  onScanAgain: (club: Club) => void;
  isScanning: boolean;
}

export const ClubEventsView: React.FC<ClubEventsViewProps> = ({
  club,
  events,
  onBack,
  onScanAgain,
  isScanning,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Back button */}
      <div className="top-nav" onClick={onBack} id="back-to-clubs-view" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} />
        <span>Back to Monitored Clubs</span>
      </div>

      {/* Club Header Banner */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 28px',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="instagram-logo-badge" style={{ width: '46px', height: '46px', borderRadius: '12px' }}>
            <InstagramIcon size={24} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
              {club.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <a
                href={club.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '13.5px',
                  color: 'var(--primary-purple)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                }}
              >
                <span>{club.handle}</span>
                <ExternalLink size={12} />
              </a>

              <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>•</span>

              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {events.length} event(s) on record
              </span>
            </div>
          </div>
        </div>

        {/* Scan Again Action */}
        <button
          type="button"
          className="btn-primary"
          onClick={() => onScanAgain(club)}
          disabled={isScanning}
          id="scan-again-btn"
          style={{ padding: '10px 22px', fontSize: '14px', opacity: isScanning ? 0.7 : 1 }}
        >
          <RefreshCw size={15} style={isScanning ? { animation: 'spin 1s linear infinite' } : {}} />
          <span>{isScanning ? 'Scanning Instagram...' : 'Scan Again'}</span>
        </button>
      </div>

      {/* Honest Warning if Instagram Login Wall was hit */}
      {club.lastScanStatus === 'login_wall' && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}>
          <AlertTriangle size={22} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              Instagram Login Challenge Detected
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The TinyFish browser agent reached <a href={club.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-purple)' }}>{club.url}</a>, but Instagram redirected to a login wall (<em>"See everyday moments from your close friends"</em>). Unauthenticated access without session credentials is restricted by Meta for this profile. No fake events are shown.
            </p>
          </div>
        </div>
      )}

      {/* Discovered Events Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
          Discovered Events for {club.name}
        </h3>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing events strictly belonging to {club.handle}
        </span>
      </div>

      {/* Events List or Empty State */}
      {events.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '60px 20px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            margin: '0 auto 16px auto'
          }}>
            <Calendar size={24} />
          </div>

          <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            No Events Discovered Yet
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            No announcements have been extracted from {club.handle}'s public posts yet. Click <strong>Scan Again</strong> to instruct the TinyFish agent to inspect recent posts.
          </p>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => onScanAgain(club)}
            disabled={isScanning}
            style={{ fontSize: '13.5px', padding: '8px 20px' }}
          >
            <RefreshCw size={14} />
            <span>Scan {club.name} Now</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map((evt) => (
            <div
              key={evt.id}
              className="card"
              style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontSize: '19px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                    {evt.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'var(--primary-purple)' }} />
                      <span>{evt.date || 'Date unknown'}</span>
                    </div>

                    {evt.time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--primary-purple)' }} />
                        <span>{evt.time}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} style={{ color: 'var(--primary-purple)' }} />
                      <span>{evt.venue || 'Venue unknown'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {evt.registrationUrl && (
                    <a
                      href={evt.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ fontSize: '12.5px', padding: '7px 16px' }}
                    >
                      <span>Register</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <a
                    href={evt.sourcePostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '12.5px', padding: '7px 14px' }}
                  >
                    <span>Source Post</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {evt.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {evt.description}
                </p>
              )}

              {evt.sourceCaption && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}>
                  " {evt.sourceCaption} "
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
