/**
 * Alerts Database Storage Tests
 *
 * Tests the database storage layer for the Alerts module.
 * Validates CRUD operations, sorting, and state management.
 *
 * @module alerts.test
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Alert } from "@/models/types";

describe("Database Alerts Storage", () => {
  // Clear storage before and after each test to ensure isolation
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  /** Sample alert data for testing */
  const mockAlert: Alert = {
    id: "alert_1",
    title: "Wake up",
    description: "Time to start the day",
    time: "2026-01-15T08:00:00Z",
    type: "alarm",
    isEnabled: true,
    recurrenceRule: "daily",
    sound: "default",
    vibration: "default",
    gradualVolume: false,
    snoozeDuration: 10,
    tags: [],
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  };

  describe("alerts", () => {
    it("should save and retrieve an alert", async () => {
      await db.alerts.save(mockAlert);
      const all = await db.alerts.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockAlert);
    });

    it("should get a specific alert by id", async () => {
      await db.alerts.save(mockAlert);
      const alert = await db.alerts.get("alert_1");

      expect(alert).toEqual(mockAlert);
    });

    it("should return null for non-existent alert", async () => {
      const alert = await db.alerts.get("non_existent");
      expect(alert).toBeNull();
    });

    it("should delete an alert", async () => {
      await db.alerts.save(mockAlert);
      await db.alerts.delete("alert_1");

      const all = await db.alerts.getAll();
      expect(all).toHaveLength(0);
    });

    it("should update existing alert on save", async () => {
      await db.alerts.save(mockAlert);
      const updated = {
        ...mockAlert,
        title: "Updated Alert",
        isEnabled: false,
      };
      await db.alerts.save(updated);

      const all = await db.alerts.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Updated Alert");
      expect(all[0].isEnabled).toBe(false);
    });

    it("should sort alerts by time ascending", async () => {
      const alert1 = {
        ...mockAlert,
        id: "alert_1",
        time: "2026-01-15T10:00:00Z",
      };
      const alert2 = {
        ...mockAlert,
        id: "alert_2",
        time: "2026-01-15T08:00:00Z",
      };
      const alert3 = {
        ...mockAlert,
        id: "alert_3",
        time: "2026-01-15T12:00:00Z",
      };

      await db.alerts.save(alert1);
      await db.alerts.save(alert2);
      await db.alerts.save(alert3);

      const sorted = await db.alerts.getAllSorted();

      expect(sorted).toHaveLength(3);
      expect(sorted[0].id).toBe("alert_2");
      expect(sorted[1].id).toBe("alert_1");
      expect(sorted[2].id).toBe("alert_3");
    });

    it("should handle alert with all types", async () => {
      const alarm: Alert = {
        ...mockAlert,
        id: "alarm_1",
        type: "alarm",
      };
      const reminder: Alert = {
        ...mockAlert,
        id: "reminder_1",
        type: "reminder",
      };

      await db.alerts.save(alarm);
      await db.alerts.save(reminder);

      const all = await db.alerts.getAll();
      expect(all).toHaveLength(2);
      expect(all.find((a) => a.id === "alarm_1")?.type).toBe("alarm");
      expect(all.find((a) => a.id === "reminder_1")?.type).toBe("reminder");
    });

    it("should handle alert with different recurrence rules", async () => {
      const daily = {
        ...mockAlert,
        id: "daily",
        recurrenceRule: "daily" as const,
      };
      const weekly = {
        ...mockAlert,
        id: "weekly",
        recurrenceRule: "weekly" as const,
      };
      const monthly = {
        ...mockAlert,
        id: "monthly",
        recurrenceRule: "monthly" as const,
      };
      const none = {
        ...mockAlert,
        id: "none",
        recurrenceRule: "none" as const,
      };

      await db.alerts.save(daily);
      await db.alerts.save(weekly);
      await db.alerts.save(monthly);
      await db.alerts.save(none);

      const all = await db.alerts.getAll();
      expect(all).toHaveLength(4);
      expect(all.find((a) => a.id === "daily")?.recurrenceRule).toBe("daily");
      expect(all.find((a) => a.id === "weekly")?.recurrenceRule).toBe("weekly");
      expect(all.find((a) => a.id === "monthly")?.recurrenceRule).toBe(
        "monthly",
      );
      expect(all.find((a) => a.id === "none")?.recurrenceRule).toBe("none");
    });

    it("should toggle alert enabled state", async () => {
      await db.alerts.save(mockAlert);

      const alert = await db.alerts.get("alert_1");
      expect(alert?.isEnabled).toBe(true);

      const toggled = { ...mockAlert, isEnabled: false };
      await db.alerts.save(toggled);

      const updated = await db.alerts.get("alert_1");
      expect(updated?.isEnabled).toBe(false);
    });

    /** Enhanced Features Tests */
    describe("Enhanced Alert Features", () => {
      it("should save and retrieve alert with sound and vibration settings", async () => {
        const alertWithSettings: Alert = {
          ...mockAlert,
          id: "alert_sound",
          sound: "gentle",
          vibration: "pulse",
          gradualVolume: true,
          snoozeDuration: 15,
        };

        await db.alerts.save(alertWithSettings);
        const retrieved = await db.alerts.get("alert_sound");

        expect(retrieved?.sound).toBe("gentle");
        expect(retrieved?.vibration).toBe("pulse");
        expect(retrieved?.gradualVolume).toBe(true);
        expect(retrieved?.snoozeDuration).toBe(15);
      });

      it("should save and retrieve alert with tags", async () => {
        const alertWithTags: Alert = {
          ...mockAlert,
          id: "alert_tags",
          tags: ["work", "morning", "routine"],
        };

        await db.alerts.save(alertWithTags);
        const retrieved = await db.alerts.get("alert_tags");

        expect(retrieved?.tags).toEqual(["work", "morning", "routine"]);
      });

      it("should filter alerts by tag", async () => {
        const alert1: Alert = {
          ...mockAlert,
          id: "alert_1",
          tags: ["work", "morning"],
        };
        const alert2: Alert = {
          ...mockAlert,
          id: "alert_2",
          tags: ["personal", "evening"],
        };
        const alert3: Alert = {
          ...mockAlert,
          id: "alert_3",
          tags: ["work", "evening"],
        };

        await db.alerts.save(alert1);
        await db.alerts.save(alert2);
        await db.alerts.save(alert3);

        const workAlerts = await db.alerts.getByTag("work");
        expect(workAlerts).toHaveLength(2);
        expect(workAlerts.map((a) => a.id)).toContain("alert_1");
        expect(workAlerts.map((a) => a.id)).toContain("alert_3");

        const morningAlerts = await db.alerts.getByTag("morning");
        expect(morningAlerts).toHaveLength(1);
        expect(morningAlerts[0].id).toBe("alert_1");
      });

      it("should get all unique tags", async () => {
        const alert1: Alert = {
          ...mockAlert,
          id: "alert_1",
          tags: ["work", "morning"],
        };
        const alert2: Alert = {
          ...mockAlert,
          id: "alert_2",
          tags: ["personal", "evening"],
        };
        const alert3: Alert = {
          ...mockAlert,
          id: "alert_3",
          tags: ["work", "routine"],
        };

        await db.alerts.save(alert1);
        await db.alerts.save(alert2);
        await db.alerts.save(alert3);

        const tags = await db.alerts.getAllTags();
        expect(tags).toHaveLength(5);
        expect(tags).toContain("work");
        expect(tags).toContain("morning");
        expect(tags).toContain("personal");
        expect(tags).toContain("evening");
        expect(tags).toContain("routine");
        expect(tags).toEqual(tags.sort()); // Should be sorted
      });

      it("should duplicate an alert", async () => {
        await db.alerts.save(mockAlert);
        const duplicated = await db.alerts.duplicate("alert_1");

        expect(duplicated).not.toBeNull();
        expect(duplicated?.id).not.toBe("alert_1");
        expect(duplicated?.title).toBe("Wake up (Copy)");
        expect(duplicated?.description).toBe(mockAlert.description);
        expect(duplicated?.time).toBe(mockAlert.time);
        expect(duplicated?.type).toBe(mockAlert.type);

        const all = await db.alerts.getAll();
        expect(all).toHaveLength(2);
      });

      it("should return null when duplicating non-existent alert", async () => {
        const duplicated = await db.alerts.duplicate("non_existent");
        expect(duplicated).toBeNull();
      });

      it("should toggle multiple alerts at once", async () => {
        const alert1: Alert = { ...mockAlert, id: "alert_1", isEnabled: true };
        const alert2: Alert = { ...mockAlert, id: "alert_2", isEnabled: true };
        const alert3: Alert = { ...mockAlert, id: "alert_3", isEnabled: true };

        await db.alerts.save(alert1);
        await db.alerts.save(alert2);
        await db.alerts.save(alert3);

        await db.alerts.toggleMultiple(["alert_1", "alert_2"], false);

        const all = await db.alerts.getAll();
        expect(all.find((a) => a.id === "alert_1")?.isEnabled).toBe(false);
        expect(all.find((a) => a.id === "alert_2")?.isEnabled).toBe(false);
        expect(all.find((a) => a.id === "alert_3")?.isEnabled).toBe(true);
      });

      it("should delete multiple alerts at once", async () => {
        const alert1: Alert = { ...mockAlert, id: "alert_1" };
        const alert2: Alert = { ...mockAlert, id: "alert_2" };
        const alert3: Alert = { ...mockAlert, id: "alert_3" };

        await db.alerts.save(alert1);
        await db.alerts.save(alert2);
        await db.alerts.save(alert3);

        await db.alerts.deleteMultiple(["alert_1", "alert_3"]);

        const all = await db.alerts.getAll();
        expect(all).toHaveLength(1);
        expect(all[0].id).toBe("alert_2");
      });

      it("should migrate old alerts without new fields", async () => {
        // Simulate old alert data without new fields
        const oldAlert = {
          id: "old_alert",
          title: "Old Alert",
          description: "Legacy alert",
          time: "2026-01-15T08:00:00Z",
          type: "alarm" as const,
          isEnabled: true,
          recurrenceRule: "daily" as const,
          createdAt: "2026-01-14T00:00:00Z",
          updatedAt: "2026-01-14T00:00:00Z",
        };

        // Save directly to bypass type checking (simulating old data)
        await db.alerts.save(oldAlert as any);

        // Retrieve should add default values
        const retrieved = await db.alerts.get("old_alert");
        expect(retrieved?.sound).toBe("default");
        expect(retrieved?.vibration).toBe("default");
        expect(retrieved?.gradualVolume).toBe(false);
        expect(retrieved?.snoozeDuration).toBe(10);
        expect(retrieved?.tags).toEqual([]);
      });
    });

    /** Alert History and Statistics Tests */
    describe("Alert History and Statistics", () => {
      it("should add an alert history entry", async () => {
        await db.alerts.save(mockAlert);

        const entry = await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:03:00Z",
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        expect(entry.id).toBeDefined();
        expect(entry.alertId).toBe("alert_1");
        expect(entry.snoozeCount).toBe(0);
        expect(entry.wasOnTime).toBe(true);

        const all = await db.alertHistory.getAll();
        expect(all).toHaveLength(1);
        expect(all[0]).toEqual(entry);
      });

      it("should get history entries for a specific alert", async () => {
        await db.alerts.save(mockAlert);
        const alert2: Alert = { ...mockAlert, id: "alert_2" };
        await db.alerts.save(alert2);

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:03:00Z",
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        await db.alertHistory.add({
          alertId: "alert_2",
          triggeredAt: "2026-01-15T09:00:00Z",
          dismissedAt: "2026-01-15T09:05:00Z",
          snoozeCount: 1,
          totalSnoozeDuration: 10,
          wasOnTime: true,
        });

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-16T08:00:00Z",
          dismissedAt: "2026-01-16T08:15:00Z",
          snoozeCount: 2,
          totalSnoozeDuration: 20,
          wasOnTime: false,
        });

        const alert1History = await db.alertHistory.getByAlert("alert_1");
        expect(alert1History).toHaveLength(2);
        expect(alert1History.every((e) => e.alertId === "alert_1")).toBe(true);

        const alert2History = await db.alertHistory.getByAlert("alert_2");
        expect(alert2History).toHaveLength(1);
        expect(alert2History[0].alertId).toBe("alert_2");
      });

      it("should update an alert history entry", async () => {
        const entry = await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: null,
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        // Update entry when dismissed
        const updatedEntry = {
          ...entry,
          dismissedAt: "2026-01-15T08:05:00Z",
          wasOnTime: true,
        };

        await db.alertHistory.update(updatedEntry);

        const all = await db.alertHistory.getAll();
        expect(all).toHaveLength(1);
        expect(all[0].dismissedAt).toBe("2026-01-15T08:05:00Z");
        expect(all[0].wasOnTime).toBe(true);
      });

      it("should calculate statistics for an alert", async () => {
        await db.alerts.save(mockAlert);

        // Add history entries with varying snooze patterns
        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:03:00Z",
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-16T08:00:00Z",
          dismissedAt: "2026-01-16T08:15:00Z",
          snoozeCount: 2,
          totalSnoozeDuration: 20,
          wasOnTime: false,
        });

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-17T08:00:00Z",
          dismissedAt: "2026-01-17T08:04:00Z",
          snoozeCount: 1,
          totalSnoozeDuration: 10,
          wasOnTime: true,
        });

        const stats = await db.alertHistory.getStatistics("alert_1");

        expect(stats.alertId).toBe("alert_1");
        expect(stats.totalTriggers).toBe(3);
        expect(stats.totalSnoozes).toBe(3);
        expect(stats.averageSnoozeCount).toBe(1);
        expect(stats.onTimeDismissalRate).toBe((2 / 3) * 100);
        expect(stats.lastTriggeredAt).toBe("2026-01-17T08:00:00Z");
      });

      it("should calculate statistics for alert with no history", async () => {
        const stats = await db.alertHistory.getStatistics("alert_nonexistent");

        expect(stats.alertId).toBe("alert_nonexistent");
        expect(stats.totalTriggers).toBe(0);
        expect(stats.totalSnoozes).toBe(0);
        expect(stats.averageSnoozeCount).toBe(0);
        expect(stats.onTimeDismissalRate).toBe(0);
        expect(stats.lastTriggeredAt).toBeNull();
      });

      it("should delete history entries when alert is deleted", async () => {
        await db.alerts.save(mockAlert);

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:03:00Z",
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-16T08:00:00Z",
          dismissedAt: "2026-01-16T08:04:00Z",
          snoozeCount: 1,
          totalSnoozeDuration: 10,
          wasOnTime: true,
        });

        const historyBefore = await db.alertHistory.getByAlert("alert_1");
        expect(historyBefore).toHaveLength(2);

        await db.alertHistory.deleteByAlert("alert_1");

        const historyAfter = await db.alertHistory.getByAlert("alert_1");
        expect(historyAfter).toHaveLength(0);
      });

      it("should track snooze patterns correctly", async () => {
        await db.alerts.save(mockAlert);

        // Alert with multiple snoozes (not on time)
        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:45:00Z",
          snoozeCount: 5,
          totalSnoozeDuration: 50,
          wasOnTime: false,
        });

        // Alert dismissed immediately (on time)
        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-16T08:00:00Z",
          dismissedAt: "2026-01-16T08:02:00Z",
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        const stats = await db.alertHistory.getStatistics("alert_1");
        expect(stats.averageSnoozeCount).toBe(2.5);
        expect(stats.onTimeDismissalRate).toBe(50);
      });

      it("should handle active alerts (not yet dismissed)", async () => {
        const entry = await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: null,
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        expect(entry.dismissedAt).toBeNull();

        const all = await db.alertHistory.getAll();
        expect(all).toHaveLength(1);
        expect(all[0].dismissedAt).toBeNull();
      });

      it("should suggest optimal snooze duration based on history", async () => {
        await db.alerts.save(mockAlert);

        // Add history with consistent 15-minute snooze pattern
        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:30:00Z",
          snoozeCount: 2,
          totalSnoozeDuration: 30, // 15 min per snooze
          wasOnTime: false,
        });

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-16T08:00:00Z",
          dismissedAt: "2026-01-16T08:15:00Z",
          snoozeCount: 1,
          totalSnoozeDuration: 15,
          wasOnTime: false,
        });

        const suggestion =
          await db.alertHistory.getSmartSnoozeSuggestion("alert_1");
        expect(suggestion).toBe(15); // Should suggest 15 minutes
      });

      it("should suggest 5 minutes for users who never snooze", async () => {
        await db.alerts.save(mockAlert);

        // Add history with no snoozing
        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:02:00Z",
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-16T08:00:00Z",
          dismissedAt: "2026-01-16T08:01:00Z",
          snoozeCount: 0,
          totalSnoozeDuration: 0,
          wasOnTime: true,
        });

        const suggestion =
          await db.alertHistory.getSmartSnoozeSuggestion("alert_1");
        expect(suggestion).toBe(5); // Shorter duration for disciplined users
      });

      it("should default to 10 minutes with no history", async () => {
        const suggestion =
          await db.alertHistory.getSmartSnoozeSuggestion("alert_new");
        expect(suggestion).toBe(10); // Default value
      });

      it("should round to nearest valid snooze option", async () => {
        await db.alerts.save(mockAlert);

        // Add history with 12-minute average (should round to 10 or 15)
        await db.alertHistory.add({
          alertId: "alert_1",
          triggeredAt: "2026-01-15T08:00:00Z",
          dismissedAt: "2026-01-15T08:24:00Z",
          snoozeCount: 2,
          totalSnoozeDuration: 24, // 12 min average
          wasOnTime: false,
        });

        const suggestion =
          await db.alertHistory.getSmartSnoozeSuggestion("alert_1");
        expect([10, 15]).toContain(suggestion); // Should be closest valid option
      });
    });
  });

  describe("Scheduling Hooks", () => {
    it("should expose sound and vibration presets", () => {
      expect(db.alerts.getSoundPresets()).toContain("gentle");
      expect(db.alerts.getVibrationPresets()).toContain("pulse");
    });

    it("should calculate the next trigger time for a recurring alert", () => {
      const nextTrigger = db.alerts.getNextTriggerAt(
        mockAlert,
        new Date("2026-01-15T09:00:00Z"),
      );

      expect(nextTrigger).toBe("2026-01-16T08:00:00.000Z");
    });

    it("should build upcoming trigger windows", async () => {
      const disabledAlert: Alert = {
        ...mockAlert,
        id: "alert_disabled",
        isEnabled: false,
        time: "2026-01-15T09:00:00Z",
        recurrenceRule: "none",
      };

      await db.alerts.save(mockAlert);
      await db.alerts.save(disabledAlert);

      const triggers = await db.alerts.getUpcomingTriggers(
        "2026-01-15T07:00:00Z",
        "2026-01-15T10:00:00Z",
      );

      expect(triggers).toHaveLength(1);
      expect(triggers[0].alertId).toBe("alert_1");
    });
  });
});
