"use client";

import { useEffect, useMemo, useState } from "react";
import { demoPortfolio } from "@/lib/demo-data";
import { bucketValues, cashByCurrency, hypotheticalAnnualEarnings, simulateBuyOnly } from "@/lib/portfolio";
import type { Bucket, PortfolioSnapshot } from "@/lib/types";
import Link from "next/link";
import SiteFooter from "./site-footer";
import { SnapTradeWordmark } from "./tech-logos";
import { WHY_SNAPTRADE } from "@/lib/site";
import styles from "./cash-check-app.module.css";
import site from "./site.module.css";

type AppMode = "landing" | "loading" | "dashboard" | "error" | "empty";
const defaultTargets: Record<Bucket, number> = { stocks: 65, bonds: 20, cash: 10, other: 5 };
const labels: Record<Bucket, string> = { stocks: "Stocks", bonds: "Bonds", cash: "Cash", other: "Other" };
const colors: Record<Bucket, string> = { stocks: "var(--acid-strong)", bonds: "var(--blue)", cash: "var(--gold)", other: "var(--coral)" };

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

function time(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function Logo() {
  return <span className={styles.logo} aria-label="Cash Check"><span className={styles.logoMark} aria-hidden="true"><i /><i /><i /></span>Cash Check</span>;
}

export default function CashCheckApp() {
  const [mode, setMode] = useState<AppMode>("landing");
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [rate, setRate] = useState(4);
  const [currency, setCurrency] = useState("USD");
  const [targets, setTargets] = useState(defaultTargets);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState("We lost the connection");

  async function loadLivePortfolio() {
    setMode("loading");
    setNotice(null);
    try {
      const response = await fetch("/api/portfolio", { cache: "no-store" });
      const body = (await response.json()) as PortfolioSnapshot & { error?: string };
      if (response.status === 401) {
        setMode("error");
        setErrorTitle("Please reconnect");
        setNotice("Please reconnect your SnapTrade account.");
        return;
      }
      if (!response.ok) { setErrorTitle("SnapTrade returned an error"); throw new Error(body.error || "Portfolio data is unavailable."); }
      setPortfolio(body);
      setMode(body.accounts.length ? "dashboard" : "empty");
    } catch (error) {
      setMode("error");
      if (error instanceof TypeError) setErrorTitle("Could not reach Cash Check");
      setNotice(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const authResult = params.get("auth");
      if (authResult) {
        params.delete("auth");
        params.delete("message");
        const query = params.toString();
        window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      }
      if (authResult === "connected") void loadLivePortfolio();
      if (params.get("demo") === "1") { setPortfolio(demoPortfolio); setCurrency("USD"); setMode("dashboard"); }
      if (authResult === "error") {
        setMode("error");
        setErrorTitle("Connection not completed");
        setNotice(params.get("message") || "SnapTrade could not be connected.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function openDemo() {
    setMode("loading");
    window.setTimeout(() => { setPortfolio(demoPortfolio); setCurrency("USD"); setMode("dashboard"); }, 450);
  }

  async function disconnect() {
    if (portfolio?.source === "demo") { setPortfolio(null); setMode("landing"); return; }
    setNotice("Disconnecting…");
    const response = await fetch("/api/auth/disconnect", { method: "POST" });
    if (response.ok) { setPortfolio(null); setMode("landing"); setNotice(null); }
    else setNotice("Could not disconnect. Please try again.");
  }

  const cashRows = useMemo(() => portfolio ? cashByCurrency(portfolio) : [], [portfolio]);
  const activeCash = cashRows.find((row) => row.currency === currency);
  const activeAccountCount = portfolio?.accounts.filter((account) => account.cash.some((cash) => cash.currency === currency)).length ?? 0;
  const values = useMemo(() => portfolio ? bucketValues(portfolio, currency) : { stocks: 0, bonds: 0, cash: 0, other: 0 }, [portfolio, currency]);
  const simulation = useMemo(() => simulateBuyOnly(values, targets), [values, targets]);
  const targetTotal = Object.values(targets).reduce((sum, value) => sum + value, 0);

  function changeHoldingBucket(holdingId: string, bucket: Bucket) {
    setPortfolio((current) => current ? { ...current, holdings: current.holdings.map((holding) => holding.id === holdingId ? { ...holding, bucket } : holding) } : current);
  }

  if (mode === "landing") return (
    <main>
      <nav className={styles.nav}><Logo /><span className={styles.readOnly}>READ-ONLY BY DESIGN</span></nav>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>CASH ACROSS ALL YOUR BROKERAGES</p>
          <h1>See the cash that isn&apos;t invested yet.</h1>
          <p className={styles.heroLead}>One read-only view of your brokerage accounts. See how much cash you hold, what came in recently, and what it could look like if you invested some of it.</p>
          <div className={styles.actions}>
            <button className={styles.primaryButton} onClick={openDemo}>Explore the demo <span aria-hidden="true">↗</span></button>
            <a className={styles.secondaryButton} href="/api/auth/snaptrade/start">Connect SnapTrade</a>
          </div>
          <p className={styles.microcopy}>Read-only. Nothing is bought or sold. Your balances are not saved. Disconnect any time.</p>
        </div>
        <div className={styles.heroVisual} aria-label="Example cash overview">
          <div className={styles.ticketTop}><span>CASH CHECK / SAMPLE</span><span>23 OCT 2026</span></div>
          <div className={styles.heroNumber}><span>$</span>15,745<sup>.80</sup></div>
          <p>cash across two USD accounts</p><div className={styles.heroRule} />
          <div className={styles.heroMetrics}><div><span>CAME IN, LAST 30 DAYS</span><strong>$1,460.60</strong></div><div><span>IF IT EARNED 4% A YEAR</span><strong>≈ $629.83</strong></div></div>
          <div className={styles.barcode} aria-hidden="true" />
        </div>
      </section>
      <section className={styles.howItWorks}>
        <p className={styles.eyebrow}>WHAT IT DOES AND DOESN&apos;T DO</p>
        <div className={styles.steps}>
          <article><b>01</b><h2>See your cash</h2><p>Cash by account and by currency. Dollars and Canadian dollars are never added together.</p></article>
          <article><b>02</b><h2>See what came in</h2><p>Dividends, interest and deposits from the last 30 days.</p></article>
          <article><b>03</b><h2>Try a what-if, not a trade</h2><p>See how investing some of the cash would change your mix. Cash Check never places an order.</p></article>
        </div>
      </section>
      <section className={site.whyLight} aria-labelledby="why-snaptrade">
        <p className={styles.eyebrow}>WHY SNAPTRADE</p>
        <div className={site.whyHead} style={{ marginBottom: 20 }}>
          <h2 id="why-snaptrade" style={{ margin: 0, fontSize: "clamp(28px, 3.6vw, 46px)", letterSpacing: "-.045em", lineHeight: 1.02, maxWidth: 720 }}>Why this needs SnapTrade</h2>
          <SnapTradeWordmark height={26} />
        </div>
        <div className={site.whyGrid}>
          {WHY_SNAPTRADE.map((item, index) => <article key={item.title}><b>0{index + 1}</b><h3>{item.title}</h3><p>{item.body}</p></article>)}
        </div>
        <Link className={site.more} href="/how-it-works">See how it&apos;s built, with a diagram ↗</Link>
      </section>
      <SiteFooter />
    </main>
  );

  if (mode === "loading") return <main className={styles.statePage}><Logo /><div className={styles.loader} aria-label="Loading portfolio"><i /><i /><i /></div><h1>Checking your cash…</h1><p>Reading balances, holdings and recent activity.</p></main>;

  if (mode === "error" || mode === "empty") return (
    <main className={styles.statePage}><Logo /><div className={styles.stateIcon}>{mode === "empty" ? "○" : "!"}</div><h1>{mode === "empty" ? "No accounts yet" : errorTitle}</h1><p>{notice || "Connect a brokerage account in SnapTrade, then come back here."}</p><div className={styles.actions}><a className={styles.primaryButton} href="/api/auth/snaptrade/start">Connect SnapTrade</a><button className={styles.secondaryButton} onClick={openDemo}>Use demo data</button></div></main>
  );

  if (!portfolio || !activeCash) return null;

  return (
    <main className={styles.appShell}>
      <header className={styles.appHeader}><Logo /><div className={styles.headerActions}><span className={styles.sourceBadge}>{portfolio.source === "demo" ? "DEMO DATA" : "LIVE · SNAPTRADE"}</span><button className={styles.textButton} onClick={disconnect}>{portfolio.source === "demo" ? "Exit demo" : "Disconnect"}</button></div></header>
      <section className={styles.dashboardIntro}><div><p className={styles.eyebrow}>YOUR CASH</p><h1>Here is the cash you hold today.</h1></div><div className={styles.currencySwitch} aria-label="Select currency">{cashRows.map((row) => <button key={row.currency} className={currency === row.currency ? styles.activeCurrency : ""} onClick={() => setCurrency(row.currency)}>{row.currency}</button>)}</div></section>
      {portfolio.accounts.some((account) => account.syncing) && <div className={styles.syncBanner}>One brokerage is still syncing. The numbers may change when it finishes.</div>}
      {notice && <div className={styles.syncBanner}>{notice}</div>}
      <section className={styles.cashGrid}>
        <article className={styles.cashCard}><p>CURRENT CASH · {currency}</p><strong>{money(activeCash.currentCash, currency)}</strong><span>Across {activeAccountCount} {activeAccountCount === 1 ? "account" : "accounts"}</span></article>
        <article className={styles.inflowCard}><p>LAST 30 DAYS · AS OF {new Date(portfolio.asOf).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}</p><h2>You received <b>{money(activeCash.inflows30d, currency)}</b>{" "}in dividends, interest and deposits over the last 30 days. You hold <b>{money(activeCash.currentCash, currency)}</b>{" "}in cash today.</h2><p className={styles.inflowNote}>These are two separate facts. We can&apos;t tell whether the money that came in is the same money still in cash.</p><div className={styles.inflowBreakdown}><span>Dividends <b>{money(activeCash.dividends, currency)}</b></span><span>Interest <b>{money(activeCash.interest, currency)}</b></span><span>Deposits <b>{money(activeCash.contributions, currency)}</b></span></div></article>
      </section>
      <section className={styles.costLine}><span aria-hidden="true">↗</span><p>If this cash earned <label><span className="sr-only">Annual hypothetical rate</span><input type="number" min="0" max="30" step="0.25" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>% a year, that&apos;s about <b>{money(hypotheticalAnnualEarnings(activeCash.currentCash, rate), currency)}</b>.</p><small>Just an example. Not a prediction or advice.</small></section>
      <section className={styles.allocationSection}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>A WHAT-IF</p><h2>What if you invested some of the cash?</h2></div><p>We use only as much cash as it takes to bring your smallest groups closer to your targets. Nothing is sold and no orders are placed.</p></div>
        <div className={styles.allocationCard}>
          <div className={styles.legendHeader}><span>Group</span><span>Now</span><span>Your target</span><span>After investing</span></div>
          {simulation.map((row) => <div className={styles.allocationRow} key={row.bucket}><div className={styles.bucketName}><i style={{ background: colors[row.bucket] }} />{labels[row.bucket]}{row.buyAmount > 0 && <small>+{money(row.buyAmount, currency)}</small>}</div><div><b>{row.currentPercent.toFixed(1)}%</b><div className={styles.track}><i style={{ width: `${Math.min(row.currentPercent, 100)}%`, background: colors[row.bucket] }} /></div></div><label className={styles.targetInput}><span className="sr-only">{labels[row.bucket]} target percentage</span><input type="number" min="0" max="100" value={targets[row.bucket]} onChange={(event) => setTargets((current) => ({ ...current, [row.bucket]: Number(event.target.value) }))} /><span>%</span></label><div><b>{row.simulatedPercent.toFixed(1)}%</b><div className={styles.track}><i style={{ width: `${Math.min(row.simulatedPercent, 100)}%`, background: colors[row.bucket] }} /></div></div></div>)}
          <div className={`${styles.targetTotal} ${targetTotal !== 100 ? styles.targetWarning : ""}`}>Your targets add up to {targetTotal}%{targetTotal !== 100 && ". They need to add up to 100%."}</div>
        </div>
        <div className={styles.holdingsEditor}>
          <div><h3>Check each holding&apos;s group</h3><p>We only guess the obvious ones. Change any holding that looks wrong before you trust the what-if.</p></div>
          <div>{portfolio.holdings.filter((holding) => holding.currency === currency).map((holding) => <label key={holding.id}><span><b>{holding.symbol}</b>{holding.name}</span><select value={holding.bucket} onChange={(event) => changeHoldingBucket(holding.id, event.target.value as Bucket)}><option value="stocks">Stocks</option><option value="bonds">Bonds</option><option value="cash">Cash</option><option value="other">Other</option></select></label>)}</div>
        </div>
      </section>
      <section className={styles.accountsSection}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ACCOUNTS</p><h2>Where the cash is</h2></div><p>Each currency is shown on its own. Cash Check never converts currencies.</p></div><div className={styles.accountList}>{portfolio.accounts.filter((account) => account.cash.some((cash) => cash.currency === currency)).map((account) => { const cash = account.cash.find((item) => item.currency === currency); return <article key={account.id} className={styles.accountRow}><div><h3>{account.name}</h3><p>{account.institution}</p></div><div><strong>{money(cash?.amount || 0, currency)}</strong><span>{account.syncing ? "Still syncing" : `Synced ${time(account.lastSyncedAt)}`}</span></div></article>; })}</div></section>
      <SiteFooter />
    </main>
  );
}
