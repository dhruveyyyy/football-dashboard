// A simple, explainable win-probability model -- not meant to rival betting
// markets, but to demonstrate real statistical reasoning over live data.
//
// The logic, in plain English (good for a 30-second judge explanation):
// 1. Each team's "strength" = points earned per game played this season.
// 2. Home advantage adds a fixed bonus to the home team's strength
//    (~0.15 points/game, a commonly cited home-advantage effect size).
// 3. The strength gap is fed through a logistic curve to get a win
//    probability for whichever side would win if there were no draws.
// 4. A draw probability is layered in separately: draws are most likely
//    when the two teams are evenly matched, and rarer the bigger the gap.
// 5. All three probabilities are normalized to sum to 100%.

export type StandingEntry = {
  teamId: number;
  points: number;
  playedGames: number;
  form: string | null; // e.g. "W,W,D,L,W"
};

export type MatchPrediction = {
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  reasoning: string;
};

const HOME_ADVANTAGE = 0.15;

function strength(entry: StandingEntry | undefined): number {
  if (!entry || entry.playedGames === 0) return 1.3; // league-average PPG as a neutral default
  return entry.points / entry.playedGames;
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function predictMatch(
  home: StandingEntry | undefined,
  away: StandingEntry | undefined
): MatchPrediction {
  const homeStrength = strength(home) + HOME_ADVANTAGE;
  const awayStrength = strength(away);
  const diff = homeStrength - awayStrength;

  const rawHomeWin = logistic(diff * 1.6);
  const drawWeight = 0.30 * Math.exp(-1.1 * diff * diff);

  const homeWin = rawHomeWin * (1 - drawWeight);
  const awayWin = (1 - rawHomeWin) * (1 - drawWeight);
  const draw = drawWeight;

  const total = homeWin + awayWin + draw;

  const homeWinPct = Math.round((homeWin / total) * 100);
  const drawPct = Math.round((draw / total) * 100);
  const awayWinPct = 100 - homeWinPct - drawPct;

  const gap = Math.abs(diff).toFixed(2);
  const reasoning =
    diff > 0.05
      ? `Home side is averaging more points per game this season (gap: ${gap}), plus home advantage.`
      : diff < -0.05
      ? `Away side has the stronger league form this season (gap: ${gap}), enough to outweigh home advantage.`
      : `Both sides are averaging almost identical points per game -- a genuine toss-up, which pushes up the draw chance.`;

  return { homeWinPct, drawPct, awayWinPct, reasoning };
}
