/* eslint-disable @next/next/no-img-element */
import { TECH } from "@/lib/site";
import styles from "./site.module.css";

const logo = (key: (typeof TECH)[number]["key"]) => TECH.find((item) => item.key === key)!.file;

type ActorKey = "you" | "app" | "db" | "snaptrade" | "brokerage";

const ACTORS: { key: ActorKey; x: number; name: string; sub: string; logos: (typeof TECH)[number]["key"][] }[] = [
  { key: "you", x: 90, name: "You", sub: "in your browser", logos: [] },
  { key: "app", x: 290, name: "Cash Check", sub: "this app", logos: ["nextjs", "vercel"] },
  { key: "db", x: 500, name: "Neon", sub: "the database", logos: ["neon"] },
  { key: "snaptrade", x: 705, name: "SnapTrade", sub: "connects your accounts", logos: ["snaptrade"] },
  { key: "brokerage", x: 910, name: "Your brokerage", sub: "where your money is", logos: [] },
];

const X = Object.fromEntries(ACTORS.map((actor) => [actor.key, actor.x])) as Record<ActorKey, number>;

const STEPS: { from: ActorKey; to: ActorKey; short: string; long: string }[] = [
  { from: "you", to: "app", short: "Connect my accounts", long: "You ask Cash Check to connect your brokerage accounts." },
  { from: "app", to: "snaptrade", short: "Start a read-only connection", long: "Cash Check sends you to SnapTrade and asks only for permission to read your account data." },
  { from: "snaptrade", to: "brokerage", short: "You log in there", long: "At SnapTrade you log in to your brokerage. Cash Check never sees your password." },
  { from: "snaptrade", to: "app", short: "Return read-only access", long: "SnapTrade gives Cash Check a read-only connection token." },
  { from: "app", to: "db", short: "Save the token securely", long: "Cash Check encrypts that token and stores it in Neon. It does not store your balances or holdings." },
  { from: "app", to: "snaptrade", short: "Get the latest account data", long: "When you open the dashboard, Cash Check uses the token to ask SnapTrade for your latest data." },
  { from: "snaptrade", to: "app", short: "Balances, holdings, activity", long: "SnapTrade sends back your balances, holdings and recent activity." },
  { from: "app", to: "you", short: "Show it, then forget it", long: "Cash Check shows the data in your dashboard without saving it." },
];

const TOP = 20;
const BOX_H = 104;
const FIRST = 190;
const GAP = 58;
const HEIGHT = FIRST + GAP * (STEPS.length - 1) + 50;

function Glyph({ kind, cx, y }: { kind: ActorKey; cx: number; y: number }) {
  if (kind === "you") return <g stroke="#132b27" strokeWidth="2" fill="none"><circle cx={cx} cy={y + 8} r="7" /><path d={`M${cx - 13} ${y + 30} q13 -20 26 0`} /></g>;
  return <g stroke="#132b27" strokeWidth="2" fill="none"><path d={`M${cx - 14} ${y + 12} L${cx} ${y} L${cx + 14} ${y + 12} Z`} /><path d={`M${cx - 11} ${y + 14} V${y + 28} M${cx} ${y + 14} V${y + 28} M${cx + 11} ${y + 14} V${y + 28} M${cx - 15} ${y + 30} H${cx + 15}`} /></g>;
}

function Chip({ who }: { who: ActorKey }) {
  const actor = ACTORS.find((item) => item.key === who)!;
  return (
    <span className={styles.flowChip}>
      {actor.logos.map((key) => <img key={key} src={logo(key)} alt="" width={18} height={18} />)}
      {actor.name}
    </span>
  );
}

export default function FlowDiagram() {
  return (
    <>
      <div className={styles.flowDesktop}>
        <svg viewBox={`0 0 1000 ${HEIGHT}`} role="img" aria-label="End-to-end flow between you, Cash Check, the Neon database, SnapTrade and your brokerage. The steps are listed below the picture on small screens.">
          <defs>
            <marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#132b27" /></marker>
          </defs>
          {ACTORS.map((actor) => (
            <g key={actor.key}>
              <line x1={actor.x} x2={actor.x} y1={TOP + BOX_H} y2={HEIGHT - 10} stroke="#c9cbbd" strokeDasharray="4 6" />
              <rect x={actor.x - 82} y={TOP} width={164} height={BOX_H} fill={actor.key === "app" ? "#d9ff70" : actor.key === "snaptrade" ? "#fffdf7" : "#fffdf7"} stroke="#132b27" />
              {actor.logos.length === 0 && <Glyph kind={actor.key} cx={actor.x} y={TOP + 14} />}
              {actor.logos.map((key, index) => <image key={key} href={logo(key)} x={actor.x - (actor.logos.length * 32) / 2 + index * 32 + 2} y={TOP + 12} width="28" height="28" />)}
              <text x={actor.x} y={TOP + 66} textAnchor="middle" fontSize="16" fontWeight="800" fill="#132b27">{actor.name}</text>
              <text x={actor.x} y={TOP + 86} textAnchor="middle" fontSize="12" fill="#68746f">{actor.sub}</text>
            </g>
          ))}
          {STEPS.map((step, index) => {
            const y = FIRST + index * GAP;
            const x1 = X[step.from];
            const x2 = X[step.to];
            const dir = x2 > x1 ? 1 : -1;
            return (
              <g key={index}>
                <line x1={x1} y1={y} x2={x2 - dir * 4} y2={y} stroke="#132b27" strokeWidth="2" markerEnd="url(#head)" />
                <circle cx={x1 + dir * 16} cy={y} r="11" fill="#132b27" />
                <text x={x1 + dir * 16} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#d9ff70">{index + 1}</text>
                <text x={(x1 + dir * 30 + x2) / 2} y={y - 10} textAnchor="middle" fontSize="14" fill="#132b27" stroke="#f4f1e8" strokeWidth="6" paintOrder="stroke">{step.short}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <ol className={styles.flowMobile}>
        {STEPS.map((step, index) => (
          <li key={index}>
            <div className={styles.flowWho}><Chip who={step.from} /><span aria-hidden="true">→</span><Chip who={step.to} /></div>
            <p>{step.long}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
