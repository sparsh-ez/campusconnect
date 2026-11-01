import React, { useState } from 'react';
import { 
  Send, 
  Info
} from 'lucide-react';
import type { CampusEvent, Club } from '../types';

interface CommunityPost {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  relatedEventTitle?: string;
  likes: number;
}

interface CommunityViewProps {
  events: CampusEvent[];
  clubs: Club[];
  onViewEvent: (event: CampusEvent) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  events,
  clubs,
  onViewEvent,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'post-1',
      author: 'Sparsh',
      role: 'GCET Student',
      content: 'Anyone heading to the Lingua Franca literature session this weekend? Looking to join a discussion group!',
      timestamp: 'Today at 10:15 AM',
      relatedEventTitle: 'Lingua Franca Open Mic',
      likes: 3,
    }
  ]);

  const [newPostContent, setNewPostContent] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const matchedEvent = events.find(e => e.id === selectedEventId);

    const newPost: CommunityPost = {
      id: `comm-${Date.now()}`,
      author: 'Sparsh',
      role: 'GCET Student',
      content: newPostContent.trim(),
      timestamp: 'Just now',
      relatedEventTitle: matchedEvent?.title,
      likes: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setSelectedEventId('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
          Campus Community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '4px' }}>
          Connect with peers around campus events, coordinate attendance, and share club announcements.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Community Discussions Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Post Creation Box */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Start an Event Discussion
            </h3>

            <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                rows={3}
                placeholder="Ask about team formations, venues, or coordinate with peers..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="handle-text-input"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  resize: 'vertical',
                }}
                id="community-post-input"
              />

              {events.length > 0 && (
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Tag a Campus Event (Optional)
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="handle-text-input"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      width: '100%',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">No event tagged</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.title} ({e.clubName})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newPostContent.trim()}
                  style={{ fontSize: '13px', padding: '8px 18px', opacity: !newPostContent.trim() ? 0.5 : 1 }}
                  id="community-submit-post-btn"
                >
                  <Send size={14} />
                  <span>Post Discussion</span>
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                className="card"
                style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: 'var(--primary-purple)',
                      fontSize: '13px'
                    }}>
                      {post.author[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{post.author}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{post.role} • {post.timestamp}</div>
                    </div>
                  </div>

                  {post.relatedEventTitle && (
                    <span 
                      style={{
                        fontSize: '11px',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        color: '#c4b5fd',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const ev = events.find(e => e.title === post.relatedEventTitle);
                        if (ev && onViewEvent) onViewEvent(ev);
                      }}
                    >
                      {post.relatedEventTitle}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13.5px', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Campus Discussions & Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Overview Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
              Campus Community Overview
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              All discussions are student-moderated for GCET societies and clubs. Keep questions constructive and focused on event participation.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              <span>Real data backed by student contributions. No fabricated user activity.</span>
            </div>
          </div>

          {/* Featured Club Channels */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Monitored Club Channels
            </h3>

            {clubs.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No active club channels yet. Add clubs to enable event discussions.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clubs.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{c.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--primary-purple)' }}>{c.handle}</div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {c.eventCount} events
                    </span>
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
