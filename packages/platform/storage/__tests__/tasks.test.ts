/**
 * Task Database Tests
 *
 * Comprehensive test suite for task storage operations including:
 * - Basic CRUD operations
 * - Hierarchical task management (parent/subtask)
 * - Search and filtering capabilities
 * - Statistics and progress tracking
 * - Bulk operations
 * - Due date management
 *
 * @module tasks.test
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Task, TaskStatus, TaskPriority } from "@aios/contracts/models/types";

describe("Task Database Operations", () => {
  // Sample task data for testing
  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: `task-${Date.now()}-${Math.random()}`,
    title: "Test Task",
    userNotes: "",
    aiNotes: [],
    priority: "medium",
    dueDate: null,
    status: "pending",
    recurrenceRule: "none",
    projectId: null,
    parentTaskId: null,
    dependencyIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  describe("Basic CRUD Operations", () => {
    test("should save and retrieve a task", async () => {
      const task = createTask({ title: "My First Task" });
      await db.tasks.save(task);

      const retrieved = await db.tasks.get(task.id);
      expect(retrieved).toEqual(task);
    });

    test("should update an existing task", async () => {
      const task = createTask({ title: "Original Title" });
      await db.tasks.save(task);

      const updatedTask = { ...task, title: "Updated Title" };
      await db.tasks.save(updatedTask);

      const retrieved = await db.tasks.get(task.id);
      expect(retrieved?.title).toBe("Updated Title");
    });

    test("should delete a task", async () => {
      const task = createTask();
      await db.tasks.save(task);

      await db.tasks.delete(task.id);

      const retrieved = await db.tasks.get(task.id);
      expect(retrieved).toBeNull();
    });

    test("should get all tasks", async () => {
      const task1 = createTask({ title: "Task 1" });
      const task2 = createTask({ title: "Task 2" });

      await db.tasks.save(task1);
      await db.tasks.save(task2);

      const all = await db.tasks.getAll();
      expect(all.length).toBe(2);
      expect(all.find((t) => t.id === task1.id)).toBeDefined();
      expect(all.find((t) => t.id === task2.id)).toBeDefined();
    });
  });

  describe("Hierarchical Task Management", () => {
    test("should get top-level tasks only", async () => {
      const parentTask = createTask({ title: "Parent Task" });
      const childTask = createTask({
        title: "Child Task",
        parentTaskId: parentTask.id,
      });

      await db.tasks.save(parentTask);
      await db.tasks.save(childTask);

      const topLevel = await db.tasks.getTopLevel();
      expect(topLevel.length).toBe(1);
      expect(topLevel[0].id).toBe(parentTask.id);
    });

    test("should get subtasks for a parent task", async () => {
      const parentTask = createTask({ title: "Parent Task" });
      const child1 = createTask({
        title: "Child 1",
        parentTaskId: parentTask.id,
      });
      const child2 = createTask({
        title: "Child 2",
        parentTaskId: parentTask.id,
      });

      await db.tasks.save(parentTask);
      await db.tasks.save(child1);
      await db.tasks.save(child2);

      const subtasks = await db.tasks.getSubtasks(parentTask.id);
      expect(subtasks.length).toBe(2);
    });

    test("should check if task has subtasks", async () => {
      const parentTask = createTask({ title: "Parent Task" });
      const childTask = createTask({
        title: "Child Task",
        parentTaskId: parentTask.id,
      });

      await db.tasks.save(parentTask);
      await db.tasks.save(childTask);

      const hasSubtasks = await db.tasks.hasSubtasks(parentTask.id);
      expect(hasSubtasks).toBe(true);

      const childHasSubtasks = await db.tasks.hasSubtasks(childTask.id);
      expect(childHasSubtasks).toBe(false);
    });

    test("should cascade delete parent and subtasks", async () => {
      const parentTask = createTask({ title: "Parent Task" });
      const childTask = createTask({
        title: "Child Task",
        parentTaskId: parentTask.id,
      });

      await db.tasks.save(parentTask);
      await db.tasks.save(childTask);

      await db.tasks.delete(parentTask.id);

      const parentRetrieved = await db.tasks.get(parentTask.id);
      const childRetrieved = await db.tasks.get(childTask.id);

      expect(parentRetrieved).toBeNull();
      expect(childRetrieved).toBeNull();
    });

    test("should calculate subtask progress", async () => {
      const parentTask = createTask({ title: "Parent Task" });
      const child1 = createTask({
        title: "Child 1",
        parentTaskId: parentTask.id,
        status: "completed",
      });
      const child2 = createTask({
        title: "Child 2",
        parentTaskId: parentTask.id,
        status: "pending",
      });

      await db.tasks.save(parentTask);
      await db.tasks.save(child1);
      await db.tasks.save(child2);

      const progress = await db.tasks.getSubtaskProgress(parentTask.id);
      expect(progress).toBe(50); // 1 of 2 completed = 50%
    });
  });

  describe("Search and Filtering", () => {
    test("should search tasks by title", async () => {
      const task1 = createTask({ title: "Fix bug in login" });
      const task2 = createTask({ title: "Add new feature" });

      await db.tasks.save(task1);
      await db.tasks.save(task2);

      const results = await db.tasks.search("bug");
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(task1.id);
    });

    test("should search tasks by user notes", async () => {
      const task1 = createTask({
        title: "Task 1",
        userNotes: "Need to check the database connection",
      });
      const task2 = createTask({
        title: "Task 2",
        userNotes: "Update UI components",
      });

      await db.tasks.save(task1);
      await db.tasks.save(task2);

      const results = await db.tasks.search("database");
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(task1.id);
    });

    test("should filter tasks by status", async () => {
      const task1 = createTask({ status: "completed" });
      const task2 = createTask({ status: "pending" });
      const task3 = createTask({ status: "in_progress" });

      await db.tasks.save(task1);
      await db.tasks.save(task2);
      await db.tasks.save(task3);

      const completed = await db.tasks.getByStatus("completed");
      expect(completed.length).toBe(1);
      expect(completed[0].id).toBe(task1.id);
    });

    test("should filter tasks by priority", async () => {
      const task1 = createTask({ priority: "urgent" });
      const task2 = createTask({ priority: "high" });
      const task3 = createTask({ priority: "low" });

      await db.tasks.save(task1);
      await db.tasks.save(task2);
      await db.tasks.save(task3);

      const urgent = await db.tasks.getByPriority("urgent");
      expect(urgent.length).toBe(1);
      expect(urgent[0].id).toBe(task1.id);
    });

    test("should filter tasks by project", async () => {
      const projectId = "project-123";
      const task1 = createTask({ projectId });
      const task2 = createTask({ projectId: "project-456" });

      await db.tasks.save(task1);
      await db.tasks.save(task2);

      const projectTasks = await db.tasks.getByProject(projectId);
      expect(projectTasks.length).toBe(1);
      expect(projectTasks[0].id).toBe(task1.id);
    });
  });

  describe("Due Date Management", () => {
    test("should get overdue tasks", async () => {
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const overdueTask = createTask({
        title: "Overdue Task",
        dueDate: yesterday,
        status: "pending",
      });
      const futureTask = createTask({
        title: "Future Task",
        dueDate: tomorrow,
        status: "pending",
      });
      const completedOverdue = createTask({
        title: "Completed Overdue",
        dueDate: yesterday,
        status: "completed",
      });

      await db.tasks.save(overdueTask);
      await db.tasks.save(futureTask);
      await db.tasks.save(completedOverdue);

      const overdue = await db.tasks.getOverdue();
      expect(overdue.length).toBe(1);
      expect(overdue[0].id).toBe(overdueTask.id);
    });

    test("should get tasks due today", async () => {
      const today = new Date().toISOString();
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const todayTask = createTask({ title: "Today Task", dueDate: today });
      const tomorrowTask = createTask({
        title: "Tomorrow Task",
        dueDate: tomorrow,
      });

      await db.tasks.save(todayTask);
      await db.tasks.save(tomorrowTask);

      const dueTodayTasks = await db.tasks.getDueToday();
      expect(dueTodayTasks.length).toBe(1);
      expect(dueTodayTasks[0].id).toBe(todayTask.id);
    });

    test("should get tasks due in next N days", async () => {
      const now = new Date();
      const in3Days = new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const in10Days = new Date(
        now.getTime() + 10 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const nearTask = createTask({
        title: "Near Task",
        dueDate: in3Days,
        status: "pending",
      });
      const farTask = createTask({
        title: "Far Task",
        dueDate: in10Days,
        status: "pending",
      });

      await db.tasks.save(nearTask);
      await db.tasks.save(farTask);

      const dueInWeek = await db.tasks.getDueInDays(7);
      expect(dueInWeek.length).toBe(1);
      expect(dueInWeek[0].id).toBe(nearTask.id);
    });
  });

  describe("Task Statistics", () => {
    test("should calculate comprehensive statistics", async () => {
      // Create date strings that are clearly in the right buckets
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1); // Yesterday - definitely overdue

      const today = new Date(now);
      today.setHours(23, 59, 0, 0); // End of today - not overdue yet

      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 5); // 5 days from now

      await db.tasks.save(createTask({ status: "completed" }));
      await db.tasks.save(createTask({ status: "in_progress" }));
      await db.tasks.save(
        createTask({ status: "pending", priority: "urgent" }),
      );
      await db.tasks.save(createTask({ status: "pending", priority: "high" }));
      await db.tasks.save(
        createTask({ status: "pending", dueDate: yesterday.toISOString() }),
      ); // overdue
      await db.tasks.save(
        createTask({ status: "pending", dueDate: today.toISOString() }),
      ); // due today
      await db.tasks.save(
        createTask({ status: "pending", dueDate: nextWeek.toISOString() }),
      ); // due this week

      const stats = await db.tasks.getStatistics();

      expect(stats.total).toBe(7);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.pending).toBe(5);
      expect(stats.overdue).toBe(1);
      expect(stats.dueToday).toBe(1);
      expect(stats.dueThisWeek).toBe(2); // today + nextWeek
      expect(stats.urgent).toBe(1);
      expect(stats.highPriority).toBe(1);
    });

    test("should return zero statistics for empty task list", async () => {
      const stats = await db.tasks.getStatistics();

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.inProgress).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.overdue).toBe(0);
      expect(stats.dueToday).toBe(0);
      expect(stats.dueThisWeek).toBe(0);
      expect(stats.urgent).toBe(0);
      expect(stats.highPriority).toBe(0);
    });
  });

  describe("Bulk Operations", () => {
    test("should bulk update task status", async () => {
      const task1 = createTask({ status: "pending" });
      const task2 = createTask({ status: "pending" });
      const task3 = createTask({ status: "pending" });

      await db.tasks.save(task1);
      await db.tasks.save(task2);
      await db.tasks.save(task3);

      await db.tasks.bulkUpdateStatus([task1.id, task2.id], "completed");

      const updated1 = await db.tasks.get(task1.id);
      const updated2 = await db.tasks.get(task2.id);
      const updated3 = await db.tasks.get(task3.id);

      expect(updated1?.status).toBe("completed");
      expect(updated2?.status).toBe("completed");
      expect(updated3?.status).toBe("pending");
    });

    test("should bulk delete tasks", async () => {
      const task1 = createTask();
      const task2 = createTask();
      const task3 = createTask();

      await db.tasks.save(task1);
      await db.tasks.save(task2);
      await db.tasks.save(task3);

      await db.tasks.bulkDelete([task1.id, task2.id]);

      const all = await db.tasks.getAll();
      expect(all.length).toBe(1);
      expect(all[0].id).toBe(task3.id);
    });

    test("should bulk delete tasks and their subtasks", async () => {
      const parent1 = createTask({ title: "Parent 1" });
      const child1 = createTask({
        title: "Child 1",
        parentTaskId: parent1.id,
      });
      const parent2 = createTask({ title: "Parent 2" });
      const child2 = createTask({
        title: "Child 2",
        parentTaskId: parent2.id,
      });

      await db.tasks.save(parent1);
      await db.tasks.save(child1);
      await db.tasks.save(parent2);
      await db.tasks.save(child2);

      await db.tasks.bulkDelete([parent1.id]);

      const all = await db.tasks.getAll();
      expect(all.length).toBe(2); // parent2 and child2 remain
      expect(all.find((t) => t.id === parent1.id)).toBeUndefined();
      expect(all.find((t) => t.id === child1.id)).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty search query", async () => {
      const task = createTask({ title: "Test Task" });
      await db.tasks.save(task);

      const results = await db.tasks.search("");
      expect(results.length).toBe(1);
    });

    test("should handle case-insensitive search", async () => {
      const task = createTask({ title: "Important Task" });
      await db.tasks.save(task);

      const results = await db.tasks.search("IMPORTANT");
      expect(results.length).toBe(1);
    });

    test("should return empty array for non-existent project", async () => {
      const task = createTask({ projectId: "project-1" });
      await db.tasks.save(task);

      const results = await db.tasks.getByProject("non-existent");
      expect(results.length).toBe(0);
    });

    test("should return 0 progress for task with no subtasks", async () => {
      const task = createTask({ title: "Standalone Task" });
      await db.tasks.save(task);

      const progress = await db.tasks.getSubtaskProgress(task.id);
      expect(progress).toBe(0);
    });

    test("should handle tasks without due dates in overdue check", async () => {
      const task = createTask({ dueDate: null, status: "pending" });
      await db.tasks.save(task);

      const overdue = await db.tasks.getOverdue();
      expect(overdue.length).toBe(0);
    });
  });
});
