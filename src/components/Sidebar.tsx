import React from 'react';
import { Users, PlusCircle, Layers } from 'lucide-react';

interface SidebarProps {
  currentTab: 'clubs' | 'add_club';
  onSelectTab: (tab: 'clubs' | 'add_club') => void;
  clubsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, clubsCount }) => {
  return (
    <aside className="sidebar">
      <div>
        {/* Brand Header */}
        <div 
          className="brand" 
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectTab('clubs')}
        >
          <div className="brand-icon">
            <Layers size={20} />
          </div>
          <span className="brand-name">CampusConnect</span>
        </div>

        {/* Navigation Items */}
        <nav className="nav-list">
          <div
            className={`nav-item ${currentTab === 'clubs' ? 'active' : ''}`}
            onClick={() => onSelectTab('clubs')}
            id="nav-clubs"
          >
            <Users size={19} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span>Monitored Clubs</span>
              {clubsCount > 0 && (
                <span style={{
                  fontSize: '11px',
                  backgroundColor: currentTab === 'clubs' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  padding: '1px 7px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}>
                  {clubsCount}
                </span>
              )}
            </div>
          </div>

          <div
            className={`nav-item ${currentTab === 'add_club' ? 'active' : ''}`}
            onClick={() => onSelectTab('add_club')}
            id="nav-add-club"
          >
            <PlusCircle size={19} />
            <span>Add Club</span>
          </div>
        </nav>
      </div>

      {/* User Profile Card (Sparsh, Student) */}
      <div className="user-card">
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
          <span className="user-role">Student</span>
        </div>
      </div>
    </aside>
  );
};
