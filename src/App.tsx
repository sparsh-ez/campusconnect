import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MonitoredClubs } from './components/MonitoredClubs';
import { AddClubForm } from './components/AddClubForm';
import { ClubEventsView } from './components/ClubEventsView';
import type { Club, ClubEvent, ViewState } from './types';

export const App: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ type: 'clubs_list' });
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedClubEvents, setSelectedClubEvents] = useState<ClubEvent[]>([]);
  const [scanningClubId, setScanningClubId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchClubs = async () => {
    try {
      const res = await fetch('/api/clubs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.clubs)) {
          setClubs(data.clubs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch clubs:', err);
    }
  };

  const fetchEventsForClub = async (clubId: string) => {
    try {
      const res = await fetch(`/api/events?clubId=${encodeURIComponent(clubId)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedClubEvents(data.events || []);
        if (data.club) setSelectedClub(data.club);
      }
    } catch (err) {
      console.error('Failed to fetch events for club:', err);
    }
  };

  // 1. Add club handler
  const handleClubAdded = (newClub: Club) => {
    fetchClubs();
    showToast(`Added "${newClub.name}" (${newClub.handle}) to monitored clubs.`);
    setViewState({ type: 'clubs_list' });
  };

  // 2. Remove club handler
  const handleRemoveClub = async (clubId: string) => {
    try {
      const res = await fetch('/api/clubs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clubId }),
      });

      if (res.ok) {
        showToast('Club removed successfully.');
        fetchClubs();
        if (selectedClub && selectedClub.id === clubId) {
          setViewState({ type: 'clubs_list' });
          setSelectedClub(null);
          setSelectedClubEvents([]);
        }
      }
    } catch (err) {
      console.error('Failed to remove club:', err);
    }
  };

  // 3. Scan club Instagram posts handler (Real TinyFish Agent)
  const handleScanClub = async (club: Club) => {
    setScanningClubId(club.id);
    showToast(`TinyFish agent dispatched to inspect ${club.handle}...`);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club.id }),
      });

      const data = await res.json();

      // Refresh clubs list to get updated status & eventCount from backend storage
      await fetchClubs();

      if (data.status === 'login_wall') {
        showToast(`Instagram Login Wall: ${club.handle} requires login credentials.`);
      } else if (data.success) {
        showToast(data.message || `Scan complete for ${club.name}.`);
      } else {
        showToast(data.error || 'Scan failed.');
      }

      // If we are currently viewing this club's events, refresh them
      if (viewState.type === 'club_events' && viewState.clubId === club.id) {
        fetchEventsForClub(club.id);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast('Network error during scan.');
      await fetchClubs();
    } finally {
      setScanningClubId(null);
    }
  };

  // 4. View events handler
  const handleViewEvents = (club: Club) => {
    setSelectedClub(club);
    setViewState({ type: 'club_events', clubId: club.id });
    fetchEventsForClub(club.id);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#1c1638',
          border: '1px solid var(--primary-purple)',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideUp 0.2s ease',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={viewState.type === 'add_club' ? 'add_club' : 'clubs'}
        onSelectTab={(tab) => {
          if (tab === 'add_club') {
            setViewState({ type: 'add_club' });
          } else {
            setViewState({ type: 'clubs_list' });
            fetchClubs();
          }
        }}
        clubsCount={clubs.length}
      />

      {/* Main Workspace Area */}
      <main className="main-content">
        {viewState.type === 'clubs_list' && (
          <MonitoredClubs
            clubs={clubs}
            onAddClubClick={() => setViewState({ type: 'add_club' })}
            onScanClub={handleScanClub}
            onViewEvents={handleViewEvents}
            onRemoveClub={handleRemoveClub}
            scanningClubId={scanningClubId}
          />
        )}

        {viewState.type === 'add_club' && (
          <AddClubForm
            onBack={() => setViewState({ type: 'clubs_list' })}
            onClubAdded={handleClubAdded}
          />
        )}

        {viewState.type === 'club_events' && selectedClub && (
          <ClubEventsView
            club={selectedClub}
            events={selectedClubEvents}
            onBack={() => {
              setViewState({ type: 'clubs_list' });
              fetchClubs();
            }}
            onScanAgain={handleScanClub}
            isScanning={scanningClubId === selectedClub.id}
          />
        )}
      </main>
    </div>
  );
};

export default App;
