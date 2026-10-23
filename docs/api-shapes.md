# SnapTrade API shapes used by Cash Check

This document records the public contracts used by the app. It intentionally contains no credentials, account identifiers, or portfolio values.

## Accounts

`GET /accounts`

Cash Check uses the account ID, display name, institution/connection name, and available sync metadata. OAuth requests use only `Authorization: Bearer …` and do not send commercial signature fields.

## Balances

`GET /accounts/{accountId}/balances`

```json
[{ "currency": { "code": "USD" }, "cash": 300.71, "buying_power": 410.71 }]
```

Cash Check uses `cash`, never substitutes margin buying power, and renders each currency independently.

## Positions

`GET /accounts/{accountId}/positions/all`

```json
{
  "results": [{
    "instrument": { "kind": "stock", "symbol": "AAPL", "description": "Apple Inc.", "currency": "USD" },
    "units": "10.5",
    "price": "123.45",
    "currency": "USD",
    "cash_equivalent": false
  }],
  "data_freshness": { "as_of": "2026-06-02T14:30:00.000Z" }
}
```

Cash-equivalent positions are excluded because SnapTrade documents that they may also be included in the cash balance.

## Activities

`GET /accounts/{accountId}/activities?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

Cash Check includes positive `DIVIDEND`, `SUBSTITUTE_DIVIDEND`, `INTEREST`, and `CONTRIBUTION` activity only. It does not infer that the same money remains in cash.

## Observed test-account differences

Verified on October 23, 2026 with SnapTrade's `Self-directed` Sandbox scenario through the deployed OAuth flow. The app received and normalized:

- two account records with display names, institution labels, and sync timestamps;
- cash balances associated with a currency;
- stock, fund, ETF, and cryptocurrency positions with nested instrument metadata; and
- dividend, interest, and contribution activities within the requested date window.

The normalizer accepts either a direct array or an object containing `results`/`data`, which covers the public contracts used by these endpoints. Cash-equivalent positions remain excluded to prevent double counting. No raw API body, account identifier, token, or portfolio value was retained for this note.
