import Link from "next/link";
import type { Metadata } from "next";
import FlowDiagram from "@/components/flow-diagram";
import SiteFooter from "@/components/site-footer";
import { SnapTradeWordmark } from "@/components/tech-logos";
import { LINKS, WHY_SNAPTRADE } from "@/lib/site";
import styles from "@/components/site.module.css";

export const metadata: Metadata = {
  title: "How Cash Check works",
  description: "Why Cash Check uses SnapTrade, and the whole trip from clicking Connect to seeing your cash.",
};

const CHOICES = [
  ["Look, don't touch.", "Cash Check can only read. It cannot buy, sell or move money, even if something goes wrong."],
  ["Money in, money out, what changed.", "We add up what came in and what went out over 30 days, and show how your cash changed. We never claim one particular dividend is still sitting there, because cash is one pool."],
  ["Currencies stay apart.", "US and Canadian dollars are never added together. A hidden exchange rate would be a hidden guess."],
  ["You pick each holding's group.", "We guess the obvious ones (stocks, bonds, cash, other) and you fix the rest. We don't look inside funds."],
];

export default function HowItWorks() {
  return (
    <main>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}><span className={styles.brandMark} aria-hidden="true"><i /><i /><i /></span>Cash Check</Link>
        <div className={styles.navLinks}><Link href="/">Demo</Link><Link href="/presentation">Presentation</Link></div>
      </nav>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>How it works</p>
        <h1>Your cash, in one place, without handing over your passwords.</h1>
        <p className={styles.lead}>Cash Check reads the cash in your brokerage accounts through SnapTrade and shows it on one page. Here is why it needs SnapTrade, and the whole trip from clicking Connect to seeing your cash.</p>
      </header>

      <section className={styles.whyBand} aria-labelledby="why">
        <div className={styles.section}>
          <div className={styles.whyHead}>
            <div>
              <p className={styles.eyebrow}>Why SnapTrade</p>
              <h2 id="why">Why it uses SnapTrade</h2>
            </div>
            <span className={styles.whyLogo}><SnapTradeWordmark /></span>
          </div>
          <div className={styles.whyGrid}>
            {WHY_SNAPTRADE.map((item, index) => (
              <article key={item.title}><b>0{index + 1}</b><h3>{item.title}</h3><p>{item.body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="trip">
        <p className={styles.eyebrow}>The whole trip</p>
        <h2 id="trip">From clicking Connect to seeing your cash</h2>
        <p className={styles.sectionLead}>Follow the numbers. Everything that happens, and who does it.</p>
        <FlowDiagram />
      </section>

      <section className={styles.section} aria-labelledby="keep">
        <p className={styles.eyebrow}>Your privacy</p>
        <h2 id="keep">What we keep, and what we don&apos;t</h2>
        <div className={styles.saved}>
          <div className={styles.savedYes}>
            <h3>We keep</h3>
            <ul><li>Your locked sign-in pass (encrypted)</li><li>Your SnapTrade user ID</li><li>When the pass runs out</li></ul>
          </div>
          <div className={styles.savedNo}>
            <h3>We never keep</h3>
            <ul><li>Your brokerage password. We never see it.</li><li>Your balances, holdings or activity</li><li>The targets and rates you type in, or your PDF summary. The PDF is made in your browser and never uploaded.</li></ul>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="choices">
        <div className={styles.twoCol}>
          <div>
            <p className={styles.eyebrow}>A few choices</p>
            <h2 id="choices">What we decided, and why</h2>
            <ul className={styles.choices}>
              {CHOICES.map(([title, body]) => <li key={title}><b>{title}</b> {body}</li>)}
            </ul>
          </div>
          <div>
            <p className={styles.eyebrow}>Honest status</p>
            <h2 id="checked">What is checked, and what isn&apos;t</h2>
            <div className={styles.statusCard}>
              <h3>Checked</h3>
              <ul>
                <li>30 automatic tests on the cash maths, the PDF summary, the locking and the sign-in</li>
                <li>A run on the live app with SnapTrade&apos;s sandbox test data, on 23 Oct 2026</li>
              </ul>
              <h3>Not yet</h3>
              <ul>
                <li>A real brokerage account</li>
              </ul>
              <h3>Good to know</h3>
              <ul>
                <li>Cash 30 days ago is an estimate. Things SnapTrade does not list, like transfers or currency exchanges, are not counted.</li>
                <li>SnapTrade&apos;s test apps allow only 5 users, so most people will try the demo.</li>
                <li>If SnapTrade&apos;s reply gets lost partway, you have to connect again.</li>
              </ul>
              <p>The engineering details (how sign-in is secured and how tokens are locked) are in the <a href={LINKS.github} target="_blank" rel="noopener noreferrer">README on GitHub</a>.</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
