# API Needs Statements & Partner Integration Specification

**Team / Project:** SettleIn (Team 1) — Student Housing & Accommodation Marketplace  
**Downstream Consumer Partner:** StudySync (Team 2) — Student Group Collaboration & Study Coordination Platform  
**Upstream Producer Partner:** Team 14 — Agricultural & Farmer Produce Marketplace  

---

## 1. Upstream & Downstream Partner Interview Summaries

### Downstream Partner Interview: StudySync (Team 2)
* **Useful Data/Actions:** Project/assignment deadlines, scheduled meetings, member rosters, task-related dates, progress tracking, and reminders.
* **Access Mode:** Primarily read-only (GET) to populate calendars and widgets, with potential future write actions (creating reminders/events).
* **Call Frequency:** Once per page load for deadlines and member info; refreshed every few minutes or on calendar view open.
* **Sensitivity/Boundaries:** No access to private student data like grades, passwords, or personal messages.

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

### Statement 1: Project & Assignment Deadlines
> **“StudySync needs to read a list of active project and assignment deadlines with due dates, course codes, and completion statuses in order to display an upcoming-deadlines widget and timeline on the student dashboard.”**

* **Freshness:** Updated within 15–30 minutes is sufficient.
* **Volume:** Called once per page load when the user navigates to the dashboard or task view.
* **Auth:** Required (Authenticated student session token / Bearer token scoped to enrolled courses).
* **Week 1 Audit Check:** 🚩 **GAP FLAGGED** — SettleIn’s resource audit (`TEAM_CHARTER.md`) manages housing leases and booking dates, but does not manage academic coursework or assignment deadlines.

---

### Statement 2: Scheduled Group Meetings & Timestamps
> **“StudySync needs to read scheduled team meeting dates, start/end timestamps, meeting links, and agendas for a registered project group in order to render a merged study group calendar and detect scheduling conflicts.”**

* **Freshness:** Updated within 5–10 minutes.
* **Volume:** Called on demand whenever a user opens or refreshes the group calendar tab.
* **Auth:** Required (Authenticated user verified as an active member of the project group).
* **Week 1 Audit Check:** 🚩 **GAP FLAGGED** — SettleIn does not maintain entities for academic study sessions or group meeting agendas.

---

### Statement 3: Team Roster & Participant Information
> **“StudySync needs to read the list of active team members with their display names, assigned group roles, and avatar URLs for a given project in order to render the team participant roster and display task assignees.”**

* **Freshness:** Semi-static (cached for 1–6 hours; rosters change infrequently).
* **Volume:** Called once per group project overview page load.
* **Auth:** Required (User session token ensuring only authorized teammates can view member details).
* **Week 1 Audit Check:** ⚠️ **PARTIAL OVERLAP / GAP FLAGGED** — Mapped to `Entity 1: User Accounts & Profiles (users)` for student names/avatars; however, SettleIn does not store academic group memberships or project roles.

---

### Statement 4: Task Progress & Member Accountability
> **“StudySync needs to read assigned task completion statuses and progress percentages per team member in order to display a visual accountability tracker and milestone progress bar.”**

* **Freshness:** Updated within 5–10 minutes.
* **Volume:** Called once per page load when viewing the group accountability / progress tab.
* **Auth:** Required (Scoped to verified project group members).
* **Week 1 Audit Check:** 🚩 **GAP FLAGGED** — SettleIn has no entity or schema for academic task tracking or student deliverables.

---

### Statement 5: Deadline Reminders & Event Hooks (Write Need)
> **“StudySync needs to create automated deadline reminder notifications and calendar sync events for upcoming milestones in order to push timely study alerts to group members before submission dates.”**

* **Freshness:** Near real-time upon event creation.
* **Volume:** Low / Infrequent (triggered only when a milestone or study reminder is scheduled).
* **Auth:** High / Required (Write-permission bearer token from an active group collaborator).
* **Week 1 Audit Check:** ⚠️ **PARTIAL OVERLAP / GAP FLAGGED** — Mapped to `Entity 17: Notifications & Alerts (notifications)`, but SettleIn currently only dispatches housing/booking alerts, not academic deadline reminders.

---

## 3. Reflection: Partner Interview Insights

The partner interview process revealed significant architectural assumptions and unexpected integration dynamics across our ring topology. What surprised us most in our interview with **StudySync (Team 2)** was a fundamental domain expectation mismatch: they entered the interview assuming our application was an academic course and project management hub, asking for coursework deadlines, task progress trackers, and group meeting schedules. In reality, **SettleIn (Team 1)** is a student housing and accommodation marketplace. Performing the Week 1 audit check immediately caught this gap before we wrote phantom endpoints, underscoring the vital role of interface discovery. On the other side, our interview with our upstream partner **Team 14** was eye-opening in terms of distributed system trade-offs: learning about their multi-tiered caching pipeline (1-minute source writes, 5-minute cron ingestion, and 60-second Redis caching) gave us concrete numbers on data freshness (~6-minute worst-case staleness), proving why API contracts must explicitly document latency expectations and payload timestamps like `fetched_at` rather than assuming instantaneous consistency.
