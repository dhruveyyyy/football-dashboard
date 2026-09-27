"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Team = { id: number; name: string; crest: string | null };
type MatchDetail = {
  utcDate: string;
  competition: { name: string };
  homeTeam: Team;
  awayTeam: Team;
  score: { fullTime: { home: number | null; away: number | null } };
  status: string;
};
type H2HMatch = {
  id: number;
  utcDate: string;
  competition: { name: string };
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: { fullTime: { home: number | null; away: number | null } };
};
type H2H = {
  aggregates: {
    numberOfMatches: number;
    homeTeam: { wins: number; draws: number; losses: number };
    awayTeam: { wins: number; draws: number; losses: number };
  };
  matches: H2HMatch[];
};

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [h2h, setH2h] = useState<H2H | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/match/${id}`).then((r) => r.json()),
      fetch(`/api/head2head/${id}`).then((r) => r.json()),
    ])
      .then(([m, h]) => {
        if (m.error) throw new Error(m.error);
        if (h.error) throw new Error(h.error);
        setMatch(m);
        setH2h(h);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <button onClick={() => router.push("/")} className="mb-6 text-sm text-chalk/50 hover:text-chalk">
        ← Back to fixtures
      </button>

      {error && <p className="text-claret">{error}</p>}

      {match && (
        <div className="mb-8">
          <p className="mb-1 text-xs uppercase tracking-wide text-chalk/40">{match.competition.name}</p>
          <h1 className="font-display text-2xl">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h1>
          <p className="mt-1 text-sm text-chalk/50">
            {new Date(match.utcDate).toLocaleString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

      {h2h && (
        <>
          <p className="mb-3 text-xs uppercase tracking-wide text-chalk/40">
            Head-to-head — last {h2h.aggregates.numberOfMatches} meetings
          </p>
          <div className="mb-6 flex gap-6 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
            <Stat label={`${match?.homeTeam.name ?? "Home"} wins`} value={h2h.aggregates.homeTeam.wins} />
            <Stat label="Draws" value={h2h.aggregates.homeTeam.draws} />
            <Stat label={`${match?.awayTeam.name ?? "Away"} wins`} value={h2h.aggregates.awayTeam.wins} />
          </div>

          <div className="space-y-2">
            {h2h.matches.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2 text-sm">
                <span className="text-chalk/50">
                  {new Date(m.utcDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <span>
                  {m.homeTeam.name} {m.score.fullTime.home ?? "-"} – {m.score.fullTime.away ?? "-"} {m.awayTeam.name}
                </span>
                <span className="text-chalk/30">{m.competition.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-xl text-gold">{value}</p>
      <p className="text-xs text-chalk/50">{label}</p>
    </div>
  );
}
