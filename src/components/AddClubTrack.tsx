import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';

interface AddClubTrackProps {
  onBack: () => void;
  onSubmitScan: (handle: string, mode: 'live' | 'preview') => void;
  defaultHandle?: string;
  hasApiKey: boolean;
}

export const AddClubTrack: React.FC<AddClubTrackProps> = ({
  onBack,
  onSubmitScan,
  defaultHandle = '@rac_gei',
  hasApiKey,
}) => {
  const [handle, setHandle] = useState(defaultHandle);
  const [scanMode, setScanMode] = useState<'live' | 'preview'>(hasApiKey ? 'live' : 'preview');
  const [errorMsg, setErrorMsg] = useState('');

  const suggestions = [
    { label: '@rac_gei', club: 'Rotaract Club, GCET', platform: 'instagram' },
    { label: '@codingclub_gcet', club: 'Coding Club GCET', platform: 'instagram' },
    { label: 'gdsc-gcet', club: 'GDSC GCET', platform: 'linkedin' },
    { label: '@cultural_gcet', club: 'Cultural Club GCET', platform: 'instagram' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = handle.trim();
    if (!trimmed) {
      setErrorMsg('Please enter an Instagram handle or profile URL.');
      return;
    }
    setErrorMsg('');
    onSubmitScan(trimmed, scanMode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Back button */}
      <div className="top-nav" onClick={onBack} id="back-to-discovery">
        <ArrowLeft size={16} />
        <span>Event Discovery</span>
      </div>

      <div className="scan-screen-center">
        <h2 className="scan-heading">Add a Club to Track</h2>
        <p className="scan-desc">
          Enter the official Instagram handle of a campus club to discover their events.
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Handle Input Field */}
          <div className="handle-input-box">
            <div className="handle-input-container">
              <div className="instagram-logo-badge">
                <InstagramIcon size={18} />
              </div>
              <input
                type="text"
                className="handle-text-input"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. @rac_gei or https://instagram.com/rac_gei"
                autoFocus
                id="club-handle-input"
              />
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--accent-rose)', fontSize: '13px', marginTop: '8px', textAlign: 'left' }}>
                {errorMsg}
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Popular GCET campus clubs:
            </div>
            <div className="suggestions-row">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => setHandle(s.label)}
                >
                  <span>{s.label}</span>
                  <span style={{ opacity: 0.6 }}>({s.club.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Engine Mode Selector */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            padding: '6px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            maxWidth: '460px',
            margin: '0 auto 28px auto'
          }}>
            <button
              type="button"
              className={`tab-btn ${scanMode === 'live' ? 'active' : ''}`}
              onClick={() => setScanMode('live')}
              style={{ fontSize: '13px', padding: '6px 16px' }}
            >
              <Globe size={13} style={{ display: 'inline', marginRight: '6px' }} />
              Live TinyFish Agent
            </button>
            <button
              type="button"
              className={`tab-btn ${scanMode === 'preview' ? 'active' : ''}`}
              onClick={() => setScanMode('preview')}
              style={{ fontSize: '13px', padding: '6px 16px' }}
            >
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: '6px' }} />
              Verified Demo Preview
            </button>
          </div>

          {/* Scan for Events Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', maxWidth: '380px', justifyContent: 'center' }}
            id="scan-for-events-submit"
          >
            <span>Scan for Events</span>
            <Sparkles size={16} />
          </button>
        </form>

        {/* Supported Types Row */}
        <div className="supported-row">
          <span style={{ fontWeight: 600 }}>Supported:</span>
          <div className="supported-tag">
            <Check size={14} />
            <span>Instagram Posts</span>
          </div>
          <div className="supported-tag">
            <Check size={14} />
            <span>Event Announcements</span>
          </div>
          <div className="supported-tag">
            <Check size={14} />
            <span>Registration Links</span>
          </div>
        </div>

        {/* Note on public Instagram analysis */}
        <div style={{ 
          marginTop: '28px', 
          padding: '12px 18px', 
          backgroundColor: 'rgba(139, 92, 246, 0.05)', 
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12.5px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '520px',
          textAlign: 'left'
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
          <span>
            <strong>Note:</strong> Only publicly accessible Instagram content can be analyzed. Results may require verification.
          </span>
        </div>
      </div>
    </div>
  );
};
