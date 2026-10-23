export const LINKS = {
  portfolio: "https://theomthakur.github.io/portfolio",
  github: "https://github.com/theomthakur/cash-check",
  linkedin: "https://www.linkedin.com/in/theomthakur",
};

/** Why this app needs SnapTrade. Shared by the home page, the system design page and the slides. */
export const WHY_SNAPTRADE = [
  {
    title: "The problem",
    body: "People keep money at more than one brokerage. No single app shows all of the cash, so some of it can sit uninvested without anyone noticing.",
  },
  {
    title: "The hard part",
    body: "Every brokerage has its own login, its own rules and its own data format. Connecting to each one, and keeping up when they change, is a whole company's job.",
  },
  {
    title: "What SnapTrade does",
    body: "It is that company. One safe sign-in, one read-only connection, and balances, holdings and activity in the same shape from every brokerage it supports.",
  },
  {
    title: "Why it fits here",
    body: "Cash Check never sees a brokerage password and never saves your balances. Without SnapTrade it could only show one brokerage, or ask you to type your numbers in by hand.",
  },
];

export const TECH = [
  { key: "nextjs", name: "Next.js", file: "/logos/nextjs.svg", role: "The app and its server routes" },
  { key: "vercel", name: "Vercel", file: "/logos/vercel.svg", role: "Hosting" },
  { key: "snaptrade", name: "SnapTrade", file: "/logos/snaptrade-icon.svg", role: "Sign-in and brokerage data" },
  { key: "neon", name: "Neon", file: "/logos/neon.svg", role: "Serverless Postgres database" },
  { key: "postgresql", name: "PostgreSQL", file: "/logos/postgresql.svg", role: "The database engine" },
] as const;
