/**
 * resilientFetch.js — Resilient HTTP Fetch Client
 *
 * Implements Week 11 Resilience Patterns:
 *   1. Timeout Enforcement via AbortSignal.timeout(timeoutMs) (default: 1500 ms)
 *   2. Exponential Backoff Retries: up to maxRetries (default: 2), starting at 200 ms, then 400 ms
 *   3. Safety Constraints:
 *      - ONLY retries idempotent GET requests. Never retries write requests (POST, PUT, PATCH, DELETE).
 *      - ONLY retries transient server errors [429, 500, 502, 503, 504] and network/timeout errors.
 *      - Does NOT retry client errors (400, 401, 403, 404).
 *      - Honors Retry-After header on HTTP 429 responses.
 */

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Sleep helper for backoff delays
 * @param {number} ms 
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses Retry-After header value into milliseconds.
 * Supports both integer seconds ("5") and HTTP-date strings ("Wed, 21 Oct 2026 07:28:00 GMT").
 * @param {string|null} headerVal 
 * @returns {number|null} delay in milliseconds, or null if unparseable
 */
function parseRetryAfter(headerVal) {
  if (!headerVal) return null;
  const seconds = Number(headerVal);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  const dateMs = Date.parse(headerVal);
  if (!Number.isNaN(dateMs)) {
    const diff = dateMs - Date.now();
    return diff > 0 ? diff : 0;
  }
  return null;
}

/**
 * Executes an HTTP fetch with timeout and exponential backoff retry.
 * 
 * @param {string|URL} url - The target endpoint URL
 * @param {RequestInit} [options={}] - Standard fetch options
 * @param {object} [config={}] - Resilience settings
 * @param {number} [config.timeoutMs=1500] - Request timeout in milliseconds
 * @param {number} [config.maxRetries=2] - Maximum number of retry attempts for GET
 * @param {number} [config.initialDelayMs=200] - Initial retry delay in milliseconds
 * @param {number} [config.backoffFactor=2] - Exponential multiplier for backoff
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, options = {}, config = {}) {
  const timeoutMs = config.timeoutMs ?? 1500;
  const maxRetries = config.maxRetries ?? 2;
  const initialDelayMs = config.initialDelayMs ?? 200;
  const backoffFactor = config.backoffFactor ?? 2;

  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  // Safety rule: Never retry non-idempotent write requests
  const effectiveMaxRetries = isGet ? maxRetries : 0;

  let attempt = 0;

  while (true) {
    // 1. Build timeout signal using native AbortSignal.timeout
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    let combinedSignal = timeoutSignal;

    if (options.signal) {
      if (typeof AbortSignal.any === 'function') {
        combinedSignal = AbortSignal.any([options.signal, timeoutSignal]);
      } else {
        // Fallback for older runtimes if AbortSignal.any is not present
        const controller = new AbortController();
        options.signal.addEventListener('abort', () => controller.abort(options.signal.reason), { once: true });
        timeoutSignal.addEventListener('abort', () => controller.abort(timeoutSignal.reason), { once: true });
        combinedSignal = controller.signal;
      }
    }

    const fetchOptions = {
      ...options,
      signal: combinedSignal
    };

    try {
      const response = await fetch(url, fetchOptions);

      // Successful response (2xx) or successful redirect: return immediately
      if (response.ok) {
        return response;
      }

      // Non-retryable status codes (e.g. 400, 401, 403, 404): return immediately without retrying
      if (!RETRYABLE_STATUS_CODES.has(response.status)) {
        return response;
      }

      // Status code is retryable (429, 500, 502, 503, 504)
      if (attempt < effectiveMaxRetries) {
        let delayMs = initialDelayMs * Math.pow(backoffFactor, attempt);

        // Respect Retry-After header on 429 responses
        if (response.status === 429) {
          const retryAfterMs = parseRetryAfter(response.headers.get('Retry-After'));
          if (retryAfterMs !== null) {
            delayMs = retryAfterMs;
          }
        }

        console.warn(`[resilientFetch] HTTP ${response.status} on attempt ${attempt + 1}/${effectiveMaxRetries + 1}. Retrying in ${delayMs}ms...`);
        attempt++;
        await sleep(delayMs);
        continue;
      }

      // All retries exhausted
      console.warn(`[resilientFetch] HTTP ${response.status}: all ${effectiveMaxRetries + 1} attempts exhausted.`);
      return response;

    } catch (err) {
      const isTimeout = err.name === 'TimeoutError' || combinedSignal.aborted;
      const failureReason = isTimeout ? `Timeout after ${timeoutMs}ms` : (err.message || 'Network failure');

      if (attempt < effectiveMaxRetries) {
        const delayMs = initialDelayMs * Math.pow(backoffFactor, attempt);
        console.warn(`[resilientFetch] Attempt ${attempt + 1}/${effectiveMaxRetries + 1} failed: ${failureReason}. Retrying in ${delayMs}ms...`);
        attempt++;
        await sleep(delayMs);
        continue;
      }

      console.error(`[resilientFetch] All ${effectiveMaxRetries + 1} attempts failed: ${failureReason}`);
      throw err;
    }
  }
}

module.exports = {
  fetchWithRetry,
  RETRYABLE_STATUS_CODES,
  parseRetryAfter
};

