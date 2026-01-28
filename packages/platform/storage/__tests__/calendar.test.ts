/**
 * Calendar Events Database Tests
 *
 * Comprehensive test suite for calendar event CRUD operations,
 * date-based queries, conflict detection, and statistics.
 *
 * @module calendar.test
 */

import { db } from "../database";
import { CalendarEvent } from "@aios/contracts/models/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("Calendar Events Database", () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  // Helper function to create a test event
  const createTestEvent = (
    overrides?: Partial<CalendarEvent>,
  ): CalendarEvent => ({
    id: "event-1",
    title: "Team Meeting",
    description: "Quarterly review meeting",
    location: "Conference Room A",
    startAt: "2024-03-15T10:00:00.000Z",
    endAt: "2024-03-15T11:00:00.000Z",
    allDay: false,
    timezone: "America/Los_Angeles",
    recurrenceRule: "none",
    exceptions: [],
    overrides: {},
    createdAt: "2024-03-10T08:00:00.000Z",
    updatedAt: "2024-03-10T08:00:00.000Z",
    source: "LOCAL",
    ...overrides,
  });

  describe("getAll", () => {
    it("should return empty array when no events exist", async () => {
      const events = await db.events.getAll();
      expect(events).toEqual([]);
    });

    it("should return all stored events", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1" }),
        createTestEvent({ id: "event-2", title: "Client Call" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getAll();
      expect(events).toHaveLength(2);
      expect(events[0].title).toBe("Team Meeting");
      expect(events[1].title).toBe("Client Call");
    });
  });

  describe("get", () => {
    it("should return event by id", async () => {
      const testEvents = [createTestEvent({ id: "event-1" })];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const event = await db.events.get("event-1");
      expect(event).toBeTruthy();
      expect(event?.title).toBe("Team Meeting");
    });

    it("should return null if event not found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      const event = await db.events.get("nonexistent");
      expect(event).toBeNull();
    });
  });

  describe("save", () => {
    it("should create a new event", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      const newEvent = createTestEvent();

      await db.events.save(newEvent);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/events",
        JSON.stringify([newEvent]),
      );
    });

    it("should update an existing event", async () => {
      const existingEvent = createTestEvent({
        id: "event-1",
        title: "Old Title",
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([existingEvent]),
      );

      const updatedEvent = { ...existingEvent, title: "New Title" };
      await db.events.save(updatedEvent);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/events",
        JSON.stringify([updatedEvent]),
      );
    });
  });

  describe("delete", () => {
    it("should delete an event by id", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1" }),
        createTestEvent({ id: "event-2" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      await db.events.delete("event-1");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/events",
        JSON.stringify([testEvents[1]]),
      );
    });

    it("should handle deleting non-existent event gracefully", async () => {
      const testEvents = [createTestEvent({ id: "event-1" })];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      await db.events.delete("nonexistent");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/events",
        JSON.stringify(testEvents),
      );
    });
  });

  describe("getForDate", () => {
    it("should return events for a specific date", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: "2024-03-15T10:00:00.000Z" }),
        createTestEvent({ id: "event-2", startAt: "2024-03-15T14:00:00.000Z" }),
        createTestEvent({ id: "event-3", startAt: "2024-03-16T10:00:00.000Z" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getForDate("2024-03-15");
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
    });

    it("should sort events by start time", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: "2024-03-15T14:00:00.000Z" }),
        createTestEvent({ id: "event-2", startAt: "2024-03-15T10:00:00.000Z" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getForDate("2024-03-15");
      expect(events[0].id).toBe("event-2"); // Earlier time
      expect(events[1].id).toBe("event-1"); // Later time
    });

    it("should return empty array if no events on date", async () => {
      const testEvents = [
        createTestEvent({ startAt: "2024-03-15T10:00:00.000Z" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getForDate("2024-03-16");
      expect(events).toEqual([]);
    });
  });

  describe("Recurring Expansion & Reminders", () => {
    it("should expand recurring events within a date range", async () => {
      const recurringEvent = createTestEvent({
        id: "event-recurring",
        startAt: "2024-03-10T09:00:00.000Z",
        endAt: "2024-03-10T10:00:00.000Z",
        recurrenceRule: "daily",
        exceptions: ["2024-03-12"],
        overrides: {
          "2024-03-13": { title: "Special Standup" },
        },
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([recurringEvent]),
      );

      const events = await db.events.getExpandedForDateRange(
        "2024-03-11T00:00:00.000Z",
        "2024-03-13T23:59:59.000Z",
      );

      const ids = events.map((event) => event.id);
      expect(ids).toHaveLength(2);
      expect(ids.some((id) => id.includes("2024-03-11"))).toBe(true);
      expect(ids.some((id) => id.includes("2024-03-12"))).toBe(false);
      expect(events.some((event) => event.title === "Special Standup")).toBe(
        true,
      );
    });

    it("should build reminder triggers for events in range", async () => {
      const event = createTestEvent({
        id: "event-reminder",
        startAt: "2024-03-20T12:00:00.000Z",
        endAt: "2024-03-20T13:00:00.000Z",
        reminderMinutes: [30],
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([event]),
      );

      const reminders = await db.events.getRemindersForDateRange(
        "2024-03-20T00:00:00.000Z",
        "2024-03-21T00:00:00.000Z",
      );

      expect(reminders).toHaveLength(1);
      expect(reminders[0].eventId).toBe("event-reminder");
      expect(reminders[0].reminderAt).toBe("2024-03-20T11:30:00.000Z");
    });
  });

  describe("getForWeek", () => {
    it("should return events for a 7-day period", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: "2024-03-15T10:00:00.000Z" }),
        createTestEvent({ id: "event-2", startAt: "2024-03-18T10:00:00.000Z" }),
        createTestEvent({ id: "event-3", startAt: "2024-03-22T10:00:00.000Z" }), // Outside week
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getForWeek("2024-03-15");
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
    });
  });

  describe("getForMonth", () => {
    it("should return events for a specific month", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: "2024-03-15T10:00:00.000Z" }),
        createTestEvent({ id: "event-2", startAt: "2024-03-25T10:00:00.000Z" }),
        createTestEvent({ id: "event-3", startAt: "2024-04-05T10:00:00.000Z" }), // Different month
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getForMonth(2024, 3);
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
    });

    it("should handle different years correctly", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: "2024-03-15T10:00:00.000Z" }),
        createTestEvent({ id: "event-2", startAt: "2025-03-15T10:00:00.000Z" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events2024 = await db.events.getForMonth(2024, 3);
      expect(events2024).toHaveLength(1);
      expect(events2024[0].id).toBe("event-1");

      const events2025 = await db.events.getForMonth(2025, 3);
      expect(events2025).toHaveLength(1);
      expect(events2025[0].id).toBe("event-2");
    });
  });

  describe("getForDateRange", () => {
    it("should return events within date range", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: "2024-03-15T10:00:00.000Z" }),
        createTestEvent({ id: "event-2", startAt: "2024-03-18T10:00:00.000Z" }),
        createTestEvent({ id: "event-3", startAt: "2024-03-25T10:00:00.000Z" }), // Outside range
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getForDateRange(
        "2024-03-15",
        "2024-03-20",
      );
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
    });

    it("should include end date (inclusive)", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: "2024-03-20T10:00:00.000Z" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getForDateRange(
        "2024-03-15",
        "2024-03-20",
      );
      expect(events).toHaveLength(1);
    });
  });

  describe("getUpcoming", () => {
    it("should return events in the next N days", async () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 8);

      const testEvents = [
        createTestEvent({ id: "event-1", startAt: tomorrow.toISOString() }),
        createTestEvent({ id: "event-2", startAt: nextWeek.toISOString() }), // Beyond 7 days
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getUpcoming(7);
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe("event-1");
    });

    it("should use 7 days as default", async () => {
      const now = new Date();
      const inThreeDays = new Date(now);
      inThreeDays.setDate(now.getDate() + 3);

      const testEvents = [
        createTestEvent({ id: "event-1", startAt: inThreeDays.toISOString() }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getUpcoming();
      expect(events).toHaveLength(1);
    });
  });

  describe("getDueToday", () => {
    it("should return events scheduled for today", async () => {
      const today = new Date().toISOString().split("T")[0];
      const testEvents = [
        createTestEvent({ id: "event-1", startAt: `${today}T10:00:00.000Z` }),
        createTestEvent({ id: "event-2", startAt: "2024-03-20T10:00:00.000Z" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getDueToday();
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe("event-1");
    });
  });

  describe("getAllDayEvents", () => {
    it("should return only all-day events for a date", async () => {
      const testEvents = [
        createTestEvent({
          id: "event-1",
          startAt: "2024-03-15T10:00:00.000Z",
          allDay: true,
        }),
        createTestEvent({
          id: "event-2",
          startAt: "2024-03-15T14:00:00.000Z",
          allDay: false,
        }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getAllDayEvents("2024-03-15");
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe("event-1");
    });
  });

  describe("getRecurring", () => {
    it("should return events with recurrence rules", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", recurrenceRule: "daily" }),
        createTestEvent({ id: "event-2", recurrenceRule: "weekly" }),
        createTestEvent({ id: "event-3", recurrenceRule: "none" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getRecurring();
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
    });

    it("should exclude events with 'none' recurrence", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", recurrenceRule: "none" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getRecurring();
      expect(events).toHaveLength(0);
    });
  });

  describe("search", () => {
    it("should search in title, description, and location", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", title: "Team Meeting" }),
        createTestEvent({ id: "event-2", description: "Discuss team goals" }),
        createTestEvent({ id: "event-3", location: "Team Room" }),
        createTestEvent({ id: "event-4", title: "Client Call" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.search("team");
      expect(events).toHaveLength(3);
      expect(events.map((e) => e.id).sort()).toEqual([
        "event-1",
        "event-2",
        "event-3",
      ]);
    });

    it("should be case-insensitive", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", title: "TEAM MEETING" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.search("team");
      expect(events).toHaveLength(1);
    });
  });

  describe("getByLocation", () => {
    it("should filter events by location", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1", location: "Conference Room A" }),
        createTestEvent({ id: "event-2", location: "Conference Room B" }),
        createTestEvent({ id: "event-3", location: "Office 123" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const events = await db.events.getByLocation("Conference");
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
    });
  });

  describe("getConflicts", () => {
    it("should detect overlapping events", async () => {
      const testEvents = [
        createTestEvent({
          id: "event-1",
          startAt: "2024-03-15T10:00:00.000Z",
          endAt: "2024-03-15T11:00:00.000Z",
        }),
        createTestEvent({
          id: "event-2",
          startAt: "2024-03-15T10:30:00.000Z",
          endAt: "2024-03-15T11:30:00.000Z",
        }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const conflicts = await db.events.getConflicts(
        "2024-03-15T10:15:00.000Z",
        "2024-03-15T10:45:00.000Z",
      );
      expect(conflicts).toHaveLength(2);
    });

    it("should not detect non-overlapping events", async () => {
      const testEvents = [
        createTestEvent({
          id: "event-1",
          startAt: "2024-03-15T10:00:00.000Z",
          endAt: "2024-03-15T11:00:00.000Z",
        }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const conflicts = await db.events.getConflicts(
        "2024-03-15T11:30:00.000Z",
        "2024-03-15T12:00:00.000Z",
      );
      expect(conflicts).toHaveLength(0);
    });

    it("should exclude specified event ID", async () => {
      const testEvents = [
        createTestEvent({
          id: "event-1",
          startAt: "2024-03-15T10:00:00.000Z",
          endAt: "2024-03-15T11:00:00.000Z",
        }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const conflicts = await db.events.getConflicts(
        "2024-03-15T10:30:00.000Z",
        "2024-03-15T11:30:00.000Z",
        "event-1",
      );
      expect(conflicts).toHaveLength(0);
    });
  });

  describe("getStats", () => {
    it("should return comprehensive statistics", async () => {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const testEvents = [
        createTestEvent({
          id: "event-1",
          startAt: `${todayStr}T10:00:00.000Z`,
          allDay: true,
        }),
        createTestEvent({
          id: "event-2",
          startAt: tomorrow.toISOString(),
          recurrenceRule: "daily",
        }),
        createTestEvent({ id: "event-3", startAt: "2024-01-15T10:00:00.000Z" }), // Past event
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      const stats = await db.events.getStats();
      expect(stats.totalEvents).toBe(3);
      expect(stats.todayEvents).toBe(1);
      expect(stats.allDayEvents).toBe(1);
      expect(stats.recurringEvents).toBe(1);
      expect(stats.upcomingEvents).toBeGreaterThanOrEqual(1);
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple events", async () => {
      const testEvents = [
        createTestEvent({ id: "event-1" }),
        createTestEvent({ id: "event-2" }),
        createTestEvent({ id: "event-3" }),
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      await db.events.bulkDelete(["event-1", "event-3"]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/events",
        JSON.stringify([testEvents[1]]),
      );
    });

    it("should handle empty array", async () => {
      const testEvents = [createTestEvent({ id: "event-1" })];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(testEvents),
      );

      await db.events.bulkDelete([]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/events",
        JSON.stringify(testEvents),
      );
    });
  });

  describe("duplicate", () => {
    it("should create a copy of an event", async () => {
      const originalEvent = createTestEvent({
        id: "event-1",
        title: "Original Event",
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([originalEvent]),
      );

      const duplicated = await db.events.duplicate("event-1");

      expect(duplicated).toBeTruthy();
      expect(duplicated?.title).toBe("Original Event (Copy)");
      expect(duplicated?.id).not.toBe(originalEvent.id);
      expect(duplicated?.description).toBe(originalEvent.description);
      expect(duplicated?.location).toBe(originalEvent.location);
    });

    it("should return null if event not found", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      const duplicated = await db.events.duplicate("nonexistent");
      expect(duplicated).toBeNull();
    });
  });
});
