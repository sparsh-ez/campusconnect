import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';
import type { Club } from '../types';
import { apiUrl, parseJsonResponse } from '../utils/api';

interface AddClubFormProps {
  onBack: () => void;
  onClubAdded: (club: Club) => void;
}

export const AddClubForm: React.FC<AddClubFormProps> = ({ onBack, onClubAdded }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedHandle = handle.trim();

    if (!trimmedName) {
      setErrorMsg('Club name is required.');
      return;
    }
    if (!trimmedHandle) {
      setErrorMsg('Instagram handle or profile URL is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(apiUrl('/api/clubs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, handle: trimmedHandle }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Failed to add club.');
        setLoading(false);
        return;
      }

      onClubAdded(data.club);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error communicating with server.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '640px', margin: '0 auto' }}>
      {/* Back link */}
      <div className="top-nav" onClick={onBack} id="back-to-clubs-btn" style={{ marginBottom: '28px' }}>
        <ArrowLeft size={16} />
        <span>Back to Monitored Clubs</span>
      </div>

      <div className="card" style={{ padding: '36px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          Add a Campus Club
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '28px', lineHeight: 1.5 }}>
          Enter the official club name and Instagram handle. CampusConnect will monitor its accessible posts for event announcements.
        </p>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '13.5px',
            marginBottom: '24px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Club Name */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Club Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <input
              type="text"
              className="handle-text-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Lingua Franca"
              autoFocus
              id="club-name-input"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '15px'
              }}
            />
          </div>

          {/* Instagram Handle or URL */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
              Instagram Handle or Profile URL <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-input)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px'
            }}>
              <div className="instagram-logo-badge" style={{ width: '28px', height: '28px', borderRadius: '6px', marginRight: '10px' }}>
                <InstagramIcon size={16} />
              </div>
              <input
                type="text"
                className="handle-text-input"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. @linguafranca.gcet or https://instagram.com/linguafranca.gcet"
                id="club-handle-input"
                style={{ fontSize: '15px', padding: '6px 0' }}
              />
            </div>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Accepts @username or full Instagram profile URLs. Automatically normalized.
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="save-club-btn"
              style={{ padding: '12px 28px', fontSize: '14.5px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner-sm" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving Club...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save Club</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={onBack}
              disabled={loading}
              style={{ padding: '12px 20px', fontSize: '14px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
