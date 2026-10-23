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
    console.error("SnapTrade portfolio request failed", error instanceof Error ? { name: error.name, message: error.message } : { name: "UnknownError" });
    return NextResponse.json({ error: "Portfolio data is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
