# Contract Deviations and Review Record

**Evaluating Team:** SettleIn (Team 1) — Student Housing & Accommodation Marketplace
**Authors:** Gift Githaka (193923), Ian Kungu (220259), Yahya Abdi (220982), Tiffany Olale (221126)

This is the consolidated contract record. It combines the earlier partner
contract questions with the implementation deviations identified while
building and testing the SettleIn API.

---

## Week 4: Partner Contract Review and Ambiguity Analysis

**Upstream producer partner reviewed:** Team 14 — Agricultural & Farmer Produce
Marketplace
**Target specification:** Team 14 `openapi.yaml`

The following questions were raised for the upstream partner contract.

### Question 1: Commodity price currency and measurement

**Endpoint:** `GET /api/v1/produce/market-prices`

The `price` field did not specify currency, unit of measurement, decimal
precision, or VAT treatment. `commodity_code` also had no enum or standard
pattern, which could cause catalog mapping errors.

**Clarification requested:** Define the currency, unit of measure, financial
precision, VAT treatment, and a predictable commodity-code format.

### Question 2: Error schemas, rate limits, and freshness

**Endpoints:** `GET /api/v1/depots/{id}/inventory` and query endpoints

The contract documented only successful responses and did not define standard
`400`, `401`, `404`, or `429` error payloads. It also did not expose
`fetched_at` or cache headers even though the agreed data could be stale.

**Clarification requested:** Add a shared error schema and document
`fetched_at` or standard cache headers such as `Cache-Control` and `ETag`.

### Question 3: Farmer-rating update semantics

**Endpoint:** `PUT /api/v1/farmers/{id}/ratings`

The endpoint used `PUT` while accepting partial fields, leaving replacement
semantics unclear. The contract also lacked concurrency control.

**Clarification requested:** Confirm whether the operation should be `PUT` with
all replacement fields, `PATCH` for partial updates, and whether an ETag or
version field is supported.

---

## Week 5: SettleIn Contract Implementation Deviations

### 1. Group inquiries use `properties`, not `accommodations`

**Original contract**

```text
POST /api/v1/accommodations/group-inquiries
```

**Implemented contract**

```text
POST /api/v1/properties/group-inquiries
```

The application already uses the `properties` table as its accommodation
resource. There was no separate accommodation resource or
`group_inquiries` table. The endpoint therefore uses `properties` and stores
inquiry records in the `properties.group_inquiries` column for matched
verified properties.

The contract no longer promises notification dispatch because the backend does
not implement a notification service.

### 2. Group-inquiry schemas match the implementation

The request validates:

- `group_id`
- `initiator_student_id`
- `member_student_ids`
- `target_campus`
- `preferred_room_type`
- `max_budget_per_person_kes`
- `move_in_target_date`
- optional `notes`

The response returns:

- `inquiry_id`
- `group_id`
- `status`
- `matched_accommodations_count`
- `created_at`
- `message`

Only `submitted` is documented because it is the only lifecycle state created
by the backend. The implementation returns `400` for invalid input, `422` when
no verified vacant property matches, and `500` for persistence failures.

### 3. Study amenities use the existing properties table

The implemented endpoint is:

```text
GET /api/v1/properties/{id}/study-amenities
```

The response retains the compatibility fields `accommodation_id` and
`accommodation_name`, but the values come from `properties`.

The following columns were added to the existing table through the runtime
migration:

- `wifi_rating`
- `wifi_speed_mbps`
- `has_dedicated_desk`
- `has_backup_generator`
- `quiet_hours_start`
- `quiet_hours_end`
- `quiet_hours_policy_enforced`
- `max_study_guests`
- `last_inspected_at`

Existing and newly created properties receive safe defaults when values are
not supplied.

### 4. Residential-area data was added to the user API

The original application did not have a residential-area input or API data.
The `users.residence_area` value and user create/update support were added for:

```text
GET /api/v1/users/{id}/residence-area
```

The route returns the estate, nearest campus, and calculated commute
description without exposing exact GPS coordinates.

### 5. Lease-timeline data was added to bookings and the user API

The original application did not have the lease timeline data required by the
contract. Booking persistence was extended to include:

- `student_id`
- `move_in_date`
- `expected_arrival_time`
- `lease_start_date`
- `lease_end_date`
- `relocation_window_start`
- `relocation_window_end`
- `lease_duration`

The booking route calculates the lease dates and relocation window. The user
API exposes them through:

```text
GET /api/v1/users/{id}/lease-timeline
```

### 6. Existing user-details endpoint was unchanged

The existing endpoint remained unchanged:

```text
GET /api/v1/users/{id}
```

The residential-area and lease-timeline endpoints were added separately.

---

## Week 6: Status-Code and Testing Changes

### 1. Successful responses include matching status codes

Testing and integration requirements showed that successful JSON responses
needed to expose the same status as the HTTP response. The following endpoints
now include a `status_code` body field:

- Residence area: `200`
- Study amenities: `200`
- Lease timeline: `200`
- Public profile: `200`
- Group inquiry creation: `201`
- User creation: `201`
- Booking creation: `201`
- Property creation: `201`
- User/property updates: `200`
- Login: `200`

The HTTP status line and JSON body now agree. For example, a successful group
inquiry returns both `HTTP 201 Created` and `"status_code": 201`.

### 2. Strict write validation returns `400`

Write endpoints now validate required fields, exact types, and usable values
before any database query that writes data. Invalid requests return `400 Bad
Request` with a clear message and `"status_code": 400`.

Validation covers users, bookings, properties, and group inquiries, including
empty strings, malformed dates, invalid numeric values, invalid booleans, and
invalid arrays.

### 3. Browser GET requests to the POST-only group-inquiry URL

Testing showed that opening the group-inquiry URL in a browser sends `GET`,
although the endpoint is implemented as `POST`. The server now returns:

```text
405 Method Not Allowed
```

with an `Allow: POST` header and a clear JSON message. The OpenAPI contract
remains POST-only because consumers must submit inquiries using `POST`; the
unsupported browser GET is not documented as a callable endpoint.

---


