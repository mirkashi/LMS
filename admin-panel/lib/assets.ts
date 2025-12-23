// Utilities for building API and static asset URLs consistently.
// NEXT_PUBLIC_API_URL is expected to include `/api` for backend endpoints.
// Uploaded files are served from `/uploads`.

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export function getBackendOrigin(): string {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/\/?api\/?$/, '');
}

export function getAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const origin = getBackendOrigin();
  const normalized = raw.replace(/^\/+/, '');
  return `${origin}/${normalized}`;
}
