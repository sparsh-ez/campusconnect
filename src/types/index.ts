export type NavTab = 
  | 'home'
  | 'events'
  | 'clubs'
  | 'discovery'
  | 'community'
  | 'resources';

export interface Club {
  id: string;
  name: string;
  handle: string; // e.g. "@linguafranca.gcet"
  cleanHandle: string; // e.g. "linguafranca.gcet"
  url: string; // e.g. "https://www.instagram.com/linguafranca.gcet/"
  linkedinUrl?: string | null;
  createdAt: string;
  lastScannedAt: string | null;
  lastScanStatus: 'never_scanned' | 'scanning' | 'success' | 'login_wall' | 'failed';
  lastScanMessage: string | null;
  eventCount: number;

  // Compatibility aliases
  platform?: 'instagram' | 'linkedin' | 'both';
  eventsCount?: number;
  lastScanned?: string;
  status?: 'active' | 'rate_limited' | 'login_required' | 'idle';
}

export type EventClassification = 'ongoing' | 'upcoming' | 'past' | 'unconfirmed';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface CampusEvent {
  id: string;
  clubId: string;
  clubName: string;
  clubHandle: string;
  title: string;
  description: string;
  date: string | null;
  time: string | null;
  venue: string | null;
  category: string;
  registrationDeadline: string | null;
  registrationUrl: string | null;
  sourcePostUrl: string;
  sourceCaption: string | null;
  image: string;
  confidence: number | null;
  verificationStatus: VerificationStatus;
  classification: EventClassification;
  isPublished: boolean;
  discoveredAt: string;
  createdAt: string;
  platform: 'instagram' | 'linkedin';

  // Compatibility aliases for legacy views
  event_name?: string;
  organizer?: string;
  handle?: string;
  registration_url?: string | null;
  source_url?: string;
  verification_status?: VerificationStatus;
}

export interface TimelineLog {
  step: number;
  text: string;
  status: 'pending' | 'active' | 'done' | 'error';
  timestamp: string;
}

export interface ScanJob {
  id: string;
  clubId: string;
  clubName: string;
  clubHandle: string;
  status: 'queued' | 'running' | 'completed' | 'login_wall' | 'failed';
  currentStep: number;
  stepName: string;
  logs: TimelineLog[];
  eventsExtracted: number;
  extractedEvents: CampusEvent[];
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface DashboardStats {
  totalClubs: number;
  upcomingEvents: number;
  ongoingEvents: number;
  discoveredThisWeek: number;
}

export interface InstagramAuthSession {
  profileId: string;
  profileName: string;
  status: 'connected' | 'disconnected' | 'expired';
  signedInSites: string[];
  lastConnectedAt: string | null;
  expiresAt: string | null;
  activeSessionId?: string | null;
  setupBaseUrl?: string | null;
}

// Aliases for component compatibility
export type ClubEvent = CampusEvent;
export type DiscoveredEvent = CampusEvent;
export type MonitoredClub = Club;
export type ActiveNav = NavTab;
export type ViewState = 
  | { type: 'clubs_list' }
  | { type: 'add_club' }
  | { type: 'club_events'; clubId: string };
