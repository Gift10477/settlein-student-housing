# Resilience Notes: Upstream Partner Integration (Week 11)

**Application:** SettleIn Student Housing  
**Integrated Service:** Shamba Direct Market Prices API (Team 14)  
**Deliverable:** Week 11 — *Resilience: When Your Partner Is Slow, Flaky, or Gone*  

---

## 1. Test Matrix Table

The following test matrix documents the behavior of `server/resilientFetch.js` and the `/api/market-prices` route across all stand-in partner modes (`ok`, `flaky`, `slow`, `error`):

| Partner Status / Mode | Upstream Behavior | Terminal / Server Logs | User Outcome & UI Experience | HTTP Status |
| :--- | :--- | :--- | :--- | :---: |
| **`ok`** (Healthy) | Returns standard mock market price data immediately (~25–45 ms). | `[resilientFetch]` succeeds on attempt 1/1.<br>`[marketPrices]` caches fresh response in `lastGoodData`. | Live crop prices render immediately. No warning banners are shown. Complete food cost calculator is interactive. | `200 OK`<br>`stale: false` |
| **`flaky`** (Transient Flakes) | Fails 2 out of 3 times with `HTTP 503`, succeeds on the 3rd attempt. | `[resilientFetch] HTTP 503 on attempt 1/3. Retrying in 200ms...`<br>`[resilientFetch] HTTP 503 on attempt 2/3. Retrying in 400ms...`<br>`[resilientFetch]` succeeds on attempt 3/3. | Seamless recovery: the user receives live market prices without error messages. Transients are absorbed automatically in ~620 ms. | `200 OK`<br>`stale: false` |
| **`slow`** (Hanging / Unresponsive) | Delays response by 10,000 ms (simulating network blackhole or overload). | `[resilientFetch] Attempt 1/3 failed: Timeout after 1500ms. Retrying in 200ms...`<br>`[resilientFetch] Attempt 2/3 failed: Timeout after 1500ms. Retrying in 400ms...`<br>`[resilientFetch] All 3 attempts failed: Timeout after 1500ms`<br>`[marketPrices] Upstream failed (TimeoutError); returning stale cached data`. | UI finishes loading after ~5.1s. Displays saved market prices with a visible amber banner: *"⚠️ Showing saved data from [timestamp]. The partner is not responding."* Accommodation booking remains 100% operational. | `200 OK`<br>`stale: true` |
| **`error`** (Outage with Prior Cache) | Consistently returns `HTTP 500 Internal Server Error`. | `[resilientFetch] HTTP 500 on attempt 1/3. Retrying in 200ms...`<br>`[resilientFetch] HTTP 500 on attempt 2/3. Retrying in 400ms...`<br>`[resilientFetch] HTTP 500: all 3 attempts exhausted.`<br>`[marketPrices] Upstream failed (Partner HTTP 500); returning stale cached data`. | Fallback to saved data: users can still calculate monthly food budgets using previously fetched prices. A clear amber warning banner indicates the partner is offline. | `200 OK`<br>`stale: true` |
| **`error`** (Outage with Empty Cache / Cold Start) | Consistently returns `HTTP 500` and no previous `lastGoodData` exists. | `[resilientFetch] HTTP 500: all 3 attempts exhausted.`<br>`[marketPrices] Market price provider request failed: Partner HTTP 500`. | Non-blocking degradation: food budget widget displays a polite alert: *"Market prices are unavailable right now. Please try again later."* with a "Try again" button. Property details and booking stay fully functional. | `502 Bad Gateway` |

---

## 2. Configuration Math & Worst-Case Latency

To provide optimal responsiveness without hammering failing upstreams, our resilience parameters are calibrated based on baseline latency:

* **Baseline Latency:** Normal upstream request turnaround is approximately **45 ms** in local and low-latency environments.
* **Timeout Choice ($1500\text{ ms}$):** The per-request timeout is set to **$1500\text{ ms}$**, which is over $30\times$ the baseline latency. This provides plenty of headroom for transient network jitter while terminating dead connections before users perceive the page as frozen.
* **Retry Schedule & Delays:**
  * Maximum retries: **2 retries** (3 total attempts).
  * Initial backoff delay: **$200\text{ ms}$**.
  * Backoff multiplier: **$2\times$**.
  * Retry 1 delay: $200\text{ ms} \times 2^0 = 200\text{ ms}$.
  * Retry 2 delay: $200\text{ ms} \times 2^1 = 400\text{ ms}$.
  * Total backoff delay: $200\text{ ms} + 400\text{ ms} = 600\text{ ms}$.
* **Worst-Case Wait Formula:**
  $$\text{Worst-Case Total Wait} = (\text{retries} + 1) \times \text{timeout} + \sum \text{delays}$$
  $$\text{Worst-Case Total Wait} = (2 + 1) \times 1500\text{ ms} + (200\text{ ms} + 400\text{ ms}) = 4500\text{ ms} + 600\text{ ms} = 5100\text{ ms} \approx 5.1\text{ s}$$

Under complete upstream failure, our application guarantees that the client request will terminate and degrade gracefully in **under 5.2 seconds**, well below standard browser abort thresholds (30–120 seconds).

---

## 3. User Experience Impact Summary

Enforcing client timeouts prevents student users from experiencing an indefinitely hanging interface or frozen booking workflow when the third-party partner service degrades. By automatically falling back to cached in-memory pricing (`lastGoodData`), students can still estimate their overall cost of living and proceed with booking rooms even during upstream partner outages. Simultaneously, prominent warning banners inform students when market prices reflect saved historical rates rather than live real-time figures, preventing inaccurate financial planning. Most importantly, failures in the third-party food price API degrade gracefully in isolation without crashing or blocking the critical property inspection and lease reservation systems.

---

## 4. Circuit Breaker Pattern

A **circuit breaker** pattern automatically tracks the frequency of consecutive failures when calling an external service and temporarily trips "open" to immediately block subsequent outbound network requests and return fallback data directly, allowing the struggling partner service time to recover without being overwhelmed by repeated doomed calls.

