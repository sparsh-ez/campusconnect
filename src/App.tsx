import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeDashboard } from './components/HomeDashboard';
import { DiscoverEventsFeed } from './components/DiscoverEventsFeed';
import { MonitoredClubs } from './components/MonitoredClubs';
import { AiEventDiscoveryView } from './components/AiEventDiscoveryView';
import { CommunityView } from './components/CommunityView';
import { ResourcesView } from './components/ResourcesView';
import { EventDetailsModal } from './components/EventDetailsModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ClubEventsView } from './components/ClubEventsView';
import { InstagramAuthModal } from './components/InstagramAuthModal';
import { DockedAgentBar } from './components/DockedAgentBar';
import type { 
  Club, 
  CampusEvent, 
  DashboardStats, 
  NavTab,
  InstagramAuthSession
} from './types';
import { apiUrl } from './utils/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalClubs: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    discoveredThisWeek: 0,
  });

  const [selectedEventForDetails, setSelectedEventForDetails] = useState<CampusEvent | null>(null);
  const [selectedClubForEvents, setSelectedClubForEvents] = useState<Club | null>(null);
  const [clubSpecificEvents, setClubSpecificEvents] = useState<CampusEvent[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInstagramAuthModal, setShowInstagramAuthModal] = useState(false);
  const [instagramSession, setInstagramSession] = useState<InstagramAuthSession | null>(null);
  const [scanningClubId, setScanningClubId] = useState<string | null>(null);
  const [clubForDiscoveryScan, setClubForDiscoveryScan] = useState<Club | null>(null);
  const [dockedSimulation, setDockedSimulation] = useState<{
    club: Club;
    stageName: string;
    stageIndex: number;
    totalStages: number;
    elapsedSeconds: number;
    progressPercent: number;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tinyFishStatus, setTinyFishStatus] = useState<{ configured: boolean; wallet?: any }>({ configured: false });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchInitialData = async () => {
    await Promise.all([
      fetchClubs(),
      fetchEvents(),
      fetchStats(),
      fetchTinyFishStatus(),
      fetchInstagramSession(),
    ]);
  };

  const fetchInstagramSession = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/instagram/status'));
      if (res.ok) {
        const data = await res.json();
        setInstagramSession(data.session);
      }
    } catch (err) {
      console.warn('Failed to fetch Instagram session:', err);
    }
  };

  const fetchTinyFishStatus = async () => {
    try {
      const res = await fetch(apiUrl('/api/status'));
      if (res.ok) {
        const data = await res.json();
        setTinyFishStatus({ configured: data.configured, wallet: data.wallet });
      }
    } catch (err) {
      console.warn('Failed to fetch status:', err);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await fetch(apiUrl('/api/clubs'));
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

  const fetchEvents = async () => {
    try {
      const res = await fetch(apiUrl('/api/events'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.events)) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(apiUrl('/api/stats'));
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Add Club Handler
  const handleClubAdded = (newClub: Club) => {
    fetchClubs();
    fetchStats();
    showToast(`Club "${newClub.name}" (${newClub.handle}) successfully registered.`);
  };

  // Remove Club Handler
  const handleRemoveClub = async (clubId: string) => {
    try {
      const res = await fetch(apiUrl('/api/clubs/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: clubId }),
      });

      if (res.ok) {
        showToast('Club removed from monitoring.');
        await fetchClubs();
        await fetchStats();
        if (selectedClubForEvents && selectedClubForEvents.id === clubId) {
          setSelectedClubForEvents(null);
        }
      }
    } catch (err) {
      console.error('Failed to remove club:', err);
    }
  };

  // Scan Club Handler (runs simulated agent workflow in AI Event Discovery)
  const handleScanClub = (club: Club) => {
    if (scanningClubId === club.id) {
      showToast(`Scan already in progress for ${club.name}.`);
      return;
    }
    setScanningClubId(club.id);
    setClubForDiscoveryScan(club);
    setSelectedClubForEvents(null);
    setCurrentTab('discovery');
    showToast(`Dispatched simulated AI agent for ${club.name}...`);
  };

  // View specific club events
  const fetchEventsForClub = async (clubId: string) => {
    try {
      const res = await fetch(apiUrl(`/api/events?clubId=${encodeURIComponent(clubId)}`));
      if (res.ok) {
        const data = await res.json();
        setClubSpecificEvents(data.events || []);
        if (data.club) setSelectedClubForEvents(data.club);
      }
    } catch (err) {
      console.error('Failed to fetch events for club:', err);
    }
  };

  const handleViewClubEvents = (club: Club) => {
    setSelectedClubForEvents(club);
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

      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedClubForEvents(null);
          setCurrentTab(tab);
          fetchInitialData();
        }}
        clubsCount={clubs.length}
        eventsCount={events.length}
        isInstagramConnected={instagramSession?.status === 'connected'}
        onOpenInstagramAuth={() => setShowInstagramAuthModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* If viewing a single club's events directly */}
        {selectedClubForEvents ? (
          <ClubEventsView
            club={selectedClubForEvents}
            events={clubSpecificEvents}
            onBack={() => {
              setSelectedClubForEvents(null);
              fetchInitialData();
            }}
            onScanAgain={handleScanClub}
            isScanning={scanningClubId === selectedClubForEvents.id}
          />
        ) : (
          <>
            {/* 1. Home Dashboard */}
            {currentTab === 'home' && (
              <HomeDashboard
                stats={stats}
                clubs={clubs}
                events={events}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onViewEventDetails={(evt) => setSelectedEventForDetails(evt)}
                onOpenAddClub={() => setCurrentTab('discovery')}
              />
            )}

            {/* 2. Discover Events — Unified Campus Feed */}
            {currentTab === 'events' && (
              <DiscoverEventsFeed
                events={events}
                onOpenDetails={(evt) => setSelectedEventForDetails(evt)}
                onNavigateToScan={() => setCurrentTab('discovery')}
              />
            )}

            {/* 3. Monitored Clubs */}
            {currentTab === 'clubs' && (
              <MonitoredClubs
                clubs={clubs}
                onAddClubClick={() => setCurrentTab('discovery')}
                onScanClub={handleScanClub}
                onViewEvents={handleViewClubEvents}
                onRemoveClub={handleRemoveClub}
                onUpdateClub={() => {
                  fetchClubs();
                  showToast('Club details updated.');
                }}
                scanningClubId={scanningClubId}
              />
            )}

            {/* 4. AI Event Discovery (Core 3-Screen Feature) */}
            {currentTab === 'discovery' && (
              <AiEventDiscoveryView
                clubs={clubs}
                onClubAdded={handleClubAdded}
                onViewFeed={() => {
                  fetchEvents();
                  fetchStats();
                  setCurrentTab('events');
                }}
                onRefreshClubs={() => {
                  fetchClubs();
                  fetchEvents();
                  fetchStats();
                  fetchInstagramSession();
                  setScanningClubId(null);
                }}
                instagramSession={instagramSession}
                onOpenInstagramAuth={() => setShowInstagramAuthModal(true)}
                initialClubForScan={clubForDiscoveryScan}
                onClearInitialClubForScan={() => setClubForDiscoveryScan(null)}
                onActiveSimulationUpdate={(data) => setDockedSimulation(data)}
              />
            )}

            {/* 5. Community */}
            {currentTab === 'community' && (
              <CommunityView
                events={events}
                clubs={clubs}
                onViewEvent={(evt) => setSelectedEventForDetails(evt)}
              />
            )}

            {/* 6. Resources */}
            {currentTab === 'resources' && (
              <ResourcesView />
            )}
          </>
        )}
      </main>

      {/* Floating Docked Agent Activity Bar (Visible across other tabs while simulation runs) */}
      {currentTab !== 'discovery' && dockedSimulation && (
        <DockedAgentBar
          club={dockedSimulation.club}
          stageName={dockedSimulation.stageName}
          stageIndex={dockedSimulation.stageIndex}
          totalStages={dockedSimulation.totalStages}
          elapsedSeconds={dockedSimulation.elapsedSeconds}
          progressPercent={dockedSimulation.progressPercent}
          onOpenFullView={() => setCurrentTab('discovery')}
          onCancel={() => {
            setDockedSimulation(null);
            setScanningClubId(null);
            showToast('Simulated agent run cancelled.');
          }}
        />
      )}

      {/* Global Event Details Modal */}
      {selectedEventForDetails && (
        <EventDetailsModal
          event={selectedEventForDetails}
          onClose={() => setSelectedEventForDetails(null)}
        />
      )}

      {/* Profile Settings Modal */}
      {showSettingsModal && (
        <ProfileSettingsModal
          onClose={() => setShowSettingsModal(false)}
          tinyFishConfigured={tinyFishStatus.configured}
          walletBalance={tinyFishStatus.wallet?.balance}
          instagramSession={instagramSession}
          onOpenInstagramAuth={() => {
            setShowSettingsModal(false);
            setShowInstagramAuthModal(true);
          }}
        />
      )}

      {/* Instagram Session Authentication Modal (Option A: TinyFish Persistent Profiles) */}
      {showInstagramAuthModal && (
        <InstagramAuthModal
          session={instagramSession}
          onClose={() => setShowInstagramAuthModal(false)}
          onSessionUpdated={(updated) => {
            setInstagramSession(updated);
            showToast(updated.status === 'connected' ? 'Instagram session connected & saved in TinyFish profile!' : 'Instagram session disconnected.');
          }}
        />
      )}
    </div>
  );
};

export default App;
