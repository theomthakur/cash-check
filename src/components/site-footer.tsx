import Link from "next/link";
import { LINKS } from "@/lib/site";
import styles from "./site.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <strong>Built by Om Thakur</strong>
          <p>I built Cash Check for SnapTrade&apos;s Product Engineer exercise. It is an independent project, not an official SnapTrade product. The demo uses sample data.</p>
          <p className={styles.footerSmall}>Cash Check is read-only and is not investment advice. It reads your balances and holdings when you open the app, then forgets them.</p>
        </div>
        <nav aria-label="Links">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/presentation">Presentation</Link>
          <Link href="/stats">Usage</Link>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href={LINKS.portfolio} target="_blank" rel="noopener noreferrer">Portfolio ↗</a>
        </nav>
      </div>
    </footer>
  );
}
