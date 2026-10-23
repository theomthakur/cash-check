"use client";

import { useState } from "react";
import styles from "./site.module.css";

type Stage = "ask" | "note" | "done" | "error";

export default function Feedback({ source }: { source: "demo" | "live" }) {
  const [stage, setStage] = useState<Stage>("ask");
  const [token, setToken] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function vote(useful: boolean) {
    setBusy(true);
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ useful, source }) });
      const body = (await response.json().catch(() => ({}))) as { token?: string };
      if (response.ok) { setToken(body.token ?? null); setStage("note"); } else setStage("error");
    } catch {
      setStage("error");
    } finally {
      setBusy(false);
    }
  }

  async function sendNote() {
    if (!token || !note.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/feedback", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, note }) });
    } finally {
      setBusy(false);
      setStage("done");
    }
  }

  return (
    <section className={styles.feedback} aria-label="Feedback">
      {stage === "ask" && (
        <>
          <p><b>Was this useful?</b> One click helps decide what to build next.</p>
          <div><button type="button" disabled={busy} onClick={() => void vote(true)}>Yes</button><button type="button" disabled={busy} onClick={() => void vote(false)}>Not really</button></div>
        </>
      )}
      {stage === "note" && (
        <form onSubmit={(event) => { event.preventDefault(); void sendNote(); }}>
          <p><b>Thanks.</b> Anything we should change? (optional, no names or account numbers please)</p>
          <div>
            <input value={note} maxLength={280} onChange={(event) => setNote(event.target.value)} placeholder="One line is plenty" aria-label="Your note" />
            <button type="submit" disabled={busy || !note.trim()}>Send note</button>
            <button type="button" onClick={() => setStage("done")}>Skip</button>
          </div>
        </form>
      )}
      {stage === "done" && <p><b>Thank you.</b> Your answer is counted anonymously.</p>}
      {stage === "error" && <p>We could not save that just now. Please try again later.</p>}
    </section>
  );
}
