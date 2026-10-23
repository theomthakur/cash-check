"use client";

import { useRef, useState } from "react";
import styles from "./site.module.css";

type Stage = "ask" | "note" | "done" | "error";

export default function Feedback({ source }: { source: "demo" | "live" }) {
  const [stage, setStage] = useState<Stage>("ask");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<"saving" | "yes" | "no">("saving");
  const [sending, setSending] = useState(false);
  const tokenPromise = useRef<Promise<string | null>>(Promise.resolve(null));

  /** Shows the thank-you straight away, then saves in the background. */
  function vote(useful: boolean) {
    setStage("note");
    setSaved("saving");
    tokenPromise.current = fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ useful, source }) })
      .then(async (response) => {
        if (!response.ok) throw new Error("not saved");
        const body = (await response.json().catch(() => ({}))) as { token?: string };
        setSaved("yes");
        return body.token ?? null;
      })
      .catch(() => {
        setSaved("no");
        setStage("error");
        return null;
      });
  }

  async function sendNote() {
    if (!note.trim()) return;
    setSending(true);
    const token = await tokenPromise.current;
    try {
      if (token) await fetch("/api/feedback", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, note }) });
    } finally {
      setSending(false);
      setStage("done");
    }
  }

  return (
    <section className={styles.feedback} aria-label="Feedback" aria-live="polite">
      {stage === "ask" && (
        <>
          <p><b>Did Cash Check help?</b> Your answer helps decide what to improve next.</p>
          <div><button type="button" onClick={() => vote(true)}>Yes</button><button type="button" onClick={() => vote(false)}>Not really</button></div>
        </>
      )}
      {stage === "note" && (
        <form onSubmit={(event) => { event.preventDefault(); void sendNote(); }}>
          <p><b>Thanks—your answer is {saved === "yes" ? "saved" : "being saved"}.</b> What would make this more useful? Please don&apos;t include names or account numbers.</p>
          <div>
            <input value={note} maxLength={280} onChange={(event) => setNote(event.target.value)} placeholder="A sentence is plenty" aria-label="Your note" />
            <button type="submit" disabled={sending || !note.trim()}>Send note</button>
            <button type="button" onClick={() => setStage("done")}>No thanks</button>
          </div>
        </form>
      )}
      {stage === "done" && <p><b>Thank you.</b> Your answer is anonymous. See what others said on the <a href="/stats" style={{ textDecoration: "underline" }}>usage page</a>.</p>}
      {stage === "error" && (
        <>
          <p>We could not save that just now.</p>
          <div><button type="button" onClick={() => setStage("ask")}>Try again</button></div>
        </>
      )}
    </section>
  );
}
