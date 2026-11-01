import React from 'react';
import { RefreshCw, Plus, ExternalLink, CheckCircle2 } from 'lucide-react';
import { InstagramIcon, LinkedinIcon } from './SocialIcons';
import type { MonitoredClub } from '../types';

interface MonitoredClubsViewProps {
  clubs: MonitoredClub[];
  onScanClub: (handle: string) => void;
  onAddClubClick: () => void;
}

export const MonitoredClubsView: React.FC<MonitoredClubsViewProps> = ({
  clubs,
  onScanClub,
  onAddClubClick,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            Monitored Campus Clubs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Official student societies and chapters actively monitored by TinyFish discovery agents.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onAddClubClick}
          style={{ fontSize: '14px', padding: '10px 22px' }}
        >
          <Plus size={16} />
          <span>Add Club to Track</span>
        </button>
      </div>

      {/* Clubs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {clubs.map((club) => (
          <div
            key={club.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="instagram-logo-badge"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: club.platform === 'linkedin'
                        ? 'linear-gradient(135deg, #0077b5, #004182)'
                        : undefined
                    }}
                  >
                    {club.platform === 'linkedin' ? <LinkedinIcon size={20} /> : <InstagramIcon size={20} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                      {club.name}
                    </h3>
                    <span style={{ fontSize: '13px', color: 'var(--primary-purple)', fontWeight: 500 }}>
                      {club.handle}
                    </span>
                  </div>
                </div>

                <a
                  href={club.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-muted)' }}
                  title="Visit Club Profile"
                >
                  <ExternalLink size={16} />
                </a>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '18px'
              }}>
                <div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Events Found</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{club.eventsCount}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>Last Scanned</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{club.lastScanned}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={13} />
                <span>Monitoring Active</span>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => onScanClub(club.handle)}
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
              >
                <RefreshCw size={13} />
                <span>Scan Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
