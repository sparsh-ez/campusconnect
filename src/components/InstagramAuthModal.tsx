import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  Globe,
  Radio
} from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { InstagramAuthSession } from '../types';
import { apiUrl } from '../utils/api';

interface InstagramAuthModalProps {
  onClose: () => void;
  session: InstagramAuthSession | null;
  onSessionUpdated: (session: InstagramAuthSession) => void;
}

export const InstagramAuthModal: React.FC<InstagramAuthModalProps> = ({
  onClose,
  session,
  onSessionUpdated,
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSessionData, setActiveSessionData] = useState<{
    sessionId: string;
    profileId: string;
    baseUrl: string;
    expiresAt: string | null;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isConnected = session?.status === 'connected';

  // Step 1: Start TinyFish Setup Session
  const handleStartSession = async () => {
    setIsStarting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/instagram/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setIsStarting(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to start TinyFish authentication session.');
        return;
      }

      setActiveSessionData({
        sessionId: data.sessionId,
        profileId: data.profileId,
        baseUrl: data.baseUrl,
        expiresAt: data.expiresAt,
      });

      // Automatically open the remote browser setup URL
      const devtoolsUrl = `${data.baseUrl}/devtools/inspector.html`;
      window.open(devtoolsUrl, '_blank', 'width=1100,height=750');
    } catch (err: any) {
      setIsStarting(false);
      setErrorMsg(err.message || 'Network error.');
    }
  };

  // Step 2: Confirm & Save Session State via TinyFish
  const handleConfirmSave = async () => {
    if (!activeSessionData) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/auth/instagram/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionData.sessionId,
          profileId: activeSessionData.profileId,
        }),
      });

      const data = await res.json();
      setIsSaving(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Could not verify Instagram login. Please ensure you logged in on the remote browser window, then try again.');
        return;
      }

      setSuccessMsg('Authenticated Instagram browser session successfully saved! Subsequent club scans will reuse this session.');
      if (data.session) {
        onSessionUpdated(data.session);
      }
      setActiveSessionData(null);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMsg(err.message || 'Failed to save authentication state.');
    }
  };

  // Disconnect Session
  const handleDisconnect = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/instagram/disconnect'), { method: 'POST' });
      if (res.ok) {
        onSessionUpdated({
          profileId: session?.profileId || 'prof_2e8ad9c73af146a8',
          profileName: 'CampusConnect Instagram Session',
          status: 'disconnected',
          signedInSites: [],
          lastConnectedAt: null,
          expiresAt: null,
        });
        setSuccessMsg('Instagram session disconnected.');
      }
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="instagram-logo-badge" style={{ width: '38px', height: '38px', borderRadius: '10px' }}>
              <InstagramIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                Instagram Session Authentication
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Powered by TinyFish Persistent Browser Profiles
              </span>
            </div>
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

        {/* Security / Privacy Guarantee Banner */}
        <div style={{
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
        }}>
          <ShieldCheck size={20} style={{ color: 'var(--primary-purple)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: '#ffffff' }}>Zero Credential Storage Guarantee:</strong> CampusConnect never asks for or stores your Instagram password. Authentication takes place directly within a dedicated, isolated TinyFish remote browser session. Cookies and session storage remain encrypted inside your TinyFish browser profile.
          </div>
        </div>

        {/* Success message banner */}
        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-emerald)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error message banner */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '18px',
            lineHeight: 1.5
          }}>
            <strong>Notice:</strong> {errorMsg}
          </div>
        )}

        {/* Current Connection Status Box */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status:</span>
            {isConnected ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--accent-emerald)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--accent-emerald)'
              }}>
                <Radio size={12} style={{ animation: 'pulse 1.5s infinite' }} />
                Connected & Active
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--accent-amber)',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--accent-amber)'
              }}>
                <Clock size={12} />
                Not Connected
              </span>
            )}
          </div>

          {session?.profileId && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>TinyFish Profile:</span>
              <span style={{ fontFamily: 'monospace', color: '#c4b5fd' }}>{session.profileId}</span>
            </div>
          )}

          {isConnected && session?.signedInSites && session.signedInSites.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authenticated Domains:</span>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{session.signedInSites.join(', ')}</span>
            </div>
          )}

          {session?.lastConnectedAt && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last Refreshed:</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {new Date(session.lastConnectedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* ACTIVE SESSION WORKFLOW: Remote setup browser running */}
        {activeSessionData ? (
          <div style={{
            backgroundColor: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid var(--primary-purple)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: 'var(--primary-purple)' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                Remote Authentication Browser Running
              </h4>
            </div>

            <ol style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', margin: 0, lineHeight: 1.6 }}>
              <li>Click <strong>Open Instagram Login Window</strong> below.</li>
              <li>Log into your Instagram account in the remote browser window.</li>
              <li>Once you see your Instagram feed or profile, return here and click <strong>Verify & Save Session</strong>.</li>
            </ol>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <a
                href={`${activeSessionData.baseUrl}/devtools/inspector.html`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px', textDecoration: 'none' }}
              >
                <span>Open Instagram Login Window</span>
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmSave}
                disabled={isSaving}
                id="verify-save-session-btn"
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                <CheckCircle2 size={15} />
                <span>{isSaving ? 'Verifying with TinyFish...' : 'Verify & Save Session'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* NOT IN SETUP SESSION: Actions */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isConnected 
                ? 'Your persistent TinyFish browser session is connected. All club scans will automatically use this session to inspect recent posts without login walls.'
                : 'Click below to launch an isolated TinyFish setup session. You will be prompted to log into Instagram once. After saving, TinyFish will persist the session for all future scans.'
              }
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
              {isConnected && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleDisconnect}
                  style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Disconnect
                </button>
              )}

              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStartSession}
                  disabled={isStarting}
                  id="start-connect-instagram-btn"
                >
                  <RefreshCw size={14} style={isStarting ? { animation: 'spin 1s linear infinite' } : {}} />
                  <span>
                    {isStarting 
                      ? 'Launching Remote Browser...' 
                      : isConnected 
                        ? 'Reconnect / Refresh Session' 
                        : 'Connect Instagram'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
