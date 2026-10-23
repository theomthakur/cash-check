# SnapTrade API shapes used by Cash Check

This document records the public contracts used by the app. It intentionally contains no credentials, account identifiers, or real portfolio values. A redacted “observed” example should be added after the first authorized test connection.

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

Pending the first authorized connection. Before submission, record only structural differences here; never commit raw financial responses.
