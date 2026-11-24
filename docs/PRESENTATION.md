# Demonstration and assessment guide

## Seven-minute demonstration

| Time | Demonstrate | Explain |
| --- | --- | --- |
| 0:00–0:45 | Home and problem statement | Students need discoverable housing; landlords need controlled publication; administrators need accountable reservations. |
| 0:45–1:30 | Student registration and filters | Roles, validation and matching every selected amenity. |
| 1:30–2:30 | Reservation and mock payment | Fee deadline, receipt, pending approval and no real money transfer. |
| 2:30–3:30 | Landlord submission, admin rejection/publication | Students cannot access the landlord/admin APIs. |
| 3:30–4:30 | Approve/cancel a paid reservation | Transactions, row locking, vacancy protection and restoration. |
| 4:30–5:30 | Support inbox, resident review, profile and 2FA | Persistent processing, user support and security. |
| 5:30–6:15 | Filter a report, print preview, activity log | Branding, date, sorting, actor and target traceability. |
| 6:15–7:00 | ER diagram, tests and deployment files | Normalized amenities, FKs, parameterized SQL, React/Express/MySQL, deployment remaining deferred. |

Prepare test accounts beforehand. Use temporary demonstration data. Keep a second browser/session for the administrator. Speak slowly, name the problem before the solution, and explain the observable result of each action. Rehearse to the allotted time. Audibility, punctuality and presentation skills must be demonstrated by the presenter; software cannot automatically satisfy those criteria.

## Honest assessment notes

- Forgot-password recovery is intentionally excluded.
- Payment is a mock checkout plus manual receipt recording, as requested; no live gateway integration is claimed.
- Reports use branded browser PDF printing and CSV. If a specific marking scheme demands Jasper/Crystal rather than equivalent reporting, confirm that format requirement with the assessor.
- Hosting files are ready; deployment was deferred at the user's request.
- Session storage supports one backend instance; a restart signs users out. Production-scale distributed sessions and security certification are not claimed.
- Reviews require approved/legacy active reservations. Legacy history with missing links is preserved in the migration archive and remains visible to administrators.

## Evidence to show

Use `docs/DATABASE.md` and the schema for entities/cardinalities, `docs/USER_MANUAL.md` for usage/help, `docs/DEPLOYMENT.md` for installation/hosting, the tests for validation/authorization, and the live reservation demonstration for the main transaction. Show both a successful case and a rejected invalid/unauthorized case.
