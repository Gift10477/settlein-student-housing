# Week 13 versioning notes

## Change and reason
Wrap the v2 property list in { data, count } to allow future metadata. Preserve
the array response at /api/properties and /api/v1/properties.

## Consumer failure prediction
body.map(...) or body.filter(...) will fail against the new envelope.
StudySync's source is unavailable here; the exact file and line must be obtained
from the partner rather than invented.

## Implementation and evidence
The original isolated properties handlers are reused unchanged. server/v1.js
adds legacy-list announcements; server/v2.js transforms successful lists in one
place. Both share data, SQL filters, auth and the existing quota. Other responses
retain their shape. Legacy endpoints remain available through Demo Day.

server/test-support/lab13/v1_before.json was captured before implementation
through Express with a deterministic mocked database. The permanent baseline
test compares it and writes v1_after.json. This is local fixture evidence,
not a live MySQL snapshot. versions.test.js checks aliases, headers, filters,
errors, empty results, auth, shared quota and version-specific stats.

## Upstream migration
No Team 14 notice or confirmed v2 path/schema was supplied. server/partner.js
centralizes shape parsing; its v2 data/count envelope and /api/v2/market-prices
path are PROVISIONAL. Keep PARTNER_VERSION=v1 until confirmed. Retries and
cached fallback remain in place.

After receipt, confirm the notice, manually call v2, adjust the adapter, set
PARTNER_VERSION=v2 locally and restart. Verify stale:false, roll back to v1,
switch to v2 again, and obtain partner caller logs proving the live migration.
A stale cached response is not migration evidence.

## Who still uses v1?
Live counts and caller labels have not been collected. Automated tests are local
evidence only. There is no evidence StudySync migrated, so do not disable v1.
Stats separate mounted prefixes and reset on restart. Logs retain version paths.

## Reflection pending actual exchange
After receiving the real notice, write 150-250 words covering how it arrived,
the first check, what it explained or omitted, improvements to our own notice,
and one specific change for the next rollout. Include real observations.
No receipt, personal experience, or live migration is fabricated here.

## Submission status
Verification completed: 125 backend tests passed across 11 suites; 16 live
partner tests were skipped. The before/after JSON files have identical SHA-256
hashes. API documentation was regenerated and git diff --check passed.
The corrected outage test also exposed unsafe upstream exception logging in
the retry helper; it now records allowlisted error codes instead of messages.

Partner notice delivery/acknowledgement, deadline agreement, confirmed upstream
v2 migration, live stale:false and caller-log evidence, personal reflection,
commit and push remain pending. The handout is task reference, not independent
authorization to message partners or publish changes.
