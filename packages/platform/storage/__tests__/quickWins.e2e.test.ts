/**
 * Quick Win Data-Layer E2E Test
 *
 * End-to-end validation for non-UI enhancements added during the refactor.
 * Covers history export scheduling, translation retention, recurring events,
 * reminder triggers, and alert scheduling hooks.
 *
 * @module quickWins.e2e.test
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Alert, CalendarEvent, Translation } from "@aios/contracts/models/types";

describe("Quick Win Data-Layer E2E", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("validates data-layer quick wins without UI dependencies", async () => {
    // History: verify scheduled export execution updates schedule metadata.
    await db.history.add({ message: "Pipeline start", type: "system" });
    await db.history.setExportSchedule({
      enabled: true,
      frequency: "daily",
      nextExportAt: "2026-01-01T00:00:00.000Z",
    });

    const payload = await db.history.runScheduledExport(
      new Date("2026-01-02T00:00:00.000Z"),
    );
    expect(payload).toContain("Pipeline start");

    // Translator: retention keeps favorites while trimming history.
    await db.translations.setRetentionPolicy({
      maxEntries: 1,
      maxAgeDays: null,
      keepFavorites: true,
    });

    const favoriteTranslation: Translation = {
      id: "trans-fav",
      sourceText: "Hello",
      targetText: "Hola",
      sourceLang: "en",
      targetLang: "es",
      createdAt: "2024-01-01T00:00:00.000Z",
      characterCount: 5,
      isFavorite: true,
    };

    const recentTranslation: Translation = {
      id: "trans-2",
      sourceText: "Goodbye",
      targetText: "Adiós",
      sourceLang: "en",
      targetLang: "es",
      createdAt: "2024-01-02T00:00:00.000Z",
      characterCount: 7,
    };

    await db.translations.save(favoriteTranslation);
    await db.translations.save(recentTranslation);

    const retained = await db.translations.getAll();
    expect(retained).toHaveLength(1);
    expect(retained[0].id).toBe("trans-fav");

    // Calendar: recurring expansion drives reminder scheduling hooks.
    const recurringEvent: CalendarEvent = {
      id: "event-quick",
      title: "Daily Sync",
      description: "Daily standup",
      location: "Zoom",
      startAt: "2026-01-01T10:00:00.000Z",
      endAt: "2026-01-01T10:30:00.000Z",
      allDay: false,
      timezone: "UTC",
      recurrenceRule: "daily",
      exceptions: [],
      overrides: {},
      reminderMinutes: [15],
      createdAt: "2025-12-31T10:00:00.000Z",
      updatedAt: "2025-12-31T10:00:00.000Z",
      source: "LOCAL",
    };

    await db.events.save(recurringEvent);

    const reminders = await db.events.getRemindersForDateRange(
      "2026-01-01T00:00:00.000Z",
      "2026-01-01T23:59:59.000Z",
    );
    expect(reminders).toHaveLength(1);
    expect(reminders[0].reminderAt).toBe("2026-01-01T09:45:00.000Z");

    // Alerts: scheduling hooks surface upcoming triggers for system services.
    const alert: Alert = {
      id: "alert-quick",
      title: "Daily Alert",
      description: "Alert test",
      time: "2026-01-01T08:00:00Z",
      type: "alarm",
      isEnabled: true,
      recurrenceRule: "daily",
      sound: "default",
      vibration: "default",
      gradualVolume: false,
      snoozeDuration: 10,
      tags: [],
      createdAt: "2025-12-31T00:00:00Z",
      updatedAt: "2025-12-31T00:00:00Z",
    };

    await db.alerts.save(alert);

    const triggers = await db.alerts.getUpcomingTriggers(
      "2026-01-01T00:00:00Z",
      "2026-01-01T23:59:59Z",
    );
    expect(triggers).toHaveLength(1);
    expect(triggers[0].alertId).toBe("alert-quick");
  });
});
