import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Alert } from "@/models/types";

describe("Database Alerts Storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const mockAlert: Alert = {
    id: "alert_1",
    title: "Wake up",
    description: "Time to start the day",
    time: "2026-01-15T08:00:00Z",
    type: "alarm",
    isEnabled: true,
    recurrenceRule: "daily",
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
  });
});
