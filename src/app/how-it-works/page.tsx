import Link from "next/link";
import type { Metadata } from "next";
import FlowDiagram from "@/components/flow-diagram";
import SiteFooter from "@/components/site-footer";
import { SnapTradeWordmark } from "@/components/tech-logos";
import { LINKS, WHY_SNAPTRADE } from "@/lib/site";
import styles from "@/components/site.module.css";

export const metadata: Metadata = {
  title: "How Cash Check works",
  description: "See how Cash Check connects your brokerage accounts without seeing your password or saving your balances.",
};

const CHOICES = [
  ["Read, never trade.", "Cash Check can read your account data, but it cannot buy, sell, or move money."],
  ["Show the change, not a guess.", "We add up what came in and went out over 30 days. We do not pretend that a specific dividend is still in cash, because all cash in an account becomes one pool."],
  ["Keep currencies separate.", "US and Canadian dollars stay separate, so a hidden exchange-rate assumption never changes your total."],
  ["Let you correct the groups.", "We sort obvious holdings into stocks, bonds, cash, or other. You can fix anything that looks wrong, and we never guess what is inside a fund."],
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
        <h1>One view of your cash. Your brokerage passwords stay private.</h1>
        <p className={styles.lead}>Cash Check uses SnapTrade to read your brokerage data safely. Here is what happens after you click Connect, what the app saves, and what it deliberately leaves alone.</p>
      </header>

      <section className={styles.whyBand} aria-labelledby="why">
        <div className={styles.section}>
          <div className={styles.whyHead}>
            <div>
              <p className={styles.eyebrow}>Why SnapTrade</p>
              <h2 id="why">Why Cash Check uses SnapTrade</h2>
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
        <h2 id="trip">What happens after you click Connect</h2>
        <p className={styles.sectionLead}>Here is the full journey, from signing in to seeing your dashboard.</p>
        <FlowDiagram />
      </section>

      <section className={styles.section} aria-labelledby="keep">
        <p className={styles.eyebrow}>Your privacy</p>
        <h2 id="keep">What Cash Check saves—and what it never saves</h2>
        <div className={styles.saved}>
          <div className={styles.savedYes}>
            <h3>Cash Check saves</h3>
            <ul><li>An encrypted connection token, so you do not have to sign in every time</li><li>Your SnapTrade user ID</li><li>When the connection needs to be renewed</li>
              <li>Anonymous usage counts and any feedback you choose to send</li></ul>
          </div>
          <div className={styles.savedNo}>
            <h3>Cash Check never saves</h3>
            <ul><li>Your brokerage password. We never see it.</li><li>Your balances, holdings or activity</li><li>The targets and rates you type in, or your PDF summary. The PDF is made in your browser and never uploaded.</li></ul>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="choices">
        <div className={styles.twoCol}>
          <div>
            <p className={styles.eyebrow}>A few choices</p>
            <h2 id="choices">The choices behind the product</h2>
            <ul className={styles.choices}>
              {CHOICES.map(([title, body]) => <li key={title}><b>{title}</b> {body}</li>)}
            </ul>
          </div>
          <div>
            <p className={styles.eyebrow}>Honest status</p>
            <h2 id="checked">What has been tested—and what has not</h2>
            <div className={styles.statusCard}>
              <h3>Checked</h3>
              <ul>
                <li>40 automated tests covering the cash calculations, PDF summary, encryption, sign-in, and feedback</li>
                <li>The deployed app with SnapTrade&apos;s sandbox data on 23 Oct 2026</li>
              </ul>
              <h3>Not yet</h3>
              <ul>
                <li>A real brokerage account</li>
              </ul>
              <h3>Good to know</h3>
              <ul>
                <li>Cash 30 days ago is an estimate. Things SnapTrade does not list, like transfers or currency exchanges, are not counted.</li>
                <li>SnapTrade&apos;s test apps allow only 5 users, so most people will try the demo.</li>
                <li>If a token refresh is interrupted before it can be saved, you will need to connect again.</li>
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
