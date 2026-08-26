# API Needs Statements & Partner Integration Specification

**Team / Project:** SettleIn (Team 1) — Student Housing & Accommodation Marketplace  
**Downstream Consumer Partner:** StudySync (Team 2) — Student Group Collaboration & Study Coordination Platform  
**Upstream Producer Partner:** Team 14 — Agricultural & Farmer Produce Marketplace  

---

## 1. Upstream & Downstream Partner Interview Summaries

### Downstream Partner Interview: StudySync (Team 2)
* **Useful Data/Actions:** Student residential neighborhoods/estates, proximity to campus, accommodation study amenities (Wi-Fi speed, dedicated desk space, backup power), lease move-in dates (for availability planning), verified student identity, and shared-living group booking inquiries.
* **Access Mode:** Primarily read-only (GET) to populate study venue recommendations and group calendars, with targeted write actions (POST) for group housing inquiries.
* **Call Frequency:** On-demand per study session planning flow; once per page load for member profile previews; cached for 1–24 hours.
* **Sensitivity/Boundaries:** No access to private student credentials, financial payment records (M-PESA numbers/PINs), landlord direct banking details, or exact private room/house numbers (neighborhood-level privacy only).

### Upstream Partner Interview: Team 14 (Producer)
* **Managed Data:** User names, roles, market commodity prices, farmer ratings, headquarters/depot locations, total earnings.
* **Allowed Operations:** Read (GET) and Update (PATCH/PUT). Create and Delete are prohibited.
* **Sensitivity/Boundaries:** Government ID and phone numbers are strictly redacted/private.
* **Freshness & Caching SLA:** Source updates every 1 minute; cron fetcher runs every 5 minutes; cached in Redis for 60 seconds (worst-case staleness: ~6 minutes). Includes `fetched_at` timestamp in responses.

---

## 2. API Needs Statements (Part D)

Every needs statement strictly adheres to the required format:  
`“[Consumer team] needs to [verb] [resource] in order to [reason].”`

---

### Statement 1: Student Residential Area & Proximity to Campus
> **“StudySync needs to read a student’s residential estate name, distance to campus, and general location coordinates in order to calculate central meetup locations and suggest convenient physical study group venues midpoint between team members.”**

* **Verb & Resource:** `GET /api/v1/users/{id}/residence-area`
* **Freshness:** Semi-static (cached for 24 hours; students rarely change residences mid-semester).
* **Volume:** Low — called on-demand when a study group schedules an offline study session or opens the group meetup map.
* **Auth & Security:** Required (Authenticated student Bearer token). For privacy, exact room numbers and building names are redacted; only neighborhood level (e.g., *"Madaraka"*, *"Parklands"*) and distance are exposed.
* **Entity Mapping:** Mapped to `Entity 1: User Accounts & Profiles` and `Entity 3: Properties & Accommodations (location, distance_to_campus)`.

---

### Statement 2: Accommodation Study Amenities & Wi-Fi Reliability
> **“StudySync needs to read the accommodation study amenities (high-speed Wi-Fi rating, dedicated desk space, backup generator, quiet-hours policy) for a member’s residence in order to identify and recommend host-friendly apartments for group project work sprints.”**

* **Verb & Resource:** `GET /api/v1/accommodations/{id}/study-amenities`
* **Freshness:** Updated within 1–6 hours.
* **Volume:** Low to medium — called when group members search for an optimal study host home.
* **Auth & Security:** Required (Authenticated group member session token).
* **Entity Mapping:** Mapped to `Entity 3: Properties` and `Entity 7: Amenities & Utilities`.

---

### Statement 3: Move-in & Semester Lease Timeline Dates
> **“StudySync needs to read student lease start and move-in dates in order to automatically flag student relocation periods as busy/unavailable on the group collaboration calendar.”**

* **Verb & Resource:** `GET /api/v1/students/{id}/lease-timeline`
* **Freshness:** Updated within 1 hour of booking confirmation.
* **Volume:** Low — called once per group calendar synchronization or schedule conflict check.
* **Auth & Security:** Required (Scoped to verified peers sharing an active project group).
* **Entity Mapping:** Mapped to `Entity 8: Bookings & Room Reservations (move_in_date, lease_duration)`.

---

### Statement 4: Verified Student Identity & University Affiliation
> **“StudySync needs to read verified student profile details (display name, verified university affiliation, campus branch, and avatar URL) in order to populate participant profiles and verify campus eligibility without duplicate account entry.”**

* **Verb & Resource:** `GET /api/v1/users/{id}/public-profile`
* **Freshness:** Cached for 6–12 hours.
* **Volume:** Medium — called once per group member roster view or project dashboard load.
* **Auth & Security:** Required (Standard API token; sensitive fields like phone number, student ID number, and password hashes are strictly omitted).
* **Entity Mapping:** Mapped to `Entity 1: User Accounts & Profiles (name, university, avatar_url, verification_status)`.

---

### Statement 5: Shared Accommodation & Co-Living Group Inquiry (Write Action)
> **“StudySync needs to create a shared-housing inquiry notification with group member IDs and target campus branch in order to alert study group members about available multi-bedroom apartments suitable for co-living near their campus.”**

* **Verb & Resource:** `POST /api/v1/accommodations/group-inquiries`
* **Freshness:** Near real-time upon event creation.
* **Volume:** Low / Infrequent — triggered only when a study group explicitly requests a joint accommodation search.
* **Auth & Security:** High / Required (Write-permission Bearer token from an authenticated study group admin).
* **Entity Mapping:** Mapped to `Entity 3: Properties`, `Entity 8: Bookings`, and `Entity 17: Notifications & Alerts`.

---

## 3. Reflection: Partner Interview Insights & Domain Reconciliation

The partner interview process provided critical insights into architectural assumptions and cross-domain integration dynamics across our ring topology. 

What stood out most during our discovery phase with **StudySync (Team 2)** was an initial domain expectation mismatch: StudySync entered the interview assuming SettleIn managed academic coursework, requesting assignment deadlines, task progress trackers, and group study schedules. Performing the Week 1 resource audit against our [TEAM_CHARTER.md](file:///c:/Users/giftg/OneDrive%20-%20Strathmore%20University/Desktop/Student_accomodation_app/TEAM_CHARTER.md) immediately caught this gap before writing phantom endpoints. We successfully reconciled our interface contract by pivoting to high-value **cross-domain touchpoints**: providing StudySync with residential neighborhood data for physical meetup planning, housing amenity ratings (Wi-Fi/power) for study sprint venues, and verified campus identities. 

On the other side, our interview with upstream partner **Team 14** offered crucial clarity on distributed system trade-offs: understanding their multi-tiered caching pipeline (1-minute source writes, 5-minute cron ingestion, and 60-second Redis caching) gave us concrete numbers on data freshness (~6-minute worst-case staleness), demonstrating why API contracts must explicitly document latency expectations and payload timestamps like `fetched_at` rather than assuming instantaneous consistency.

