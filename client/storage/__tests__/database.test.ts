import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Recommendation, Note, Task } from "@/models/types";

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
