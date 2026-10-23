export const LINKS = {
  portfolio: "https://theomthakur.github.io/portfolio",
  github: "https://github.com/theomthakur/cash-check",
  linkedin: "https://www.linkedin.com/in/theomthakur",
};

/** Why this app needs SnapTrade. Shared by the home page, the system design page and the slides. */
export const WHY_SNAPTRADE = [
  {
    title: "Your cash is scattered",
    body: "When you use more than one brokerage, it is easy to lose track of how much cash is sitting in each account.",
  },
  {
    title: "Every brokerage is different",
    body: "Each one has its own login and its own way of returning data. Building and maintaining those connections ourselves would be a product on its own.",
  },
  {
    title: "SnapTrade handles the connections",
    body: "You connect through SnapTrade, and it gives Cash Check read-only data in one consistent format across the brokerages it supports.",
  },
  {
    title: "Your login stays private",
    body: "Cash Check never sees your brokerage password and never saves your balances. You get one useful view without typing everything in by hand.",
  },
];

export const TECH = [
  { key: "nextjs", name: "Next.js", file: "/logos/nextjs.svg", role: "The app and its server routes" },
  { key: "vercel", name: "Vercel", file: "/logos/vercel.svg", role: "Hosting" },
  { key: "snaptrade", name: "SnapTrade", file: "/logos/snaptrade-icon.svg", role: "Sign-in and brokerage data" },
  { key: "neon", name: "Neon", file: "/logos/neon.svg", role: "Serverless Postgres database" },
  { key: "postgresql", name: "PostgreSQL", file: "/logos/postgresql.svg", role: "The database engine" },
] as const;
