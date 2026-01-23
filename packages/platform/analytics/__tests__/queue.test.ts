/**
 * Queue Tests
 *
 * Tests for event queue behavior including backpressure and compaction
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventQueue } from "../queue";
import { AnalyticsEvent } from "../types";

describe("EventQueue", () => {
  let queue: EventQueue;

  const createMockEvent = (id: string): AnalyticsEvent => ({
    event_name: "item_created",
    event_id: id,
    occurred_at: new Date().toISOString(),
    session_id: "test_session",
    props: {
      module_id: "notebook",
      item_type: "note",
    },
    app_version: "1.0.0",
    platform: "ios",
  });

  beforeEach(async () => {
    await AsyncStorage.clear();
    queue = new EventQueue({ maxSize: 10 });
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  describe("enqueue", () => {
    it("should enqueue events successfully", async () => {
      const event = createMockEvent("test_1");
      const result = await queue.enqueue(event);

      expect(result).toBe(true);
      const size = await queue.size();
      expect(size).toBe(1);
    });

    it("should persist events to storage", async () => {
      const event = createMockEvent("test_1");
      await queue.enqueue(event);

      // Create new queue instance to test persistence
      const newQueue = new EventQueue({ maxSize: 10 });
      const size = await newQueue.size();
      expect(size).toBe(1);
    });

    it("should apply compaction when approaching capacity", async () => {
      // Fill queue close to capacity
      for (let i = 0; i < 10; i++) {
        await queue.enqueue(createMockEvent(`event_${i}`));
      }

      // Queue should have compacted and be less than maxSize
      const size = await queue.size();
      expect(size).toBeLessThan(10);
      expect(size).toBeGreaterThanOrEqual(8); // Should be around 8-9 after compaction

      // Should still be able to enqueue more events (compaction makes room)
      const result = await queue.enqueue(createMockEvent("more"));
      expect(result).toBe(true);
    });

    it("should compact queue when approaching capacity", async () => {
      // Fill queue to 90% (9 out of 10)
      for (let i = 0; i < 9; i++) {
        await queue.enqueue(createMockEvent(`event_${i}`));
      }

      const sizeBefore = await queue.size();
      expect(sizeBefore).toBe(9);

      // Enqueue one more to trigger compaction
      await queue.enqueue(createMockEvent("trigger_compact"));

      const sizeAfter = await queue.size();
      // Should have compacted (removed 20% of 9 = 1 event) and added 1
      expect(sizeAfter).toBeLessThan(10);
    });
  });

  describe("dequeue", () => {
    it("should dequeue events in batches", async () => {
      // Add 5 events
      for (let i = 0; i < 5; i++) {
        await queue.enqueue(createMockEvent(`event_${i}`));
      }

      // Dequeue batch of 3
      const batch = await queue.dequeue(3);
      expect(batch).toHaveLength(3);
      expect(batch[0].event.event_id).toBe("event_0");
      expect(batch[1].event.event_id).toBe("event_1");
      expect(batch[2].event.event_id).toBe("event_2");

      // Queue size should still be 5 (dequeue doesn't remove)
      const size = await queue.size();
      expect(size).toBe(5);
    });

    it("should return empty array when queue is empty", async () => {
      const batch = await queue.dequeue(10);
      expect(batch).toHaveLength(0);
    });
  });

  describe("remove", () => {
    it("should remove events from queue", async () => {
      // Add 3 events
      await queue.enqueue(createMockEvent("event_1"));
      await queue.enqueue(createMockEvent("event_2"));
      await queue.enqueue(createMockEvent("event_3"));

      // Dequeue and remove first 2
      const batch = await queue.dequeue(2);
      await queue.remove(batch);

      const size = await queue.size();
      expect(size).toBe(1);
    });
  });

  describe("incrementRetryCount", () => {
    it("should increment retry count for events", async () => {
      await queue.enqueue(createMockEvent("event_1"));

      const batch = await queue.dequeue(1);
      expect(batch[0].retryCount).toBe(0);

      await queue.incrementRetryCount(batch);

      const newBatch = await queue.dequeue(1);
      expect(newBatch[0].retryCount).toBe(1);
    });
  });

  describe("removeFailedEvents", () => {
    it("should remove events exceeding max retries", async () => {
      await queue.enqueue(createMockEvent("event_1"));
      await queue.enqueue(createMockEvent("event_2"));

      // Increment retry count for first event to exceed max
      const batch1 = await queue.dequeue(1);
      await queue.incrementRetryCount(batch1);
      await queue.incrementRetryCount(batch1);
      await queue.incrementRetryCount(batch1);
      await queue.incrementRetryCount(batch1);

      const removed = await queue.removeFailedEvents(3);
      expect(removed).toBe(1);

      const size = await queue.size();
      expect(size).toBe(1);
    });
  });

  describe("clear", () => {
    it("should clear all events from queue", async () => {
      await queue.enqueue(createMockEvent("event_1"));
      await queue.enqueue(createMockEvent("event_2"));

      await queue.clear();

      const size = await queue.size();
      expect(size).toBe(0);
    });
  });

  describe("getStats", () => {
    it("should return queue statistics", async () => {
      await queue.enqueue(createMockEvent("event_1"));
      await queue.enqueue(createMockEvent("event_2"));

      const batch = await queue.dequeue(1);
      await queue.incrementRetryCount(batch);

      const stats = await queue.getStats();

      expect(stats.size).toBe(2);
      expect(stats.oldestTimestamp).toBeDefined();
      expect(stats.newestTimestamp).toBeDefined();
      expect(stats.retryDistribution).toHaveProperty("0");
      expect(stats.retryDistribution).toHaveProperty("1");
    });
  });
});
