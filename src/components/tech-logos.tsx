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
