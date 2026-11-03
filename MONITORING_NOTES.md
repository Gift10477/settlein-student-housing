# Week 12 Monitoring Notes

## Predictions

1. Slowest endpoint:
   I predict GET /api/properties will be slowest because it reads property data from the database.

2. Endpoint with most errors:
   I predict GET /api/properties/:id will produce the most errors because invalid property IDs may return 404 responses.

## Results from captured traffic

The captured request log contained 107 requests:

- 20 responses with status 200
- 30 responses with status 401
- 31 responses with status 404
- 24 responses with status 502
- Average response time: 152.4 ms
- Slowest recorded response: 920.6 ms

The most frequent caller labels were `key-d3a9a0` with 75 requests and
`none` with 30 requests. The key itself was not written to the log.

The slowest route should be confirmed from the `/stats` response because
`/stats` groups parameterized routes by route pattern and reports `avgMs` and
`maxMs` for each route.

The verified `/stats` response reported 106 completed requests, 61 client
errors, 24 server errors, a 22.6% server-error rate, and a 151.6 ms overall
average. `GET /api/market-prices/` was the slowest route by average at
654.5 ms and had a 920.6 ms maximum. It also accounted for all 24 server
errors, so the partner-backed market-price request produced the most server
errors.

The captured log also showed 29 client-error responses for
`/api/properties`, 13 for `/999999`, and 18 for `/not-a-real-route`. The
partner-backed 502 responses indicate that the upstream service was
unavailable or returned an unexpected response during some requests.

## Traffic pattern and hypothesis

The log contains many rejected requests (`401`) and missing-resource or
unavailable-resource responses (`404` and `502`). This likely happened
because the traffic script intentionally included missing keys, an invalid
property ID, a non-existent route, and a partner-backed endpoint while its
dependency was unavailable.

I would next compare the `/stats` route breakdown with the corresponding
log lines, then check the partner integration logs for the 502 requests and
confirm whether the 404 responses came from the invalid property ID or the
non-existent route.

## Production alert

I would alert when `errorRatePercent` is above 5% for five consecutive
minutes. The service should continue returning safe JSON error responses and
the market-price feature should show its existing unavailable state while the
underlying problem is investigated.