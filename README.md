# Matchday — Live Football Dashboard

Live fixtures across the Premier League, La Liga, and Champions League, with
your own win-probability model layered on top of real season data (not just
raw scores). Polls for updates every 60 seconds.

## How the prediction works

Each team's "strength" = points earned per game played this season. The gap
between the two teams' strength (plus a fixed home-advantage bonus) is fed
through a logistic curve to get a win probability, and a separate draw
probability is layered in that peaks when the two teams are evenly matched.
See `lib/prediction.ts` — it's isolated from the UI and fully commented.

Stack: Next.js (App Router), football-data.org API. No database needed —
this project is a live data proxy + model, not a data store.

## Setup (5 minutes)

1. Sign up for a free API key at https://www.football-data.org/client/register
2. Copy `.env.local.example` to `.env.local` and paste your key in as
   `FOOTBALL_DATA_API_KEY` (NOT prefixed with NEXT_PUBLIC_ — this key must
   stay server-side only, since the free tier ties usage to your account).
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000.

## Deploy (5 minutes)

Push to GitHub, import into Vercel, add `FOOTBALL_DATA_API_KEY` as an
environment variable in the Vercel project settings (again, no
NEXT_PUBLIC_ prefix). Deploy.

## Notes for reviewers

- The free football-data.org tier is rate-limited to 10 requests/minute.
  `lib/footballApi.ts` caches every upstream response for 60 seconds so
  the dashboard's polling never comes close to that limit.
- If a competition shows no fixtures, it's most likely because there are
  genuinely none scheduled in the next 7 days (e.g. an international
  break) — not a bug.
