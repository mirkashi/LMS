// Utilities for building API and static asset URLs consistently.
//
// Important: NEXT_PUBLIC_API_URL is used for API requests and is expected to include `/api`.
// Uploaded files are served from the backend at `/uploads` (NOT `/api/uploads`).

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export function getBackendOrigin(): string {
  const apiUrl = getApiUrl();
  // Strip trailing `/api` (or `/api/`) to get the backend origin.
  return apiUrl.replace(/\/?api\/?$/, '');
}

/**
 * Convert a stored path (typically `/uploads/<file>`) to an absolute URL.
 * - Accepts absolute URLs and returns them unchanged.
 * - Normalizes leading slashes.
 */
export function getAssetUrl(path?: string | null): string | null {
  if (!path) return null;

  const raw = String(path).trim();
  if (!raw) return null;

  // Already absolute
  if (/^https?:\/\//i.test(raw)) return raw;

  const origin = getBackendOrigin();
  const normalized = raw.replace(/^\/+/, '');
  return `${origin}/${normalized}`;
}
