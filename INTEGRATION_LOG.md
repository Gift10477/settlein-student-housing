# Week 10 integration log - SettleIn / Shamba Direct

## Team members - SettleIn (Team 1)

| Student ID | Full name |
| --- | --- |
| 193923 | Githaka, Gift Gicheru |
| 220259 | Kungu, Ian Gachigua |
| 220982 | Abdi, Yahya Ahmed |
| 221126 | Olale, Tiffany Akello |

Prepared 27 October 2026 (Africa/Nairobi). The live Team 14 URL and any issued
key are still pending. This document distinguishes local implementation/tests
from evidence that must be collected with the partner. No real keys belong here.

## Actual findings during local preparation

| # | Symptom / surprise | Root cause | Fix | Whose code / who fixed it | Evidence / retest |
| --- | --- | --- | --- | --- | --- |
| 1 | Browsing and account creation returned 429 | Original shared limit was 3 requests/15 minutes; an old backend process continued running after edits | Threshold increased by the user to 100; assistant restarted the old process; docs/tests synchronized | SettleIn / user and assistant | Four consecutive health requests returned 200 after restart; empty registration reached 400 validation instead of 429 |
| 2 | Registration displayed only `Bad Request` | Frontend used `error` while ignoring detailed backend `message` | Prefer validation message; enforce eight-character password minimum in the form | SettleIn / assistant | Frontend build passed; original invalid user field was not identified, so account creation is not claimed verified |
| 3 | Provider authentication assumption differed from updated contract | Earlier lab instructions discussed keys, but latest saved Shamba spec allows public reads | Partner key optional; configurable header and prefix for future auth | Contract interpretation / assistant adapter | Automated request tests cover public and keyed reads; live auth still to confirm with Team 14 |
| 4 | Missing county could reject valid prices | Updated partner schema permits an omitted/null county | Preserve missing county as null and label it unspecified | SettleIn / assistant | Automated null/omitted county tests |
| 5 | README/OpenAPI/tests still said 3 requests after runtime changed to 100 | Documentation/test drift after a local configuration edit | Align response docs, 101st-request tests, and rendered docs with 100/15 minutes | SettleIn / assistant | Local test run recorded below; no rate-limit removal |

## Current local verification

The demo provider, preflight script, request-status logger and their dedicated
tests were removed at the user's request. No demo commands are required.
The existing market-price, authentication, security, documentation and budget
calculation tests remain. They mock partner/database responses and do not prove
that Team 14 is reachable. Live UI failure/recovery remains pending.

Final cleanup results: **107 backend tests passed across seven suites**, six
budget-calculation tests passed, and the frontend production build passed.
Rendered docs were rebuilt and the remaining guide/commands checked for stale
references to the removed tools. No live partner request was made.

## Pending live / human evidence - do not mark complete without doing it

| Requirement | Status | Record here when performed |
| --- | --- | --- |
| Team 14 live URL, README/version and server availability | Pending partner | URL without credentials; date/time in Africa/Nairobi |
| Confirm public reads or issued key/header/prefix | Pending partner | Header names and scheme only; never the key |
| Confirm KES currency and market-price field types | Pending partner | Contract version and redacted observation |
| Upstream and downstream contacts; TA check-in slot | Pending coordination | Names/roles and agreed slot |
| First terminal call outside the app | Pending URL | Method/path, actual status, shape result, timestamp |
| Live widget shows real partner data | Pending URL | Redacted screenshot/result; quantities and expected calculation |
| Manual UI failure/recovery check | Pending partner | Message shown; accommodation still visible; recovery result |
| Real partner down / back demonstration | Pending partner | Failure message, safe log code, restart and recovery results |
| Support StudySync using current SettleIn contract | Pending collaboration | Actual bug report, owner, fix and retest, or checks that passed |
| Final demo, reviewed commit and push | Pending final evidence | Commit hash, branch, demonstration outcome |

## Add one row per new bug, surprise or deliberate test

| Time (Africa/Nairobi) | Environment: local/live | Request / action | Expected | Actual symptom/status | Root cause | Fix | Whose code / who fixed it | Retest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Examples in the handout are not evidence. If a live check works on the first
attempt, say so; also record deliberate wrong-key, nonexistent-ID (on a route
that takes an ID), shape and provider-down tests as actually performed.
