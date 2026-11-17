// make.fun public API: read-only GET, CORS open. Answers are cached in memory and
// revalidated with their ETag (If-None-Match): a 304 within the same minute costs no body.
const API = 'https://make.fun/api';
const cache = new Map();

export async function get(path) {
  const hit = cache.get(path);
  const headers = hit?.etag ? { 'If-None-Match': hit.etag } : {};
  const res = await fetch(API + path, { headers });
  if (res.status === 304 && hit) return hit.data;
  if (!res.ok) throw new Error(`make.fun answered ${res.status} for ${path}`);
  const data = await res.json();
  cache.set(path, { etag: res.headers.get('etag'), data });
  return data;
}

export const getBounties = () => get('/competitions?status=open&activity=times');
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
