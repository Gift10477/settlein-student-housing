# Week 10 - connecting SettleIn to Shamba Direct

The food and living cost widget is implemented. The live partner URL, currency
confirmation, cross-team coordination and final demonstration remain pending.
Demo servers, preflight scripts and extra request logging have been removed.
Use the existing tests and ordinary terminal requests below.

## 1. Get the partner information

Ask Team 14 for their reachable base URL, latest README/contract, whether they
require a key, its exact header/scheme, their rate limit and confirmation that
prices are KES. Agree on contact people and book your TA check-in.

Their localhost means their own computer. Do not point Shamba's URL at your
SettleIn backend or Vite server. The latest saved contract permits public reads;
leave the partner key empty unless they confirm authentication is required.

## 2. Configure server/.env

Preserve the database settings and accepted SettleIn keys. Add/update:

```env
SHAMBA_API_URL=https://<partner-host>/api
SHAMBA_API_KEY=
SHAMBA_API_KEY_HEADER=X-API-Key
SHAMBA_API_KEY_PREFIX=
SETTLEIN_WEB_API_KEY=<your-api-key>
```

- `SETTLEIN_WEB_API_KEY` must be one of your existing `API_KEYS`. Vite injects
  it on the server; it is not Shamba's key.
- `SHAMBA_API_URL` may include or omit the final `/api`. Do not include the
  full `/market-prices` path, credentials, query or fragment.
- If Shamba requires a plain key, put their issued key in `SHAMBA_API_KEY` and
  set their confirmed header name. Do not send a SettleIn key to Shamba.
- For a confirmed Bearer scheme, set the header to `Authorization`, prefix to
  `Bearer`, and key to the raw token without adding `Bearer` again.
- These header arrangements need no request-code changes. Other protocols
  require a reviewed adapter. Never commit keys or expose them through `VITE_*`.

## 3. Make the first terminal call before using the app

For their currently documented public read:

```powershell
curl.exe -i "https://<partner-host>/api/market-prices"
```

If they confirm X-API-Key authentication:

```powershell
curl.exe -i -H "X-API-Key: <partner-issued-key>" "https://<partner-host>/api/market-prices"
```

Replace placeholders locally. Do not share history/screenshots containing a real
key. Use their exact README header if different. Expect an array with
`crop_name`, numeric nonnegative `price_per_kg` and optional/null `county`.
Confirm KES separately. Record the actual status, shape, time and any mismatch
in `INTEGRATION_LOG.md`. Fix a failing terminal call before moving into the app.
Inspect real response data locally once; remove temporary raw-body debugging
before committing. Do not put personal data or credentials in the log.

## 4. Run SettleIn

Stop any old backend with Ctrl+C in its terminal before starting another.

```powershell
# Terminal 1, from the repository root
cd server
npm.cmd run dev
```

```powershell
# Terminal 2, from the repository root
cd app
npm.cmd run dev
```

Open the URL Vite prints, not backend port 5000. Nodemon reloads backend code;
restart both servers after changing environment settings. Use a fresh terminal
or clear old SHAMBA_* process overrides, which take precedence over `.env`.

Open an accommodation detail page. Choose monthly kilograms and verify food
cost = price per kg times quantity. Total = rent + selected food + entered other
costs. Deposits, booking fees, delivery and expenses not entered are excluded.
No default diet or market proximity is inferred. Missing configuration, empty
data and failures show messages rather than invented prices.

## 5. Test failure and recovery

1. Confirm the widget displays real partner data and the retrieval time.
2. Ask Team 14 to stop their server. Leave and reopen the property detail view.
3. Check the friendly unavailable message and that accommodation details remain.
4. Confirm SettleIn's other routes still work. Inspect its safe provider error
   diagnostic: HTTP status, ECONNREFUSED, ENOTFOUND or REQUEST_FAILED.
5. Ask Team 14 to restart. Click Try again: prices should return without a code
   change. Record actual results and redacted evidence in the integration log.

Do not add timeouts or automatic retries for this week's lab.

## 6. Support StudySync and finish the log

Keep SettleIn reachable. Share its current contract, reachable URL, their key
privately, owner-token requirements and the 100 requests/key/15-minute limit.
Never share Shamba's key. Private student endpoints are owner-only; discuss
peer/group delegation rather than disabling ownership checks for a demo.

For every bug/surprise record the request, expected contract behavior, actual
status and redacted response, time, root cause, whose code, fix and retest. Log
both teams' real issues. Do not invent bugs or copy examples as your results.

| Failure | Check |
| --- | --- |
| 401 | Correct provider's key/header/prefix; private SettleIn routes also need an owner token |
| 429 | Retry-After and shared request quota; wait before retrying |
| Widget 503 | Partner base URL not configured |
| Widget 502 | Provider unavailable, HTTP error, bad response shape or invalid configuration |
| 200 but blanks | Exact field names, number types, nesting and optional county |
| CORS | Partner calls should come from the backend; CORS precedes key checks |

## 7. Existing tests and submission

```powershell
# From server: local tests, without the live Shamba suite
npm.cmd run docs:build
npm.cmd test -- --testPathIgnorePatterns=shamba_direct.test.js
```

```powershell
# From app
npm.cmd test
npm.cmd run build
```

Existing tests simulate partner/database responses. They do not prove a live
Shamba connection. Once Team 14 is reachable, run its existing live suite
separately using whatever authentication its current API actually requires.

Rehearse live data -> partner down/fallback -> partner back/recovered. Complete
the pending contact, check-in, live evidence and downstream support entries in
`INTEGRATION_LOG.md`. Review `git status`, `git check-ignore server/.env`, and
the exact staged diff. Stage only intended files, never credentials. Then commit
with `Week 10: live integration with upstream partner` and push your branch.
Live calls, human coordination, final demo and commit/push remain pending.
