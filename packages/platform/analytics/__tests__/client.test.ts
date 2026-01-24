/**
 * Analytics Client Integration Tests
 *
 * Covers offline queueing and retry handling for Phase 0.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnalyticsClient } from "../client";
import { Transport, TransportResult } from "../transport";

jest.mock("react-native", () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: { OS: "ios" },
}));

describe("AnalyticsClient", () => {
  const createClient = async (sendResult: TransportResult) => {
    const sendMock = jest
      .spyOn(Transport.prototype, "send")
      .mockResolvedValue(sendResult);
    const client = new AnalyticsClient({
      flushInterval: 60000,
      debugMode: false,
    });
    await client.initialize();
    return { client, sendMock };
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(async () => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    await AsyncStorage.clear();
  });

  it("queues events when offline and increments retry counts on failure", async () => {
    const { client } = await createClient({
      success: false,
      shouldRetry: true,
      error: "network down",
    });

    await client.log("app_opened", {
      install_age_bucket: "0d",
      network_state: "offline",
    });

    let stats = await client.getQueueStats();
    expect(stats.size).toBe(1);

    await client.flush();

    stats = await client.getQueueStats();
    expect(stats.size).toBe(1);
    expect(stats.retryDistribution).toHaveProperty("1", 1);

  });

  it("removes queued events after a successful flush", async () => {
    const { client, sendMock } = await createClient({
      success: true,
      shouldRetry: false,
    });

    await client.log("app_opened", {
      install_age_bucket: "1-7d",
      network_state: "online",
    });

    await client.flush();

    const stats = await client.getQueueStats();
    expect(stats.size).toBe(0);
    expect(sendMock).toHaveBeenCalledTimes(1);

  });
});
