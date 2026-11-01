import React from 'react';
import { 
  Home, 
  Compass, 
  Users, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Settings,
  Layers
} from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  clubsCount: number;
  eventsCount: number;
  isInstagramConnected?: boolean;
  onOpenInstagramAuth?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  clubsCount, 
  eventsCount,
  isInstagramConnected = false,
  onOpenInstagramAuth,
  onOpenSettings
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home size={19} /> },
    { id: 'events', label: 'Discover Events', icon: <Compass size={19} />, badge: eventsCount },
    { id: 'clubs', label: 'Monitored Clubs', icon: <Users size={19} />, badge: clubsCount },
    { id: 'discovery', label: 'AI Event Discovery', icon: <Sparkles size={19} /> },
    { id: 'community', label: 'Community', icon: <MessageSquare size={19} /> },
    { id: 'resources', label: 'Resources', icon: <BookOpen size={19} /> },
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div 
          className="brand" 
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectTab('home')}
          id="brand-logo"
        >
          <div className="brand-icon">
            <Layers size={20} />
          </div>
          <span className="brand-name">CampusConnect</span>
        </div>

        {/* Navigation Items */}
        <nav className="nav-list">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
                id={`nav-${item.id}`}
              >
                {item.icon}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Instagram Persistent Auth Connection Pill */}
        <div 
          onClick={onOpenInstagramAuth}
          style={{
            cursor: 'pointer',
            padding: '9px 14px',
            margin: '0 12px 12px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isInstagramConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isInstagramConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background-color 0.2s ease',
          }}
          title={isInstagramConnected ? 'Instagram Connected (TinyFish Profile)' : 'Click to Connect Instagram'}
          id="sidebar-instagram-status"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InstagramIcon size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
              {isInstagramConnected ? 'Instagram Connected' : 'Connect Instagram'}
            </span>
          </div>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: isInstagramConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)',
            boxShadow: isInstagramConnected ? '0 0 8px var(--accent-emerald)' : 'none',
          }} />
        </div>

        {/* User Profile Card (Sparsh, Student) with Profile Settings */}
        <div 
          className="user-card" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onClick={onOpenSettings}
          id="user-profile-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/avatar.jpg"
              alt="Sparsh profile"
              className="user-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face';
              }}
            />
            <div className="user-info">
              <span className="user-name">Sparsh</span>
              <span className="user-role">GCET Student</span>
            </div>
          </div>

          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'color 0.2s ease',
            }}
            title="Profile Settings"
            id="profile-settings-btn"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
