/**
 * Analytics Transport Tests
 *
 * Validates retry behavior for transient failures.
 */

import { Transport } from "../transport";
import type { AnalyticsEvent } from "../types";

const createEvent = (): AnalyticsEvent => ({
  event_name: "app_opened",
  event_id: "event-1",
  occurred_at: new Date().toISOString(),
  session_id: "session-1",
  props: {
    install_age_bucket: "0d",
    network_state: "offline",
  },
  app_version: "1.0.0",
  platform: "ios",
});

describe("Transport", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("retries on server errors and succeeds on a later attempt", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 202 });
    global.fetch = fetchMock as unknown as typeof fetch;

    const transport = new Transport({
      endpoint: "http://example.com/telemetry",
      maxRetries: 2,
      enabled: true,
    });

    const sendPromise = transport.send([createEvent()], "default");
    await Promise.resolve();
    await jest.runAllTimersAsync();

    const result = await sendPromise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.shouldRetry).toBe(false);
  });

  it("does not retry on client errors", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 400 });
    global.fetch = fetchMock as unknown as typeof fetch;

    const transport = new Transport({
      endpoint: "http://example.com/telemetry",
      maxRetries: 3,
      enabled: true,
    });

    const result = await transport.send([createEvent()], "default");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.shouldRetry).toBe(false);
    expect(result.statusCode).toBe(400);
  });
});
