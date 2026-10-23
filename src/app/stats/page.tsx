import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import SiteFooter from "@/components/site-footer";
import { getStats } from "@/server/db";
import styles from "@/components/site.module.css";

export const metadata: Metadata = { title: "How people use Cash Check", description: "Anonymous counts: demo opens, PDF downloads and feedback." };

async function load() {
  try {
    return await getStats();
  } catch {
    return null;
  }
}

async function Counts() {
  await connection(); // always read fresh counts, never a saved copy
  const stats = await load();
  const votes = stats ? stats.useful + stats.notUseful : 0;
  if (!stats) return <p className={styles.sectionLead}>The counts are not available right now.</p>;
  return (
    <div className={styles.checks}>
      <div><strong>{stats.events.demo_opened ?? 0}</strong><span>times the demo was opened</span></div>
      <div><strong>{stats.events.live_loaded ?? 0}</strong><span>times a connected account was loaded</span></div>
      <div><strong>{stats.events.pdf_downloaded ?? 0}</strong><span>PDF summaries downloaded</span></div>
      <div><strong>{votes ? `${stats.useful} of ${votes}` : "None yet"}</strong><span>{votes ? "people said it was useful" : "answers to \"Was this useful?\""}</span></div>
    </div>
  );
}

export default function Stats() {
  return (
    <main>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}><span className={styles.brandMark} aria-hidden="true"><i /><i /><i /></span>Cash Check</Link>
        <div className={styles.navLinks}><Link href="/">Demo</Link><Link href="/how-it-works">How it works</Link></div>
      </nav>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Usage</p>
        <h1>How people use it.</h1>
        <p className={styles.lead}>Plain counts, so decisions come from what people actually do. No names, no accounts and no money amounts are counted.</p>
      </header>
      <section className={styles.section}>
        <Suspense fallback={<p className={styles.sectionLead}>Counting…</p>}><Counts /></Suspense>
      </section>
      <SiteFooter />
    </main>
  );
}
