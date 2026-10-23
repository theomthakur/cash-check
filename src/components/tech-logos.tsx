import { TECH } from "@/lib/site";
import styles from "./site.module.css";

/* eslint-disable @next/next/no-img-element */
export function TechLogo({ name }: { name: (typeof TECH)[number]["key"] }) {
  const tech = TECH.find((item) => item.key === name)!;
  return <img className={styles.techLogo} src={tech.file} alt={`${tech.name} logo`} width={28} height={28} />;
}

export function SnapTradeWordmark({ height = 26 }: { height?: number }) {
  return <img src="/logos/snaptrade-wordmark.svg" alt="SnapTrade" height={height} style={{ height, width: "auto" }} />;
}

export function TechStrip() {
  return (
    <ul className={styles.techStrip} aria-label="Technology used">
      {TECH.filter((item) => item.key !== "postgresql").map((item) => (
        <li key={item.key}>
          <TechLogo name={item.key} />
          <span><b>{item.name}</b>{item.role}</span>
        </li>
      ))}
    </ul>
  );
}
