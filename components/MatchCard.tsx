"use client";

import Link from "next/link";
import PredictionBar from "./PredictionBar";
import { predictMatch, StandingEntry } from "@/lib/prediction";

type Team = { id: number; name: string; shortName: string | null; crest: string | null };
type Match = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  score: { fullTime: { home: number | null; away: number | null } };
};

const LIVE_STATUSES = new Set(["LIVE", "IN_PLAY", "PAUSED"]);

export default function MatchCard({
  match,
  standings,
}: {
  match: Match;
  standings: StandingEntry[];
}) {
  const home = standings.find((s) => s.teamId === match.homeTeam.id);
  const away = standings.find((s) => s.teamId === match.awayTeam.id);
  const prediction = predictMatch(home, away);

  const isLive = LIVE_STATUSES.has(match.status);
  const isFinished = match.status === "FINISHED";
  const kickoff = new Date(match.utcDate).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", }); 

  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-chalk/50">
        <span>{kickoff}</span>
        {isLive ? (
          <span className="rounded-full bg-claret/20 px-2 py-0.5 font-medium text-claret">● LIVE</span>
        ) : (
          <span>{isFinished ? "Full time" : match.status}</span>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <TeamRow team={match.homeTeam} />
        <ScoreOrVs match={match} isLive={isLive} isFinished={isFinished} />
        <TeamRow team={match.awayTeam} reverse />
      </div>

      <PredictionBar
        homeWinPct={prediction.homeWinPct}
        drawPct={prediction.drawPct}
        awayWinPct={prediction.awayWinPct}
        homeLabel={match.homeTeam.shortName ?? match.homeTeam.name}
        awayLabel={match.awayTeam.shortName ?? match.awayTeam.name}
      />
      <p className="mt-2 text-xs text-chalk/40">{prediction.reasoning}</p>
    </Link>
  );
}

function TeamRow({ team, reverse }: { team: Team; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${reverse ? "flex-row-reverse text-right" : ""}`}>
      {team.crest && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.crest} alt="" className="h-6 w-6 object-contain" />
      )}
      <span className="text-sm font-medium">{team.shortName ?? team.name}</span>
    </div>
  );
}

function ScoreOrVs({ match, isLive, isFinished }: { match: Match; isLive: boolean; isFinished: boolean }) {
  if (isLive || isFinished) {
    return (
      <span className="font-display text-lg">
        {match.score.fullTime.home ?? 0} – {match.score.fullTime.away ?? 0}
      </span>
    );
  }
  return <span className="text-chalk/30">vs</span>;
}
