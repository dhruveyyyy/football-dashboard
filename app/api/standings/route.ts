import { NextResponse } from "next/server";
import { footballFetch, COMPETITIONS } from "@/lib/footballApi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await Promise.all(
      COMPETITIONS.map(async (c) => {
        const data = await footballFetch(`/competitions/${c.code}/standings`);
        const table = data.standings?.find((s: any) => s.type === "TOTAL")?.table ?? [];
        return [
          c.code,
          table.map((row: any) => ({
            teamId: row.team.id,
            points: row.points,
            playedGames: row.playedGames,
            form: row.form,
          })),
        ] as const;
      })
    );
    return NextResponse.json(Object.fromEntries(results));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
