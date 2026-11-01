import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import type { DiscoveredEvent } from '../types';

interface UnifiedEventsFeedProps {
  events: DiscoveredEvent[];
  onOpenReview: (event: DiscoveredEvent) => void;
  onNavigateToScan: () => void;
}

export const UnifiedEventsFeed: React.FC<UnifiedEventsFeedProps> = ({
  events,
  onOpenReview,
  onNavigateToScan,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'upcoming' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const clubs = Array.from(new Set(events.map((e) => e.organizer)));

  const filteredEvents = events.filter((e) => {
    // Tab filter
    if (activeTab === 'ongoing' && e.classification !== 'ongoing') return false;
    if (activeTab === 'upcoming' && e.classification !== 'upcoming') return false;
    if (activeTab === 'verified' && e.verification_status !== 'verified') return false;

    // Club filter
    if (selectedClub !== 'all' && e.organizer !== selectedClub) return false;

    // Platform filter
    if (selectedPlatform !== 'all' && e.platform !== selectedPlatform) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.event_name.toLowerCase().includes(q);
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchVenue = (e.venue || '').toLowerCase().includes(q);
      const matchCategory = e.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchVenue && !matchCategory) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            Campus Events Feed
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Aggregated upcoming gatherings, tech summits, and cultural fests discovered across campus clubs.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onNavigateToScan}
          style={{ fontSize: '14px', padding: '10px 22px' }}
        >
          <Sparkles size={16} />
          <span>Discover New Events</span>
        </button>
      </div>

      {/* Tabs & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px'
      }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: `All Events (${events.length})` },
            { id: 'ongoing', label: 'Ongoing Now' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'verified', label: 'Campus Verified' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            gap: '8px'
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search events, venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '13px',
                width: '160px'
              }}
            />
          </div>

          {/* Club Dropdown */}
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              padding: '6px 14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Clubs</option>
            {clubs.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Platform filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              padding: '6px 14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Sources</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Events List Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>
            No events match the selected criteria.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setActiveTab('all');
              setSelectedClub('all');
              setSelectedPlatform('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filteredEvents.map((evt) => {
            const isVerified = evt.verification_status === 'verified';
            return (
              <div
                key={evt.id}
                className="card"
                onClick={() => onOpenReview(evt)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Image Banner */}
                <div style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '14px',
                  position: 'relative'
                }}>
                  <img
                    src={evt.image}
                    alt={evt.event_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Classification tag */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: evt.classification === 'ongoing' ? 'rgba(239, 68, 68, 0.85)' : 'rgba(15, 12, 30, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {evt.classification === 'ongoing' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', animation: 'spin 1s infinite' }} />}
                    {evt.classification}
                  </div>

                  {/* Platform icon */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(15, 12, 30, 0.85)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    {evt.platform === 'instagram' ? <InstagramIcon size={15} /> : <LinkedinIcon size={15} />}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="category-tag">{evt.category}</span>
                  {isVerified ? (
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <Clock size={12} /> Under Review
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                  {evt.event_name}
                </h3>

                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {evt.organizer} ({evt.handle})
                </p>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {evt.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                  marginTop: 'auto',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} style={{ color: 'var(--primary-purple)' }} />
                    <span>{evt.date || 'TBD'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: 'var(--primary-purple)' }} />
                    <span>{evt.venue || 'TBD'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
