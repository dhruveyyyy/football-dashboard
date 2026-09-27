import { NextResponse } from "next/server";
import { footballFetch, COMPETITIONS } from "@/lib/footballApi";
export const dynamic = "force-dynamic";
function isoDate(daysFromNow: number) { const d = new Date(); d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10); } const DATE_FROM = isoDate(-10);
const DATE_TO = isoDate(14);
export async function GET() { try { const results = await Promise.all( COMPETITIONS.map((c) => footballFetch( `/competitions/${c.code}/matches?dateFrom=${DATE_FROM}&dateTo=${DATE_TO}` ) ) );
  const allMatches = results.flatMap((r) => r.matches ?? []);
  return NextResponse.json(allMatches); } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 502 }); } }