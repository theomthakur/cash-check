import { NextRequest, NextResponse } from "next/server";
import { addFeedbackNote, feedbackInLastHour, saveFeedback } from "@/server/db";
import { env } from "@/server/env";
import { isSameOrigin, parseFeedback, parseNote } from "@/lib/feedback";

const HOURLY_CAP = 300;

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request.headers.get("origin"), env().APP_URL)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const input = parseFeedback(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: "That did not look right." }, { status: 400 });
  try {
    if ((await feedbackInLastHour()) >= HOURLY_CAP) return NextResponse.json({ error: "Please try again later." }, { status: 429 });
    const token = await saveFeedback(input);
    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error("Saving feedback failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "We could not save that. Please try again." }, { status: 500 });
  }
}

/** Adds a note to the answer you just gave. */
export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request.headers.get("origin"), env().APP_URL)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const input = parseNote(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: "That did not look right." }, { status: 400 });
  try {
    return NextResponse.json({ ok: await addFeedbackNote(input.token, input.note) });
  } catch (error) {
    console.error("Saving a note failed:", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "We could not save that. Please try again." }, { status: 500 });
  }
}
