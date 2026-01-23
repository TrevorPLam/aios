import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Recommendation, Note, Task } from "@contracts/models/types";

describe("Database Storage Layer", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  describe("recommendations", () => {
    const mockRecommendation: Recommendation = {
      id: "rec_1",
      module: "command",
      title: "Test Recommendation",
      summary: "Test summary",
      type: "test",
      status: "active",
      createdAt: "2026-01-14T00:00:00Z",
      expiresAt: "2026-12-31T23:59:59Z",
      confidence: "high",
      priority: "high",
      dedupeKey: "test_key",
      countsAgainstLimit: true,
      why: "Test reason",
      evidenceTimestamps: [],
    };

    it("should save and retrieve a recommendation", async () => {
      await db.recommendations.save(mockRecommendation);
      const all = await db.recommendations.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockRecommendation);
    });

    it("should get only active recommendations", async () => {
      const expiredRec = {
        ...mockRecommendation,
        id: "rec_2",
        expiresAt: "2020-01-01T00:00:00Z",
      };
      await db.recommendations.save(mockRecommendation);
      await db.recommendations.save(expiredRec);

      const active = await db.recommendations.getActive();

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe("rec_1");
    });

    it("should update recommendation status", async () => {
      await db.recommendations.save(mockRecommendation);
      await db.recommendations.updateStatus("rec_1", "accepted");

      const all = await db.recommendations.getAll();
      expect(all[0].status).toBe("accepted");
    });

    it("should update existing recommendation on save", async () => {
      await db.recommendations.save(mockRecommendation);
      const updated = { ...mockRecommendation, title: "Updated Title" };
      await db.recommendations.save(updated);

      const all = await db.recommendations.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Updated Title");
    });

    it("should get recommendation history", async () => {
      const acceptedRec = {
        ...mockRecommendation,
        id: "rec_2",
        status: "accepted" as const,
        createdAt: "2026-01-15T00:00:00Z",
      };
      const declinedRec = {
        ...mockRecommendation,
        id: "rec_3",
        status: "declined" as const,
        createdAt: "2026-01-16T00:00:00Z",
      };

      await db.recommendations.save(mockRecommendation); // active
      await db.recommendations.save(acceptedRec);
      await db.recommendations.save(declinedRec);

      const history = await db.recommendations.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].id).toBe("rec_3"); // Most recent first
      expect(history[1].id).toBe("rec_2");
    });

    it("should limit recommendation history results", async () => {
      for (let i = 0; i < 10; i++) {
        await db.recommendations.save({
          ...mockRecommendation,
          id: `rec_${i}`,
          status: "accepted",
        });
      }

      const history = await db.recommendations.getHistory(5);
      expect(history).toHaveLength(5);
    });

    it("should get recommendations by module", async () => {
      const plannerRec = {
        ...mockRecommendation,
        id: "rec_2",
        module: "planner" as const,
      };

      await db.recommendations.save(mockRecommendation); // command module
      await db.recommendations.save(plannerRec);

      const commandRecs = await db.recommendations.getByModule("command");
      const plannerRecs = await db.recommendations.getByModule("planner");

      expect(commandRecs).toHaveLength(1);
      expect(plannerRecs).toHaveLength(1);
      expect(commandRecs[0].module).toBe("command");
    });

    it("should get recommendations by status", async () => {
      const acceptedRec = {
        ...mockRecommendation,
        id: "rec_2",
        status: "accepted" as const,
      };
      const declinedRec = {
        ...mockRecommendation,
        id: "rec_3",
        status: "declined" as const,
      };

      await db.recommendations.save(mockRecommendation); // active
      await db.recommendations.save(acceptedRec);
      await db.recommendations.save(declinedRec);

      const active = await db.recommendations.getByStatus("active");
      const accepted = await db.recommendations.getByStatus("accepted");
      const declined = await db.recommendations.getByStatus("declined");

      expect(active).toHaveLength(1);
      expect(accepted).toHaveLength(1);
      expect(declined).toHaveLength(1);
    });

    it("should get recommendation statistics", async () => {
      const acceptedRec = {
        ...mockRecommendation,
        id: "rec_2",
        status: "accepted" as const,
        module: "planner" as const,
        priority: "medium" as const,
      };
      const declinedRec = {
        ...mockRecommendation,
        id: "rec_3",
        status: "declined" as const,
        priority: "low" as const,
      };
      const expiredRec = {
        ...mockRecommendation,
        id: "rec_4",
        status: "expired" as const,
      };

      await db.recommendations.save(mockRecommendation); // active
      await db.recommendations.save(acceptedRec);
      await db.recommendations.save(declinedRec);
      await db.recommendations.save(expiredRec);

      const stats = await db.recommendations.getStatistics();

      expect(stats.total).toBe(4);
      expect(stats.active).toBe(1);
      expect(stats.accepted).toBe(1);
      expect(stats.declined).toBe(1);
      expect(stats.expired).toBe(1);
      expect(stats.acceptanceRate).toBe(50); // 1 accepted out of 2 decided
      expect(stats.byModule.command).toBe(3);
      expect(stats.byModule.planner).toBe(1);
      expect(stats.byPriority.high).toBe(2); // mockRecommendation and expiredRec
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(1);
    });

    it("should calculate 0% acceptance rate when no decisions made", async () => {
      await db.recommendations.save(mockRecommendation); // active

      const stats = await db.recommendations.getStatistics();

      expect(stats.acceptanceRate).toBe(0);
    });

    it("should delete old recommendations", async () => {
      const oldRec1 = {
        ...mockRecommendation,
        id: "rec_old_1",
        status: "accepted" as const,
        createdAt: "2025-01-01T00:00:00Z",
      };
      const oldRec2 = {
        ...mockRecommendation,
        id: "rec_old_2",
        status: "declined" as const,
        createdAt: "2025-06-01T00:00:00Z",
      };
      const recentRec = {
        ...mockRecommendation,
        id: "rec_recent",
        status: "accepted" as const,
        createdAt: new Date().toISOString(),
      };

      await db.recommendations.save(oldRec1);
      await db.recommendations.save(oldRec2);
      await db.recommendations.save(recentRec);
      await db.recommendations.save(mockRecommendation); // active

      const deletedCount = await db.recommendations.deleteOld(30);

      const remaining = await db.recommendations.getAll();

      expect(deletedCount).toBeGreaterThan(0);
      expect(remaining.length).toBeLessThan(4);
      // Active recommendations should never be deleted
      expect(remaining.find((r) => r.id === "rec_1")).toBeDefined();
      expect(remaining.find((r) => r.id === "rec_recent")).toBeDefined();
    });

    it("should not delete active recommendations even if old", async () => {
      const oldActiveRec = {
        ...mockRecommendation,
        id: "rec_old_active",
        status: "active" as const,
        createdAt: "2020-01-01T00:00:00Z",
      };

      await db.recommendations.save(oldActiveRec);

      await db.recommendations.deleteOld(30);

      const all = await db.recommendations.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("rec_old_active");
    });
  });

  describe("notes", () => {
    const mockNote: Note = {
      id: "note_1",
      title: "Test Note",
      bodyMarkdown: "# Test Content",
      createdAt: "2026-01-14T00:00:00Z",
      updatedAt: "2026-01-14T00:00:00Z",
      tags: ["test"],
      links: [],
    };

    it("should save and retrieve a note", async () => {
      await db.notes.save(mockNote);
      const all = await db.notes.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockNote);
    });

    it("should get a specific note by id", async () => {
      await db.notes.save(mockNote);
      const note = await db.notes.get("note_1");

      expect(note).toEqual(mockNote);
    });

    it("should return null for non-existent note", async () => {
      const note = await db.notes.get("non_existent");
      expect(note).toBeNull();
    });

    it("should delete a note", async () => {
      await db.notes.save(mockNote);
      await db.notes.delete("note_1");

      const all = await db.notes.getAll();
      expect(all).toHaveLength(0);
    });

    it("should update existing note on save", async () => {
      await db.notes.save(mockNote);
      const updated = { ...mockNote, title: "Updated Note" };
      await db.notes.save(updated);

      const all = await db.notes.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Updated Note");
    });
  });

  describe("tasks", () => {
    const mockTask: Task = {
      id: "task_1",
      title: "Test Task",
      userNotes: "Test notes",
      aiNotes: [],
      status: "pending",
      priority: "high",
      recurrenceRule: "none",
      createdAt: "2026-01-14T00:00:00Z",
      updatedAt: "2026-01-14T00:00:00Z",
      dueDate: null,
      projectId: null,
      parentTaskId: null,
      dependencyIds: [],
    };

    it("should save and retrieve a task", async () => {
      await db.tasks.save(mockTask);
      const all = await db.tasks.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockTask);
    });

    it("should get top level tasks only", async () => {
      const subtask = { ...mockTask, id: "task_2", parentTaskId: "task_1" };
      await db.tasks.save(mockTask);
      await db.tasks.save(subtask);

      const topLevel = await db.tasks.getTopLevel();

      expect(topLevel).toHaveLength(1);
      expect(topLevel[0].id).toBe("task_1");
    });

    it("should get subtasks for a parent task", async () => {
      const subtask1 = { ...mockTask, id: "task_2", parentTaskId: "task_1" };
      const subtask2 = { ...mockTask, id: "task_3", parentTaskId: "task_1" };
      await db.tasks.save(mockTask);
      await db.tasks.save(subtask1);
      await db.tasks.save(subtask2);

      const subtasks = await db.tasks.getSubtasks("task_1");

      expect(subtasks).toHaveLength(2);
    });

    it("should check if task has subtasks", async () => {
      const subtask = { ...mockTask, id: "task_2", parentTaskId: "task_1" };
      await db.tasks.save(mockTask);
      await db.tasks.save(subtask);

      const hasSubtasks = await db.tasks.hasSubtasks("task_1");
      const noSubtasks = await db.tasks.hasSubtasks("task_2");

      expect(hasSubtasks).toBe(true);
      expect(noSubtasks).toBe(false);
    });

    it("should delete task and its subtasks", async () => {
      const subtask = { ...mockTask, id: "task_2", parentTaskId: "task_1" };
      await db.tasks.save(mockTask);
      await db.tasks.save(subtask);

      await db.tasks.delete("task_1");

      const all = await db.tasks.getAll();
      expect(all).toHaveLength(0);
    });
  });

  describe("settings", () => {
    it("should return default settings if none exist", async () => {
      const settings = await db.settings.get();
      expect(settings).toBeDefined();
      expect(settings.aiName).toBe("AIOS");
    });

    it("should save and retrieve settings", async () => {
      const settings = await db.settings.get();
      const updated = { ...settings, darkMode: false };
      await db.settings.save(updated);

      const retrieved = await db.settings.get();
      expect(retrieved.darkMode).toBe(false);
    });

    it("should update partial settings", async () => {
      const updated = await db.settings.update({ darkMode: false });
      expect(updated.darkMode).toBe(false);
    });
  });

  describe("initialization", () => {
    it("should track initialization status", async () => {
      const initial = await db.isInitialized();
      expect(initial).toBe(false);

      await db.setInitialized();

      const after = await db.isInitialized();
      expect(after).toBe(true);
    });
  });

  describe("clearAll", () => {
    it("should clear all stored data", async () => {
      const mockNote: Note = {
        id: "note_1",
        title: "Test",
        bodyMarkdown: "Content",
        createdAt: "2026-01-14T00:00:00Z",
        updatedAt: "2026-01-14T00:00:00Z",
        tags: [],
        links: [],
      };

      await db.notes.save(mockNote);
      await db.setInitialized();

      await db.clearAll();

      const notes = await db.notes.getAll();
      const initialized = await db.isInitialized();

      expect(notes).toHaveLength(0);
      expect(initialized).toBe(false);
    });
  });
});
