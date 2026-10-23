import { NextRequest, NextResponse } from "next/server";
import { recordEvent } from "@/server/db";
import { env } from "@/server/env";
import { isSameOrigin, parseEventName } from "@/lib/feedback";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request.headers.get("origin"), env().APP_URL)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const name = parseEventName(body && typeof body === "object" ? (body as Record<string, unknown>).name : null);
  if (!name) return NextResponse.json({ error: "Unknown event." }, { status: 400 });
  try {
    await recordEvent(name);
  } catch (error) {
    console.error("Counting an event failed:", error instanceof Error ? error.name : "unknown");
  }
  return NextResponse.json({ ok: true });
}
