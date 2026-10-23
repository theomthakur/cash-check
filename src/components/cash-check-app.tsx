"use client";

import { useEffect, useMemo, useState } from "react";
import { demoPortfolio } from "@/lib/demo-data";
import { bucketValues, cashByCurrency, hypotheticalAnnualEarnings, simulateBuyOnly } from "@/lib/portfolio";
import type { Bucket, PortfolioSnapshot } from "@/lib/types";
import styles from "./cash-check-app.module.css";

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
      if (params.get("auth") === "connected") void loadLivePortfolio();
      if (params.get("demo") === "1") { setPortfolio(demoPortfolio); setCurrency("USD"); setMode("dashboard"); }
      if (params.get("auth") === "error") {
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
          <p className={styles.eyebrow}>THE QUIET PART OF YOUR PORTFOLIO</p>
          <h1>See the cash that isn&apos;t invested yet.</h1>
          <p className={styles.heroLead}>One read-only view across your brokerage accounts. Understand what arrived, what is currently cash, and what a buy-only rebalance could look like.</p>
          <div className={styles.actions}>
            <button className={styles.primaryButton} onClick={openDemo}>Explore the demo <span aria-hidden="true">↗</span></button>
            <a className={styles.secondaryButton} href="/api/auth/snaptrade/start">Connect SnapTrade</a>
          </div>
          <p className={styles.microcopy}>No trading permissions. No holdings stored. Disconnect anytime.</p>
        </div>
        <div className={styles.heroVisual} aria-label="Example cash overview">
          <div className={styles.ticketTop}><span>CASH CHECK / SAMPLE</span><span>23 OCT 2026</span></div>
          <div className={styles.heroNumber}><span>$</span>15,745<sup>.80</sup></div>
          <p>cash across two USD accounts</p><div className={styles.heroRule} />
          <div className={styles.heroMetrics}><div><span>30D INFLOWS</span><strong>$1,460.60</strong></div><div><span>AT 4% / YEAR</span><strong>≈ $629.83</strong></div></div>
          <div className={styles.barcode} aria-hidden="true" />
        </div>
      </section>
      <section className={styles.howItWorks}>
        <p className={styles.eyebrow}>WHAT IT DOES — AND DOESN&apos;T</p>
        <div className={styles.steps}>
          <article><b>01</b><h2>Find the cash</h2><p>View current cash by account and currency, without pretending currencies are interchangeable.</p></article>
          <article><b>02</b><h2>Add context</h2><p>See dividends, interest, and contributions received over the last 30 days.</p></article>
          <article><b>03</b><h2>Explore, don&apos;t trade</h2><p>Test a buy-only allocation. Cash Check never places an order.</p></article>
        </div>
      </section>
    </main>
  );

  if (mode === "loading") return <main className={styles.statePage}><Logo /><div className={styles.loader} aria-label="Loading portfolio"><i /><i /><i /></div><h1>Checking your cash…</h1><p>Reading balances, positions, and recent account activity.</p></main>;

  if (mode === "error" || mode === "empty") return (
    <main className={styles.statePage}><Logo /><div className={styles.stateIcon}>{mode === "empty" ? "○" : "!"}</div><h1>{mode === "empty" ? "No accounts yet" : errorTitle}</h1><p>{notice || "Connect a brokerage account in SnapTrade, then come back here."}</p><div className={styles.actions}><a className={styles.primaryButton} href="/api/auth/snaptrade/start">Connect SnapTrade</a><button className={styles.secondaryButton} onClick={openDemo}>Use demo data</button></div></main>
  );

  if (!portfolio || !activeCash) return null;

  return (
    <main className={styles.appShell}>
      <header className={styles.appHeader}><Logo /><div className={styles.headerActions}><span className={styles.sourceBadge}>{portfolio.source === "demo" ? "DEMO DATA" : "LIVE · SNAPTRADE"}</span><button className={styles.textButton} onClick={disconnect}>{portfolio.source === "demo" ? "Exit demo" : "Disconnect"}</button></div></header>
      <section className={styles.dashboardIntro}><div><p className={styles.eyebrow}>PORTFOLIO CASH</p><h1>Here&apos;s what is liquid right now.</h1></div><div className={styles.currencySwitch} aria-label="Select currency">{cashRows.map((row) => <button key={row.currency} className={currency === row.currency ? styles.activeCurrency : ""} onClick={() => setCurrency(row.currency)}>{row.currency}</button>)}</div></section>
      {portfolio.accounts.some((account) => account.syncing) && <div className={styles.syncBanner}>One brokerage is still syncing. Figures may change when it finishes.</div>}
      {notice && <div className={styles.syncBanner}>{notice}</div>}
      <section className={styles.cashGrid}>
        <article className={styles.cashCard}><p>CURRENT CASH · {currency}</p><strong>{money(activeCash.currentCash, currency)}</strong><span>Across {portfolio.accounts.filter((account) => account.cash.some((cash) => cash.currency === currency)).length} account(s)</span></article>
        <article className={styles.inflowCard}><p>LAST 30 DAYS · AS OF {new Date(portfolio.asOf).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}</p><h2>You received <b>{money(activeCash.inflows30d, currency)}</b> in cash inflows over the last 30 days and currently hold <b>{money(activeCash.currentCash, currency)}</b> in cash.</h2><div className={styles.inflowBreakdown}><span>Dividends <b>{money(activeCash.dividends, currency)}</b></span><span>Interest <b>{money(activeCash.interest, currency)}</b></span><span>Contributions <b>{money(activeCash.contributions, currency)}</b></span></div></article>
      </section>
      <section className={styles.costLine}><span aria-hidden="true">↗</span><p>If this cash earned <label><span className="sr-only">Annual hypothetical rate</span><input type="number" min="0" max="30" step="0.25" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>% a year, that&apos;s about <b>{money(hypotheticalAnnualEarnings(activeCash.currentCash, rate), currency)}</b>.</p><small>Illustration only — not a forecast or recommendation.</small></section>
      <section className={styles.allocationSection}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>BUY-ONLY SIMULATION</p><h2>What if you invested the cash?</h2></div><p>We allocate only enough cash to move underweight buckets toward your target. No selling, no orders.</p></div>
        <div className={styles.allocationCard}>
          <div className={styles.legendHeader}><span>Bucket</span><span>Current</span><span>Target</span><span>After simulation</span></div>
          {simulation.map((row) => <div className={styles.allocationRow} key={row.bucket}><div className={styles.bucketName}><i style={{ background: colors[row.bucket] }} />{labels[row.bucket]}{row.buyAmount > 0 && <small>+{money(row.buyAmount, currency)}</small>}</div><div><b>{row.currentPercent.toFixed(1)}%</b><div className={styles.track}><i style={{ width: `${Math.min(row.currentPercent, 100)}%`, background: colors[row.bucket] }} /></div></div><label className={styles.targetInput}><span className="sr-only">{labels[row.bucket]} target percentage</span><input type="number" min="0" max="100" value={targets[row.bucket]} onChange={(event) => setTargets((current) => ({ ...current, [row.bucket]: Number(event.target.value) }))} /><span>%</span></label><div><b>{row.simulatedPercent.toFixed(1)}%</b><div className={styles.track}><i style={{ width: `${Math.min(row.simulatedPercent, 100)}%`, background: colors[row.bucket] }} /></div></div></div>)}
          <div className={`${styles.targetTotal} ${targetTotal !== 100 ? styles.targetWarning : ""}`}>Target total: {targetTotal}% {targetTotal !== 100 && "· Must equal 100%"}</div>
        </div>
        <div className={styles.holdingsEditor}>
          <div><h3>Check the buckets</h3><p>We prefill only obvious classifications. Change any holding before using the simulation.</p></div>
          <div>{portfolio.holdings.filter((holding) => holding.currency === currency).map((holding) => <label key={holding.id}><span><b>{holding.symbol}</b>{holding.name}</span><select value={holding.bucket} onChange={(event) => changeHoldingBucket(holding.id, event.target.value as Bucket)}><option value="stocks">Stocks</option><option value="bonds">Bonds</option><option value="cash">Cash</option><option value="other">Other</option></select></label>)}</div>
        </div>
      </section>
      <section className={styles.accountsSection}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ACCOUNT DETAIL</p><h2>Where the cash is</h2></div><p>Balances are grouped by currency. Cash Check never performs currency conversion.</p></div><div className={styles.accountList}>{portfolio.accounts.filter((account) => account.cash.some((cash) => cash.currency === currency)).map((account) => { const cash = account.cash.find((item) => item.currency === currency); return <article key={account.id} className={styles.accountRow}><div><h3>{account.name}</h3><p>{account.institution}</p></div><div><strong>{money(cash?.amount || 0, currency)}</strong><span>{account.syncing ? "Still syncing" : `Synced ${time(account.lastSyncedAt)}`}</span></div></article>; })}</div></section>
      <footer className={styles.footer}><Logo /><p>Read-only portfolio context. Not investment advice.</p><p>Balances and holdings are fetched when you open the app and are not stored by Cash Check.</p></footer>
    </main>
  );
}
