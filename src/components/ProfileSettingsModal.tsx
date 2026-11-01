import React, { useState } from 'react';
import { X, User, CheckCircle2, Key, Database, RefreshCw } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { InstagramAuthSession } from '../types';

interface ProfileSettingsModalProps {
  onClose: () => void;
  tinyFishConfigured: boolean;
  walletBalance?: string | null;
  instagramSession?: InstagramAuthSession | null;
  onOpenInstagramAuth?: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  onClose,
  tinyFishConfigured,
  walletBalance,
  instagramSession,
  onOpenInstagramAuth,
}) => {
  const [name, setName] = useState('Sparsh');
  const [college, setCollege] = useState('Galgotias College of Engineering & Technology');
  const [email, setEmail] = useState('sparsh.shishodia@gcet.edu.in');
  const [savedMsg, setSavedMsg] = useState(false);

  const isConnected = instagramSession?.status === 'connected';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <User size={18} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
              Student Profile & Settings
            </h3>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Student Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="handle-text-input"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              College / Institution
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="handle-text-input"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              College Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="handle-text-input"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
            />
          </div>

          {/* Persistent Instagram Session Status */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginTop: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <InstagramIcon size={14} />
                Instagram Session Authentication
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${isConnected ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`
              }}>
                {isConnected ? 'Session Active' : 'Not Connected'}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
              {isConnected
                ? `Persistent TinyFish browser profile (${instagramSession?.profileId}) is authenticated for instagram.com. Subsequent club scans will reuse this session without credentials prompts.`
                : 'Connect your Instagram account through a secure TinyFish setup browser to allow agents to bypass guest login barriers.'
              }
            </p>

            {onOpenInstagramAuth && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  onClose();
                  onOpenInstagramAuth();
                }}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                id="profile-manage-instagram-btn"
              >
                <RefreshCw size={12} />
                <span>{isConnected ? 'Manage / Renew Instagram Session' : 'Connect Instagram Now'}</span>
              </button>
            )}
          </div>

          {/* System & Engine Status */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              AI Engine & Database Integration
            </span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={13} />
                TinyFish Autonomous Agent:
              </span>
              <span style={{ color: tinyFishConfigured ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
                {tinyFishConfigured ? 'Active & Ready' : 'Key Missing'}
              </span>
            </div>

            {walletBalance && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Wallet Balance:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>${walletBalance} USD</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={13} />
                Database Persistence:
              </span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                Supabase / PostgreSQL Ready
              </span>
            </div>
          </div>

          {savedMsg && (
            <div style={{ color: 'var(--accent-emerald)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
