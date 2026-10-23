# Cash Check

Cash Check is a read-only dashboard for finding uninvested cash across brokerage accounts. It shows current cash separately by currency, adds context from the last 30 days of dividends, interest, and contributions, and lets the user explore a buy-only allocation without placing a trade.

The first action is a fully functional demo. A real SnapTrade connection uses OAuth authorization code + PKCE and asks only for `openid read` access.

## Why this exists

Cash is easy to miss when it is spread across accounts. A single large number is not enough, though: recent inflows are not necessarily the same dollars that remain in cash, and USD and CAD should not be silently added together. The product therefore says exactly what it knows:

> You received $X in cash inflows over the last 30 days and currently hold $Y in cash.

It does not claim that a particular dividend or contribution is “still sitting,” convert currencies, recommend a security, or place an order.

## Product decisions

- **Demo first:** reviewers can understand the product without sharing financial data.
- **Read-only:** the app never requests the `trade` scope.
- **Cash by currency:** no hidden FX assumptions.
- **Buy-only simulation:** the calculation moves available cash toward underweight buckets while keeping the requested cash target. It never models a sale.
- **Editable classifications:** obvious holdings are prefilled as Stocks, Bonds, Cash, or Other; the user can correct them.
- **Visible assumptions:** the hypothetical annual rate is editable and labeled as an illustration.

## Security boundary

- OAuth uses a fresh state, nonce, and S256 PKCE challenge for every attempt.
- The code exchange, token refresh, and revocation happen only on the server.
- The ID token is verified against SnapTrade's issuer, audience, JWKS, expiry, and nonce.
- Access and refresh tokens are encrypted with AES-256-GCM before they reach Postgres.
- The browser receives a signed, httpOnly, same-site cookie containing only a random Cash Check user ID.
- Balances, positions, and activities are fetched on demand with `Cache-Control: private, no-store`; Cash Check does not persist them.
- Refresh tokens rotate. A 30-second database lease prevents two server requests from trying to use the same refresh token.
- “Disconnect Cash Check” revokes the app's refresh token and deletes its local token row. It does **not** remove brokerage connections from SnapTrade.

## Data flow

```text
Browser
  → SnapTrade authorization page (PKCE + state + nonce)
  → Cash Check callback (server-only code exchange)
  → encrypted tokens in Neon Postgres
  → read-scoped Bearer requests to SnapTrade
  → normalized, non-cached portfolio response
  → dashboard in the browser
```

## Run locally

Requirements: Node 22 and a Postgres database.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Generate the encryption key with `openssl rand -base64 32`. Generate each cookie secret independently with `openssl rand -base64 48`. Do not commit `.env.local`.

The callback URL for local development is `http://localhost:3000/api/auth/snaptrade/callback`. For a deployed app, set `APP_URL` to its HTTPS origin and register the matching callback URL in SnapTrade.

## Verification

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npm audit
```

The arithmetic tests cover cash totals, drift, buy-only allocation, and incomplete targets using hand-checked examples. They also confirm that different currencies remain separate.

## Known limits

- Real response shapes still need to be checked against one authorized test account; the normalizer is based on the current public API contract. See `docs/api-shapes.md`.
- If SnapTrade rejects a rotated refresh token with `invalid_grant`, Cash Check deletes the unusable token row and asks the user to reconnect. It cannot recover a refresh token lost between SnapTrade's response and the database update.
- Asset buckets are intentionally simple and do not look through funds into their underlying holdings.
- The first version retrieves the first activity response for the requested 30-day period. Pagination should be added for accounts with unusually high activity volume.
- Brokerage data freshness depends on the user's SnapTrade plan and institution.

## Deliberately cut from v1

Trading, LLM features, SEC filings, fund look-through, currency conversion, an analytics dashboard, and a public status page. They do not help answer the first product question: “How much cash do I hold right now, and what could a buy-only allocation look like?”

## Next

1. Connect one real account and record redacted response-shape notes.
2. Confirm the five-user OAuth test limit is sufficient for reviewers.
3. Add activity pagination and integration tests from sanitized fixtures.
4. Add a small usefulness feedback control only after the real-data path is verified.
