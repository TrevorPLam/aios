/**
 * Analytics Storage Trustworthiness Tests
 *
 * Enhanced tests that verify actual behavior, not just side effects.
 * Fixes weak idempotency test identified in trust audit.
 */
import { MemStorage } from "../storage";
import { randomUUID } from "crypto";

describe("Analytics Storage - Enhanced Trustworthiness", () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe("Idempotency - Enhanced", () => {
    test("should skip duplicate events and log skip message", async () => {
      const eventId = randomUUID();
      const userId = randomUUID();
      const event = {
        eventId,
        eventName: "test_event",
        timestamp: new Date().toISOString(),
        properties: { test: true },
        identity: { userId },
      };

      // Spy on console to verify skip behavior
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // First save - should succeed
      await storage.saveAnalyticsEvents([event]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Saved 1 events"),
      );

      // Clear console spy
      consoleSpy.mockClear();

      // Second save - should skip duplicate
      await storage.saveAnalyticsEvents([event]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Skipping duplicate event"),
      );

      // Verify final count
      const saved = await storage.getAnalyticsEvents(userId);
      expect(saved).toHaveLength(1);

      // Cleanup
      consoleSpy.mockRestore();
    });

    test("should track creation timestamp separately from event timestamp", async () => {
      const eventId = randomUUID();
      const userId = randomUUID();
      const eventTimestamp = new Date("2024-01-01T00:00:00Z").toISOString();

      const event = {
        eventId,
        eventName: "test_event",
        timestamp: eventTimestamp,
        properties: {},
        identity: { userId },
      };

      const beforeSave = Date.now();
      await storage.saveAnalyticsEvents([event]);
      const afterSave = Date.now();

      const saved = await storage.getAnalyticsEvents(userId);
      expect(saved).toHaveLength(1);

      // Event timestamp should match what was provided
      expect(new Date(saved[0].timestamp).toISOString()).toBe(eventTimestamp);

      // CreatedAt should be when saved, not event timestamp
      const createdAt = new Date(saved[0].createdAt).getTime();
      expect(createdAt).toBeGreaterThanOrEqual(beforeSave);
      expect(createdAt).toBeLessThanOrEqual(afterSave);
    });

    test("should handle batch with mixed duplicates and new events", async () => {
      const userId = randomUUID();
      const existingEventId = randomUUID();
      const newEventId = randomUUID();

      // Save first event
      await storage.saveAnalyticsEvents([
        {
          eventId: existingEventId,
          eventName: "existing",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      // Spy on console
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // Save batch with duplicate and new
      await storage.saveAnalyticsEvents([
        {
          eventId: existingEventId, // Duplicate
          eventName: "existing",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
        {
          eventId: newEventId, // New
          eventName: "new",
          timestamp: new Date().toISOString(),
          properties: {},
          identity: { userId },
        },
      ]);

      // Should log skip message for duplicate
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Skipping duplicate event"),
      );

      // Should have 2 total events (not 3)
      const saved = await storage.getAnalyticsEvents(userId);
      expect(saved).toHaveLength(2);
      expect(saved.map((e) => e.eventName).sort()).toEqual(["existing", "new"]);

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases - Enhanced", () => {
    test("should handle rapid duplicate submissions", async () => {
      const eventId = randomUUID();
      const userId = randomUUID();
      const event = {
        eventId,
        eventName: "rapid_test",
        timestamp: new Date().toISOString(),
        properties: {},
        identity: { userId },
      };

      // Simulate rapid duplicate submissions
      await Promise.all([
        storage.saveAnalyticsEvents([event]),
        storage.saveAnalyticsEvents([event]),
        storage.saveAnalyticsEvents([event]),
      ]);

      // Should only have 1 event stored
      const saved = await storage.getAnalyticsEvents(userId);
      expect(saved).toHaveLength(1);
    });

    test("should preserve original event data on duplicate attempt", async () => {
      const eventId = randomUUID();
      const userId = randomUUID();
      const originalTimestamp = new Date("2024-01-01T00:00:00Z").toISOString();

      // Save original event
      await storage.saveAnalyticsEvents([
        {
          eventId,
          eventName: "original",
          timestamp: originalTimestamp,
          properties: { version: "1" },
          identity: { userId },
        },
      ]);

      // Attempt to save duplicate with different data
      await storage.saveAnalyticsEvents([
        {
          eventId, // Same ID
          eventName: "modified", // Different name
          timestamp: new Date().toISOString(), // Different timestamp
          properties: { version: "2" }, // Different properties
          identity: { userId },
        },
      ]);

      // Should keep original data, not modified
      const saved = await storage.getAnalyticsEvents(userId);
      expect(saved).toHaveLength(1);
      expect(saved[0].eventName).toBe("original");
      expect(saved[0].eventProperties).toEqual({ version: "1" });
    });
  });
});
