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
        <p className={styles.eyebrow}>A short story</p>
        <h1>Where is all your cash?</h1>
        <p className={styles.big}>Cash Check shows the cash you hold across all your brokerages, on one page. Made by Om Thakur for SnapTrade.</p>
      </>
    ),
  },
  {
    label: "The problem",
    body: (
      <>
        <p className={styles.eyebrow}>The problem</p>
        <h2>You open three apps and still don&apos;t know.</h2>
        <p className={styles.big}>An account here, another account there. A dividend lands in one, a deposit in the other. Nobody adds up the cash that is just sitting around, and some of it was meant to be invested.</p>
      </>
    ),
  },
  {
    label: "Why SnapTrade",
    body: (
      <>
        <p className={styles.eyebrow}>Why SnapTrade</p>
        <h2>Why not connect to the brokerages ourselves?</h2>
        <p className={styles.big}>Every brokerage has its own login, its own rules and its own format. That is a lot of work for each one, and it changes all the time. SnapTrade already did that work. We sign in once, and we get everything in the same shape.</p>
        <div className={styles.chips}><span className={styles.chip}><img src="/logos/snaptrade-wordmark.svg" alt="SnapTrade" height={20} style={{ height: 20, width: "auto" }} /></span></div>
      </>
    ),
  },
  {
    label: "The trip",
    body: (
      <>
        <p className={styles.eyebrow}>What happens when you connect</p>
        <h2>Four players, one short trip.</h2>
        <div className={styles.slideDiagram}>
          <div className={styles.slideNode}><b>You</b><small>Press Connect.</small></div>
          <div className={styles.slideNode}><div className={styles.chips} style={{ gap: 8 }}><img src={logo("nextjs")} alt="Next.js" /><img src={logo("vercel")} alt="Vercel" /></div><b>Cash Check</b><small>Sends you to sign in, then shows your cash.</small></div>
          <div className={styles.slideNode}><img src={logo("snaptrade")} alt="SnapTrade" /><b>SnapTrade</b><small>Logs you in to your brokerage and hands back a read-only pass.</small></div>
          <div className={styles.slideNode}><img src={logo("neon")} alt="Neon" /><b>Neon</b><small>Keeps the pass locked. Nothing else.</small></div>
        </div>
        <p className={styles.big}>Cash Check never sees your password, and it forgets your numbers as soon as you leave.</p>
      </>
    ),
  },
  {
    label: "What you see",
    body: (
      <>
        <p className={styles.eyebrow}>What you see</p>
        <h2>Your cash, what changed, and a what-if.</h2>
        <ul className={styles.points}>
          <li><b>What you hold today,</b> account by account. Each currency on its own.</li>
          <li><b>What came in and went out</b> over the last 30 days, and how much your cash changed.</li>
          <li><b>A what-if:</b> how your mix would change if you invested some of the cash. Nothing is bought or sold.</li>
          <li><b>A PDF to keep:</b> one button turns what you see into a summary you can download or share.</li>
        </ul>
        <p className={styles.big}>Cash is one pool, so we never say a particular dividend is still sitting there. We show the change instead.</p>
      </>
    ),
  },
  {
    label: "Left out, and next",
    body: (
      <>
        <p className={styles.eyebrow}>Left out, and what is next</p>
        <h2>It looks, it doesn&apos;t touch.</h2>
        <ul className={styles.points}>
          <li><b>Left out on purpose:</b> trading, AI guesses and currency conversion.</li>
          <li><b>Checked:</b> 33 automatic tests, and a run with SnapTrade&apos;s sandbox test data.</li>
          <li><b>Next:</b> try a real account, and ask people if a weekly check is useful.</li>
        </ul>
        <div className={styles.links}>
          <Link href="/">Try the demo</Link>
          <Link href="/how-it-works">How it works</Link>
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
        <Link href="/how-it-works">← How it works</Link>
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
