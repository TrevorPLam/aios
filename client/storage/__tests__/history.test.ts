/**
 * History Module Tests
 *
 * Tests for the enhanced history tracking functionality including:
 * - Basic CRUD operations
 * - Filtering by type
 * - Date range filtering
 * - Search functionality
 * - Statistics generation
 * - Bulk operations
 * - Export functionality
 */

import { db } from "../database";
import { HistoryLogEntry } from "@/models/types";

describe("History Module", () => {
  beforeEach(async () => {
    // Clear history before each test
    await db.history.clear();
  });

  describe("Basic Operations", () => {
    it("should add a history entry", async () => {
      await db.history.add({
        message: "Test recommendation accepted",
        type: "recommendation",
        metadata: { recommendationId: "rec_123" },
      });

      const entries = await db.history.getAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].message).toBe("Test recommendation accepted");
      expect(entries[0].type).toBe("recommendation");
      expect(entries[0]).toHaveProperty("id");
      expect(entries[0]).toHaveProperty("timestamp");
    });

    it("should get all entries sorted by timestamp (newest first)", async () => {
      await db.history.add({ message: "First entry", type: "system" });
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      await db.history.add({ message: "Second entry", type: "system" });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await db.history.add({ message: "Third entry", type: "system" });

      const entries = await db.history.getAll();
      expect(entries).toHaveLength(3);
      expect(entries[0].message).toBe("Third entry");
      expect(entries[1].message).toBe("Second entry");
      expect(entries[2].message).toBe("First entry");
    });

    it("should get entry by id", async () => {
      await db.history.add({
        message: "Test entry",
        type: "recommendation",
      });

      const entries = await db.history.getAll();
      const entryId = entries[0].id;

      const retrieved = await db.history.getById(entryId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(entryId);
      expect(retrieved?.message).toBe("Test entry");
    });

    it("should return null for non-existent id", async () => {
      const retrieved = await db.history.getById("non_existent_id");
      expect(retrieved).toBeNull();
    });

    it("should clear all entries", async () => {
      await db.history.add({ message: "Entry 1", type: "system" });
      await db.history.add({ message: "Entry 2", type: "system" });
      await db.history.add({ message: "Entry 3", type: "system" });

      let entries = await db.history.getAll();
      expect(entries).toHaveLength(3);

      await db.history.clear();

      entries = await db.history.getAll();
      expect(entries).toHaveLength(0);
    });
  });

  describe("Filtering by Type", () => {
    beforeEach(async () => {
      // Add entries of different types
      await db.history.add({ message: "Rec 1", type: "recommendation" });
      await db.history.add({ message: "Archived 1", type: "archived" });
      await db.history.add({ message: "Banked 1", type: "banked" });
      await db.history.add({ message: "Deprecated 1", type: "deprecated" });
      await db.history.add({ message: "System 1", type: "system" });
      await db.history.add({ message: "Rec 2", type: "recommendation" });
      await db.history.add({ message: "System 2", type: "system" });
    });

    it("should filter by recommendation type", async () => {
      const entries = await db.history.getByType("recommendation");
      expect(entries).toHaveLength(2);
      expect(entries.every((e) => e.type === "recommendation")).toBe(true);
    });

    it("should filter by archived type", async () => {
      const entries = await db.history.getByType("archived");
      expect(entries).toHaveLength(1);
      expect(entries[0].message).toBe("Archived 1");
    });

    it("should filter by banked type", async () => {
      const entries = await db.history.getByType("banked");
      expect(entries).toHaveLength(1);
      expect(entries[0].message).toBe("Banked 1");
    });

    it("should filter by deprecated type", async () => {
      const entries = await db.history.getByType("deprecated");
      expect(entries).toHaveLength(1);
      expect(entries[0].message).toBe("Deprecated 1");
    });

    it("should filter by system type", async () => {
      const entries = await db.history.getByType("system");
      expect(entries).toHaveLength(2);
      expect(entries.every((e) => e.type === "system")).toBe(true);
    });
  });

  describe("Date Range Filtering", () => {
    it("should filter entries by date range", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await db.history.add({ message: "Today entry", type: "system" });

      const entries = await db.history.getByDateRange(yesterday, tomorrow);
      expect(entries).toHaveLength(1);
      expect(entries[0].message).toBe("Today entry");
    });

    it("should return empty array when no entries in range", async () => {
      await db.history.add({ message: "Today entry", type: "system" });

      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const evenMorePast = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const entries = await db.history.getByDateRange(evenMorePast, pastDate);
      expect(entries).toHaveLength(0);
    });

    it("should handle same start and end date", async () => {
      const now = new Date();
      await db.history.add({ message: "Today entry", type: "system" });

      const startOfDay = new Date(now.getTime());
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now.getTime());
      endOfDay.setHours(23, 59, 59, 999);

      const entries = await db.history.getByDateRange(startOfDay, endOfDay);
      expect(entries.length).toBeGreaterThan(0);
    });
  });

  describe("Search Functionality", () => {
    beforeEach(async () => {
      await db.history.add({
        message: "User accepted recommendation",
        type: "recommendation",
      });
      await db.history.add({
        message: "Task was archived automatically",
        type: "archived",
      });
      await db.history.add({
        message: "System backup completed",
        type: "system",
      });
      await db.history.add({
        message: "Note was banked for later",
        type: "banked",
      });
    });

    it("should search entries by message content", async () => {
      const results = await db.history.search("recommendation");
      expect(results).toHaveLength(1);
      expect(results[0].message).toContain("recommendation");
    });

    it("should be case-insensitive", async () => {
      const results = await db.history.search("SYSTEM");
      expect(results).toHaveLength(1);
      expect(results[0].message).toContain("System");
    });

    it("should search by partial match", async () => {
      const results = await db.history.search("back");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(
        results.some((r) => r.message.toLowerCase().includes("back")),
      ).toBe(true);
    });

    it("should return empty array for no matches", async () => {
      const results = await db.history.search("nonexistent");
      expect(results).toHaveLength(0);
    });

    it("should search by type name", async () => {
      const results = await db.history.search("archived");
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Delete Operations", () => {
    it("should delete entry by id", async () => {
      await db.history.add({ message: "Entry 1", type: "system" });
      await db.history.add({ message: "Entry 2", type: "system" });

      let entries = await db.history.getAll();
      expect(entries).toHaveLength(2);

      const idToDelete = entries[0].id;
      await db.history.deleteById(idToDelete);

      entries = await db.history.getAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).not.toBe(idToDelete);
    });

    it("should delete multiple entries", async () => {
      await db.history.add({ message: "Entry 1", type: "system" });
      await db.history.add({ message: "Entry 2", type: "system" });
      await db.history.add({ message: "Entry 3", type: "system" });
      await db.history.add({ message: "Entry 4", type: "system" });

      let entries = await db.history.getAll();
      expect(entries).toHaveLength(4);

      const idsToDelete = [entries[0].id, entries[2].id];
      await db.history.deleteMultiple(idsToDelete);

      entries = await db.history.getAll();
      expect(entries).toHaveLength(2);
      expect(entries.map((e) => e.id)).not.toContain(idsToDelete[0]);
      expect(entries.map((e) => e.id)).not.toContain(idsToDelete[1]);
    });

    it("should handle deleting non-existent id gracefully", async () => {
      await db.history.add({ message: "Entry 1", type: "system" });

      await db.history.deleteById("non_existent_id");

      const entries = await db.history.getAll();
      expect(entries).toHaveLength(1);
    });
  });

  describe("Statistics", () => {
    beforeEach(async () => {
      await db.history.add({ message: "Rec 1", type: "recommendation" });
      await db.history.add({ message: "Rec 2", type: "recommendation" });
      await db.history.add({ message: "Archived 1", type: "archived" });
      await db.history.add({ message: "Banked 1", type: "banked" });
      await db.history.add({ message: "System 1", type: "system" });
      await db.history.add({ message: "System 2", type: "system" });
      await db.history.add({ message: "System 3", type: "system" });
    });

    it("should calculate correct total entries", async () => {
      const stats = await db.history.getStatistics();
      expect(stats.totalEntries).toBe(7);
    });

    it("should count entries by type", async () => {
      const stats = await db.history.getStatistics();
      expect(stats.entriesByType.recommendation).toBe(2);
      expect(stats.entriesByType.archived).toBe(1);
      expect(stats.entriesByType.banked).toBe(1);
      expect(stats.entriesByType.deprecated).toBe(0);
      expect(stats.entriesByType.system).toBe(3);
    });

    it("should identify oldest and newest entries", async () => {
      const stats = await db.history.getStatistics();
      expect(stats.oldestEntry).not.toBeNull();
      expect(stats.newestEntry).not.toBeNull();

      const oldest = new Date(stats.oldestEntry!);
      const newest = new Date(stats.newestEntry!);
      expect(newest.getTime()).toBeGreaterThanOrEqual(oldest.getTime());
    });

    it("should handle empty history", async () => {
      await db.history.clear();
      const stats = await db.history.getStatistics();

      expect(stats.totalEntries).toBe(0);
      expect(stats.oldestEntry).toBeNull();
      expect(stats.newestEntry).toBeNull();
    });
  });

  describe("Export Functionality", () => {
    it("should export history as JSON string", async () => {
      await db.history.add({
        message: "Test entry 1",
        type: "recommendation",
        metadata: { key: "value" },
      });
      await db.history.add({ message: "Test entry 2", type: "system" });

      const json = await db.history.exportToJSON();
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toHaveProperty("id");
      expect(parsed[0]).toHaveProperty("timestamp");
      expect(parsed[0]).toHaveProperty("message");
      expect(parsed[0]).toHaveProperty("type");
    });

    it("should export empty history as empty array JSON", async () => {
      await db.history.clear();
      const json = await db.history.exportToJSON();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(0);
    });

    it("should preserve metadata in export", async () => {
      const metadata = { userId: "123", action: "accept" };
      await db.history.add({
        message: "Test with metadata",
        type: "recommendation",
        metadata,
      });

      const json = await db.history.exportToJSON();
      const parsed = JSON.parse(json);

      expect(parsed[0].metadata).toEqual(metadata);
    });
  });

  describe("Export Scheduling", () => {
    it("should initialize with default export schedule", async () => {
      const schedule = await db.history.getExportSchedule();
      expect(schedule.enabled).toBe(false);
      expect(schedule.frequency).toBe("weekly");
    });

    it("should set next export time when enabling schedule", async () => {
      const schedule = await db.history.setExportSchedule({
        enabled: true,
        frequency: "daily",
      });

      expect(schedule.enabled).toBe(true);
      expect(schedule.nextExportAt).toBeTruthy();
    });

    it("should run scheduled export when due", async () => {
      await db.history.add({ message: "Export me", type: "system" });

      await db.history.setExportSchedule({
        enabled: true,
        frequency: "daily",
        nextExportAt: "2026-01-01T00:00:00.000Z",
      });

      const payload = await db.history.runScheduledExport(
        new Date("2026-01-02T00:00:00.000Z"),
      );

      expect(payload).toContain("Export me");
    });
  });

  describe("Pattern Insights", () => {
    it("should return day/hour clustering and top types", async () => {
      await db.history.add({ message: "Rec", type: "recommendation" });
      await db.history.add({ message: "System", type: "system" });

      const insights = await db.history.getPatternInsights();
      expect(Object.keys(insights.entriesByDay).length).toBeGreaterThan(0);
      expect(Object.keys(insights.entriesByHour).length).toBeGreaterThan(0);
      expect(insights.topTypes.length).toBeGreaterThan(0);
    });
  });
});
