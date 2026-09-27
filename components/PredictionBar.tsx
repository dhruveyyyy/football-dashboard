export default function PredictionBar({
  homeWinPct,
  drawPct,
  awayWinPct,
  homeLabel,
  awayLabel,
}: {
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  homeLabel: string;
  awayLabel: string;
}) {
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="bg-gold" style={{ width: `${homeWinPct}%` }} />
        <div className="bg-white/30" style={{ width: `${drawPct}%` }} />
        <div className="bg-claret" style={{ width: `${awayWinPct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-chalk/60">
        <span>
          {homeLabel} <span className="text-gold">{homeWinPct}%</span>
        </span>
        <span>Draw {drawPct}%</span>
        <span>
          <span className="text-claret">{awayWinPct}%</span> {awayLabel}
        </span>
      </div>
    </div>
  );
}
