import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  Plus, 
  Check, 
  MapPin, 
  Eye, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { DiscoveredEvent } from '../types';

interface ResultsDashboardProps {
  onBack: () => void;
  onRescan: () => void;
  onOpenReview: (event: DiscoveredEvent) => void;
  onAddSelectedToCampus: (selectedIds: string[]) => void;
  events: DiscoveredEvent[];
  clubHandle?: string;
  clubName?: string;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  onBack,
  onRescan,
  onOpenReview,
  onAddSelectedToCampus,
  events,
  clubHandle = '@rac_gei',
  clubName = 'Rotaract Club, GCET',
}) => {
  // Preselect the first two events matching reference design
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return events.slice(0, 2).map((e) => e.id);
  });

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === events.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(events.map((e) => e.id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top back navigation */}
      <div className="top-nav" onClick={onBack} id="back-to-landing">
        <ArrowLeft size={16} />
        <span>Event Discovery</span>
      </div>

      {/* Top 4 Summary Cards Grid */}
      <div className="summary-cards-grid">
        {/* Card 1: Club Profile */}
        <div className="summary-card">
          <div className="instagram-logo-badge" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
            <InstagramIcon size={22} />
          </div>
          <div className="summary-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#ffffff' }}>{clubHandle}</span>
            </div>
            <a 
              href={`https://instagram.com/${clubHandle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              style={{ 
                fontSize: '12.5px', 
                color: 'var(--text-secondary)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px',
                textDecoration: 'none',
                marginTop: '2px'
              }}
            >
              <span>{clubName}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Card 2: Events Found */}
        <div className="summary-card">
          <div className="summary-icon-box">
            <Calendar size={22} />
          </div>
          <div className="summary-content">
            <span className="summary-metric">{events.length}</span>
            <span className="summary-label">Events Found</span>
          </div>
        </div>

        {/* Card 3: New Events */}
        <div className="summary-card">
          <div className="summary-icon-box amber">
            <Sparkles size={22} />
          </div>
          <div className="summary-content">
            <span className="summary-metric">2</span>
            <span className="summary-label">New Events</span>
          </div>
        </div>

        {/* Card 4: Last Scanned */}
        <div className="summary-card">
          <div className="summary-icon-box emerald">
            <Clock size={22} />
          </div>
          <div className="summary-content">
            <span className="summary-label" style={{ marginTop: 0 }}>Last Scanned</span>
            <span style={{ fontWeight: 600, fontSize: '15px', color: '#ffffff', marginTop: '4px' }}>
              2 mins ago
            </span>
          </div>
        </div>
      </div>

      {/* Section Header: Discovered Events */}
      <div className="section-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <h2 className="section-title">Discovered Events</h2>
          <button
            type="button"
            className="suggestion-chip"
            onClick={handleSelectAll}
            style={{ fontSize: '12px' }}
          >
            {selectedIds.length === events.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="section-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onRescan}
            id="rescan-button"
            style={{ fontSize: '14px', padding: '9px 18px' }}
          >
            <RefreshCw size={15} />
            <span>Rescan</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => onAddSelectedToCampus(selectedIds)}
            disabled={selectedIds.length === 0}
            id="add-to-campus-events-btn"
            style={{ 
              fontSize: '14px', 
              padding: '9px 20px',
              opacity: selectedIds.length === 0 ? 0.5 : 1,
              cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Plus size={16} />
            <span>
              {selectedIds.length > 0 
                ? `Add ${selectedIds.length} to Campus Events` 
                : 'Add to Campus Events'}
            </span>
          </button>
        </div>
      </div>

      {/* Discovered Events List */}
      <div className="events-list">
        {events.map((evt) => {
          const isSelected = selectedIds.includes(evt.id);
          const isVerified = evt.verification_status === 'verified';

          return (
            <div
              key={evt.id}
              className={`event-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onOpenReview(evt)}
            >
              <div className="event-card-left">
                {/* Event Poster Thumbnail */}
                <div className="event-thumbnail-box">
                  <img
                    src={evt.image}
                    alt={evt.event_name}
                    className="event-thumbnail-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/hero-illustration.png';
                    }}
                  />
                </div>

                {/* Event Metadata */}
                <div className="event-meta-info">
                  <div className="event-title-row">
                    <span className="event-title">{evt.event_name}</span>
                    <span className="category-tag">{evt.category}</span>
                    {isVerified && (
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
                    )}
                  </div>

                  <div className="event-details-row">
                    <div className="event-detail-item">
                      <Calendar size={14} />
                      <span>{evt.date || 'Date TBD'}</span>
                    </div>

                    <div className="event-detail-item">
                      <MapPin size={14} />
                      <span>{evt.venue || 'Venue TBD'}</span>
                    </div>

                    {evt.registration_url ? (
                      <a
                        href={evt.registration_url}
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
                        href={evt.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="event-link-tag"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <ExternalLink size={13} />
                        <span>Details on Instagram</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Review button & Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReview(evt);
                  }}
                  style={{ 
                    fontSize: '12.5px', 
                    padding: '6px 12px',
                    borderColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                  title="Review extracted details"
                >
                  <Eye size={13} />
                  <span>Review</span>
                </button>

                <div
                  className={`custom-checkbox ${isSelected ? 'checked' : ''}`}
                  onClick={(e) => toggleSelect(evt.id, e)}
                  role="checkbox"
                  aria-checked={isSelected}
                  id={`checkbox-${evt.id}`}
                >
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note about unverified events */}
      <div style={{ 
        marginTop: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '12.5px',
        color: 'var(--text-muted)'
      }}>
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>
          Extracted events remain in the review queue until approved. Only verified events appear on the public student dashboard.
        </span>
      </div>
    </div>
  );
};
