# API response and authorization audit — 27 October 2026

Scope: all handlers in `server/app.js`, `server/routes/user.js`,
`server/routes/properties.js`, and `server/routes/bookings.js`, including the
`/api` and `/api/v1` aliases, authentication, rate limits, database initialization,
and error logging. This is a source review plus isolated request tests, not a
penetration test of a deployed service.

## Part D checklist

- **Sensitive fields:** checked every successful response, including nested
  property data, for passwords, hashes, tokens, private emails, and internal
  flags. Login's intentionally issued token is the only authentication secret
  returned to its authenticated caller. Findings and fixes are recorded below.
- **Other people's data:** checked user ID paths, booking IDs in request bodies,
  lists, and write endpoints. Owner checks protect private records; listing
  writes and group inquiry submission still trust any valid consumer API key.
- **Error messages:** checked route errors, global/parser errors, authentication,
  throttling, and database logs for stack traces, paths, SQL, and table details.
- **Write endpoints:** checked supported field lists and SQL parameters; tested
  extra fields such as `id`, `isAdmin`, `password_hash`, and role escalation.
- **Keys in the wrong place:** checked current source/docs, environment ignore
  rules, local log files, and locally available Git history. Historical findings
  and the limits of this scan are recorded below; no real key is included here.

## Findings and fixes

| Check | What was examined | Finding and action |
| --- | --- | --- |
| Sensitive user fields | User list, user detail, login, residence, timeline, profile | Lists/details returned raw rows, including `password_hash`. Login removed only two known password fields and leaked future columns. Replaced these with an explicit user allowlist. Email/phone/residence are available only to the owner. Login intentionally issues a short-lived token to the authenticated caller. |
| Sensitive property fields | Property list/detail, study amenities, create response | `...p` exposed arbitrary columns and stored group inquiries with student identities/notes. Removed row spreading, inquiries, and unbounded nested reviews. Amenities and images expose only strings. Landlord name, phone, and WhatsApp are retained as advertised listing contact fields. Study amenities and create responses already used explicit fields: nothing wrong with their response projection. |
| Sensitive booking fields | All-bookings list, per-user list, booking creation | Lists returned raw rows. Added explicit projections; booking notes and student details are accessible only to the owner. Creation already built an explicit response: nothing wrong with that projection. |
| Other people's records | Every user ID path; booking user ID path and POST body; list exports; all write routes | API keys authenticated a consumer, not a student. Any key could enumerate users, residences, arrival schedules, and bookings, modify/delete another user, or create bookings for them. Added server-issued owner sessions and owner checks before queries. User and booking lists now require login and query only the owning user. At the user's request, property writes and group inquiry creation require only the existing consumer API key. There is no admin-key override; the public-profile route remains owner only. |
| Error disclosure | Every catch block, initialization logs, global error handler, JSON parser, missing routes, 401/403/404/405/409/422/429 responses | Booking/property create exposed `err.message`; the global handler exposed arbitrary error names/messages. Logs printed full database error objects, potentially including SQL, credentials, and submitted data. Removed error details, use fixed log events and generic errors, and return fixed JSON for unknown routes. Existing validation, auth, missing-record, duplicate-email, no-match, method, and rate-limit messages contain no stack, paths, queries, or credentials: nothing wrong with those messages. |
| Extra write fields | User create/update/login, property create/update, group inquiries, booking create | Most SQL writes already enumerated columns and used placeholders: nothing wrong with SQL parameterization or automatic persistence of arbitrary extra fields. User creation/update explicitly accepted an arbitrary `role`, allowing privilege escalation. Registration now creates students only; profile updates cannot change role. All JSON write routes reject unsupported fields such as `id`, `isAdmin`, and `password_hash`. Booking status and calculated lease dates remain server controlled. |
| Incorrect internal claims | Student profile response | Hardcoded verification and student number could falsely label a user as verified or return somebody else's sample identity. Now uses stored verification, year, and student ID, without a fabricated student number. |
| Caching | Responses containing private data and login tokens | Added `Cache-Control: no-store`. Disabled the Express identification header. |
| Keys in source, history, docs, logs | Environment ignore rules, tracked env paths, first-party history, README, example config, logging statements | Found four API keys in historical `server/.env` at commit `215eafa`. Added their SHA-256 fingerprints to a denylist checked by authentication, so they remain revoked even if configured again. The current local key does not match these old keys. Current `.env` is ignored and untracked. README contains no live key; corrected its obsolete environment variable names. No local application log files were found. Database error logging is now redacted. Historical or externally retained logs cannot be erased by changing logging statements. |

## How callers authenticate now

1. Configure real random consumer keys in the comma-separated `API_KEYS` setting
   in `server/.env`. Send `X-API-Key` on requests. Keep real keys out of frontend
   bundles, documentation, and Git.
2. Sign in with `POST /api/v1/users/login` using the API key and a JSON body with
   `email` and `password`. Successful responses include `access_token`,
   `token_type: "Bearer"`, `expires_in: 3600`, and an allowlisted `user`.
3. For private user/booking routes send **both** `X-API-Key` and
   `Authorization: Bearer <access_token>`. Only that user's ID is allowed.
   Tokens are bound to the consumer key used to log in. Missing/expired tokens
   return 401; another user's ID returns 403 before querying records.
4. No separate admin key is required. Property writes and group inquiries accept
   the existing consumer API key. User and booking lists require a login token
   and return only that user's records. No key bypasses ownership checks.
5. Public listing reads, health checks, and documentation still require a consumer
   API key but no user token. Registration returns only the new ID; sign in after
   registering to obtain a session.

This is an intentional change to the old API contract. Existing partner and
frontend callers must adopt the token flow; keys alone no longer grant access
to arbitrary students. Partner delegation, landlord ownership, and group consent
need explicit models before broader access can be enabled safely.

Sessions and rate limits are held in process memory. Sessions expire after one
hour, are revoked on account deletion, and are lost on restart. Multiple backend
instances require a shared session and rate-limit store. Use HTTPS outside local
development. The configured limiter remains 3 requests per key per 15 minutes.

## Rate limit and rationale

The threshold is **3 authenticated requests per API key in a 15-minute fixed
window**, shared across endpoints and both route aliases. The window starts
with that key's first authenticated request. The fourth request returns `429`
with `{"message":"Too many requests, please try again later."}` and a
`Retry-After` header containing the remaining seconds. Requests that pass API-key
authentication count even if a later route returns an error. Missing, invalid,
and revoked keys return `401` before the limiter and do not consume this quota.

The existing threshold was retained for this development/classroom exercise:
three successful calls followed by one blocked call make throttling easy to
demonstrate, and the 15-minute window makes repeated blocking visible. This is
not based on measured production traffic and is too restrictive for ordinary
application browsing. A production threshold should be chosen from expected
traffic and load tests. No threshold was changed during this documentation task.

The counter is per process and resets on restart. Multiple instances need a
shared counter store. Invalid-key attempts need a separate IP-based limit if
they are to be throttled; the current per-key limiter does not cover them.

## Verification results

The final scan covered 288 first-party historical file versions across locally
available refs and 70 current first-party files.
No matches for the current local secrets or additional provider/private-key
patterns were found. These pattern checks are not proof that no other secret
exists. Historical `.env` inspection separately found the four keys above.
Run `node server/audit-history.cjs` from the repository root to repeat this
read-only check; it prints fingerprints and file locations, never secret values.
Vendor files, remote-only refs, external logs, forks, and other services were not
audited. Historical `DB_PASSWORD` entries were empty or example-like values.

The old keys still exist in history. They are revoked in this API; rotate them
wherever else they were reused. No Git history was rewritten. The existing key
shown in the IDE/chat should also be replaced before production use.

Security regression tests are in `server/__tests__/security.test.js`. They mock
the database and exercise the real Express app, both aliases, cross-user access,
exports, writes, field injection, response projections, malformed JSON, error/log
redaction, and login/session behavior. Run from `server` with:

```powershell
node node_modules/jest/bin/jest.js __tests__/security.test.js --runInBand
```

Result after removing the admin-key requirement: **61 tests passed**. JavaScript syntax checks and `git diff --check`
also passed. These tests use a mocked database; no production records were read
or modified. A live MySQL/deployment test was not performed.

## Week 7 suite rerun

The first rerun of `users.test.js`, `properties.test.js`,
`partner_access.test.js`, and `auth.test.js` produced **13 failures and 3 passes**.
The old Week 7 tests assumed unauthenticated requests would reach the routes;
they now correctly encounter `401` first.

The tests now send test-only API keys and owner tokens where required. Each
test receives a fresh app so the strict rate limit cannot interfere with other
tests. Deterministic database fixtures preserve the original success-shape,
missing-record, and validation checks without modifying a real database.
A missing record is tested with an otherwise valid owner session; accessing
another user's ID is separately tested to return `403`.

Added tests confirm a documented property route returns `401` without a key
and `200` with a valid key. An additional test confirms the fourth request gets
`429`, checks `Retry-After: 900` at the window start, and advances the test clock
to verify that access resumes after 15 minutes. The updated Week 7/auth suite
passes **19 tests across four suites**.

Documentation regression tests also verify the API-key scheme, `401`/`429`
responses on every documented operation, and that `docs/index.html` embeds the
current OpenAPI contract. The rendered page can be rebuilt with
`npm run docs:build` from `server`.

Final combined local result: **83 tests passed across six suites** (Week 7,
API-key authentication/rate limiting, security regressions, and documentation).
Run from `server`:

```powershell
npm test -- users.test.js properties.test.js partner_access.test.js auth.test.js security.test.js documentation.test.js
```

These are database-mocked request tests, not live MySQL or public-tunnel tests.
The upstream Shamba Direct suite requires a separately configured partner URL
and is not part of the local Week 7 verification.
