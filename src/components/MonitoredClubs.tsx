import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  X
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import type { Club } from '../types';

interface MonitoredClubsProps {
  clubs: Club[];
  onAddClubClick: () => void;
  onScanClub: (club: Club) => void;
  onViewEvents: (club: Club) => void;
  onRemoveClub: (clubId: string) => void;
  onUpdateClub?: (clubId: string, updates: { name?: string; linkedinUrl?: string | null }) => void;
  scanningClubId: string | null;
}

export const MonitoredClubs: React.FC<MonitoredClubsProps> = ({
  clubs,
  onAddClubClick,
  onScanClub,
  onViewEvents,
  onRemoveClub,
  onUpdateClub,
  scanningClubId,
}) => {
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);
  const [clubToEdit, setClubToEdit] = useState<Club | null>(null);
  const [editName, setEditName] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');

  const handleOpenEdit = (club: Club) => {
    setClubToEdit(club);
    setEditName(club.name);
    setEditLinkedin(club.linkedinUrl || '');
  };

  const handleSaveEdit = async () => {
    if (!clubToEdit || !editName.trim()) return;
    try {
      const res = await fetch('/api/clubs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: clubToEdit.id,
          name: editName.trim(),
          linkedinUrl: editLinkedin.trim() || null,
        }),
      });

      if (res.ok && onUpdateClub) {
        onUpdateClub(clubToEdit.id, {
          name: editName.trim(),
          linkedinUrl: editLinkedin.trim() || null,
        });
      }
      setClubToEdit(null);
    } catch (err) {
      console.error('Failed to update club:', err);
    }
  };

  const formatLastScanTime = (isoString: string | null) => {
    if (!isoString) return 'Never scanned';
    try {
      const date = new Date(isoString);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return 'Just now';
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} mins ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Never scanned';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            Monitored Campus Clubs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '4px' }}>
            Official student clubs and chapters monitored by TinyFish agents.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onAddClubClick}
          id="monitored-clubs-add-btn"
        >
          <Plus size={16} />
          <span>Add a Club</span>
        </button>
      </div>

      {/* Clubs Grid or Empty State */}
      {clubs.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-purple)'
          }}>
            <Users size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>No clubs monitored yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', marginTop: '6px' }}>
              Add a college club with its Instagram handle to automatically discover and aggregate its events.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={onAddClubClick}
          >
            <Plus size={16} />
            <span>Add First Club</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {clubs.map((club) => {
            const isScanning = scanningClubId === club.id;

            return (
              <div
                key={club.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  {/* Top row: Badges & Links */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="instagram-logo-badge" style={{ width: '42px', height: '42px', borderRadius: '10px' }}>
                        <InstagramIcon size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                          {club.name}
                        </h3>
                        <a
                          href={club.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '13px',
                            color: 'var(--primary-purple)',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none'
                          }}
                        >
                          <span>{club.handle}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Quick edit/remove buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                        }}
                        onClick={() => handleOpenEdit(club)}
                        title="Edit Club"
                        id={`edit-club-${club.cleanHandle}`}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                        }}
                        onClick={() => setClubToDelete(club)}
                        title="Remove Club"
                        id={`remove-club-${club.cleanHandle}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* LinkedIn if configured */}
                  {club.linkedinUrl && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '14px'
                    }}>
                      <LinkedinIcon size={14} />
                      <a
                        href={club.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'none' }}
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}

                  {/* Metrics box */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                        Discovered Events
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                        {club.eventCount || 0}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                        Last Actual Scan
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {formatLastScanTime(club.lastScannedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div style={{ fontSize: '12.5px', marginBottom: '8px' }}>
                    {isScanning ? (
                      <span style={{ color: 'var(--primary-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Agent Scanning Instagram...</span>
                      </span>
                    ) : club.lastScanStatus === 'login_wall' ? (
                      <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldAlert size={14} />
                        <span>Instagram login challenge detected</span>
                      </span>
                    ) : club.lastScanStatus === 'success' ? (
                      <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} />
                        <span>Scan complete ({club.eventCount} events)</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} />
                        <span>Ready to scan</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onViewEvents(club)}
                    style={{ fontSize: '13px', padding: '7px 14px', flex: 1, justifyContent: 'center' }}
                    id={`view-events-${club.cleanHandle}`}
                  >
                    <Calendar size={14} />
                    <span>View Events</span>
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onScanClub(club)}
                    disabled={isScanning}
                    style={{ fontSize: '13px', padding: '7px 16px', flex: 1, justifyContent: 'center' }}
                    id={`scan-events-btn-${club.cleanHandle}`}
                  >
                    <RefreshCw size={14} style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
                    <span>{isScanning ? 'Scanning...' : 'Scan Events'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REMOVE CLUB CONFIRMATION MODAL */}
      {clubToDelete && (
        <div className="modal-overlay" onClick={() => setClubToDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)'
              }}>
                <Trash2 size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                Remove {clubToDelete.name}?
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Are you sure you want to remove <strong>{clubToDelete.name}</strong> ({clubToDelete.handle}) from monitored clubs? TinyFish will stop automated scanning for this club.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setClubToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onRemoveClub(clubToDelete.id);
                  setClubToDelete(null);
                }}
                style={{ backgroundColor: 'var(--accent-rose)' }}
                id="confirm-remove-club-btn"
              >
                Remove Club
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLUB MODAL */}
      {clubToEdit && (
        <div className="modal-overlay" onClick={() => setClubToEdit(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                Edit Club
              </h3>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setClubToEdit(null)}
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Club Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="handle-text-input"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  LinkedIn Profile URL (Optional)
                </label>
                <input
                  type="text"
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="handle-text-input"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setClubToEdit(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
