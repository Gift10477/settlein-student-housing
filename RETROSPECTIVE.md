# Individual Retrospective Report — SettleIn API (Team 1)

**Author:** Yahya Ahmed Abdi (220982)  
**Role:** Backend Developer (Endpoints & Database Logic)  
**Project:** SettleIn Student Housing Marketplace  

---

## 1. The Hardest Part of the Lifecycle

For me and our team, the hardest stage of the lifecycle was **Integration (Weeks 10–11)** because connecting SettleIn with external services meant our backend suddenly depended on another team's authentication rules, payload schemas, and server uptime.

During earlier phases, building and verifying our local Express routes and MySQL tables (`users`, `properties`, `group_inquiries`, and `bookings`) felt predictable because we controlled the database state and test environment. However, passing isolated Jest unit tests did not guarantee that the live ring connection would work. Coordinating live testing windows with our upstream partner (**Team 14, Shamba Direct**) proved difficult when their server went down or returned unexpected status codes during active test runs. At the same time, we had to verify how our downstream partner (**Team 2, StudySync**) actually consumed our property and study-amenity endpoints (`GET /api/properties` and `GET /api/properties/{id}/study-amenities`) so our OpenAPI contract and documentation matched their real frontend workflow rather than our assumptions.

---

## 2. One Real Cross-Team Issue

A concrete cross-team issue occurred on **10 November 2026** during our live integration with **Team 14 (Shamba Direct)** around the `GET /api/market-prices` endpoint that powers SettleIn’s student monthly food basket calculator.

When Shamba Direct updated their contract, they began requiring an `X-API-Key` header on requests, whereas our live integration test suite (`server/__tests__/shamba_direct.test.js`) was still sending unauthenticated calls based on an earlier draft of their spec. In addition, our test assertions assumed that listing ID `1` always existed in their database and rejected price records where certain fields arrived as `null`, even though their updated schema allowed nullable fields.

We discovered the failures immediately when our integration suite ran against their live server and failed authentication and schema assertions. To fix the issue on our side, I updated our adapter (`server/integrations/shambaRequest.js`) to support configurable `X-API-Key` headers and clean base URL normalization, and I updated our tests and mapper (`server/routes/marketPrices.js`) to dynamically discover existing record IDs and accept `null` field values without throwing errors. After those changes, **13 of 16 live tests passed**. The remaining 3 tests failed because Shamba Direct returned `403 Forbidden` instead of the documented `400 Bad Request` for invalid IDs, and their server later went down with `5xx` server errors—meaning the live integration could not be 100% resolved before their server became unavailable, though our fallback cache kept our UI functional.

---

## 3. What I Would Design Differently

If I were starting SettleIn over from Week 1, I would make two specific architectural improvements:

1. **Enforce Live Contract Drift & Error-Code Checks Earlier:**  
   We assumed early on that if an upstream contract documented a `400 Bad Request` or optional auth, the live server would match it. When Shamba Direct changed their auth requirements on 10 November 2026 and returned `403` for invalid IDs, we lost valuable debugging time separating our adapter bugs from their server behavior. Next time, I would write strict response-shape and status-code contract tests against a live staging URL in Week 7 rather than relying mostly on local mock responses until Week 10.
2. **Persist Fallback Caches and Rate-Limit State Outside Process Memory:**  
   We stored our `lastGood` market-price fallback cache, rate-limit counters (`server/middleware/rateLimit.js`), and `/stats` metrics in Node process memory. Every time we restarted the server during debugging, cached partner data and request history wiped completely. Using a lightweight Redis or SQLite store from Week 6 would have preserved fallback resilience across restarts.

What I would definitely **keep** is our centralized `allowFields` validation middleware (`server/middleware/fields.js`) and our `resilientFetch.js` wrapper (`1500 ms` timeout, max `2` retries with `200 ms`/`400 ms` exponential backoff), which prevented Shamba Direct's late-stage server errors from crashing SettleIn.

---

## 4. My Contribution

I rate my overall contribution to Team 1 as **8.5 out of 10**. As Backend Developer, I took primary ownership of our MySQL schema implementation, core CRUD and nested REST endpoints (`server/routes/properties.js`, `bookings.js`, `user.js`, and `marketPrices.js`), centralized input validation (`allowFields`), and the resilience and partner adapter layer (`resilientFetch.js` and `shambaRequest.js`). During the 10 November 2026 integration debugging, I updated our partner request headers, nullable field handling, and dynamic record lookup logic so that 13 of 16 live tests passed immediately.

Where I carried the team was in backend fault tolerance, database query shaping, and keeping our Express middleware order (`monitor` $\rightarrow$ `auth` $\rightarrow$ `rateLimit`) stable under load. Conversely, my teammates carried me in other essential areas: our API Lead maintained the OpenAPI 3.0 specification and versioning routes (`v1`/`v2`), our Docs/DevOps Lead built the Redoc documentation and `README.md` Quickstart, and our Integration/QA Lead coordinated partner handoffs and end-to-end test runs. Looking back, I spent too much time polishing local database queries mid-semester instead of pushing earlier for live cross-team integration testing.