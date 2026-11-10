# Deprecation notice: SettleIn property list v1

To: StudySync downstream team (named contact pending)
From: SettleIn team
Date: 9 November 2026, Africa/Nairobi
Status: Prepared locally; not sent; deployment pending.

## Summary and timeline
GET /api/v2/properties is implemented locally. GET /api/properties and
/api/v1/properties keep working. Proposed migration deadline: 13 November
2026 at 00:00 UTC (03:00 EAT), subject to partner agreement and Demo Day date.
Legacy routes remain available through Demo Day; there is no automatic removal.

## What changes and why
The list becomes { data, count } so future pagination metadata can be added
without another top-level shape change. Fields, IDs, filters, API key, quota,
detail responses and write operations retain their current behavior.
Count means rows returned; pagination is not implemented yet.

## Before and after
Abbreviated example, v1 GET /api/properties:
```json
[{ "id": "prop-002", "title": "Housing", "price": 12000 }]
```
v2 GET /api/v2/properties:
```json
{ "data": [{ "id": "prop-002", "title": "Housing", "price": 12000 }], "count": 1 }
```

## Migration
1. Change the list URL to /api/v2/properties; retain X-API-Key and query filters.
2. Iterate over body.data instead of body; verify empty lists and errors.
3. Reply to acknowledge receipt, then confirm a successful v2 request so we can
   check /stats and caller logs. Do not share keys in evidence.
4. Roll back to the old URL if needed during the migration period.

## Questions and delivery
Named contact and response-time commitment await team agreement. Send the full
notice and committed repository link through the agreed channel. Delivery,
acknowledgement, actual deployment and deadline agreement remain pending.
