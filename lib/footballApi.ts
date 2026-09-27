// Thin wrapper around football-data.org's v4 API.
//
// Two things this handles that matter for a hackathon demo:
// 1. The API key stays server-side only (never NEXT_PUBLIC_*) so it's never
//    exposed in the browser.
// 2. The free tier is rate-limited (10 requests/minute). A simple in-memory
//    cache means multiple people loading the dashboard -- or the same person
//    refreshing -- don't each burn a request; we just serve the last result
//    for CACHE_TTL_MS.

const BASE_URL = "https://api.football-data.org/v4";
const CACHE_TTL_MS = 60_000;
type CacheEntry = { data: any; expiresAt: number };
const cache = new Map<string, CacheEntry>();
function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); } 
export async function footballFetch(path: string): Promise<any> { const cached = cache.get(path);
  if (cached && cached.expiresAt > Date.now()) { return cached.data; }
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) { throw new Error("FOOTBALL_DATA_API_KEY is not set"); }
  const res = await fetch(`${BASE_URL}${path}`, { headers: { "X-Auth-Token": apiKey }, cache: "no-store", });
  if (res.status === 429) { await sleep(3000); return footballFetch(path); }
  if (!res.ok) { const body = await res.text(); throw new Error(`football-data.org ${res.status}: ${body}`); }
  const data = await res.json(); cache.set(path, { data, expiresAt: Date.now() + CACHE_TTL_MS }); return data; }
export const COMPETITIONS = [ { code: "PL", name: "Premier League" }, { code: "PD", name: "La Liga" }, { code: "SA", name: "Serie A" }, { code: "BL1", name: "Bundesliga" }, { code: "FL1", name: "Ligue 1" }, { code: "CL", name: "Champions League" }, ] as const;