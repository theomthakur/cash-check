import { NextResponse } from "next/server";
import { getSessionUserId } from "@/server/session";
import { getPortfolioSnapshot } from "@/server/snaptrade";
import { ReconnectRequiredError } from "@/server/tokens";

export async function GET() {
  const appUserId = await getSessionUserId();
  if (!appUserId) return NextResponse.json({ error: "Please reconnect your SnapTrade account." }, { status: 401 });
  try {
    return NextResponse.json(await getPortfolioSnapshot(appUserId), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof ReconnectRequiredError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Portfolio data is unavailable." }, { status: 502 });
  }
}
