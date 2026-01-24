/**
 * Analytics Integration Tests
 *
 * Tests for Phase 0 analytics implementation:
 * - Storage methods (saveAnalyticsEvents, getAnalyticsEvents, deleteUserAnalytics)
 * - Event idempotency
 * - Filtering and querying
 * - GDPR deletion
 *
 * Token optimization: Use `glob_file_search` for file finding instead of broad searches
 */

import { MemStorage } from "../storage";
import { randomUUID } from "crypto";

describe("Analytics Storage", () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe("saveAnalyticsEvents", () => {
    test("should save single analytics event", async () => {
      const eventId = randomUUID();
      const userId = randomUUID();
      const events = [
        {
          eventId,
          eventName: "app_opened",
          timestamp: new Date().toISOString(),
          properties: { install_age_bucket: "0d", network_state: "wifi" },
          identity: { userId, sessionId: "session-1", deviceId: "device-1" },
          appVersion: "1.0.0",
          platform: "ios",
        },
      ];

      await storage.saveAnalyticsEvents(events);
      const saved = await storage.getAnalyticsEvents(userId);

      expect(saved).toHaveLength(1);
      expect(saved[0].eventName).toBe("app_opened");
      expect(saved[0].userId).toBe(userId);
      expect(saved[0].sessionId).toBe("session-1");
      expect(saved[0].deviceId).toBe("device-1");
      expect(saved[0].appVersion).toBe("1.0.0");
      expect(saved[0].platform).toBe("ios");
      expect(saved[0].eventProperties).toEqual({
        install_age_bucket: "0d",
        network_state: "wifi",
      });
    });

    test("should save batch of events", async () => {
      const userId = randomUUID();
      const events = Array.from({ length: 50 }, (_, i) => ({
        eventId: randomUUID(),
        eventName: `event_${i}`,
        timestamp: new Date().toISOString(),
        properties: { index: i },
        identity: { userId },
      }));

      await storage.saveAnalyticsEvents(events);
      const saved = await storage.getAnalyticsEvents(userId);

      expect(saved).toHaveLength(50);
    });

    test("should skip duplicate events (idempotency)", async () => {
      const eventId = randomUUID();
      const userId = randomUUID();
      const event = {
        eventId,
        eventName: "test_event",
        timestamp: new Date().toISOString(),
        properties: { test: true },
        identity: { userId },
      };

      // Save same event twice
      await storage.saveAnalyticsEvents([event]);
      await storage.saveAnalyticsEvents([event]); // Duplicate

      const saved = await storage.getAnalyticsEvents(userId);
      expect(saved).toHaveLength(1); // Not 2
    });

    test("should handle events without optional fields", async () => {
      const userId = randomUUID();
      const events = [
        {
          eventId: randomUUID(),
          eventName: "minimal_event",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
      ];

      await storage.saveAnalyticsEvents(events);
      const saved = await storage.getAnalyticsEvents(userId);

      expect(saved).toHaveLength(1);
      expect(saved[0].sessionId).toBeNull();
      expect(saved[0].deviceId).toBeNull();
      expect(saved[0].appVersion).toBeNull();
      expect(saved[0].platform).toBeNull();
    });
  });

  describe("getAnalyticsEvents", () => {
    test("should filter events by date range", async () => {
      const userId = randomUUID();
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      await storage.saveAnalyticsEvents([
        {
          eventId: randomUUID(),
          eventName: "old_event",
          timestamp: twoDaysAgo.toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "yesterday_event",
          timestamp: yesterday.toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "today_event",
          timestamp: now.toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      // Get events from yesterday onwards
      const recentEvents = await storage.getAnalyticsEvents(userId, {
        startDate: new Date(yesterday.getTime() - 1000), // Slightly before yesterday
      });

      expect(recentEvents).toHaveLength(2);
      expect(recentEvents.map((e) => e.eventName)).toContain("yesterday_event");
      expect(recentEvents.map((e) => e.eventName)).toContain("today_event");
      expect(recentEvents.map((e) => e.eventName)).not.toContain("old_event");
    });

    test("should filter events by event names", async () => {
      const userId = randomUUID();
      await storage.saveAnalyticsEvents([
        {
          eventId: randomUUID(),
          eventName: "app_opened",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "module_opened",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "item_created",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      const filteredEvents = await storage.getAnalyticsEvents(userId, {
        eventNames: ["app_opened", "module_opened"],
      });

      expect(filteredEvents).toHaveLength(2);
      expect(filteredEvents.map((e) => e.eventName)).toContain("app_opened");
      expect(filteredEvents.map((e) => e.eventName)).toContain("module_opened");
      expect(filteredEvents.map((e) => e.eventName)).not.toContain(
        "item_created",
      );
    });

    test("should apply limit", async () => {
      const userId = randomUUID();
      const events = Array.from({ length: 20 }, (_, i) => ({
        eventId: randomUUID(),
        eventName: `event_${i}`,
        timestamp: new Date().toISOString(),
        properties: {},
        identity: { userId },
      }));

      await storage.saveAnalyticsEvents(events);
      const limited = await storage.getAnalyticsEvents(userId, { limit: 5 });

      expect(limited).toHaveLength(5);
    });

    test("should sort by timestamp descending (newest first)", async () => {
      const userId = randomUUID();
      const now = new Date();

      await storage.saveAnalyticsEvents([
        {
          eventId: randomUUID(),
          eventName: "event_1",
          timestamp: new Date(now.getTime() - 3000).toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "event_2",
          timestamp: new Date(now.getTime() - 2000).toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "event_3",
          timestamp: new Date(now.getTime() - 1000).toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      const sorted = await storage.getAnalyticsEvents(userId);

      expect(sorted).toHaveLength(3);
      expect(sorted[0].eventName).toBe("event_3"); // Newest
      expect(sorted[1].eventName).toBe("event_2");
      expect(sorted[2].eventName).toBe("event_1"); // Oldest
    });

    test("should only return events for specific user", async () => {
      const user1 = randomUUID();
      const user2 = randomUUID();

      await storage.saveAnalyticsEvents([
        {
          eventId: randomUUID(),
          eventName: "user1_event",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId: user1 },
        },
        {
          eventId: randomUUID(),
          eventName: "user2_event",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId: user2 },
        },
      ]);

      const user1Events = await storage.getAnalyticsEvents(user1);
      const user2Events = await storage.getAnalyticsEvents(user2);

      expect(user1Events).toHaveLength(1);
      expect(user1Events[0].eventName).toBe("user1_event");
      expect(user2Events).toHaveLength(1);
      expect(user2Events[0].eventName).toBe("user2_event");
    });
  });

  describe("deleteUserAnalytics (GDPR)", () => {
    test("should delete all events for specific user", async () => {
      const user1 = randomUUID();
      const user2 = randomUUID();

      // Create events for both users
      await storage.saveAnalyticsEvents([
        {
          eventId: randomUUID(),
          eventName: "user1_event_1",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId: user1 },
        },
        {
          eventId: randomUUID(),
          eventName: "user1_event_2",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId: user1 },
        },
        {
          eventId: randomUUID(),
          eventName: "user2_event",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId: user2 },
        },
      ]);

      // Delete user1's events
      await storage.deleteUserAnalytics(user1);

      // Verify user1 has no events
      const user1Events = await storage.getAnalyticsEvents(user1);
      expect(user1Events).toHaveLength(0);

      // Verify user2 still has events
      const user2Events = await storage.getAnalyticsEvents(user2);
      expect(user2Events).toHaveLength(1);
      expect(user2Events[0].eventName).toBe("user2_event");
    });

    test("should handle deletion when no events exist", async () => {
      const userId = randomUUID();

      // Should not throw
      await expect(
        storage.deleteUserAnalytics(userId),
      ).resolves.toBeUndefined();

      // Verify still no events
      const events = await storage.getAnalyticsEvents(userId);
      expect(events).toHaveLength(0);
    });
  });

  describe("Combined scenarios", () => {
    test("should handle complex filtering with date range, event names, and limit", async () => {
      const userId = randomUUID();
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      await storage.saveAnalyticsEvents([
        {
          eventId: randomUUID(),
          eventName: "app_opened",
          timestamp: yesterday.toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "module_opened",
          timestamp: yesterday.toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "app_opened",
          timestamp: now.toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "module_opened",
          timestamp: now.toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: randomUUID(),
          eventName: "item_created",
          timestamp: now.toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      const filtered = await storage.getAnalyticsEvents(userId, {
        startDate: new Date(yesterday.getTime() + 1000), // After yesterday events
        eventNames: ["app_opened", "module_opened"],
        limit: 1,
      });

      expect(filtered).toHaveLength(1);
      // Should be the newest event matching filters
      expect(["app_opened", "module_opened"]).toContain(filtered[0].eventName);
    });

    test("should handle batch save with mixed duplicate and new events", async () => {
      const userId = randomUUID();
      const event1Id = randomUUID();
      const event2Id = randomUUID();

      // First batch
      await storage.saveAnalyticsEvents([
        {
          eventId: event1Id,
          eventName: "event_1",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      // Second batch with duplicate and new event
      await storage.saveAnalyticsEvents([
        {
          eventId: event1Id, // Duplicate
          eventName: "event_1",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: event2Id, // New
          eventName: "event_2",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      const saved = await storage.getAnalyticsEvents(userId);
      expect(saved).toHaveLength(2); // Not 3
      expect(saved.map((e) => e.eventName).sort()).toEqual([
        "event_1",
        "event_2",
      ]);
    });
  });
});

/**
 * Analytics Integration Tests (E2E)
 *
 * Tests for Phase 0 analytics implementation end-to-end:
 * - Client sends events → Server receives → DB persists
 * - Batch sending (50 events)
 * - Error handling (bad payload returns 400)
 * - GDPR deletion via storage
 */
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { registerRoutes } from "../routes";
import { generateToken } from "../middleware/auth";
import { storage } from "../storage";

process.env.JWT_SECRET = "test-jwt-secret-for-analytics-e2e-tests";

describe("Analytics Integration (E2E)", () => {
  let server: Server;
  let baseUrl: string;
  let testUserId: string;
  let testToken: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());

    server = await registerRoutes(app);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    // Create test user and token
    testUserId = randomUUID();
    testToken = generateToken({
      userId: testUserId,
      username: "test_user",
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        resolve();
      });
    });
  });

  beforeEach(async () => {
    // Clear analytics events before each test
    await storage.deleteUserAnalytics(testUserId);
  });

  describe("E2E: Client → Server → Storage", () => {
    test("should accept events from client and persist to storage", async () => {
      const eventId = randomUUID();
      const payload = {
        events: [
          {
            eventId,
            eventName: "app_opened",
            timestamp: new Date().toISOString(),
            properties: { install_age_bucket: "0d", network_state: "wifi" },
            identity: {
              userId: testUserId,
              sessionId: "session-123",
              deviceId: "device-456",
            },
            appVersion: "1.0.0",
            platform: "ios",
          },
        ],
        schemaVersion: "1.0.0",
        mode: "default",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(202);
      const responseBody = await response.json();
      expect(responseBody.received).toBe(1);
      expect(responseBody.schemaVersion).toBe("1.0.0");

      // Verify event was persisted
      const saved = await storage.getAnalyticsEvents(testUserId);
      expect(saved).toHaveLength(1);
      expect(saved[0].eventName).toBe("app_opened");
      expect(saved[0].userId).toBe(testUserId);
      expect(saved[0].sessionId).toBe("session-123");
      expect(saved[0].deviceId).toBe("device-456");
    });

    test("should handle batch of 50 events", async () => {
      const events = Array.from({ length: 50 }, (_, i) => ({
        eventId: randomUUID(),
        eventName: `event_${i}`,
        timestamp: new Date().toISOString(),
        properties: { index: i },
        identity: { userId: testUserId },
      }));

      const payload = {
        events,
        schemaVersion: "1.0.0",
        mode: "default",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(202);
      const responseBody = await response.json();
      expect(responseBody.received).toBe(50);

      // Verify all events were persisted
      const saved = await storage.getAnalyticsEvents(testUserId);
      expect(saved).toHaveLength(50);
    });
  });

  describe("Error Handling", () => {
    test("should return 400 for invalid payload (missing required fields)", async () => {
      const invalidPayload = {
        events: [
          {
            // Missing eventId, eventName, timestamp, properties, identity
            appVersion: "1.0.0",
          },
        ],
        schemaVersion: "1.0.0",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify(invalidPayload),
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for invalid eventId (not UUID)", async () => {
      const invalidPayload = {
        events: [
          {
            eventId: "not-a-uuid",
            eventName: "app_opened",
            timestamp: new Date().toISOString(),
            properties: {},
            identity: { userId: testUserId },
          },
        ],
        schemaVersion: "1.0.0",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify(invalidPayload),
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for invalid timestamp (not ISO datetime)", async () => {
      const invalidPayload = {
        events: [
          {
            eventId: randomUUID(),
            eventName: "app_opened",
            timestamp: "not-a-datetime",
            properties: {},
            identity: { userId: testUserId },
          },
        ],
        schemaVersion: "1.0.0",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify(invalidPayload),
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for batch exceeding max size (101 events)", async () => {
      const events = Array.from({ length: 101 }, (_, i) => ({
        eventId: randomUUID(),
        eventName: `event_${i}`,
        timestamp: new Date().toISOString(),
        properties: {},
        identity: { userId: testUserId },
      }));

      const payload = {
        events,
        schemaVersion: "1.0.0",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });

    test("should return 400 for empty batch", async () => {
      const payload = {
        events: [],
        schemaVersion: "1.0.0",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(400);
    });

    test("should return 401 for missing authentication token", async () => {
      const payload = {
        events: [
          {
            eventId: randomUUID(),
            eventName: "app_opened",
            timestamp: new Date().toISOString(),
            properties: {},
            identity: { userId: testUserId },
          },
        ],
        schemaVersion: "1.0.0",
      };

      const response = await fetch(`${baseUrl}/api/telemetry/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // No Authorization header
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GDPR Deletion", () => {
    test("should delete all user analytics events", async () => {
      // Create events for test user
      await storage.saveAnalyticsEvents([
        {
          eventId: randomUUID(),
          eventName: "event_1",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId: testUserId },
        },
        {
          eventId: randomUUID(),
          eventName: "event_2",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId: testUserId },
        },
      ]);

      // Verify events exist
      let saved = await storage.getAnalyticsEvents(testUserId);
      expect(saved).toHaveLength(2);

      // Delete all user analytics
      await storage.deleteUserAnalytics(testUserId);

      // Verify events are deleted
      saved = await storage.getAnalyticsEvents(testUserId);
      expect(saved).toHaveLength(0);
    });
  });
});
