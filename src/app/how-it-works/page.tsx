import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "@/components/site-footer";
import { SnapTradeWordmark, TechLogo, TechStrip } from "@/components/tech-logos";
import { WHY_SNAPTRADE } from "@/lib/site";
import styles from "@/components/site.module.css";

export const metadata: Metadata = {
  title: "How Cash Check is built",
  description: "The parts of Cash Check, why it needs SnapTrade, what is saved, and the choices behind it.",
};

const STEPS = [
  ["You press Connect SnapTrade.", "The server makes a one-time secret (PKCE), a state value and a nonce, keeps them in a short-lived cookie, and sends you to SnapTrade."],
  ["You sign in at SnapTrade and approve read-only access.", "Cash Check never sees your brokerage password. We ask only for the openid and read permissions."],
  ["SnapTrade sends you back with a one-time code.", "The server checks the state value, trades the code for tokens, and checks the identity token."],
  ["The tokens are encrypted and saved in Neon.", "Your browser gets a signed cookie that holds only a random ID. It never holds a token."],
  ["When you open the dashboard, the server reads your data from SnapTrade.", "Balances, holdings and the last 30 days of activity are fetched on the spot and sent to you. They are not saved."],
  ["Disconnect cleans up.", "Access is revoked at SnapTrade and our saved row is deleted. Your brokerage connections stay in SnapTrade."],
];

const DECISIONS = [
  {
    title: "Read-only on purpose",
    body: "Cash Check asks for the read permission only. It cannot place a trade, even if there is a bug.",
    tradeoff: "No one-click investing. The what-if only shows numbers.",
    live: "Keep it read-only. Any trading would need its own review.",
  },
  {
    title: "Sign in with SnapTrade, not with passwords",
    body: "SnapTrade handles the brokerage login. We receive a token that can only read.",
    tradeoff: "We depend on SnapTrade being up, and a test app is limited to 5 users, so there is a demo.",
    live: "Register a production app and watch for sign-in errors.",
  },
  {
    title: "Save only the sign-in tokens, and encrypt them",
    body: "The database holds encrypted tokens and a refresh timer. Balances, holdings and activity are never saved.",
    tradeoff: "Every dashboard visit calls SnapTrade, so it is a little slower.",
    live: "Add a short private cache and a rate-limit guard.",
  },
  {
    title: "Only one refresh at a time",
    body: "SnapTrade replaces the refresh token each time it is used. If two requests refreshed together, one would lock you out. The first request takes a 30-second lease; the second waits for the result.",
    tradeoff: "If SnapTrade answers but the answer is lost before we save it, you have to reconnect.",
    live: "Add alerts for failed refreshes and a clearer reconnect flow.",
  },
  {
    title: "Two facts, not one claim",
    body: "We show current cash and recent inflows side by side. We cannot prove the money that came in is the money still sitting in cash, so we do not say that.",
    tradeoff: "Less punchy than a single big number.",
    live: "Keep the wording. Add per-account detail.",
  },
  {
    title: "Currencies stay separate",
    body: "US dollars and Canadian dollars are never added together. You pick a currency to look at.",
    tradeoff: "No single grand total.",
    live: "Offer a clearly labeled conversion that names its rate source.",
  },
  {
    title: "You choose each holding's group",
    body: "We guess only the obvious ones (stocks, bonds, cash, other) and you can change any of them. We do not look inside funds.",
    tradeoff: "A mixed fund counts as one group.",
    live: "Use a fund-holdings data source.",
  },
];

export default function HowItWorks() {
  return (
    <main>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}><span className={styles.brandMark} aria-hidden="true"><i /><i /><i /></span>Cash Check</Link>
        <div className={styles.navLinks}><Link href="/">Demo</Link><Link href="/presentation">Presentation</Link></div>
      </nav>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>How it&apos;s built</p>
        <h1>A small app with one job and a few careful choices.</h1>
        <p className={styles.lead}>Cash Check reads the cash in your brokerage accounts through SnapTrade and shows it in one place. This page explains what each part does, why SnapTrade is needed, and what is saved.</p>
      </header>

      <section className={styles.whyBand} aria-labelledby="why">
        <div className={styles.section}>
          <div className={styles.whyHead}>
            <div>
              <p className={styles.eyebrow}>Why SnapTrade</p>
              <h2 id="why">Why this app needs SnapTrade</h2>
            </div>
            <span className={styles.whyLogo}><SnapTradeWordmark /></span>
          </div>
          <p className={styles.sectionLead}>The idea behind Cash Check only works if one app can see every brokerage. SnapTrade is what makes that possible.</p>
          <div className={styles.whyGrid}>
            {WHY_SNAPTRADE.map((item, index) => (
              <article key={item.title}><b>0{index + 1}</b><h3>{item.title}</h3><p>{item.body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="parts">
        <p className={styles.eyebrow}>The parts</p>
        <h2 id="parts">Who does what</h2>
        <p className={styles.sectionLead}>Four places are involved. Your browser only ever talks to Cash Check. Cash Check talks to SnapTrade and to its own database.</p>
        <div className={styles.diagram}>
          <div className={styles.node}>
            <span className={styles.tag}>1 · You</span>
            <h3>Your browser</h3>
            <p>Shows the page. Holds a signed cookie with a random ID, and nothing else.</p>
          </div>
          <div className={styles.arrow}><span aria-hidden="true">⇄</span>pages and data</div>
          <div className={`${styles.node} ${styles.nodeAcid}`}>
            <span className={styles.tag}>2 · Cash Check</span>
            <h3>The app and its server</h3>
            <div className={styles.nodeLogos}><TechLogo name="nextjs" /><TechLogo name="vercel" /></div>
            <p>Built with Next.js and hosted on Vercel. Handles sign-in, keeps the secrets, and asks SnapTrade for your data.</p>
          </div>
          <div className={styles.arrow}><span aria-hidden="true">⇄</span>sign-in and read-only requests</div>
          <div className={`${styles.node} ${styles.nodeDark}`}>
            <span className={styles.tag}>3 · SnapTrade</span>
            <h3>Brokerage sign-in and data</h3>
            <div className={styles.nodeLogos}><span className={styles.whyLogo}><SnapTradeWordmark height={20} /></span></div>
            <p>Does the brokerage login and returns balances, holdings and activity in one format. Cash Check never talks to a brokerage directly.</p>
          </div>
        </div>
        <div className={styles.dbRow}>
          <div className={styles.dbArrow}><span aria-hidden="true">↕</span>encrypted tokens only</div>
          <div className={styles.node}>
            <span className={styles.tag}>4 · Storage</span>
            <h3>Neon database</h3>
            <div className={styles.nodeLogos}><TechLogo name="neon" /><TechLogo name="postgresql" /></div>
            <p>A serverless Postgres database from Neon. It holds the encrypted sign-in tokens and a short refresh timer, and nothing about your money.</p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="tech">
        <p className={styles.eyebrow}>Built with</p>
        <h2 id="tech">The tools</h2>
        <TechStrip />
      </section>

      <section className={styles.section} aria-labelledby="flow">
        <p className={styles.eyebrow}>Step by step</p>
        <h2 id="flow">What happens when you connect</h2>
        <ol className={styles.steps}>
          {STEPS.map(([title, body]) => <li key={title}><div><b>{title}</b><p>{body}</p></div></li>)}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="saved">
        <p className={styles.eyebrow}>Privacy</p>
        <h2 id="saved">What is saved, and what is not</h2>
        <div className={styles.saved}>
          <div className={styles.savedYes}>
            <h3>Saved in Neon</h3>
            <ul><li>Your sign-in tokens, encrypted with AES-256-GCM</li><li>Your SnapTrade user ID</li><li>When the token expires</li><li>A 30-second timer while a refresh is running</li></ul>
          </div>
          <div className={styles.savedNo}>
            <h3>Never saved</h3>
            <ul><li>Brokerage passwords (Cash Check never sees them)</li><li>Balances, holdings and activity</li><li>The targets and rates you type into the what-if</li></ul>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="decisions">
        <p className={styles.eyebrow}>Choices</p>
        <h2 id="decisions">What we chose, and what it costs</h2>
        <div className={styles.decisions}>
          {DECISIONS.map((item, index) => (
            <article className={styles.decision} key={item.title}>
              <b>0{index + 1}</b>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <dl><dt>The tradeoff</dt><dd>{item.tradeoff}</dd><dt>If it went live</dt><dd>{item.live}</dd></dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="checks">
        <p className={styles.eyebrow}>Checked</p>
        <h2 id="checks">How we know it works</h2>
        <div className={styles.checks}>
          <div><strong>20</strong><span>automatic tests: cash math, encryption, the sign-in secret, and the refresh timer</span></div>
          <div><strong>0</strong><span>known vulnerabilities in the packages (npm audit)</span></div>
          <div><strong>Live</strong><span>checked on the deployed app with SnapTrade&apos;s sandbox test accounts on 23 Oct 2026</span></div>
          <div><strong>Not yet</strong><span>a real brokerage account. The what-if is never meant to be advice.</span></div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="limits">
        <p className={styles.eyebrow}>Honest limits</p>
        <h2 id="limits">What it does not do yet</h2>
        <ul className={styles.limits}>
          <li>It reads only the first page of recent activity. Very busy accounts could be cut short.</li>
          <li>A test app on SnapTrade is limited to 5 users, so the demo is the main way to try it.</li>
          <li>It does not look inside funds, convert currencies, or place trades.</li>
          <li>If a refresh answer is lost, you have to connect again.</li>
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
