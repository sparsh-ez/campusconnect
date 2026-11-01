import React from 'react';
import { Plus, ExternalLink, RefreshCw, Trash2, Calendar, AlertTriangle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { Club } from '../types';

interface MonitoredClubsProps {
  clubs: Club[];
  onAddClubClick: () => void;
  onScanClub: (club: Club) => void;
  onViewEvents: (club: Club) => void;
  onRemoveClub: (clubId: string) => void;
  scanningClubId: string | null;
}

export const MonitoredClubs: React.FC<MonitoredClubsProps> = ({
  clubs,
  onAddClubClick,
  onScanClub,
  onViewEvents,
  onRemoveClub,
  scanningClubId,
}) => {
  const getStatusBadge = (club: Club) => {
    if (scanningClubId === club.id || club.lastScanStatus === 'scanning') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid var(--primary-purple)',
          color: '#c4b5fd',
          fontSize: '12px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 600,
        }}>
          <span className="spinner-sm" style={{ width: '10px', height: '10px', borderWidth: '1.5px' }} />
          Agent Scanning...
        </span>
      );
    }

    if (club.lastScanStatus === 'login_wall') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: 'var(--accent-amber)',
          fontSize: '12px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 600,
        }} title={club.lastScanMessage || 'Instagram Login Wall'}>
          <AlertTriangle size={13} />
          Login Wall Detected
        </span>
      );
    }

    if (club.lastScanStatus === 'success') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: 'var(--accent-emerald)',
          fontSize: '12px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={13} />
          {club.eventCount > 0 ? `${club.eventCount} Event(s) Discovered` : 'Scan Complete (0 events)'}
        </span>
      );
    }

    if (club.lastScanStatus === 'failed') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: 'var(--accent-rose)',
          fontSize: '12px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 600,
        }}>
          Scan Failed
        </span>
      );
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: '12px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
      }}>
        <Clock size={12} />
        Never scanned
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            Monitored Campus Clubs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '4px' }}>
            College clubs tracked for Instagram event discovery via TinyFish web agents.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onAddClubClick}
          id="add-club-header-btn"
          style={{ padding: '10px 22px', fontSize: '14px' }}
        >
          <Plus size={16} />
          <span>Add Club</span>
        </button>
      </div>

      {/* Empty State */}
      {clubs.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '70px 24px',
          margin: '30px auto',
          maxWidth: '560px',
          width: '100%',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-purple)',
            margin: '0 auto 20px auto',
          }}>
            <Calendar size={28} />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            No Campus Clubs Added Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '28px', lineHeight: 1.5 }}>
            Add a club like <strong>Lingua Franca</strong> with its Instagram handle. CampusConnect will use TinyFish agents to inspect its recent posts for event announcements.
          </p>

          <button
            type="button"
            className="btn-primary"
            onClick={onAddClubClick}
            id="empty-add-club-btn"
            style={{ padding: '12px 28px', fontSize: '14.5px' }}
          >
            <Plus size={16} />
            <span>Add Your First Club</span>
          </button>
        </div>
      ) : (
        /* Clubs Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
          {clubs.map((club) => {
            const isScanning = scanningClubId === club.id;

            return (
              <div
                key={club.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                  borderColor: isScanning ? 'var(--primary-purple)' : undefined,
                  boxShadow: isScanning ? '0 0 20px rgba(139, 92, 246, 0.25)' : undefined,
                }}
              >
                <div>
                  {/* Card Header: Club details and Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="instagram-logo-badge" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                        <InstagramIcon size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                          {club.name}
                        </h3>
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
                            marginTop: '2px',
                          }}
                        >
                          <span>{club.handle}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {getStatusBadge(club)}
                  </div>

                  {/* Status explanation or message */}
                  {club.lastScanStatus === 'login_wall' && (
                    <div style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      color: '#fbbf24',
                      lineHeight: 1.45,
                      marginBottom: '16px',
                    }}>
                      <strong>Notice:</strong> Instagram redirected guest requests to a login screen. Meta requires session credentials for this profile.
                    </div>
                  )}

                  {club.lastScanStatus === 'success' && club.eventCount > 0 && (
                    <div style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      color: '#34d399',
                      lineHeight: 1.45,
                      marginBottom: '16px',
                    }}>
                      ✓ Found <strong>{club.eventCount}</strong> announced event(s) associated with {club.name}.
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  marginTop: '12px',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Scan Events button */}
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onScanClub(club)}
                      disabled={isScanning}
                      id={`scan-club-${club.id}`}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        opacity: isScanning ? 0.6 : 1,
                      }}
                    >
                      <RefreshCw size={13} className={isScanning ? 'spinner-sm' : ''} style={isScanning ? { animation: 'spin 1s linear infinite' } : {}} />
                      <span>{isScanning ? 'Scanning...' : 'Scan Events'}</span>
                    </button>

                    {/* View Events button */}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => onViewEvents(club)}
                      id={`view-events-${club.id}`}
                      style={{ padding: '8px 14px', fontSize: '13px' }}
                    >
                      <Eye size={13} />
                      <span>View Events ({club.eventCount})</span>
                    </button>
                  </div>

                  {/* Remove Club button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove "${club.name}" from monitored clubs?`)) {
                        onRemoveClub(club.id);
                      }
                    }}
                    id={`remove-club-${club.id}`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-rose)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-dim)')}
                    title="Remove club"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
