# Week 4: Partner Contract Review & Ambiguity Analysis

**Evaluating Team:** SettleIn (Team 1) — Student Housing & Accommodation Marketplace  
**Authors:** Gift Githaka (193923), Ian Kungu (220259), Yahya Abdi (220982), Tiffany Olale (221126)  
**Upstream Producer Partner Reviewed:** Team 14 — Agricultural & Farmer Produce Marketplace  
**Target Specification:** Team 14 `openapi.yaml` (Produce Pricing, Farmer Ratings & Depot Inventory Endpoints)

---

## Overview

In accordance with Week 4 API Design II requirements, our engineering team conducted an in-depth contract review of our upstream partner's OpenAPI specification (**Team 14**). As future consumers of their API endpoints, we analyzed schema precision, parameter validation, missing edge cases, naming conventions, and alignment with our agreed Week 2/3 data exchange protocols.

Below are **three critical, specific questions and ambiguities** identified in Team 14's contract that require resolution prior to build execution.

---

### Question 1: Ambiguity in Commodity Price Currency, Unit of Measurement, and Decimal Precision
* **Endpoint Affected:** `GET /api/v1/produce/market-prices`
* **Specific Field(s):** `price`, `minimum_order_quantity`, `commodity_code`
* **Identified Ambiguity:**
  In the response schema for `GET /api/v1/produce/market-prices`, the `price` attribute is typed merely as `type: number` without specifying:
  1. The target currency (e.g., ISO 4217 code `KES` vs `USD`).
  2. The unit of measure to which the price applies (e.g., per 50kg bag, per kilogram, or per crate).
  3. The rounding or decimal constraint (whether float, double, or fixed 2-decimal financial string).
  
  Furthermore, `commodity_code` does not provide an `enum` or reference standardized agricultural taxonomy (such as standard EAC commodity codes), leaving consumers unable to programmatically map items like *dry maize*, *onions*, or *sukuma wiki*.
* **Actionable Clarification Requested for Team 14:**
  > *"Could Team 14 update the `price` schema to explicitly specify the currency (e.g., `currency: { type: string, example: 'KES' }`), provide a unit field (`unit_of_measure: { type: string, enum: ['kg', '50kg_bag', 'crate', 'tonne'], example: 'kg' }`), and document whether prices are VAT-inclusive? Providing an enum or regex pattern for `commodity_code` will prevent catalog sync errors on our client service."*

---

### Question 2: Missing HTTP Error Schemas, Rate-Limiting Headers, and Stale Cache Invalidation (`fetched_at`)
* **Endpoint Affected:** `GET /api/v1/depots/{id}/inventory` and all query endpoints
* **Specific Field(s):** `responses: '400'`, `responses: '404'`, `responses: '429'`, and `fetched_at`
* **Identified Ambiguity:**
  The contract currently only documents the happy-path `200 OK` response with no defined schema for client or server errors (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `429 Too Many Requests`). If a consumer requests an invalid depot ID (e.g., non-existent ID or alphanumeric string instead of an integer), it is undefined whether Team 14 returns an error JSON object (such as `{ "error": "...", "message": "..." }`) or plain text / HTML error pages.
  
  Additionally, our Week 2 SLA agreement established that Team 14's pipeline employs a 60-second Redis cache on top of a 5-minute cron worker (~6-minute maximum staleness). However, neither the response body nor the response headers declare `fetched_at` (ISO 8601 timestamp) or standard HTTP cache directives (`Cache-Control: max-age=60`, `ETag`). Without this, downstream clients cannot determine whether displayed produce prices or depot stock levels are fresh or stale.
* **Actionable Clarification Requested for Team 14:**
  > *"Can Team 14 define standardized error response schemas (specifically `400`, `404`, and `429`) referencing an `ErrorResponse` object with `code`, `message`, and `timestamp`? Furthermore, could you confirm whether `fetched_at` will be returned in the JSON payload or via HTTP headers (`Last-Modified` / `Cache-Control`), so consumer services can calculate data freshness accurately?"*

---

### Question 3: Ambiguous Update Semantics on Farmer Ratings (`PUT` vs `PATCH`) and Missing Concurrency Control
* **Endpoint Affected:** `PUT /api/v1/farmers/{id}/ratings`
* **Specific Field(s):** `requestBody` (`rating_score`, `review_text`, `reviewer_role`), and `updated_at`
* **Identified Ambiguity:**
  The endpoint uses HTTP `PUT`, which conventionally denotes full entity replacement. However, the documented request schema accepts partial fields (`rating_score` and optional `review_text`). If optional fields are omitted during an update, does Team 14's backend overwrite existing reviews with `null`, or does it preserve previous values (which should semantically be an HTTP `PATCH`)?
  
  Moreover, there is no concurrency control mechanism (such as an `If-Match` header or version field). If two concurrent client systems submit updated ratings for the same farmer profile simultaneously, a race condition will silently overwrite submissions without collision detection.
* **Actionable Clarification Requested for Team 14:**
  > *"Should this endpoint be updated to `PATCH /api/v1/farmers/{id}/ratings` if partial updates are intended, or should `review_text` be marked as required for `PUT`? Additionally, does Team 14 support optimistic concurrency control via an `If-Match: <etag>` header or a `version_id` attribute to prevent concurrent write collisions?"*

---

## Deliverable Sign-Off

- [x] All 5 endpoints from SettleIn `ENDPOINT_LIST.md` authored in `openapi.yaml`.
- [x] Every schema includes real data types, required fields, and realistic campus examples.
- [x] 3 precise, technical questions submitted for upstream partner contract review.
