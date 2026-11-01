import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { 
  getClubs, 
  addClub, 
  deleteClub, 
  getClubById, 
  updateClubStatus, 
  getEventsForClub, 
  saveDiscoveredEvents,
  normalizeInstagramHandle,
  type Club,
  type ClubEvent
} from './db.ts';

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
function parseExtractedEvents(resultText: string): Partial<ClubEvent>[] {
  const events: Partial<ClubEvent>[] = [];

  // Try parsing direct JSON
  try {
    const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, resultText];
    const candidate = jsonMatch[1] ? jsonMatch[1].trim() : resultText.trim();
    if (candidate.startsWith('{') || candidate.startsWith('[')) {
      const parsed = JSON.parse(candidate);
      const list = Array.isArray(parsed) ? parsed : (parsed.events || [parsed]);
      for (const item of list) {
        if (item && (item.title || item.event_name || item.name)) {
          events.push({
            title: item.title || item.event_name || item.name,
            description: item.description || null,
            date: item.date || null,
            time: item.time || null,
            venue: item.venue || null,
            registrationDeadline: item.registrationDeadline || item.deadline || null,
            registrationUrl: item.registrationUrl || item.registration_url || item.link || null,
            sourcePostUrl: item.sourcePostUrl || item.source_url || item.post_url || '',
            sourceCaption: item.sourceCaption || item.caption || null,
            extractionStatus: 'extracted',
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

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const rawUrl = req.url || '';
  const parsedUrl = new URL(rawUrl, 'http://localhost');
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }

  // 1. GET /api/status - check TinyFish key & wallet
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

  // 2. GET /api/clubs - list all monitored clubs
  if (pathname === '/api/clubs' && req.method === 'GET') {
    const clubs = getClubs();
    sendJson(res, 200, { clubs });
    return true;
  }

  // 3. POST /api/clubs - add a new club
  if (pathname === '/api/clubs' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { name, handle } = body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        sendJson(res, 400, { error: 'Club name is required.' });
        return true;
      }

      if (!handle || typeof handle !== 'string' || !handle.trim()) {
        sendJson(res, 400, { error: 'Instagram handle or profile URL is required.' });
        return true;
      }

      const result = addClub(name, handle);
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

  // 4. POST /api/clubs/delete or DELETE /api/clubs/:id - remove a club
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

  // 5. GET /api/events - get events for a specific club
  if (pathname === '/api/events' && req.method === 'GET') {
    const clubId = parsedUrl.searchParams.get('clubId');
    if (!clubId) {
      sendJson(res, 400, { error: 'clubId query parameter is required.' });
      return true;
    }

    const club = getClubById(clubId);
    if (!club) {
      sendJson(res, 404, { error: 'Club not found.' });
      return true;
    }

    const events = getEventsForClub(clubId);
    sendJson(res, 200, { club, events });
    return true;
  }

  // 6. POST /api/scan - scan Instagram posts for a club using TinyFish
  if (pathname === '/api/scan' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const clubId = body.clubId;
      const rawHandle = body.handle;

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

      console.log(`[TinyFish Scan] Starting real scan for: ${club.name} (${club.handle}) -> ${club.url}`);

      // Mark club as scanning
      updateClubStatus(club.id, 'scanning', 'Agent navigating to Instagram profile...');

      if (!TINYFISH_API_KEY) {
        updateClubStatus(club.id, 'failed', 'TINYFISH_API_KEY is not configured on server.');
        sendJson(res, 500, { 
          success: false, 
          error: 'TINYFISH_API_KEY is not configured on server.',
          club: getClubById(club.id),
          events: []
        });
        return true;
      }

      const startTime = Date.now();
      const goal = `Navigate to ${club.url}. Check if the profile is publicly viewable or if Instagram displays a login wall. If blocked by a login wall or login challenge, state clearly that Instagram requires authentication to view this profile. If recent posts are visible, inspect recent posts to find college event announcements (gatherings, competitions, festivals, workshops). For each event found, extract: title, date, time, venue, description, registrationUrl, sourcePostUrl, sourceCaption. Return JSON with key "events". Do not fabricate events if login wall is present.`;

      const tfResponse = await fetch(`${TINYFISH_API_BASE}/v1/automation/run`, {
        method: 'POST',
        headers: {
          'X-API-Key': TINYFISH_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: club.url,
          goal,
          browser_profile: 'stealth',
        }),
      });

      const tfData = (await tfResponse.json()) as any;
      const durationMs = Date.now() - startTime;
      console.log(`[TinyFish Scan] Finished in ${durationMs}ms:`, tfData);

      const resultText = typeof tfData.result === 'string' 
        ? tfData.result 
        : (tfData.result?.result || JSON.stringify(tfData.result || {}));

      const lower = resultText.toLowerCase();

      // Check for Instagram Login Wall / Block
      const isLoginWall = lower.includes('login wall') ||
                          lower.includes('login page') ||
                          lower.includes('requires authentication') ||
                          lower.includes('login challenge') ||
                          lower.includes('see everyday moments') ||
                          lower.includes('not publicly accessible') ||
                          lower.includes('blocked');

      if (isLoginWall) {
        const errorMsg = 'Instagram Login Wall: Profile requires authentication. Instagram redirected the agent to a login page ("See everyday moments from your close friends").';
        const updatedClub = updateClubStatus(club.id, 'login_wall', errorMsg);
        
        sendJson(res, 200, {
          success: false,
          status: 'login_wall',
          message: errorMsg,
          rawResult: resultText,
          club: updatedClub,
          events: getEventsForClub(club.id), // return existing real events, no fake events
          durationMs,
        });
        return true;
      }

      // Check if actual events were extracted
      const extracted = parseExtractedEvents(resultText);

      if (extracted.length > 0) {
        saveDiscoveredEvents(club, extracted);
        const updatedClub = updateClubStatus(club.id, 'success', `Scan complete. Found ${extracted.length} event announcement(s).`, extracted.length);
        const clubEvents = getEventsForClub(club.id);

        sendJson(res, 200, {
          success: true,
          status: 'success',
          message: `Discovered ${extracted.length} event(s) from Instagram posts.`,
          club: updatedClub,
          events: clubEvents,
          durationMs,
        });
        return true;
      }

      // No events found in accessible posts
      const updatedClub = updateClubStatus(club.id, 'success', 'Profile scanned. No event announcements found in recent posts.');
      sendJson(res, 200, {
        success: true,
        status: 'no_events',
        message: 'No event announcements found in recent posts.',
        rawResult: resultText,
        club: updatedClub,
        events: getEventsForClub(club.id),
        durationMs,
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
