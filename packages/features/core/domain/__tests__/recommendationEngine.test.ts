/**
 * Recommendation Engine Tests
 *
 * Comprehensive test suite for the AI recommendation generation engine.
 * Tests include:
 * - Rule condition evaluation
 * - Recommendation generation logic
 * - Deduplication mechanisms
 * - Cross-module data analysis
 * - Edge cases and error handling
 *
 * @module RecommendationEngineTests
 */

import { RecommendationEngine } from "../recommendationEngine";
import { db } from "@platform/storage/database";
import { Note, Task, CalendarEvent } from "@contracts/models/types";

// Mock the database
jest.mock("@platform/storage/database", () => ({
  db: {
    notes: {
      getAll: jest.fn(),
    },
    tasks: {
      getAll: jest.fn(),
    },
    events: {
      getAll: jest.fn(),
    },
    decisions: {
      getAll: jest.fn(),
    },
    recommendations: {
      getAll: jest.fn(),
      save: jest.fn(),
      updateStatus: jest.fn(),
    },
  },
}));

/**
 * Test Utilities
 */
let RealDate: typeof Date;

/**
 * Mock Date to return a specific date
 */
function mockDateTo(targetDate: Date): void {
  RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(targetDate.getTime());
      } else {
        // @ts-expect-error - Spread args to super is safe here, constructor signature is complex
        super(...args);
      }
    }
    static now() {
      return targetDate.getTime();
    }
  } as any;
}

/**
 * Restore the original Date implementation
 */
function restoreDate(): void {
  if (RealDate) {
    global.Date = RealDate;
  }
}

describe("RecommendationEngine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default empty data
    (db.notes.getAll as jest.Mock).mockResolvedValue([]);
    (db.tasks.getAll as jest.Mock).mockResolvedValue([]);
    (db.events.getAll as jest.Mock).mockResolvedValue([]);
    (db.decisions.getAll as jest.Mock).mockResolvedValue([]);
    (db.recommendations.getAll as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    restoreDate();
  });

  describe("generateRecommendations", () => {
    it("should return empty array when no conditions are met", async () => {
      // Mock current date to be a Tuesday (weekday, not weekend)
      mockDateTo(new Date("2024-01-16T10:00:00Z"));

      const recommendations =
        await RecommendationEngine.generateRecommendations();
      expect(recommendations).toEqual([]);
    });

    it("should generate meeting notes recommendation for recent events", async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 5);

      const mockEvent: CalendarEvent = {
        id: "event1",
        title: "Team Standup",
        startAt: yesterday.toISOString(),
        endAt: yesterday.toISOString(),
        allDay: false,
        timezone: "UTC",
        exceptions: [],
        overrides: {},
        source: "LOCAL",
        location: "",
        description: "",
        recurrenceRule: "none",
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      };

      (db.events.getAll as jest.Mock).mockResolvedValue([mockEvent]);
      (db.notes.getAll as jest.Mock).mockResolvedValue([]);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      const meetingNoteRec = recommendations.find((r) =>
        r.title.includes("Team Standup"),
      );
      expect(meetingNoteRec).toBeDefined();
      expect(meetingNoteRec?.module).toBe("notebook");
      expect(meetingNoteRec?.type).toBe("note_suggestion");
    });

    it("should not suggest meeting notes if note already exists", async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 5);

      const mockEvent: CalendarEvent = {
        id: "event1",
        title: "Team Standup",
        startAt: yesterday.toISOString(),
        endAt: yesterday.toISOString(),
        allDay: false,
        timezone: "UTC",
        exceptions: [],
        overrides: {},
        source: "LOCAL",
        location: "",
        description: "",
        recurrenceRule: "none",
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      };

      const mockNote: Note = {
        id: "note1",
        title: "Team Standup Notes",
        bodyMarkdown: "Meeting notes",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        links: [],
      };

      (db.events.getAll as jest.Mock).mockResolvedValue([mockEvent]);
      (db.notes.getAll as jest.Mock).mockResolvedValue([mockNote]);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      const meetingNoteRec = recommendations.find((r) =>
        r.title.includes("Team Standup"),
      );
      expect(meetingNoteRec).toBeUndefined();
    });

    it("should generate task breakdown recommendation for stale tasks", async () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const mockTask: Task = {
        id: "task1",
        title: "Complete API integration",
        status: "pending",
        priority: "high",
        dueDate: null,

        userNotes: "",
        aiNotes: [],
        createdAt: fiveDaysAgo.toISOString(),
        updatedAt: fiveDaysAgo.toISOString(),
        parentTaskId: null,
        projectId: null,
        recurrenceRule: "none",
        dependencyIds: [],
      };

      (db.tasks.getAll as jest.Mock).mockResolvedValue([mockTask]);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      const breakdownRec = recommendations.find((r) =>
        r.title.includes("Break down"),
      );
      expect(breakdownRec).toBeDefined();
      expect(breakdownRec?.module).toBe("planner");
      expect(breakdownRec?.priority).toBe("high");
    });

    it("should generate focus time recommendation for multiple high-priority tasks", async () => {
      const mockTasks: Task[] = [
        {
          id: "task1",
          title: "High priority task 1",
          status: "pending",
          priority: "high",
          dueDate: null,

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
        {
          id: "task2",
          title: "High priority task 2",
          status: "pending",
          priority: "urgent",
          dueDate: null,

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
      ];

      (db.tasks.getAll as jest.Mock).mockResolvedValue(mockTasks);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      const focusTimeRec = recommendations.find((r) =>
        r.title.includes("focus time"),
      );
      expect(focusTimeRec).toBeDefined();
      expect(focusTimeRec?.module).toBe("calendar");
      expect(focusTimeRec?.confidence).toBe("high");
    });

    it("should not suggest focus time if already scheduled", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockTasks: Task[] = [
        {
          id: "task1",
          title: "High priority task 1",
          status: "pending",
          priority: "high",
          dueDate: null,

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
        {
          id: "task2",
          title: "High priority task 2",
          status: "pending",
          priority: "urgent",
          dueDate: null,

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
      ];

      const mockEvent: CalendarEvent = {
        id: "event1",
        title: "Focus Time",
        startAt: tomorrow.toISOString(),
        endAt: tomorrow.toISOString(),
        allDay: false,
        timezone: "UTC",
        exceptions: [],
        overrides: {},
        source: "LOCAL",
        location: "",
        description: "",
        recurrenceRule: "none",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (db.tasks.getAll as jest.Mock).mockResolvedValue(mockTasks);
      (db.events.getAll as jest.Mock).mockResolvedValue([mockEvent]);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      const focusTimeRec = recommendations.find((r) =>
        r.title.includes("focus time"),
      );
      expect(focusTimeRec).toBeUndefined();
    });

    it("should generate weekly reflection on weekends", async () => {
      // Mock current date to be a Saturday
      mockDateTo(new Date("2024-01-20T10:00:00Z"));

      (db.notes.getAll as jest.Mock).mockResolvedValue([]);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      const reflectionRec = recommendations.find((r) =>
        r.title.includes("Weekly reflection"),
      );
      expect(reflectionRec).toBeDefined();
      expect(reflectionRec?.module).toBe("notebook");
    });

    it("should generate deadline alert for upcoming tasks", async () => {
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

      const mockTasks: Task[] = [
        {
          id: "task1",
          title: "Task due soon 1",
          status: "pending",
          priority: "medium",
          dueDate: twoDaysFromNow.toISOString(),

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
        {
          id: "task2",
          title: "Task due soon 2",
          status: "pending",
          priority: "high",
          dueDate: twoDaysFromNow.toISOString(),

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
        {
          id: "task3",
          title: "Task due soon 3",
          status: "pending",
          priority: "low",
          dueDate: twoDaysFromNow.toISOString(),

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
      ];

      (db.tasks.getAll as jest.Mock).mockResolvedValue(mockTasks);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      const deadlineRec = recommendations.find((r) =>
        r.title.includes("deadline"),
      );
      expect(deadlineRec).toBeDefined();
      expect(deadlineRec?.priority).toBe("urgent");
      expect(deadlineRec?.module).toBe("planner");
    });

    it("should generate note tagging recommendation for untagged notes", async () => {
      const mockNotes: Note[] = Array.from({ length: 6 }, (_, i) => ({
        id: `note${i}`,
        title: `Note ${i}`,
        bodyMarkdown: "Content",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [], // No tags
        links: [],
      }));

      (db.notes.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      const taggingRec = recommendations.find((r) => r.title.includes("tags"));
      expect(taggingRec).toBeDefined();
      expect(taggingRec?.module).toBe("notebook");
      expect(taggingRec?.countsAgainstLimit).toBe(false);
    });

    it("should respect maxRecommendations limit", async () => {
      // Create conditions for multiple recommendations
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const mockTasks: Task[] = [
        {
          id: "task1",
          title: "Stale task",
          status: "pending",
          priority: "high",
          dueDate: null,

          userNotes: "",
          aiNotes: [],
          createdAt: fiveDaysAgo.toISOString(),
          updatedAt: fiveDaysAgo.toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
        {
          id: "task2",
          title: "High priority task",
          status: "pending",
          priority: "urgent",
          dueDate: null,

          userNotes: "",
          aiNotes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentTaskId: null,
          projectId: null,
          recurrenceRule: "none",
          dependencyIds: [],
        },
      ];

      const mockNotes: Note[] = Array.from({ length: 6 }, (_, i) => ({
        id: `note${i}`,
        title: `Note ${i}`,
        bodyMarkdown: "Content",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        links: [],
      }));

      (db.tasks.getAll as jest.Mock).mockResolvedValue(mockTasks);
      (db.notes.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const recommendations =
        await RecommendationEngine.generateRecommendations(2);

      expect(recommendations.length).toBeLessThanOrEqual(2);
    });

    it("should avoid duplicate recommendations", async () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const mockTask: Task = {
        id: "task1",
        title: "Complete API integration",
        status: "pending",
        priority: "high",
        dueDate: null,

        userNotes: "",
        aiNotes: [],
        createdAt: fiveDaysAgo.toISOString(),
        updatedAt: fiveDaysAgo.toISOString(),
        parentTaskId: null,
        projectId: null,
        recurrenceRule: "none",
        dependencyIds: [],
      };

      (db.tasks.getAll as jest.Mock).mockResolvedValue([mockTask]);
      (db.recommendations.getAll as jest.Mock).mockResolvedValue([
        {
          id: "rec1",
          dedupeKey: `task_breakdown_task1`,
          status: "active",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      ]);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      const breakdownRec = recommendations.find(
        (r) => r.dedupeKey === `task_breakdown_task1`,
      );
      expect(breakdownRec).toBeUndefined();
    });
  });

  describe("refreshRecommendations", () => {
    it("should expire old recommendations", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      (db.recommendations.getAll as jest.Mock).mockResolvedValue([
        {
          id: "rec1",
          status: "active",
          expiresAt: yesterday.toISOString(),
          dedupeKey: "old_rec",
        },
      ]);

      await RecommendationEngine.refreshRecommendations();

      expect(db.recommendations.updateStatus).toHaveBeenCalledWith(
        "rec1",
        "expired",
      );
    });

    it("should generate new recommendations when slots available", async () => {
      (db.recommendations.getAll as jest.Mock).mockResolvedValue([]);

      const mockNotes: Note[] = Array.from({ length: 6 }, (_, i) => ({
        id: `note${i}`,
        title: `Note ${i}`,
        bodyMarkdown: "Content",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        links: [],
      }));

      (db.notes.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const count = await RecommendationEngine.refreshRecommendations();

      expect(count).toBeGreaterThan(0);
      expect(db.recommendations.save).toHaveBeenCalled();
    });

    it("should not generate new recommendations if slots full", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const activeRecs = Array.from({ length: 8 }, (_, i) => ({
        id: `rec${i}`,
        status: "active",
        expiresAt: tomorrow.toISOString(),
        dedupeKey: `rec_${i}`,
      }));

      (db.recommendations.getAll as jest.Mock).mockResolvedValue(activeRecs);

      const count = await RecommendationEngine.refreshRecommendations();

      expect(count).toBe(0);
      expect(db.recommendations.save).not.toHaveBeenCalled();
    });

    it("should return count of new recommendations generated", async () => {
      (db.recommendations.getAll as jest.Mock).mockResolvedValue([]);

      const mockNotes: Note[] = Array.from({ length: 6 }, (_, i) => ({
        id: `note${i}`,
        title: `Note ${i}`,
        bodyMarkdown: "Content",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        links: [],
      }));

      (db.notes.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const count = await RecommendationEngine.refreshRecommendations();

      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Error handling", () => {
    it("should handle database errors gracefully", async () => {
      // Mock current date to be a Tuesday (weekday, not weekend)
      mockDateTo(new Date("2024-01-16T10:00:00Z"));

      (db.notes.getAll as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      // Should return empty array instead of throwing
      expect(recommendations).toEqual([]);
    });

    it("should continue processing other rules if one fails", async () => {
      const mockNotes: Note[] = Array.from({ length: 6 }, (_, i) => ({
        id: `note${i}`,
        title: `Note ${i}`,
        bodyMarkdown: "Content",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        links: [],
      }));

      (db.tasks.getAll as jest.Mock).mockRejectedValue(
        new Error("Task fetch error"),
      );
      (db.notes.getAll as jest.Mock).mockResolvedValue(mockNotes);

      const recommendations =
        await RecommendationEngine.generateRecommendations();

      // Should still generate note-based recommendations
      const taggingRec = recommendations.find((r) => r.title.includes("tags"));
      expect(taggingRec).toBeDefined();
    });
  });
});
