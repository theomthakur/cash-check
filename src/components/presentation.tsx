"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { LINKS, TECH } from "@/lib/site";
import styles from "./site.module.css";

/* eslint-disable @next/next/no-img-element */
const logo = (key: (typeof TECH)[number]["key"]) => TECH.find((item) => item.key === key)!.file;

const slides: { label: string; body: ReactNode }[] = [
  {
    label: "Cash Check",
    body: (
      <>
        <p className={styles.eyebrow}>A short presentation</p>
        <h1>See the cash that isn&apos;t invested yet.</h1>
        <p className={styles.big}>A read-only view of the cash across your brokerage accounts. Made by Om Thakur for SnapTrade&apos;s Product Engineer exercise.</p>
      </>
    ),
  },
  {
    label: "The problem",
    body: (
      <>
        <p className={styles.eyebrow}>The problem</p>
        <h2>Cash hides when it is spread across accounts.</h2>
        <ul className={styles.points}>
          <li><b>One account is easy.</b> You see the balance when you log in.</li>
          <li><b>Three accounts is not.</b> A dividend lands here, a deposit lands there, and nobody adds it up.</li>
          <li><b>The result:</b> money that was meant to be invested sits as cash for months.</li>
        </ul>
      </>
    ),
  },
  {
    label: "Why SnapTrade",
    body: (
      <>
        <p className={styles.eyebrow}>Why SnapTrade</p>
        <h2>Without SnapTrade, this idea does not work.</h2>
        <ul className={styles.points}>
          <li><b>Every brokerage is different.</b> Its own login, its own rules, its own data format.</li>
          <li><b>SnapTrade is one connection.</b> One safe sign-in and the same data shape from every brokerage it supports.</li>
          <li><b>Safer for you.</b> Cash Check never sees a brokerage password, and only asks to read.</li>
          <li><b>The alternative</b> is one brokerage only, or typing numbers by hand.</li>
        </ul>
        <div className={styles.chips}><span className={styles.chip}><img src="/logos/snaptrade-wordmark.svg" alt="SnapTrade" height={20} style={{ height: 20, width: "auto" }} /></span></div>
      </>
    ),
  },
  {
    label: "What you see",
    body: (
      <>
        <p className={styles.eyebrow}>What it shows</p>
        <h2>Two facts, side by side. Not one big claim.</h2>
        <ul className={styles.points}>
          <li><b>Cash today</b>, by account and by currency. Dollars and Canadian dollars are never added together.</li>
          <li><b>What came in</b> over the last 30 days: dividends, interest and deposits.</li>
          <li><b>A what-if:</b> how your mix would change if you invested some of the cash. Nothing is sold, and no order is placed.</li>
        </ul>
        <p className={styles.big}>We never say the money that came in is the money still in cash, because we cannot prove it.</p>
      </>
    ),
  },
  {
    label: "How it works",
    body: (
      <>
        <p className={styles.eyebrow}>How it works</p>
        <h2>Four parts, each with one job.</h2>
        <div className={styles.slideDiagram}>
          <div className={styles.slideNode}><b>Your browser</b><small>Shows the page. Holds a random ID and nothing else.</small></div>
          <div className={styles.slideNode}><div className={styles.chips} style={{ gap: 8 }}><img src={logo("nextjs")} alt="Next.js" /><img src={logo("vercel")} alt="Vercel" /></div><b>Cash Check</b><small>Next.js on Vercel. Handles sign-in and keeps the secrets.</small></div>
          <div className={styles.slideNode}><img src={logo("snaptrade")} alt="SnapTrade" /><b>SnapTrade</b><small>Does the brokerage login. Returns balances, holdings and activity.</small></div>
          <div className={styles.slideNode}><div className={styles.chips} style={{ gap: 8 }}><img src={logo("neon")} alt="Neon" /><img src={logo("postgresql")} alt="PostgreSQL" /></div><b>Neon</b><small>Saves only encrypted sign-in tokens. Nothing about your money.</small></div>
        </div>
        <p className={styles.big}>Browser to Cash Check to SnapTrade, with Neon beside Cash Check.</p>
      </>
    ),
  },
  {
    label: "Keeping it safe",
    body: (
      <>
        <p className={styles.eyebrow}>Keeping it safe</p>
        <h2>Small surface, careful edges.</h2>
        <ul className={styles.points}>
          <li><b>Read-only.</b> The trade permission is never requested.</li>
          <li><b>Proper sign-in.</b> OAuth with PKCE, a state value and a nonce on every attempt.</li>
          <li><b>Encrypted tokens.</b> AES-256-GCM before anything reaches the database.</li>
          <li><b>One refresh at a time.</b> A short lease stops two requests from locking you out.</li>
          <li><b>Nothing to leak.</b> Balances and holdings are never saved.</li>
        </ul>
      </>
    ),
  },
  {
    label: "Choices",
    body: (
      <>
        <p className={styles.eyebrow}>Choices</p>
        <h2>What we left out, on purpose.</h2>
        <ul className={styles.points}>
          <li><b>No trading.</b> It is a view, not a broker.</li>
          <li><b>No AI.</b> The numbers are plain sums, so they can be checked.</li>
          <li><b>No currency conversion.</b> A hidden exchange rate would be a hidden guess.</li>
          <li><b>Demo first.</b> Anyone can try it without connecting an account.</li>
        </ul>
        <p className={styles.big}>20 automatic tests cover the cash math, the encryption, the sign-in secret and the refresh timer.</p>
      </>
    ),
  },
  {
    label: "Next",
    body: (
      <>
        <p className={styles.eyebrow}>What is next</p>
        <h2>From a good demo to a real tool.</h2>
        <ul className={styles.points}>
          <li><b>Read every page of activity</b> for busy accounts.</li>
          <li><b>Use a real account</b> and record what SnapTrade actually returns.</li>
          <li><b>Ask users</b> whether the weekly check is useful, then decide what to build.</li>
        </ul>
        <div className={styles.links}>
          <Link href="/">Try the demo</Link>
          <Link href="/how-it-works">How it&apos;s built</Link>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={LINKS.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>
        </div>
      </>
    ),
  },
];

export default function Presentation() {
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;
  const go = useCallback((step: number) => setIndex((current) => Math.min(last, Math.max(0, current + step))), [last]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") { event.preventDefault(); go(1); }
      if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); go(-1); }
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(last);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, last]);

  function fullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }

  return (
    <div className={styles.deck}>
      <div className={styles.deckTop}>
        <Link href="/how-it-works">← How it&apos;s built</Link>
        <span>{slides[index].label}</span>
        <button type="button" onClick={fullscreen}>Full screen</button>
      </div>
      <div className={styles.progress} aria-hidden="true"><i style={{ width: `${((index + 1) / slides.length) * 100}%` }} /></div>
      <section className={styles.slide} aria-live="polite" aria-label={`Slide ${index + 1} of ${slides.length}: ${slides[index].label}`}>
        {slides[index].body}
      </section>
      <div className={styles.deckBottom}>
        <button type="button" onClick={() => go(-1)} disabled={index === 0}>Back</button>
        <span>{index + 1} / {slides.length} · arrow keys work too</span>
        <button type="button" onClick={() => go(1)} disabled={index === last}>Next</button>
      </div>
    </div>
  );
}
