import { NextResponse } from "next/server";
import { footballFetch } from "@/lib/footballApi";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { matchId: string } }) {
  try {
    const data = await footballFetch(`/matches/${params.matchId}/head2head?limit=5`);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
