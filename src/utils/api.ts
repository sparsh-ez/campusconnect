/**
 * Resolves API endpoints against the configured backend base URL (VITE_API_BASE_URL)
 * or falls back to relative paths for local development (via Vite dev server middleware).
 */
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Normalize base URL by stripping trailing slashes
export const API_BASE_URL = RAW_BASE_URL ? String(RAW_BASE_URL).trim().replace(/\/+$/, '') : '';

/**
 * Returns a fully qualified or relative URL for the given API path.
 *
 * Examples:
 * - With VITE_API_BASE_URL="https://campusconnect-api.onrender.com":
 *   apiUrl('/api/clubs') -> "https://campusconnect-api.onrender.com/api/clubs"
 * - In local development (without VITE_API_BASE_URL set):
 *   apiUrl('/api/clubs') -> "/api/clubs"
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Safely parses JSON from a Fetch Response. If the response is HTML (e.g. Vercel 404
 * or Render wake-up 502/503), returns an intelligible error instead of a raw SyntaxError.
 */
export async function parseJsonResponse<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Backend returned HTTP ${res.status} non-JSON response. Please ensure VITE_API_BASE_URL is set in Vercel and the Render backend is live.`
    );
  }
}
