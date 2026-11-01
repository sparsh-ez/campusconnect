import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { 
  getClubs, 
  addClub, 
  deleteClub, 
  updateClub,
  getClubById, 
  updateClubStatus, 
  getEvents,
  getEventsForClub, 
  saveDiscoveredEvents,
  publishEvents,
  updateEvent,
  getDashboardStats,
  createScanJob,
  getScanJob,
  updateScanJob,
  getInstagramSession,
  saveInstagramSession,
  clearInstagramSession,
  normalizeInstagramHandle,
  classifyEventDate,
  type Club,
  type CampusEvent
} from './db.ts';
import { getDemoEventsForClub } from './demoEvents.ts';

dotenv.config();

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || '';
const TINYFISH_API_BASE = 'https://agent.tinyfish.ai';

// Helper to parse JSON body from incoming Node request
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

// Extract JSON event objects from TinyFish text result if formatted
function parseExtractedEvents(resultText: string): Partial<CampusEvent>[] {
  const events: Partial<CampusEvent>[] = [];

  try {
    const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, resultText];
    const candidate = jsonMatch[1] ? jsonMatch[1].trim() : resultText.trim();
    if (candidate.startsWith('{') || candidate.startsWith('[')) {
      const parsed = JSON.parse(candidate);
      const list = Array.isArray(parsed) ? parsed : (parsed.events || [parsed]);
      for (const item of list) {
        if (item && (item.title || item.event_name || item.name)) {
          const rawDate = item.date || item.event_date || null;
          events.push({
            title: item.title || item.event_name || item.name,
            description: item.description || '',
            date: rawDate,
            time: item.time || null,
            venue: item.venue || item.location || 'Campus Auditorium',
            category: item.category || 'Campus Life',
            registrationDeadline: item.registrationDeadline || item.deadline || null,
            registrationUrl: item.registrationUrl || item.registration_url || item.link || null,
            sourcePostUrl: item.sourcePostUrl || item.source_url || item.post_url || '',
            sourceCaption: item.sourceCaption || item.caption || null,
            image: item.image || item.poster || null,
            classification: classifyEventDate(rawDate),
            verificationStatus: 'pending',
            isPublished: false,
            platform: 'instagram'
          });
        }
      }
      if (events.length > 0) return events;
    }
  } catch {
    // Non-JSON response, fall through
  }

  return events;
}

// Asynchronous execution function for TinyFish scan
async function executeScanJob(jobId: string, club: Club): Promise<void> {
  const addLog = (step: number, text: string, status: 'active' | 'done' | 'error' = 'active') => {
    const job = getScanJob(jobId);
    if (!job) return;
    const logs = [...job.logs, { step, text, status, timestamp: new Date().toISOString() }];
    updateScanJob(jobId, { currentStep: step, stepName: text, logs });
  };

  try {
    // Step 1: Connecting
    addLog(1, 'Connecting to TinyFish browser engine', 'active');
    updateClubStatus(club.id, 'scanning', 'Connecting to TinyFish browser engine...');

    if (!TINYFISH_API_KEY) {
      addLog(1, 'Error: TINYFISH_API_KEY is not configured', 'error');
      updateClubStatus(club.id, 'failed', 'TINYFISH_API_KEY is missing.');
      updateScanJob(jobId, { status: 'failed', error: 'TINYFISH_API_KEY is missing.', completedAt: new Date().toISOString() });
      return;
    }

    // Step 2: Opening profile
    const authSession = getInstagramSession();
    const useProfile = authSession.status === 'connected' && Boolean(authSession.profileId);

    if (useProfile) {
      addLog(2, `Navigating with authenticated Instagram browser profile (${authSession.profileId})`, 'active');
    } else {
      addLog(2, `Navigating browser agent to ${club.url}`, 'active');
    }

    const startTime = Date.now();
    const goal = `Navigate to ${club.url}. Check if the Instagram profile is viewable or if Instagram displays a login wall or prompt ("See everyday moments from your close friends"). If blocked by a login wall or login challenge, state clearly that Instagram requires authentication to view this profile. If recent posts are accessible, inspect recent posts to find college event announcements (festivals, technical contests, workshops, competitions). For each event found, extract: title, date, time, venue, category, description, registrationUrl, sourcePostUrl, sourceCaption. Return JSON with key "events". Do not invent fake events if login wall is present.`;

    const payload: any = {
      url: club.url,
      goal,
      browser_profile: 'stealth',
    };

    if (useProfile) {
      payload.use_profile = true;
      payload.profile_id = authSession.profileId;
    }

    const tfResponse = await fetch(`${TINYFISH_API_BASE}/v1/automation/run`, {
      method: 'POST',
      headers: {
        'X-API-Key': TINYFISH_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Step 3: Reading accessible posts
    addLog(3, 'Reading accessible posts and profile header', 'active');

    const tfData = (await tfResponse.json()) as any;
    const durationMs = Date.now() - startTime;
    console.log(`[TinyFish Scan] Job ${jobId} finished in ${durationMs}ms`);

    const resultText = typeof tfData.result === 'string' 
      ? tfData.result 
      : (tfData.result?.result || JSON.stringify(tfData.result || {}));

    const lower = resultText.toLowerCase();

    // Step 4: Identifying announcements & checking login wall
    addLog(4, 'Inspecting page content for event announcements', 'active');

    const isLoginWall = lower.includes('login wall') ||
                        lower.includes('login page') ||
                        lower.includes('requires authentication') ||
                        lower.includes('login challenge') ||
                        lower.includes('see everyday moments') ||
                        lower.includes('not publicly accessible') ||
                        lower.includes('blocked');

    if (isLoginWall) {
      const errorMsg = useProfile
        ? 'Instagram Login Wall: Authenticated session may have expired. Please re-authenticate your Instagram session in settings.'
        : 'Instagram Login Wall: Public guest access is restricted by Instagram. Connect your Instagram account in CampusConnect to inspect club posts.';
      addLog(4, errorMsg, 'error');
      updateClubStatus(club.id, 'login_wall', errorMsg);
      updateScanJob(jobId, {
        status: 'login_wall',
        error: errorMsg,
        currentStep: 4,
        stepName: 'Instagram Authentication Required',
        completedAt: new Date().toISOString()
      });
      return;
    }

    // Step 5: Extracting event details
    addLog(5, 'Extracting structured event metadata', 'active');
    const extracted = parseExtractedEvents(resultText);

    // Step 6: Saving discovered events
    addLog(6, `Saving ${extracted.length} discovered event(s) to database`, 'done');

    if (extracted.length > 0) {
      const saved = saveDiscoveredEvents(club, extracted);
      updateClubStatus(club.id, 'success', `Scan complete. Found ${saved.length} event announcement(s).`, saved.length);
      updateScanJob(jobId, {
        status: 'completed',
        currentStep: 6,
        stepName: 'Scan Completed Successfully',
        eventsExtracted: saved.length,
        extractedEvents: saved,
        completedAt: new Date().toISOString()
      });
    } else {
      updateClubStatus(club.id, 'success', 'Profile scanned. No event announcements found in recent posts.');
      updateScanJob(jobId, {
        status: 'completed',
        currentStep: 6,
        stepName: 'Scan Complete — No Events Found',
        eventsExtracted: 0,
        extractedEvents: [],
        completedAt: new Date().toISOString()
      });
    }
  } catch (err: any) {
    console.error(`[TinyFish Scan] Error in job ${jobId}:`, err);
    addLog(1, `Scan error: ${err.message || 'Unknown error'}`, 'error');
    updateClubStatus(club.id, 'failed', err.message || 'Scan failed.');
    updateScanJob(jobId, {
      status: 'failed',
      error: err.message || 'Scan failed.',
      completedAt: new Date().toISOString()
    });
  }
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const rawUrl = req.url || '';
  const parsedUrl = new URL(rawUrl, 'http://localhost');
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }

  // 1. GET /api/status - check TinyFish key & wallet & DB
  if (pathname === '/api/status' && req.method === 'GET') {
    const hasKey = Boolean(TINYFISH_API_KEY && TINYFISH_API_KEY.startsWith('sk-tinyfish-'));
    let walletInfo = null;

    if (hasKey) {
      try {
        const response = await fetch(`${TINYFISH_API_BASE}/v1/wallet`, {
          headers: {
            'X-API-Key': TINYFISH_API_KEY,
            'Accept': 'application/json',
          },
        });
        if (response.ok) {
          walletInfo = await response.json();
        }
      } catch (err) {
        console.warn('TinyFish wallet check warning:', err);
      }
    }

    sendJson(res, 200, {
      configured: hasKey,
      keyMask: hasKey ? `${TINYFISH_API_KEY.slice(0, 11)}...${TINYFISH_API_KEY.slice(-4)}` : null,
      wallet: walletInfo,
      systemTime: new Date().toISOString(),
    });
    return true;
  }

  // --- INSTAGRAM PERSISTENT BROWSER AUTH ENDPOINTS ---

  // GET /api/auth/instagram/status
  if (pathname === '/api/auth/instagram/status' && req.method === 'GET') {
    let session = getInstagramSession();
    // Validate live status with TinyFish if configured
    if (TINYFISH_API_KEY && session.profileId) {
      try {
        const tfRes = await fetch(`${TINYFISH_API_BASE}/v1/profiles/${session.profileId}`, {
          headers: { 'X-API-Key': TINYFISH_API_KEY }
        });
        if (tfRes.ok) {
          const profileData: any = await tfRes.json();
          const domains = profileData.domains || profileData.signed_in_sites || [];
          const hasInstagram = domains.some((d: any) => 
            typeof d === 'string' ? d.includes('instagram.com') : d.domain?.includes('instagram.com')
          );
          if (hasInstagram) {
            session = saveInstagramSession({
              status: 'connected',
              signedInSites: ['instagram.com'],
              lastConnectedAt: session.lastConnectedAt || new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.warn('TinyFish profile status check warning:', e);
      }
    }
    sendJson(res, 200, {
      connected: session.status === 'connected',
      session,
      tinyFishConfigured: Boolean(TINYFISH_API_KEY)
    });
    return true;
  }

  // POST /api/auth/instagram/start - Start TinyFish authentication browser session
  if (pathname === '/api/auth/instagram/start' && req.method === 'POST') {
    if (!TINYFISH_API_KEY) {
      sendJson(res, 500, { error: 'TINYFISH_API_KEY is not configured on server.' });
      return true;
    }

    try {
      const session = getInstagramSession();
      let profileId = session.profileId;

      // Ensure persistent profile exists in TinyFish
      if (!profileId) {
        const createRes = await fetch(`${TINYFISH_API_BASE}/v1/profiles`, {
          method: 'POST',
          headers: { 'X-API-Key': TINYFISH_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'CampusConnect Instagram Session' })
        });
        if (createRes.ok) {
          const created: any = await createRes.json();
          profileId = created.id;
          saveInstagramSession({ profileId, profileName: 'CampusConnect Instagram Session' });
        }
      }

      // Start setup-session on TinyFish
      const setupRes = await fetch(`${TINYFISH_API_BASE}/v1/profiles/${profileId}/setup-session`, {
        method: 'POST',
        headers: { 'X-API-Key': TINYFISH_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!setupRes.ok) {
        const errText = await setupRes.text();
        sendJson(res, setupRes.status, { error: `TinyFish setup session failed: ${errText}` });
        return true;
      }

      const setupData: any = await setupRes.json();
      const sessionId = setupData.session_id;
      const baseUrl = setupData.base_url;

      // Instruct remote setup browser to open Instagram login directly
      try {
        await fetch(`${baseUrl}/json/new?https://www.instagram.com/accounts/login/`, { method: 'PUT' });
      } catch (navErr) {
        console.warn('Pre-navigation to Instagram login notice:', navErr);
      }

      saveInstagramSession({
        activeSessionId: sessionId,
        setupBaseUrl: baseUrl,
        expiresAt: setupData.expires_at || null
      });

      sendJson(res, 200, {
        success: true,
        sessionId,
        profileId,
        baseUrl,
        cdpUrl: setupData.cdp_url,
        expiresAt: setupData.expires_at,
        timeoutSeconds: setupData.timeout_seconds || 900
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Failed to start setup session.' });
      return true;
    }
  }

  // POST /api/auth/instagram/save - Confirm authentication and persist session state
  if (pathname === '/api/auth/instagram/save' && req.method === 'POST') {
    if (!TINYFISH_API_KEY) {
      sendJson(res, 500, { error: 'TINYFISH_API_KEY is not configured on server.' });
      return true;
    }

    try {
      const body = await parseBody(req);
      const session = getInstagramSession();
      const sessionId = body.sessionId || session.activeSessionId;
      const profileId = body.profileId || session.profileId;

      if (!sessionId || !profileId) {
        sendJson(res, 400, { error: 'sessionId and profileId are required to save session state.' });
        return true;
      }

      const saveRes = await fetch(`${TINYFISH_API_BASE}/v1/profiles/${profileId}/save`, {
        method: 'POST',
        headers: { 'X-API-Key': TINYFISH_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      const saveData: any = await saveRes.json();

      if (!saveRes.ok) {
        // Return honest error from TinyFish (e.g. 409 RETRY_REQUIRED if user hasn't finished logging in)
        sendJson(res, saveRes.status, {
          success: false,
          error: saveData.error?.message || 'Could not save session. Please verify that you have logged into Instagram.'
        });
        return true;
      }

      // Successfully saved!
      const updated = saveInstagramSession({
        status: 'connected',
        signedInSites: ['instagram.com'],
        lastConnectedAt: new Date().toISOString(),
        activeSessionId: null
      });

      sendJson(res, 200, {
        success: true,
        message: 'Instagram authenticated session captured and saved to TinyFish profile successfully.',
        session: updated
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // POST /api/auth/instagram/disconnect - Disconnect session
  if (pathname === '/api/auth/instagram/disconnect' && req.method === 'POST') {
    clearInstagramSession();
    sendJson(res, 200, { success: true, message: 'Instagram session disconnected.' });
    return true;
  }

  // --- DEMO SIMULATION ENDPOINTS ---

  // GET /api/demo/events - Retrieve preconfigured demo events for a club
  if (pathname === '/api/demo/events' && req.method === 'GET') {
    const clubId = parsedUrl.searchParams.get('clubId') || '';
    const handle = parsedUrl.searchParams.get('handle') || '';
    const name = parsedUrl.searchParams.get('name') || '';

    let club: Club | undefined;
    if (clubId) {
      club = getClubById(clubId);
    }

    const clubHandle = club ? club.handle : handle;
    const clubName = club ? club.name : name;

    const demoTemplates = getDemoEventsForClub(clubHandle, clubName);
    sendJson(res, 200, {
      success: true,
      club: club || { name: clubName, handle: clubHandle },
      count: demoTemplates.length,
      events: demoTemplates
    });
    return true;
  }

  // POST /api/demo/save - Persist simulated discoveries to the shared database
  if (pathname === '/api/demo/save' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { clubId, events: rawEvents } = body;

      if (!clubId) {
        sendJson(res, 400, { error: 'clubId is required to save demo events.' });
        return true;
      }

      const club = getClubById(clubId);
      if (!club) {
        sendJson(res, 404, { error: 'Club not found.' });
        return true;
      }

      const eventsList = Array.isArray(rawEvents) ? rawEvents : [];
      const savedEvents = saveDiscoveredEvents(club, eventsList);

      const msg = eventsList.length > 0 
        ? `Simulated discovery complete (${eventsList.length} events found).`
        : 'Simulated scan complete. No events found in demo dataset.';

      updateClubStatus(club.id, 'success', msg);
      const updatedClub = getClubById(club.id);
      const stats = getDashboardStats();

      sendJson(res, 200, {
        success: true,
        savedCount: savedEvents.length,
        events: savedEvents,
        club: updatedClub,
        stats
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Failed to save demo events.' });
      return true;
    }
  }

  // 2. GET /api/stats - real database-backed statistics for Home Dashboard
  if (pathname === '/api/stats' && req.method === 'GET') {
    const stats = getDashboardStats();
    sendJson(res, 200, { success: true, stats });
    return true;
  }

  // 3. GET /api/clubs - list all monitored clubs
  if (pathname === '/api/clubs' && req.method === 'GET') {
    const clubs = getClubs();
    sendJson(res, 200, { clubs });
    return true;
  }

  // 4. POST /api/clubs - add a new club
  if (pathname === '/api/clubs' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { name, handle, linkedinUrl } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        sendJson(res, 400, { error: 'Club name is required.' });
        return true;
      }

      if (!handle || typeof handle !== 'string' || !handle.trim()) {
        sendJson(res, 400, { error: 'Instagram handle or profile URL is required.' });
        return true;
      }

      const result = addClub(name, handle, linkedinUrl);
      if (result.error) {
        sendJson(res, 409, { error: result.error, club: result.club });
        return true;
      }

      console.log(`[API] Added club: "${result.club.name}" (${result.club.handle})`);
      sendJson(res, 201, { success: true, club: result.club });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Failed to save club.' });
      return true;
    }
  }

  // 5. POST /api/clubs/update - update club details
  if (pathname === '/api/clubs/update' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { id, name, linkedinUrl } = body;
      if (!id) {
        sendJson(res, 400, { error: 'Club ID is required.' });
        return true;
      }

      const updated = updateClub(id, { name, linkedinUrl });
      if (!updated) {
        sendJson(res, 404, { error: 'Club not found.' });
        return true;
      }

      sendJson(res, 200, { success: true, club: updated });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 6. POST /api/clubs/delete or DELETE /api/clubs/:id - remove a club
  if ((pathname === '/api/clubs/delete' && req.method === 'POST') || (pathname.startsWith('/api/clubs/') && req.method === 'DELETE')) {
    try {
      let id = '';
      if (req.method === 'DELETE') {
        id = pathname.replace('/api/clubs/', '');
      } else {
        const body = await parseBody(req);
        id = body.id;
      }

      if (!id) {
        sendJson(res, 400, { error: 'Club ID is required.' });
        return true;
      }

      const deleted = deleteClub(id);
      if (!deleted) {
        sendJson(res, 404, { error: 'Club not found.' });
        return true;
      }

      console.log(`[API] Deleted club ID: ${id}`);
      sendJson(res, 200, { success: true, message: 'Club removed successfully.' });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 7. GET /api/events - Unified Campus Feed or Club Events
  if (pathname === '/api/events' && req.method === 'GET') {
    const clubId = parsedUrl.searchParams.get('clubId');
    if (clubId) {
      const club = getClubById(clubId);
      if (!club) {
        sendJson(res, 404, { error: 'Club not found.' });
        return true;
      }
      const events = getEventsForClub(clubId);
      sendJson(res, 200, { club, events });
      return true;
    }

    // Unified Feed: return all events
    const allEvents = getEvents();
    sendJson(res, 200, { events: allEvents });
    return true;
  }

  // 8. POST /api/events/publish - Publish selected events to campus feed
  if (pathname === '/api/events/publish' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { eventIds } = body;
      if (!Array.isArray(eventIds) || eventIds.length === 0) {
        sendJson(res, 400, { error: 'eventIds array is required.' });
        return true;
      }

      const result = publishEvents(eventIds);
      sendJson(res, 200, { 
        success: true, 
        message: `Successfully verified and published ${result.publishedCount} event(s) to campus feed.`,
        publishedCount: result.publishedCount,
        events: result.events 
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 9. POST /api/events/update - Update event details
  if (pathname === '/api/events/update' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { id, ...updates } = body;
      if (!id) {
        sendJson(res, 400, { error: 'Event ID is required.' });
        return true;
      }

      const updated = updateEvent(id, updates);
      if (!updated) {
        sendJson(res, 404, { error: 'Event not found.' });
        return true;
      }

      sendJson(res, 200, { success: true, event: updated });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // 10. GET /api/scan/jobs/:jobId - Poll scan job status
  if (pathname.startsWith('/api/scan/jobs/') && req.method === 'GET') {
    const jobId = pathname.replace('/api/scan/jobs/', '');
    const job = getScanJob(jobId);
    if (!job) {
      sendJson(res, 404, { error: 'Scan job not found.' });
      return true;
    }
    sendJson(res, 200, { job });
    return true;
  }

  // 11. POST /api/scan - Initiate TinyFish scan (supports sync or async with jobId)
  if (pathname === '/api/scan' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const clubId = body.clubId;
      const rawHandle = body.handle;
      const isAsync = body.async === true;

      let club: Club | undefined;
      if (clubId) {
        club = getClubById(clubId);
      } else if (rawHandle) {
        const { cleanHandle } = normalizeInstagramHandle(rawHandle);
        const clubs = getClubs();
        club = clubs.find(c => c.cleanHandle.toLowerCase() === cleanHandle.toLowerCase());
      }

      if (!club) {
        sendJson(res, 404, { error: 'Club not found. Please add the club first.' });
        return true;
      }

      // Create a persistent scan job
      const scanJob = createScanJob(club);

      if (isAsync) {
        // Run scan asynchronously in background
        executeScanJob(scanJob.id, club);
        sendJson(res, 202, { 
          success: true, 
          jobId: scanJob.id, 
          message: 'Scan initiated.', 
          job: scanJob 
        });
        return true;
      }

      // Synchronous execution (wait for scan completion)
      await executeScanJob(scanJob.id, club);
      const completedJob = getScanJob(scanJob.id);
      const updatedClub = getClubById(club.id);

      sendJson(res, 200, {
        success: completedJob?.status === 'completed',
        status: completedJob?.status,
        message: completedJob?.error || completedJob?.stepName,
        job: completedJob,
        club: updatedClub,
        events: getEventsForClub(club.id),
      });
      return true;
    } catch (err: any) {
      console.error('[TinyFish Scan Error]:', err);
      sendJson(res, 500, {
        success: false,
        status: 'failed',
        error: err.message || 'Failed to complete scan.',
        events: []
      });
      return true;
    }
  }

  return false;
}
