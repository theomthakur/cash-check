export const LINKS = {
  portfolio: "https://theomthakur.github.io/portfolio",
  github: "https://github.com/theomthakur/cash-check",
  linkedin: "https://www.linkedin.com/in/theomthakur",
};

/** Why this app needs SnapTrade. Shared by the home page, the system design page and the slides. */
export const WHY_SNAPTRADE = [
  {
    title: "The problem",
    body: "Your money can be spread across a few brokerages. Nobody shows you all the cash in one place, so some of it can sit there doing nothing.",
  },
  {
    title: "The hard part",
    body: "Every brokerage works differently: its own login, its own rules, its own format. Connecting to all of them ourselves would take a whole company.",
  },
  {
    title: "What SnapTrade does",
    body: "That is SnapTrade's job. You sign in once, and it hands us your balances in one tidy format, from every brokerage it supports.",
  },
  {
    title: "Why that matters here",
    body: "We never see your brokerage password, and we don't keep your numbers. Without SnapTrade, we could only show one brokerage, or you would have to type everything in.",
  },
];

export const TECH = [
  { key: "nextjs", name: "Next.js", file: "/logos/nextjs.svg", role: "The app and its server routes" },
  { key: "vercel", name: "Vercel", file: "/logos/vercel.svg", role: "Hosting" },
  { key: "snaptrade", name: "SnapTrade", file: "/logos/snaptrade-icon.svg", role: "Sign-in and brokerage data" },
  { key: "neon", name: "Neon", file: "/logos/neon.svg", role: "Serverless Postgres database" },
  { key: "postgresql", name: "PostgreSQL", file: "/logos/postgresql.svg", role: "The database engine" },
] as const;
