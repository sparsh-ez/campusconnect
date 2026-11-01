import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Eye, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Info,
  Clock
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import { AgentActivityPanel } from './AgentActivityPanel';
import type { CampusEvent, Club, InstagramAuthSession } from '../types';

interface AiEventDiscoveryViewProps {
  clubs: Club[];
  onClubAdded: (newClub: Club) => void;
  onViewFeed: () => void;
  onRefreshClubs: () => void;
  instagramSession?: InstagramAuthSession | null;
  onOpenInstagramAuth?: () => void;
  initialClubForScan?: Club | null;
  onClearInitialClubForScan?: () => void;
  onActiveSimulationUpdate?: (data: {
    club: Club;
    stageName: string;
    stageIndex: number;
    totalStages: number;
    elapsedSeconds: number;
    progressPercent: number;
  } | null) => void;
}

export const AiEventDiscoveryView: React.FC<AiEventDiscoveryViewProps> = ({
  clubs,
  onClubAdded,
  onViewFeed,
  onRefreshClubs,
  instagramSession,
  onOpenInstagramAuth,
  initialClubForScan,
  onClearInitialClubForScan,
  onActiveSimulationUpdate,
}) => {
  const isConnected = instagramSession?.status === 'connected';
  // Screen state: 'screen_a' (Add/Select club) | 'screen_b' (Scanning) | 'screen_c' (Results & Review)
  const [screen, setScreen] = useState<'screen_a' | 'screen_b' | 'screen_c'>('screen_a');

  // Form fields for Screen A
  const [clubName, setClubName] = useState('');
  const [handle, setHandle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingClub, setIsSavingClub] = useState(false);

  // Selected club for scan
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // Discovered events for Screen C
  const [discoveredEvents, setDiscoveredEvents] = useState<CampusEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // Editing event modal state
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Handle Form Submit: Add Club & Proceed
  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = clubName.trim();
    const trimmedHandle = handle.trim();

    if (!trimmedName) {
      setFormError('Please enter the club name.');
      return;
    }
    if (!trimmedHandle) {
      setFormError('Please enter an Instagram handle or profile URL.');
      return;
    }

    setIsSavingClub(true);
    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          handle: trimmedHandle,
          linkedinUrl: linkedinUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save club.');
        setIsSavingClub(false);
        return;
      }

      onClubAdded(data.club);
      setSelectedClub(data.club);
      setClubName('');
      setHandle('');
      setLinkedinUrl('');
      setIsSavingClub(false);

      // Immediately launch scan for this newly saved club
      initiateScan(data.club);
    } catch (err: any) {
      setFormError(err.message || 'Network error.');
      setIsSavingClub(false);
    }
  };

  // Automatically trigger scan if initialClubForScan is passed
  React.useEffect(() => {
    if (initialClubForScan) {
      setSelectedClub(initialClubForScan);
      setScreen('screen_b');
      if (onClearInitialClubForScan) onClearInitialClubForScan();
    }
  }, [initialClubForScan]);

  // Initiate simulated agent scan workflow for the selected club
  const initiateScan = (clubToScan: Club) => {
    setSelectedClub(clubToScan);
    setScreen('screen_b');
  };

  // Toggle selection for publishing
  const toggleSelectEvent = (id: string) => {
    if (selectedEventIds.includes(id)) {
      setSelectedEventIds(selectedEventIds.filter(i => i !== id));
    } else {
      setSelectedEventIds([...selectedEventIds, id]);
    }
  };

  // Confirm and Publish selected events
  const handlePublishEvents = async () => {
    if (selectedEventIds.length === 0) return;
    setIsPublishing(true);

    try {
      const res = await fetch('/api/events/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventIds: selectedEventIds }),
      });

      const data = await res.json();
      setIsPublishing(false);
      setShowConfirmModal(false);

      if (res.ok) {
        setPublishSuccessMsg(`Published ${data.publishedCount} event(s) to the Unified Campus Feed.`);
        onRefreshClubs();

        // Update local state to show verified
        setDiscoveredEvents(prev => prev.map(e => {
          if (selectedEventIds.includes(e.id)) {
            return { ...e, isPublished: true, verificationStatus: 'verified' };
          }
          return e;
        }));
      }
    } catch (err) {
      setIsPublishing(false);
      setShowConfirmModal(false);
    }
  };

  // Save edited event
  const handleSaveEditedEvent = async (updated: CampusEvent) => {
    try {
      const res = await fetch('/api/events/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setDiscoveredEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
        setEditingEvent(null);
      }
    } catch (err) {
      console.error('Update event error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ========================================================
          SCREEN A: Add a Club & Select Monitored Club to Scan
      ======================================================== */}
      {screen === 'screen_a' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header */}
          <div>
            <div className="ai-badge" style={{ marginBottom: '12px' }}>
              <Sparkles size={14} />
              <span>AI Event Discovery Engine</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
              Discover Events from Club Socials
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '4px', maxWidth: '640px' }}>
              Add a college club's social media handle. TinyFish will analyze its accessible posts and find upcoming or ongoing events.
            </p>
          </div>

          {/* Instagram Persistent Browser Session Banner */}
          <div style={{
            backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="instagram-logo-badge" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <InstagramIcon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#ffffff' }}>
                  {isConnected ? 'Persistent Authenticated Instagram Session Active' : 'Instagram Authentication Recommended'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {isConnected 
                    ? `TinyFish Browser Profile (${instagramSession?.profileId}) is authenticated for instagram.com. Subsequent scans will reuse this session without credentials prompts.` 
                    : 'Meta blocks guest viewing on many club profiles. Connect your Instagram account to enable TinyFish agents to inspect posts.'}
                </div>
              </div>
            </div>

            {onOpenInstagramAuth && (
              <button
                type="button"
                className={isConnected ? 'btn-secondary' : 'btn-primary'}
                onClick={onOpenInstagramAuth}
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
                id="ai-discovery-instagram-auth-btn"
              >
                <span>{isConnected ? 'Manage Session' : 'Connect Instagram'}</span>
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* Form Card: Add Club */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
                Add New Club
              </h2>

              <form onSubmit={handleSaveClub} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Club Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lingua Franca or Coding Club GCET"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="handle-text-input"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                    }}
                    id="add-club-name-input"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Instagram Handle or Profile URL *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    gap: '8px'
                  }}>
                    <InstagramIcon size={18} />
                    <input
                      type="text"
                      placeholder="e.g. @linguafranca.gcet or instagram.com/linguafranca.gcet"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        width: '100%',
                      }}
                      id="add-club-handle-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    LinkedIn Profile URL (Optional)
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    gap: '8px'
                  }}>
                    <LinkedinIcon size={18} />
                    <input
                      type="text"
                      placeholder="e.g. linkedin.com/company/lingua-franca"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        width: '100%',
                      }}
                      id="add-club-linkedin-input"
                    />
                  </div>
                </div>

                {formError && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '12.5px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {formError}
                  </div>
                )}

                {/* Example note */}
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong>Example:</strong> Club Name: <em>Lingua Franca</em>, Instagram Handle: <code>@linguafranca.gcet</code>. Handles are normalized automatically.
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSavingClub}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
                  id="save-club-btn"
                >
                  <Plus size={16} />
                  <span>{isSavingClub ? 'Saving Club...' : 'Save Club & Start Scan'}</span>
                </button>
              </form>
            </div>

            {/* Existing Monitored Clubs Section */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Select Club to Scan
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {clubs.length} monitored
                </span>
              </div>

              {clubs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  No clubs added yet. Use the form on the left to add your first club.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto' }}>
                  {clubs.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="instagram-logo-badge" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                          <InstagramIcon size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{c.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--primary-purple)' }}>{c.handle}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => initiateScan(c)}
                        style={{ fontSize: '12.5px', padding: '6px 14px' }}
                        id={`scan-club-${c.cleanHandle}`}
                      >
                        <Sparkles size={14} />
                        <span>Scan for Events</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCREEN B: Club Scanning (Simulated Agent Activity Panel)
      ======================================================== */}
      {screen === 'screen_b' && selectedClub && (
        <AgentActivityPanel
          club={selectedClub}
          onCancel={() => {
            // Stay in Screen B, AgentActivityPanel presents "Discovery cancelled" state
          }}
          onComplete={(events) => {
            setDiscoveredEvents(events);
            setSelectedEventIds(events.map(e => e.id));
            onRefreshClubs();
          }}
          onBackToClubs={() => {
            setScreen('screen_a');
            setSelectedClub(null);
          }}
          onViewFeed={onViewFeed}
          onOpenReview={() => setScreen('screen_c')}
          onDockUpdate={onActiveSimulationUpdate}
        />
      )}

      {/* ========================================================
          SCREEN C: Scan Results, Review & Publish
      ======================================================== */}
      {screen === 'screen_c' && selectedClub && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top back */}
          <div 
            className="top-nav" 
            onClick={() => setScreen('screen_a')}
            style={{ width: 'fit-content' }}
          >
            <ArrowLeft size={16} />
            <span>AI Event Discovery</span>
          </div>

          {/* Success Banner if published */}
          {publishSuccessMsg && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--accent-emerald)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              color: '#ffffff',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
                <span>{publishSuccessMsg}</span>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={onViewFeed}
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                Go to Campus Feed
              </button>
            </div>
          )}

          {/* Scan summary metrics */}
          <div className="summary-cards-grid">
            <div className="summary-card">
              <div className="instagram-logo-badge" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                <InstagramIcon size={22} />
              </div>
              <div className="summary-content">
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#ffffff' }}>{selectedClub.handle}</span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{selectedClub.name}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon-box">
                <Calendar size={22} />
              </div>
              <div className="summary-content">
                <span className="summary-metric">{discoveredEvents.length}</span>
                <span className="summary-label">Discovered Events</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon-box emerald">
                <CheckCircle2 size={22} />
              </div>
              <div className="summary-content">
                <span className="summary-metric">
                  {discoveredEvents.filter(e => e.verificationStatus === 'verified').length}
                </span>
                <span className="summary-label">Verified & Published</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon-box amber">
                <Clock size={22} />
              </div>
              <div className="summary-content">
                <span className="summary-metric">
                  {discoveredEvents.filter(e => e.verificationStatus === 'pending').length}
                </span>
                <span className="summary-label">Pending Review</span>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="section-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <h2 className="section-title">Extracted Event Announcements</h2>
              <button
                type="button"
                className="suggestion-chip"
                onClick={() => {
                  if (selectedEventIds.length === discoveredEvents.length) {
                    setSelectedEventIds([]);
                  } else {
                    setSelectedEventIds(discoveredEvents.map(e => e.id));
                  }
                }}
                style={{ fontSize: '12px' }}
              >
                {selectedEventIds.length === discoveredEvents.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="section-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => initiateScan(selectedClub)}
                style={{ fontSize: '13.5px', padding: '8px 16px' }}
              >
                <RefreshCw size={14} />
                <span>Rescan Club</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowConfirmModal(true)}
                disabled={selectedEventIds.length === 0}
                style={{
                  fontSize: '13.5px',
                  padding: '8px 18px',
                  opacity: selectedEventIds.length === 0 ? 0.5 : 1,
                  cursor: selectedEventIds.length === 0 ? 'not-allowed' : 'pointer'
                }}
                id="publish-selected-btn"
              >
                <Plus size={16} />
                <span>
                  {selectedEventIds.length > 0 
                    ? `Publish ${selectedEventIds.length} to Unified Feed` 
                    : 'Publish to Feed'}
                </span>
              </button>
            </div>
          </div>

          {/* Discovered Events List */}
          {discoveredEvents.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontSize: '15px', marginBottom: '12px' }}>
                No events were extracted from accessible posts during this scan.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => initiateScan(selectedClub)}
              >
                Retry Scan
              </button>
            </div>
          ) : (
            <div className="events-list">
              {discoveredEvents.map((evt) => {
                const isSelected = selectedEventIds.includes(evt.id);
                const isVerified = evt.verificationStatus === 'verified';
                const isUnconfirmed = evt.classification === 'unconfirmed' || !evt.date;

                return (
                  <div
                    key={evt.id}
                    className={`event-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setEditingEvent(evt)}
                  >
                    <div className="event-card-left">
                      {/* Thumbnail */}
                      <div className="event-thumbnail-box">
                        <img
                          src={evt.image}
                          alt={evt.title}
                          className="event-thumbnail-img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/hero-illustration.png';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="event-meta-info">
                        <div className="event-title-row">
                          <span className="event-title">{evt.title}</span>
                          <span className="category-tag">{evt.category}</span>
                          {isVerified ? (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid var(--accent-emerald)',
                              color: 'var(--accent-emerald)',
                              fontSize: '11px',
                              padding: '1px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: 600
                            }}>
                              <CheckCircle2 size={11} />
                              Campus Verified
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid var(--accent-amber)',
                              color: 'var(--accent-amber)',
                              fontSize: '11px',
                              padding: '1px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: 600
                            }}>
                              <Clock size={11} />
                              Pending Review
                            </span>
                          )}
                        </div>

                        <div className="event-details-row">
                          <div className="event-detail-item">
                            <Calendar size={14} />
                            <span>{isUnconfirmed ? 'Date not confirmed' : (evt.date || 'Date not confirmed')}</span>
                          </div>

                          <div className="event-detail-item">
                            <MapPin size={14} />
                            <span>{evt.venue || 'Campus Venue'}</span>
                          </div>

                          {evt.registrationUrl ? (
                            <a
                              href={evt.registrationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="event-link-tag"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={13} />
                              <span>Registration Open</span>
                            </a>
                          ) : (
                            <a
                              href={evt.sourcePostUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="event-link-tag"
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              <ExternalLink size={13} />
                              <span>View Instagram Post</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(evt);
                        }}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        <Eye size={13} />
                        <span>Review & Edit</span>
                      </button>

                      <div
                        className={`custom-checkbox ${isSelected ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectEvent(evt.id);
                        }}
                        role="checkbox"
                        aria-checked={isSelected}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Note */}
          <div style={{ 
            marginTop: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '12.5px',
            color: 'var(--text-muted)'
          }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>
              Publishing requires explicit user confirmation. Only reviewed events receive the "Campus Verified" status in the unified feed.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          CONFIRMATION MODAL: Publish to Unified Campus Feed
      ======================================================== */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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
                Publish to Unified Campus Feed?
              </h3>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              You are about to verify and publish <strong>{selectedEventIds.length}</strong> event(s) to the official campus feed. They will be marked as "Campus Verified" and visible to all students.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handlePublishEvents}
                disabled={isPublishing}
                id="confirm-publish-action-btn"
              >
                <CheckCircle2 size={16} />
                <span>{isPublishing ? 'Publishing...' : 'Confirm & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          REVIEW & EDIT MODAL: Edit Incorrect Details
      ======================================================== */}
      {editingEvent && (
        <div className="modal-overlay" onClick={() => setEditingEvent(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
              Review & Edit Discovered Event
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Event Title
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="handle-text-input"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Event Date (e.g. Nov 14, 2026 or leave empty for unconfirmed)
                  </label>
                  <input
                    type="text"
                    value={editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value || null })}
                    placeholder="Leave empty if unconfirmed"
                    className="handle-text-input"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Venue
                  </label>
                  <input
                    type="text"
                    value={editingEvent.venue || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value || null })}
                    placeholder="e.g. GCET Auditorium"
                    className="handle-text-input"
                    style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="handle-text-input"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Registration Link (actual destination)
                </label>
                <input
                  type="text"
                  value={editingEvent.registrationUrl || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, registrationUrl: e.target.value || null })}
                  placeholder="https://..."
                  className="handle-text-input"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingEvent(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSaveEditedEvent(editingEvent)}
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
