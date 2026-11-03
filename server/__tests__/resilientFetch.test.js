const { fetchWithRetry, RETRYABLE_STATUS_CODES, parseRetryAfter } = require('../resilientFetch');

describe('resilientFetch module', () => {
  let fetchMock;
  let warnMock;
  let errorMock;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
    warnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('parseRetryAfter parses integer seconds and HTTP dates correctly', () => {
    expect(parseRetryAfter('5')).toBe(5000);
    expect(parseRetryAfter('0')).toBe(0);
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter('invalid')).toBeNull();

    const futureDate = new Date(Date.now() + 10000).toUTCString();
    const parsed = parseRetryAfter(futureDate);
    expect(parsed).toBeGreaterThanOrEqual(9000);
    expect(parsed).toBeLessThanOrEqual(11000);
  });

  test('successful GET request returns immediately on first attempt without retrying', async () => {
    const mockResponse = { ok: true, status: 200, json: async () => ({ success: true }) };
    fetchMock.mockResolvedValueOnce(mockResponse);

    const promise = fetchWithRetry('https://example.com/api', {}, { timeoutMs: 1000 });
    const response = await promise;

    expect(response).toBe(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(warnMock).not.toHaveBeenCalled();
  });

  test('retries transient 503 errors up to 2 times with exponential backoff and succeeds on 3rd attempt', async () => {
    const error503 = { ok: false, status: 503, headers: new Headers() };
    const success200 = { ok: true, status: 200, json: async () => ({ data: 'ok' }) };

    fetchMock
      .mockResolvedValueOnce(error503)
      .mockResolvedValueOnce(error503)
      .mockResolvedValueOnce(success200);

    const promise = fetchWithRetry('https://example.com/api', {}, { initialDelayMs: 200, backoffFactor: 2, maxRetries: 2 });

    // Advance through the retry timers: 200ms for retry 1, 400ms for retry 2
    await jest.advanceTimersByTimeAsync(200);
    await jest.advanceTimersByTimeAsync(400);

    const res = await promise;
    expect(res).toBe(success200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('HTTP 503 on attempt 1/3. Retrying in 200ms'));
    expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('HTTP 503 on attempt 2/3. Retrying in 400ms'));
  });

  test('does NOT retry client errors (400, 401, 403, 404)', async () => {
    for (const status of [400, 401, 403, 404]) {
      fetchMock.mockReset();
      const clientError = { ok: false, status, headers: new Headers() };
      fetchMock.mockResolvedValueOnce(clientError);

      const res = await fetchWithRetry('https://example.com/api', {}, { maxRetries: 2 });
      expect(res.status).toBe(status);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(warnMock).not.toHaveBeenCalled();
    }
  });

  test('does NOT retry non-idempotent write methods (POST, PUT, DELETE, PATCH)', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      fetchMock.mockReset();
      const serverError500 = { ok: false, status: 500, headers: new Headers() };
      fetchMock.mockResolvedValueOnce(serverError500);

      const res = await fetchWithRetry('https://example.com/api', { method }, { maxRetries: 2 });
      expect(res.status).toBe(500);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
  });

  test('respects Retry-After header on 429 status code', async () => {
    const headers = new Headers();
    headers.set('Retry-After', '3'); // 3 seconds = 3000 ms

    const rateLimited429 = { ok: false, status: 429, headers };
    const success200 = { ok: true, status: 200 };

    fetchMock
      .mockResolvedValueOnce(rateLimited429)
      .mockResolvedValueOnce(success200);

    const promise = fetchWithRetry('https://example.com/api', {}, { maxRetries: 1 });

    await jest.advanceTimersByTimeAsync(3000);
    const res = await promise;

    expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('HTTP 429 on attempt 1/2. Retrying in 3000ms'));
    expect(res).toBe(success200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('retries on timeout error and exhausts all retries if partner stays slow', async () => {
    const timeoutErr = new Error('The operation was aborted due to timeout');
    timeoutErr.name = 'TimeoutError';

    fetchMock.mockRejectedValue(timeoutErr);

    const promise = fetchWithRetry('https://example.com/api', {}, {
      timeoutMs: 1500,
      initialDelayMs: 200,
      backoffFactor: 2,
      maxRetries: 2
    });

    const rejectExpectation = expect(promise).rejects.toThrow('The operation was aborted due to timeout');

    // Advance through backoff delays
    await jest.advanceTimersByTimeAsync(200);
    await jest.advanceTimersByTimeAsync(400);

    await rejectExpectation;
    expect(fetchMock).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining('All 3 attempts failed'));
  });
});
