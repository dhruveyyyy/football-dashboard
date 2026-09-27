"use client";

import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import { StandingEntry } from "@/lib/prediction";
import { COMPETITIONS } from "@/lib/footballApi";

type Match = {
  id: number;
  utcDate: string;
  status: string;
  competition: { code: string; name: string };
  homeTeam: { id: number; name: string; shortName: string | null; crest: string | null };
  awayTeam: { id: number; name: string; shortName: string | null; crest: string | null };
  score: { fullTime: { home: number | null; away: number | null } };
};

type StandingsMap = Record<string, StandingEntry[]>;

const POLL_MS = 60_000;

export default function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingsMap>({});
  const [competition, setCompetition] = useState<string>(COMPETITIONS[0].code);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [matchesRes, standingsRes] = await Promise.all([
        fetch("/api/matches").then((r) => r.json()),
        fetch("/api/standings").then((r) => r.json()),
      ]);
      if (matchesRes.error) throw new Error(matchesRes.error);
      if (standingsRes.error) throw new Error(standingsRes.error);
      setMatches(matchesRes);
      setStandings(standingsRes);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, []);

const now = Date.now();
const filtered = matches .filter((m) => m.competition.code === competition) .sort((a, b) => { const aTime = new Date(a.utcDate).getTime();
  const bTime = new Date(b.utcDate).getTime();
  const aUpcoming = aTime >= now;
  const bUpcoming = bTime >= now;
  if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
  return aUpcoming ? aTime - bTime : bTime - aTime; });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl">Matchday</h1>
        <p className="mt-1 text-sm text-chalk/50">
          Live fixtures with a real win-probability model, refreshing every minute.
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        {COMPETITIONS.map((c) => (
          <button
            key={c.code}
            onClick={() => setCompetition(c.code)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              competition === c.code
                ? "border-gold bg-gold/10 text-gold"
                : "border-white/15 text-chalk/70 hover:border-white/30"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-chalk/50">Loading fixtures…</p>
      ) : error ? (
        <div className="rounded-lg border border-claret/40 bg-claret/10 p-4 text-sm text-chalk/80">
          <p className="font-medium text-claret">Couldn't load live data</p>
          <p className="mt-1 text-chalk/60">{error}</p>
          <p className="mt-2 text-xs text-chalk/40">
            Check that FOOTBALL_DATA_API_KEY is set correctly in .env.local.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-chalk/50">No fixtures in the next week for this competition.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} standings={standings[competition] ?? []} />
          ))}
        </div>
      )}
    </main>
  );
}
