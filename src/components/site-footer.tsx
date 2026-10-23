import Link from "next/link";
import { LINKS } from "@/lib/site";
import styles from "./site.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <strong>Built by Om Thakur</strong>
          <p>An independent project made for SnapTrade&apos;s Product Engineer exercise. Not made or endorsed by SnapTrade. Demo data is made up.</p>
          <p className={styles.footerSmall}>Read-only. Not investment advice. Balances and holdings are read when you open the app and are not saved.</p>
        </div>
        <nav aria-label="Links">
          <Link href="/how-it-works">How it&apos;s built</Link>
          <Link href="/presentation">Presentation</Link>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href={LINKS.portfolio} target="_blank" rel="noopener noreferrer">Portfolio ↗</a>
        </nav>
      </div>
    </footer>
  );
}
