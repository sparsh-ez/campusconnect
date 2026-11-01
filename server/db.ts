import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CLUBS_FILE = path.join(DATA_DIR, 'clubs.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const JOBS_FILE = path.join(DATA_DIR, 'scan_jobs.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth_session.json');

// Supabase client instance (optional fallback to JSON if credentials are not configured)
let supabase: SupabaseClient | null = null;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[Database] Supabase client initialized with URL:', SUPABASE_URL);
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err);
  }
} else {
  console.log('[Database] No Supabase credentials in .env. Using file persistence in data/');
}

// Ensure local data directory and seed files exist
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CLUBS_FILE)) {
    fs.writeFileSync(CLUBS_FILE, '[]', 'utf-8');
  }
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, '[]', 'utf-8');
  }
  if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, '[]', 'utf-8');
  }
  if (!fs.existsSync(AUTH_FILE)) {
    fs.writeFileSync(AUTH_FILE, JSON.stringify({
      profileId: 'prof_2e8ad9c73af146a8',
      profileName: 'CampusConnect Instagram Session',
      status: 'disconnected',
      signedInSites: [],
      lastConnectedAt: null,
      expiresAt: null,
      activeSessionId: null,
      setupBaseUrl: null
    }, null, 2), 'utf-8');
  }
}

// Normalize handle or profile URL into standard format
export function normalizeInstagramHandle(input: string): { handle: string; cleanHandle: string; url: string } {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/\/+$/, '');

  const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/i);
  let cleanHandle = urlMatch ? urlMatch[1] : cleaned.replace(/^@+/, '');

  cleanHandle = cleanHandle.toLowerCase().trim();
  const handle = `@${cleanHandle}`;
  const url = `https://www.instagram.com/${cleanHandle}/`;

  return { handle, cleanHandle, url };
}

// Determine event classification from date string
export function classifyEventDate(dateStr: string | null): EventClassification {
  if (!dateStr || !dateStr.trim() || dateStr.toLowerCase().includes('tbd') || dateStr.toLowerCase().includes('soon')) {
    return 'unconfirmed';
  }

  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    // If not parseable standard date format, mark unconfirmed
    return 'unconfirmed';
  }

  const eventTime = new Date(parsed).getTime();
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // If within the last 12 hours or next 12 hours, consider ongoing
  if (Math.abs(eventTime - now) <= oneDayMs / 2) {
    return 'ongoing';
  }

  if (eventTime > now) {
    return 'upcoming';
  }

  return 'past';
}

// --- CLUBS ---

export function getClubs(): Club[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(CLUBS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading clubs.json:', err);
    return [];
  }
}

export function saveClubs(clubs: Club[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(CLUBS_FILE, JSON.stringify(clubs, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving clubs.json:', err);
  }
}

export function getClubById(id: string): Club | undefined {
  const clubs = getClubs();
  return clubs.find(c => c.id === id);
}

export function findClubByHandle(cleanHandle: string): Club | undefined {
  const clubs = getClubs();
  return clubs.find(c => c.cleanHandle.toLowerCase() === cleanHandle.toLowerCase());
}

export function addClub(name: string, rawHandle: string, linkedinUrl?: string): { club: Club; error?: string } {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { club: null as any, error: 'Club name is required.' };
  }

  const { handle, cleanHandle, url } = normalizeInstagramHandle(rawHandle);
  if (!cleanHandle) {
    return { club: null as any, error: 'Valid Instagram handle is required.' };
  }

  const clubs = getClubs();
  const existing = clubs.find(c => c.cleanHandle.toLowerCase() === cleanHandle.toLowerCase());
  if (existing) {
    return { club: existing, error: `Club with handle ${handle} is already added.` };
  }

  const newClub: Club = {
    id: `club-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: trimmedName,
    handle,
    cleanHandle,
    url,
    linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
    createdAt: new Date().toISOString(),
    lastScannedAt: null,
    lastScanStatus: 'never_scanned',
    lastScanMessage: null,
    eventCount: 0,
  };

  clubs.unshift(newClub);
  saveClubs(clubs);

  // Sync to Supabase if connected
  if (supabase) {
    supabase.from('clubs').insert({
      id: newClub.id,
      name: newClub.name,
      handle: newClub.handle,
      clean_handle: newClub.cleanHandle,
      url: newClub.url,
      linkedin_url: newClub.linkedinUrl,
      last_scan_status: newClub.lastScanStatus,
      event_count: 0
    }).then(({ error }) => {
      if (error) console.warn('[Supabase] Failed to insert club:', error.message);
    });
  }

  return { club: newClub };
}

export function updateClubStatus(
  id: string,
  status: Club['lastScanStatus'],
  message: string | null,
  eventCountIncrement: number = 0
): Club | undefined {
  const clubs = getClubs();
  const idx = clubs.findIndex(c => c.id === id);
  if (idx === -1) return undefined;

  clubs[idx].lastScannedAt = new Date().toISOString();
  clubs[idx].lastScanStatus = status;
  clubs[idx].lastScanMessage = message;
  if (eventCountIncrement > 0) {
    clubs[idx].eventCount = (clubs[idx].eventCount || 0) + eventCountIncrement;
  }
  saveClubs(clubs);

  if (supabase) {
    supabase.from('clubs').update({
      last_scanned_at: clubs[idx].lastScannedAt,
      last_scan_status: status,
      last_scan_message: message,
      event_count: clubs[idx].eventCount
    }).eq('id', id).then(({ error }) => {
      if (error) console.warn('[Supabase] Failed to update club:', error.message);
    });
  }

  return clubs[idx];
}

export function updateClub(
  id: string,
  updates: { name?: string; linkedinUrl?: string | null }
): Club | undefined {
  const clubs = getClubs();
  const idx = clubs.findIndex(c => c.id === id);
  if (idx === -1) return undefined;

  if (updates.name && updates.name.trim()) {
    clubs[idx].name = updates.name.trim();
  }
  if (updates.linkedinUrl !== undefined) {
    clubs[idx].linkedinUrl = updates.linkedinUrl ? updates.linkedinUrl.trim() : null;
  }
  saveClubs(clubs);
  return clubs[idx];
}

export function deleteClub(id: string): boolean {
  const clubs = getClubs();
  const filteredClubs = clubs.filter(c => c.id !== id);
  if (filteredClubs.length === clubs.length) return false;

  saveClubs(filteredClubs);

  if (supabase) {
    supabase.from('clubs').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('[Supabase] Failed to delete club:', error.message);
    });
  }

  return true;
}

// --- EVENTS ---

export function getEvents(): CampusEvent[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading events.json:', err);
    return [];
  }
}

export function saveEvents(events: CampusEvent[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving events.json:', err);
  }
}

export function getEventsForClub(clubId: string): CampusEvent[] {
  const events = getEvents();
  return events.filter(e => e.clubId === clubId);
}

export function getEventById(id: string): CampusEvent | undefined {
  const events = getEvents();
  return events.find(e => e.id === id);
}

export function updateEvent(id: string, updates: Partial<CampusEvent>): CampusEvent | undefined {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return undefined;

  const current = events[idx];
  const updatedDate = updates.date !== undefined ? updates.date : current.date;
  const classification = updates.classification || classifyEventDate(updatedDate);

  events[idx] = {
    ...current,
    ...updates,
    classification,
  };

  saveEvents(events);
  return events[idx];
}

export function publishEvents(eventIds: string[]): { publishedCount: number; events: CampusEvent[] } {
  const events = getEvents();
  const published: CampusEvent[] = [];

  for (let i = 0; i < events.length; i++) {
    if (eventIds.includes(events[i].id)) {
      events[i].isPublished = true;
      events[i].verificationStatus = 'verified';
      published.push(events[i]);
    }
  }

  saveEvents(events);

  // Update club event counts based on published events
  const clubs = getClubs();
  for (const club of clubs) {
    const count = events.filter(e => e.clubId === club.id && e.isPublished).length;
    club.eventCount = count;
  }
  saveClubs(clubs);

  return { publishedCount: published.length, events: published };
}

export function saveDiscoveredEvents(club: Club, rawEvents: Partial<CampusEvent>[]): CampusEvent[] {
  const allEvents = getEvents();
  const saved: CampusEvent[] = [];

  const defaultPosters = [
    '/events/range_bharat.jpg',
    '/events/disha.jpg',
    '/events/abhivyakti.jpg',
    '/hero-illustration.png'
  ];

  for (let i = 0; i < rawEvents.length; i++) {
    const item = rawEvents[i];
    const title = (item.title || '').trim();
    if (!title) continue;

    // Check duplicate by title + date for this club
    const isDup = allEvents.some(e => 
      e.clubId === club.id && 
      e.title.toLowerCase() === title.toLowerCase() &&
      e.date === (item.date || null)
    );

    if (!isDup) {
      const dateVal = item.date ? item.date.trim() : null;
      const classification = item.classification || classifyEventDate(dateVal);

      const newEvent: CampusEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        clubId: club.id,
        clubName: club.name,
        clubHandle: club.handle,
        title,
        description: item.description || `Event organized by ${club.name}. Check social post for updates.`,
        date: dateVal,
        time: item.time || null,
        venue: item.venue || 'Campus Auditorium',
        category: item.category || 'Campus Life',
        registrationDeadline: item.registrationDeadline || null,
        registrationUrl: item.registrationUrl || null,
        sourcePostUrl: item.sourcePostUrl || club.url,
        sourceCaption: item.sourceCaption || null,
        image: item.image || defaultPosters[i % defaultPosters.length],
        confidence: item.confidence ?? null, // Real calculated confidence or null
        verificationStatus: item.verificationStatus || 'pending',
        classification,
        isPublished: item.isPublished || false,
        discoveredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        platform: item.platform || 'instagram',
      };

      allEvents.unshift(newEvent);
      saved.push(newEvent);
    }
  }

  saveEvents(allEvents);

  // Update club event count (published or total discovered)
  const clubEvents = allEvents.filter(e => e.clubId === club.id);
  const clubs = getClubs();
  const cIdx = clubs.findIndex(c => c.id === club.id);
  if (cIdx !== -1) {
    clubs[cIdx].eventCount = clubEvents.length;
    saveClubs(clubs);
  }

  return saved;
}

// --- SCAN JOBS ---

export function getScanJobs(): ScanJob[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading scan_jobs.json:', err);
    return [];
  }
}

export function saveScanJobs(jobs: ScanJob[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving scan_jobs.json:', err);
  }
}

export function createScanJob(club: Club): ScanJob {
  const jobs = getScanJobs();
  const newJob: ScanJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    clubId: club.id,
    clubName: club.name,
    clubHandle: club.handle,
    status: 'running',
    currentStep: 1,
    stepName: 'Connecting to TinyFish',
    logs: [
      {
        step: 1,
        text: `Connecting to TinyFish runner for ${club.handle}...`,
        status: 'active',
        timestamp: new Date().toISOString(),
      }
    ],
    eventsExtracted: 0,
    extractedEvents: [],
    error: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  jobs.unshift(newJob);
  saveScanJobs(jobs);
  return newJob;
}

export function getScanJob(id: string): ScanJob | undefined {
  const jobs = getScanJobs();
  return jobs.find(j => j.id === id);
}

export function updateScanJob(id: string, updates: Partial<ScanJob>): ScanJob | undefined {
  const jobs = getScanJobs();
  const idx = jobs.findIndex(j => j.id === id);
  if (idx === -1) return undefined;

  jobs[idx] = {
    ...jobs[idx],
    ...updates,
  };

  saveScanJobs(jobs);
  return jobs[idx];
}

// --- DASHBOARD STATISTICS ---

export function getDashboardStats(): {
  totalClubs: number;
  upcomingEvents: number;
  ongoingEvents: number;
  discoveredThisWeek: number;
} {
  const clubs = getClubs();
  const events = getEvents();

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  let upcomingEvents = 0;
  let ongoingEvents = 0;
  let discoveredThisWeek = 0;

  for (const evt of events) {
    if (evt.classification === 'upcoming') {
      upcomingEvents++;
    } else if (evt.classification === 'ongoing') {
      ongoingEvents++;
    }

    const discTime = Date.parse(evt.discoveredAt || evt.createdAt);
    if (!isNaN(discTime) && discTime >= oneWeekAgo) {
      discoveredThisWeek++;
    }
  }

  return {
    totalClubs: clubs.length,
    upcomingEvents,
    ongoingEvents,
    discoveredThisWeek,
  };
}

// --- INSTAGRAM AUTH SESSION PERSISTENCE ---

export function getInstagramSession(): InstagramAuthSession {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(AUTH_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return {
      profileId: 'prof_2e8ad9c73af146a8',
      profileName: 'CampusConnect Instagram Session',
      status: 'disconnected',
      signedInSites: [],
      lastConnectedAt: null,
      expiresAt: null,
      activeSessionId: null,
      setupBaseUrl: null
    };
  }
}

export function saveInstagramSession(updates: Partial<InstagramAuthSession>): InstagramAuthSession {
  const current = getInstagramSession();
  const updated: InstagramAuthSession = {
    ...current,
    ...updates,
  };
  ensureDataDir();
  try {
    fs.writeFileSync(AUTH_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving auth_session.json:', err);
  }
  return updated;
}

export function clearInstagramSession(): InstagramAuthSession {
  return saveInstagramSession({
    status: 'disconnected',
    signedInSites: [],
    lastConnectedAt: null,
    expiresAt: null,
    activeSessionId: null,
    setupBaseUrl: null
  });
}

