# Contract Deviations


## OpenAPI changes

The `openapi.yaml` file was changed. The following deviations were made:

### 1. Group inquiries use `properties`, not `accommodations`

**Original contract**

```text
POST /api/v1/accommodations/group-inquiries
```

**Current contract and implementation**

```text
POST /api/v1/properties/group-inquiries
```

The application already uses the `properties` table as its accommodation
resource. There was no separate accommodation resource or separate
`group_inquiries` table. The endpoint was therefore moved under
`properties` and stores inquiry records in the `properties.group_inquiries`
column for matched verified properties.

This change also updates the operation description to state that inquiries are
recorded on matched properties. The contract no longer promises notification
dispatch because the current backend does not implement a notification service.

### 2. Group-inquiry responses match the implemented behavior

The `CreateGroupInquiryRequest` and `GroupInquiryResponse` schemas were
adjusted to describe the fields that the route validates and returns:

- `group_id`
- `initiator_student_id`
- `member_student_ids`
- `target_campus`
- `preferred_room_type`
- `max_budget_per_person_kes`
- `move_in_target_date`
- optional `notes`
- `inquiry_id`
- `status`
- `matched_accommodations_count`
- `created_at`
- `message`

The response status is currently restricted to `submitted`, because that is the
only lifecycle state created by the backend. The contract no longer documents
future states such as `reviewing`, `matched`, or `contacted`.

The route returns `400` for invalid input, `422` when no verified vacant
property matches the requested criteria, and `500` for persistence failures.
The `422` response prevents a false success when there is no property row on
which the inquiry can be stored.

Successful contract responses now also include a `status_code` field in the
JSON body that matches the HTTP response:

- `200` for the residence-area, study-amenities, lease-timeline, and
  public-profile GET endpoints.
- `201` for a successfully persisted group inquiry.

Express also sets the corresponding HTTP status line through `res.json()` and
`res.status(...)`; the JSON field makes the result explicit to API consumers.

### 3. Browser GET requests to the group-inquiry URL return `405`

Testing showed that opening the group-inquiry URL directly in a browser sends a
`GET` request, even though the resource is implemented as a `POST` endpoint.
Before this adjustment, that GET could be interpreted as a property lookup and
return a misleading `404 Property not found` response.

The implementation now explicitly returns:

```text
405 Method Not Allowed
```

with an `Allow: POST` header and a clear JSON message. The OpenAPI contract
remains POST-only because the unsupported GET method is not an endpoint
consumers should call; submitting an inquiry still requires `POST`.


### 4. Study amenities use the existing property resource

The study-amenities operation is documented as:

```text
GET /api/v1/properties/{id}/study-amenities
```

It is not an accommodation-table endpoint. The response continues to expose
the contract's accommodation-oriented field names, such as
`accommodation_id` and `accommodation_name`, for compatibility with the
downstream consumer, but the values are read from the existing `properties`
table.

The following study-related columns were added to the existing `properties`
table through the application's runtime migration:

- `wifi_rating`
- `wifi_speed_mbps`
- `has_dedicated_desk`
- `has_backup_generator`
- `quiet_hours_start`
- `quiet_hours_end`
- `quiet_hours_policy_enforced`
- `max_study_guests`
- `last_inspected_at`

Existing properties receive safe default study-amenity values when those fields
are missing, and newly created properties receive the same defaults unless
explicit values are supplied.

### 5. Group-inquiry persistence uses the existing `properties` table

The following column was added to `properties`:

- `group_inquiries` — JSON text containing inquiries associated with matched
  properties.

No separate `group_inquiries` table or standalone group-inquiry router was
created. This is a deliberate deviation from a normalized resource design,
made because the requested implementation had to use the current properties
table.

## User API and database additions

The original application did not provide all of the user data required by the
contract. The following capabilities were added:

### Residential area and proximity

The user database now supports the `residence_area` value used by:

```text
GET /api/v1/users/{id}/residence-area
```

The route reads the student's residential estate from the user record and
calculates a nearest-campus and distance description using the application's
known estate and campus reference data. Exact GPS coordinates are not exposed
by this API.

User creation and update requests were also wired to accept `residence_area`,
so the application has a place for the student to enter their residential
area. This field was necessary because the original application had no
residential-area input or corresponding API data.

### Lease timeline

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

The booking route calculates lease dates and the relocation window when a
booking is created. The user API exposes the resulting data through:

```text
GET /api/v1/users/{id}/lease-timeline
```

This endpoint reads the latest booking for the user and returns the lease
period, move-in information, accommodation name, and whether the user is
currently within the relocation window.

## User endpoint that did not change

The existing user-details endpoint was not changed:

```text
GET /api/v1/users/{id}
```

Its existing user-details behavior remains separate from the newly added
residential-area and lease-timeline contract endpoints.

## Summary

These are implementation-alignment deviations, not arbitrary contract
changes. The original contract referred to accommodation and data resources
that were not present in the application. The final contract uses the existing
`properties`, `users`, and `bookings` resources, documents the fields that are
actually persisted, and avoids promising notification, authentication, or
workflow behavior that has not been implemented.

Group_members:
- Githaka, Gift Gicheru (193923)
- Kungu, Ian Gachigua (220259)
- Abdi, Yahya Ahmed (220982)
- Olale, Tiffany Akello (221126)
