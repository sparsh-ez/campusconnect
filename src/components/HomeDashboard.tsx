import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Search, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  PlusCircle, 
  Users, 
  ExternalLink,
  Flame,
  Compass
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import type { CampusEvent, Club, DashboardStats, NavTab } from '../types';

interface HomeDashboardProps {
  stats: DashboardStats;
  clubs: Club[];
  events: CampusEvent[];
  onNavigateTab: (tab: NavTab) => void;
  onViewEventDetails: (event: CampusEvent) => void;
  onOpenAddClub: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  stats,
  clubs,
  events,
  onNavigateTab,
  onViewEventDetails,
  onOpenAddClub,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Format today's date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Ongoing events
  const ongoingEvents = events.filter((e) => e.classification === 'ongoing');

  // Upcoming events sorted by date
  const upcomingEvents = events
    .filter((e) => e.classification === 'upcoming')
    .slice(0, 6);

  // Recently discovered events (last 5 discovered)
  const recentlyDiscovered = [...events]
    .sort((a, b) => new Date(b.discoveredAt || b.createdAt).getTime() - new Date(a.discoveredAt || a.createdAt).getTime())
    .slice(0, 4);

  // Filtered upcoming events if search query is entered
  const displayedUpcoming = searchQuery.trim()
    ? events.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.venue || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : upcomingEvents;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Welcome Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: 'var(--primary-purple)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {todayFormatted}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
            Good morning, Sparsh
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '4px' }}>
            Here's what's happening across your campus.
          </p>
        </div>

        {/* Global Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '8px 18px',
          gap: '10px',
          width: '100%',
          maxWidth: '320px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search campus events, clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '13.5px',
              width: '100%',
            }}
            id="home-search-input"
          />
        </div>
      </div>

      {/* 2. Database-Backed Statistics Cards */}
      <div className="summary-cards-grid">
        {/* Card 1: Monitored Clubs */}
        <div 
          className="summary-card" 
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('clubs')}
        >
          <div className="summary-icon-box">
            <Users size={22} />
          </div>
          <div className="summary-content">
            <span className="summary-metric">{stats.totalClubs}</span>
            <span className="summary-label">Total Monitored Clubs</span>
          </div>
        </div>

        {/* Card 2: Upcoming Campus Events */}
        <div 
          className="summary-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('events')}
        >
          <div className="summary-icon-box emerald">
            <Calendar size={22} />
          </div>
          <div className="summary-content">
            <span className="summary-metric">{stats.upcomingEvents}</span>
            <span className="summary-label">Upcoming Campus Events</span>
          </div>
        </div>

        {/* Card 3: Ongoing Events */}
        <div 
          className="summary-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('events')}
        >
          <div className="summary-icon-box rose">
            <Flame size={22} />
          </div>
          <div className="summary-content">
            <span className="summary-metric">{stats.ongoingEvents}</span>
            <span className="summary-label">Ongoing Events</span>
          </div>
        </div>

        {/* Card 4: Events Discovered This Week */}
        <div 
          className="summary-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTab('discovery')}
        >
          <div className="summary-icon-box amber">
            <Sparkles size={22} />
          </div>
          <div className="summary-content">
            <span className="summary-metric">{stats.discoveredThisWeek}</span>
            <span className="summary-label">Discovered This Week</span>
          </div>
        </div>
      </div>

      {/* 3. Onboarding State (If no clubs have been added yet) */}
      {clubs.length === 0 && (
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          border: '1px dashed var(--primary-purple)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-purple)'
          }}>
            <Sparkles size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
              Start Monitoring Campus Clubs
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '480px', marginTop: '6px' }}>
              Add your first college club's Instagram handle (e.g. <code>@linguafranca.gcet</code>). TinyFish will scan its accessible posts and bring upcoming events directly to your dashboard.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddClub}
            id="onboarding-add-first-club"
          >
            <PlusCircle size={16} />
            <span>Add Your First Club</span>
          </button>
        </div>
      )}

      {/* 4. Happening Now Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-rose)', animation: 'spin 1.5s infinite' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>Happening Now</h2>
          </div>
          {ongoingEvents.length > 0 && (
            <button
              type="button"
              className="tab-btn active"
              onClick={() => onNavigateTab('events')}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              View All ({ongoingEvents.length})
            </button>
          )}
        </div>

        {ongoingEvents.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '28px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            <Clock size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto', display: 'block' }} />
            <span>No events currently ongoing right now. Check upcoming events below!</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px'
          }}>
            {ongoingEvents.map((evt) => (
              <div 
                key={evt.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}
              >
                <div style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '12px',
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
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                    Ongoing
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                  {evt.title}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--primary-purple)', fontWeight: 600, marginBottom: '8px' }}>
                  {evt.clubName}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  <MapPin size={13} style={{ color: 'var(--primary-purple)' }} />
                  <span>{evt.venue || 'Campus Auditorium'}</span>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onViewEventDetails(evt)}
                  style={{ width: '100%', justifyContent: 'center', fontSize: '13px', marginTop: 'auto' }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Main Content Split: Upcoming Events & Recently Discovered */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: Upcoming Campus Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>Upcoming Campus Events</h2>
            <button
              type="button"
              className="suggestion-chip"
              onClick={() => onNavigateTab('events')}
              style={{ fontSize: '12px' }}
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {displayedUpcoming.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '28px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              <span>No upcoming events found. Scan club socials to discover new events!</span>
            </div>
          ) : (
            displayedUpcoming.map((evt) => (
              <div
                key={evt.id}
                className="card"
                onClick={() => onViewEventDetails(evt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={evt.image}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-illustration.png';
                      }}
                    />
                  </div>

                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                      {evt.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {evt.clubName} • {evt.venue || 'Campus Venue'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--primary-purple)' }}>
                    {evt.date || 'Date TBD'}
                  </div>
                  {evt.registrationUrl ? (
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      Registration Open
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Check Post
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Recently Discovered + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={onOpenAddClub}
                style={{ fontSize: '13px', padding: '9px 12px', justifyContent: 'center' }}
                id="quick-action-add-club"
              >
                <PlusCircle size={15} />
                <span>Add a Club</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigateTab('discovery')}
                style={{ fontSize: '13px', padding: '9px 12px', justifyContent: 'center' }}
                id="quick-action-scan-socials"
              >
                <Sparkles size={15} />
                <span>Scan Socials</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigateTab('events')}
                style={{ fontSize: '13px', padding: '9px 12px', justifyContent: 'center' }}
                id="quick-action-view-feed"
              >
                <Compass size={15} />
                <span>View All Events</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigateTab('clubs')}
                style={{ fontSize: '13px', padding: '9px 12px', justifyContent: 'center' }}
                id="quick-action-manage-clubs"
              >
                <Users size={15} />
                <span>Manage Clubs</span>
              </button>
            </div>
          </div>

          {/* Recently Discovered through TinyFish */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary-purple)' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>Recently Discovered</h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>via TinyFish</span>
            </div>

            {recentlyDiscovered.length === 0 ? (
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px'
              }}>
                <span>No discovery runs yet. Add a club to start automated discovery.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentlyDiscovered.map((evt) => (
                  <div
                    key={evt.id}
                    className="card"
                    onClick={() => onViewEventDetails(evt)}
                    style={{
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="instagram-logo-badge" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
                        {evt.platform === 'linkedin' ? <LinkedinIcon size={14} /> : <InstagramIcon size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff' }}>{evt.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{evt.clubName} ({evt.clubHandle})</div>
                      </div>
                    </div>

                    <a
                      href={evt.sourcePostUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--text-muted)', padding: '4px' }}
                      title="Open Original Social Media Post"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
