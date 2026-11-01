import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import type { CampusEvent } from '../types';

interface DiscoverEventsFeedProps {
  events: CampusEvent[];
  onOpenDetails: (event: CampusEvent) => void;
  onNavigateToScan: () => void;
}

export const DiscoverEventsFeed: React.FC<DiscoverEventsFeedProps> = ({
  events,
  onOpenDetails,
  onNavigateToScan,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'upcoming' | 'past' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const clubs = Array.from(new Set(events.map((e) => e.clubName))).filter(Boolean);
  const categories = Array.from(new Set(events.map((e) => e.category))).filter(Boolean);

  const filteredEvents = events.filter((e) => {
    // 1. Status Tab filter
    if (activeTab === 'ongoing' && e.classification !== 'ongoing') return false;
    if (activeTab === 'upcoming' && e.classification !== 'upcoming') return false;
    if (activeTab === 'past' && e.classification !== 'past') return false;
    if (activeTab === 'verified' && e.verificationStatus !== 'verified') return false;

    // 2. Club filter
    if (selectedClub !== 'all' && e.clubName !== selectedClub) return false;

    // 3. Category filter
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

    // 4. Platform filter
    if (selectedPlatform !== 'all' && e.platform !== selectedPlatform) return false;

    // 5. Search query (event name, description, venue)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.title.toLowerCase().includes(q);
      const matchDesc = (e.description || '').toLowerCase().includes(q);
      const matchVenue = (e.venue || '').toLowerCase().includes(q);
      const matchClub = e.clubName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchVenue && !matchClub) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            Discover Campus Events
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '4px' }}>
            Every event happening across your campus, in one place.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onNavigateToScan}
          id="discover-events-scan-cta"
        >
          <Sparkles size={16} />
          <span>AI Event Discovery</span>
        </button>
      </div>

      {/* 2. Primary Tabs (All, Happening Now, Upcoming, Past, Campus Verified) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Events (${events.length})` },
            { id: 'ongoing', label: 'Happening Now' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past Events' },
            { id: 'verified', label: 'Campus Verified' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
              id={`tab-filter-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '7px 16px',
          gap: '8px',
          width: '100%',
          maxWidth: '280px'
        }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search event name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '13px',
              width: '100%'
            }}
            id="feed-search-input"
          />
        </div>
      </div>

      {/* 3. Dropdown Filters (Club, Category, Platform) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Club dropdown */}
        <select
          value={selectedClub}
          onChange={(e) => setSelectedClub(e.target.value)}
          className="handle-text-input"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            padding: '7px 16px',
            width: 'auto',
            cursor: 'pointer'
          }}
          id="filter-club-dropdown"
        >
          <option value="all">All Clubs ({clubs.length})</option>
          {clubs.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Category dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="handle-text-input"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            padding: '7px 16px',
            width: 'auto',
            cursor: 'pointer'
          }}
          id="filter-category-dropdown"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Source platform dropdown */}
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="handle-text-input"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            padding: '7px 16px',
            width: 'auto',
            cursor: 'pointer'
          }}
          id="filter-platform-dropdown"
        >
          <option value="all">All Sources</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
        </select>

        {(selectedClub !== 'all' || selectedCategory !== 'all' || selectedPlatform !== 'all' || searchQuery.trim() || activeTab !== 'all') && (
          <button
            type="button"
            className="suggestion-chip"
            onClick={() => {
              setActiveTab('all');
              setSelectedClub('all');
              setSelectedCategory('all');
              setSelectedPlatform('all');
              setSearchQuery('');
            }}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* 4. Events Grid */}
      {filteredEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>
            No campus events match your selected filters.
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setActiveTab('all');
              setSelectedClub('all');
              setSelectedCategory('all');
              setSelectedPlatform('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
          {filteredEvents.map((evt) => {
            const isVerified = evt.verificationStatus === 'verified';
            const isUnconfirmed = evt.classification === 'unconfirmed' || !evt.date;

            return (
              <div
                key={evt.id}
                className="card"
                onClick={() => onOpenDetails(evt)}
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
                  height: '165px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '14px',
                  position: 'relative'
                }}>
                  <img
                    src={evt.image}
                    alt={evt.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/hero-illustration.png';
                    }}
                  />

                  {/* Classification tag */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: evt.classification === 'ongoing' 
                      ? 'rgba(239, 68, 68, 0.9)' 
                      : isUnconfirmed 
                        ? 'rgba(100, 116, 139, 0.9)'
                        : 'rgba(15, 12, 30, 0.85)',
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
                    {evt.classification === 'ongoing' && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', animation: 'spin 1s infinite' }} />
                    )}
                    {isUnconfirmed ? 'Date not confirmed' : evt.classification}
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
                    {evt.platform === 'linkedin' ? <LinkedinIcon size={15} /> : <InstagramIcon size={15} />}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="category-tag">{evt.category}</span>
                  {isVerified ? (
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> Campus Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <Clock size={12} /> Pending Review
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                  {evt.title}
                </h3>

                <p style={{ fontSize: '12.5px', color: 'var(--primary-purple)', fontWeight: 500, marginBottom: '10px' }}>
                  {evt.clubName} ({evt.clubHandle})
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

                {/* Card footer */}
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
                    <span>{isUnconfirmed ? 'Date not confirmed' : (evt.date || 'Date not confirmed')}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: 'var(--primary-purple)' }} />
                    <span>{evt.venue || 'Campus Venue'}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetails(evt);
                    }}
                    style={{ fontSize: '12px', padding: '6px 12px', width: '100%', justifyContent: 'center' }}
                  >
                    View Details
                  </button>

                  {evt.registrationUrl && (
                    <a
                      href={evt.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                      title="Open Official Registration"
                    >
                      <span>Register</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
