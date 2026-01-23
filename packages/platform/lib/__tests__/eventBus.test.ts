/**
 * Event Bus Tests
 *
 * Tests for cross-module event communication system.
 */

import { eventBus, EVENT_TYPES, EventPayload } from "../eventBus";

describe("EventBus", () => {
  beforeEach(() => {
    // Clear all listeners and history before each test
    eventBus.removeAllListeners();
    eventBus.clearHistory();
  });

  describe("Basic Pub/Sub", () => {
    it("should allow subscribing to events", () => {
      const listener = jest.fn();
      const unsubscribe = eventBus.on(EVENT_TYPES.TASK_CREATED, listener);

      expect(typeof unsubscribe).toBe("function");
    });

    it("should call listener when event is emitted", () => {
      const listener = jest.fn();
      eventBus.on(EVENT_TYPES.TASK_CREATED, listener);

      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: EVENT_TYPES.TASK_CREATED,
          data: { taskId: "123" },
        }),
      );
    });

    it("should not call listener after unsubscribing", () => {
      const listener = jest.fn();
      const unsubscribe = eventBus.on(EVENT_TYPES.TASK_CREATED, listener);

      unsubscribe();
      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should support multiple listeners for same event", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      eventBus.on(EVENT_TYPES.TASK_CREATED, listener1);
      eventBus.on(EVENT_TYPES.TASK_CREATED, listener2);

      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("should not call listeners for different event types", () => {
      const taskListener = jest.fn();
      const noteListener = jest.fn();

      eventBus.on(EVENT_TYPES.TASK_CREATED, taskListener);
      eventBus.on(EVENT_TYPES.NOTE_CREATED, noteListener);

      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });

      expect(taskListener).toHaveBeenCalledTimes(1);
      expect(noteListener).not.toHaveBeenCalled();
    });
  });

  describe("Event Payload", () => {
    it("should include timestamp in event payload", () => {
      const listener = jest.fn();
      eventBus.on(EVENT_TYPES.TASK_CREATED, listener);

      const beforeEmit = new Date().toISOString();
      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });
      const afterEmit = new Date().toISOString();

      const payload: EventPayload = listener.mock.calls[0][0];
      expect(payload.timestamp).toBeDefined();
      expect(payload.timestamp >= beforeEmit).toBe(true);
      expect(payload.timestamp <= afterEmit).toBe(true);
    });

    it("should include moduleId when provided", () => {
      const listener = jest.fn();
      eventBus.on(EVENT_TYPES.TASK_CREATED, listener);

      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" }, "planner");

      const payload: EventPayload = listener.mock.calls[0][0];
      expect(payload.moduleId).toBe("planner");
    });

    it("should handle empty data object", () => {
      const listener = jest.fn();
      eventBus.on(EVENT_TYPES.APP_FOREGROUNDED, listener);

      eventBus.emit(EVENT_TYPES.APP_FOREGROUNDED, {});

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {},
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should catch errors in listeners and continue", () => {
      const errorListener = jest.fn(() => {
        throw new Error("Test error");
      });
      const normalListener = jest.fn();

      eventBus.on(EVENT_TYPES.TASK_CREATED, errorListener);
      eventBus.on(EVENT_TYPES.TASK_CREATED, normalListener);

      // Should not throw
      expect(() => {
        eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });
      }).not.toThrow();

      // Normal listener should still be called
      expect(normalListener).toHaveBeenCalledTimes(1);
    });

    it("should catch errors in async listeners", async () => {
      const asyncErrorListener = jest.fn(async () => {
        throw new Error("Async test error");
      });
      const normalListener = jest.fn();

      eventBus.on(EVENT_TYPES.TASK_CREATED, asyncErrorListener);
      eventBus.on(EVENT_TYPES.TASK_CREATED, normalListener);

      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });

      // Normal listener should be called immediately
      expect(normalListener).toHaveBeenCalledTimes(1);

      // Wait for async errors to be handled
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should not crash the app
      expect(asyncErrorListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Event History", () => {
    it("should store events in history", () => {
      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });
      eventBus.emit(EVENT_TYPES.NOTE_CREATED, { noteId: "456" });

      const history = eventBus.getRecentEvents(10);

      expect(history).toHaveLength(2);
      expect(history[0].eventType).toBe(EVENT_TYPES.TASK_CREATED);
      expect(history[1].eventType).toBe(EVENT_TYPES.NOTE_CREATED);
    });

    it("should limit history size", () => {
      // Emit 150 events (max is 100)
      for (let i = 0; i < 150; i++) {
        eventBus.emit(EVENT_TYPES.USER_ACTION, { count: i });
      }

      const history = eventBus.getRecentEvents(200);

      expect(history.length).toBeLessThanOrEqual(100);
    });

    it("should return requested number of recent events", () => {
      for (let i = 0; i < 20; i++) {
        eventBus.emit(EVENT_TYPES.USER_ACTION, { count: i });
      }

      const recent5 = eventBus.getRecentEvents(5);

      expect(recent5).toHaveLength(5);
      // Should return most recent (15-19)
      expect(recent5[4].data.count).toBe(19);
    });

    it("should clear history", () => {
      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });
      eventBus.emit(EVENT_TYPES.NOTE_CREATED, { noteId: "456" });

      eventBus.clearHistory();

      const history = eventBus.getRecentEvents(10);
      expect(history).toHaveLength(0);
    });
  });

  describe("Listener Management", () => {
    it("should track listener counts", () => {
      eventBus.on(EVENT_TYPES.TASK_CREATED, jest.fn());
      eventBus.on(EVENT_TYPES.TASK_CREATED, jest.fn());
      eventBus.on(EVENT_TYPES.NOTE_CREATED, jest.fn());

      const counts = eventBus.getListenerCounts();

      expect(counts.get(EVENT_TYPES.TASK_CREATED)).toBe(2);
      expect(counts.get(EVENT_TYPES.NOTE_CREATED)).toBe(1);
    });

    it("should remove all listeners for event type", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      eventBus.on(EVENT_TYPES.TASK_CREATED, listener1);
      eventBus.on(EVENT_TYPES.TASK_CREATED, listener2);

      eventBus.removeAllListeners(EVENT_TYPES.TASK_CREATED);
      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it("should remove all listeners for all events", () => {
      const taskListener = jest.fn();
      const noteListener = jest.fn();

      eventBus.on(EVENT_TYPES.TASK_CREATED, taskListener);
      eventBus.on(EVENT_TYPES.NOTE_CREATED, noteListener);

      eventBus.removeAllListeners();

      eventBus.emit(EVENT_TYPES.TASK_CREATED, { taskId: "123" });
      eventBus.emit(EVENT_TYPES.NOTE_CREATED, { noteId: "456" });

      expect(taskListener).not.toHaveBeenCalled();
      expect(noteListener).not.toHaveBeenCalled();
    });
  });

  describe("Real-world Scenarios", () => {
    it("should support calendar event created → multiple module suggestions", () => {
      const mapsListener = jest.fn(); // Maps suggests directions
      const foodListener = jest.fn(); // Food suggests restaurant
      const walletListener = jest.fn(); // Wallet suggests bill split

      eventBus.on(EVENT_TYPES.CALENDAR_EVENT_CREATED, mapsListener);
      eventBus.on(EVENT_TYPES.CALENDAR_EVENT_CREATED, foodListener);
      eventBus.on(EVENT_TYPES.CALENDAR_EVENT_CREATED, walletListener);

      eventBus.emit(
        EVENT_TYPES.CALENDAR_EVENT_CREATED,
        {
          eventId: "123",
          title: "Dinner with Sarah",
          location: "Downtown Restaurant",
        },
        "calendar",
      );

      expect(mapsListener).toHaveBeenCalledTimes(1);
      expect(foodListener).toHaveBeenCalledTimes(1);
      expect(walletListener).toHaveBeenCalledTimes(1);
    });

    it("should support navigation tracking", () => {
      const analyticsListener = jest.fn();

      eventBus.on(EVENT_TYPES.MODULE_OPENED, analyticsListener);

      eventBus.emit(
        EVENT_TYPES.MODULE_OPENED,
        { moduleId: "notebook", screen: "NotebookScreen" },
        "notebook",
      );

      expect(analyticsListener).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: EVENT_TYPES.MODULE_OPENED,
          data: expect.objectContaining({ moduleId: "notebook" }),
          moduleId: "notebook",
        }),
      );
    });
  });
});
