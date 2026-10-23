# Cash Check

Cash Check shows the cash you hold across your brokerage accounts, in one place. It is read-only: it never buys, sells or moves anything.

- Live app: https://cash-check-nine.vercel.app
- How it's built (system design): `/how-it-works`
- Short presentation: `/presentation`
- Built by Om Thakur: [Portfolio](https://theomthakur.github.io/portfolio), [LinkedIn](https://www.linkedin.com/in/theomthakur), [GitHub](https://github.com/theomthakur)

This is an independent project made for SnapTrade's Product Engineer exercise. It is not made or endorsed by SnapTrade. The demo uses made-up data.

## Why SnapTrade is needed

1. **The problem.** People keep money at more than one brokerage. No single app shows all of the cash, so some of it can sit uninvested without anyone noticing.
2. **The hard part.** Every brokerage has its own login, its own rules and its own data format. Connecting to each one, and keeping up when they change, is a whole company's job.
3. **What SnapTrade does.** It is that company. One safe sign-in, one read-only connection, and balances, holdings and activity in the same shape from every brokerage it supports.
4. **Why it fits here.** Cash Check never sees a brokerage password and never saves your balances. Without SnapTrade it could only show one brokerage, or ask you to type your numbers in by hand.

## What it shows

- **Cash today**, by account and by currency. US and Canadian dollars are never added together.
- **What came in** over the last 30 days: dividends, interest and deposits. These are shown next to the cash, as two separate facts. We cannot tell whether the money that came in is the money still in cash, so we do not say that.
- **A simple example:** "If this cash earned 4% a year, that's about $X." The rate is yours to change. It is not a prediction.
- **A what-if:** how your mix of stocks, bonds, cash and other would change if you invested some of the cash. Nothing is sold and no order is placed.

## The parts

| Part | What it does |
|---|---|
| Your browser | Shows the page. Holds a signed cookie with a random ID, and nothing else. |
| Cash Check (Next.js on Vercel) | Handles sign-in, keeps the secrets, and asks SnapTrade for your data. |
| SnapTrade | Does the brokerage sign-in and returns balances, holdings and activity in one format. |
| Neon (Postgres) | Saves the encrypted sign-in tokens and a short refresh timer. Nothing about your money. |

```text
Browser  <->  Cash Check (Next.js, Vercel)  <->  SnapTrade  <->  your brokerages
                          |
                          v
                   Neon Postgres
              (encrypted tokens only)
```

## What is saved and what is not

- **Saved:** your sign-in tokens (encrypted with AES-256-GCM), your SnapTrade user ID, when the token expires, and a 30-second timer while a refresh runs.
- **Never saved:** brokerage passwords, balances, holdings, activity, or what you type into the what-if.

## How sign-in stays safe

- Read-only: the app asks for the `openid read` permissions and never asks to trade.
- Every sign-in uses a fresh one-time secret (PKCE, S256), a state value and a nonce. The identity token is checked against SnapTrade's published keys.
- Tokens are exchanged, refreshed and revoked on the server only.
- SnapTrade replaces the refresh token each time it is used. A 30-second lease in the database means two requests cannot refresh at once.
- "Disconnect" revokes access at SnapTrade and deletes our saved row. It does not remove your brokerage connections from SnapTrade.

## Run it yourself

You need Node 22 and a Postgres database (Neon works well; a local one works too).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Make the encryption key with `openssl rand -base64 32` and each cookie secret with `openssl rand -base64 48`. Never commit `.env.local`. For local sign-in, register `http://localhost:3000/api/auth/snaptrade/callback` as the callback in SnapTrade. For a deployed app, set `APP_URL` to its HTTPS address and register the matching callback.

## Checks

```bash
npm test          # 20 automatic tests
npm run lint
npx tsc --noEmit
npm run build
npm audit
```

The tests cover the cash math (totals, separate currencies, the buy-only what-if), encryption (round trip and tampering), the sign-in secret, and the refresh lease (waiting, rotating, expired access, other errors).

## Honest limits

- Checked on the deployed app with SnapTrade's sandbox test data on 23 Oct 2026. See `docs/api-shapes.md`. Not yet checked with a real brokerage account.
- Only the first page of the last 30 days of activity is read. Very busy accounts could be cut short.
- A SnapTrade test app is limited to 5 users, so the demo is the main way to try it.
- If SnapTrade answers a refresh but the answer is lost before we save it, you have to connect again.
- Groups (stocks, bonds, cash, other) are simple. Funds are not looked into.
- Cash Check is not investment advice.

## Left out on purpose

Trading, AI features, SEC filings, looking inside funds, currency conversion, a usage dashboard and a public status page. None of them help answer the first question: how much cash do I hold right now, and what could investing some of it look like?
