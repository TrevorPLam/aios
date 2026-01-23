import { db } from "../database";
import {
  Integration,
  IntegrationCategory,
  IntegrationStatus,
} from "@contracts/models/types";

describe("Integrations Storage", () => {
  beforeEach(async () => {
    await db.clearAll();
  });

  const createTestIntegration = (
    overrides?: Partial<Integration>,
  ): Integration => ({
    id: "integration_1",
    name: "Google Calendar",
    serviceName: "Google",
    category: "calendar" as IntegrationCategory,
    description: "Sync your calendar events with Google Calendar",
    iconName: "calendar",
    status: "connected" as IntegrationStatus,
    isEnabled: true,
    lastSyncAt: new Date().toISOString(),
    connectedAt: new Date().toISOString(),
    config: {
      syncFrequency: "hourly",
      syncEnabled: true,
      notificationsEnabled: true,
      twoWaySync: true,
      syncedDataTypes: ["events", "reminders"],
    },
    stats: {
      totalSyncs: 42,
      dataItemsSynced: 128,
      lastSyncDurationMs: 1500,
      errorCount: 2,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      accountEmail: "user@example.com",
    },
    ...overrides,
  });

  describe("getAll", () => {
    it("should return empty array when no integrations exist", async () => {
      const integrations = await db.integrations.getAll();
      expect(integrations).toEqual([]);
    });

    it("should return all integrations", async () => {
      const integration1 = createTestIntegration();
      const integration2 = createTestIntegration({
        id: "integration_2",
        name: "Dropbox",
        category: "cloud_storage",
      });

      await db.integrations.save(integration1);
      await db.integrations.save(integration2);

      const integrations = await db.integrations.getAll();
      expect(integrations).toHaveLength(2);
    });
  });

  describe("getAllSorted", () => {
    it("should return integrations sorted by category then name", async () => {
      const calendar = createTestIntegration({
        id: "int_1",
        name: "Google Calendar",
        category: "calendar",
      });
      const gmail = createTestIntegration({
        id: "int_2",
        name: "Gmail",
        category: "email",
      });
      const outlook = createTestIntegration({
        id: "int_3",
        name: "Outlook Calendar",
        category: "calendar",
      });

      await db.integrations.save(gmail);
      await db.integrations.save(calendar);
      await db.integrations.save(outlook);

      const sorted = await db.integrations.getAllSorted();
      expect(sorted).toHaveLength(3);
      expect(sorted[0].name).toBe("Google Calendar");
      expect(sorted[1].name).toBe("Outlook Calendar");
      expect(sorted[2].name).toBe("Gmail");
    });
  });

  describe("getByCategory", () => {
    it("should return only integrations of specified category", async () => {
      const calendar = createTestIntegration({
        id: "int_1",
        category: "calendar",
      });
      const email = createTestIntegration({
        id: "int_2",
        category: "email",
      });

      await db.integrations.save(calendar);
      await db.integrations.save(email);

      const calendarIntegrations =
        await db.integrations.getByCategory("calendar");
      expect(calendarIntegrations).toHaveLength(1);
      expect(calendarIntegrations[0].category).toBe("calendar");
    });
  });

  describe("getByStatus", () => {
    it("should return only integrations with specified status", async () => {
      const connected = createTestIntegration({
        id: "int_1",
        status: "connected",
      });
      const disconnected = createTestIntegration({
        id: "int_2",
        status: "disconnected",
      });

      await db.integrations.save(connected);
      await db.integrations.save(disconnected);

      const connectedIntegrations =
        await db.integrations.getByStatus("connected");
      expect(connectedIntegrations).toHaveLength(1);
      expect(connectedIntegrations[0].status).toBe("connected");
    });
  });

  describe("getById", () => {
    it("should return null when integration does not exist", async () => {
      const integration = await db.integrations.getById("nonexistent");
      expect(integration).toBeNull();
    });

    it("should return the correct integration", async () => {
      const testIntegration = createTestIntegration();
      await db.integrations.save(testIntegration);

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("Google Calendar");
    });
  });

  describe("save", () => {
    it("should save a new integration", async () => {
      const integration = createTestIntegration();
      await db.integrations.save(integration);

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("Google Calendar");
    });

    it("should update an existing integration", async () => {
      const integration = createTestIntegration();
      await db.integrations.save(integration);

      const updated = { ...integration, name: "Updated Calendar" };
      await db.integrations.save(updated);

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved?.name).toBe("Updated Calendar");
    });
  });

  describe("delete", () => {
    it("should delete an integration", async () => {
      const integration = createTestIntegration();
      await db.integrations.save(integration);

      await db.integrations.delete("integration_1");

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("should update integration status", async () => {
      const integration = createTestIntegration({ status: "connected" });
      await db.integrations.save(integration);

      await db.integrations.updateStatus("integration_1", "disconnected");

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved?.status).toBe("disconnected");
    });
  });

  describe("updateLastSync", () => {
    it("should update last sync time and increment sync count", async () => {
      const integration = createTestIntegration({
        stats: {
          totalSyncs: 5,
          dataItemsSynced: 100,
          lastSyncDurationMs: 1000,
          errorCount: 0,
        },
      });
      await db.integrations.save(integration);

      await db.integrations.updateLastSync("integration_1");

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved?.lastSyncAt).not.toBeNull();
      expect(retrieved?.stats.totalSyncs).toBe(6);
    });
  });

  describe("toggleEnabled", () => {
    it("should toggle integration enabled state", async () => {
      const integration = createTestIntegration({ isEnabled: true });
      await db.integrations.save(integration);

      await db.integrations.toggleEnabled("integration_1");

      let retrieved = await db.integrations.getById("integration_1");
      expect(retrieved?.isEnabled).toBe(false);

      await db.integrations.toggleEnabled("integration_1");

      retrieved = await db.integrations.getById("integration_1");
      expect(retrieved?.isEnabled).toBe(true);
    });
  });

  describe("search", () => {
    it("should return all integrations when query is empty", async () => {
      const integration1 = createTestIntegration();
      const integration2 = createTestIntegration({
        id: "integration_2",
        name: "Dropbox",
      });
      await db.integrations.save(integration1);
      await db.integrations.save(integration2);

      const results = await db.integrations.search("");
      expect(results).toHaveLength(2);
    });

    it("should search by name", async () => {
      const calendar = createTestIntegration({
        id: "int_1",
        name: "Google Calendar",
        description: "Sync events with Google",
      });
      const dropbox = createTestIntegration({
        id: "int_2",
        name: "Dropbox",
        serviceName: "Dropbox",
        description: "Cloud storage sync",
      });
      await db.integrations.save(calendar);
      await db.integrations.save(dropbox);

      const results = await db.integrations.search("Calendar");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Google Calendar");
    });

    it("should search by service name", async () => {
      const calendar = createTestIntegration({
        id: "int_1",
        name: "Calendar Integration",
        serviceName: "Google",
      });
      await db.integrations.save(calendar);

      const results = await db.integrations.search("Google");
      expect(results).toHaveLength(1);
      expect(results[0].serviceName).toBe("Google");
    });

    it("should search by description", async () => {
      const calendar = createTestIntegration({
        id: "int_1",
        description: "Sync your calendar events with Google Calendar",
      });
      await db.integrations.save(calendar);

      const results = await db.integrations.search("events");
      expect(results).toHaveLength(1);
    });

    it("should be case insensitive", async () => {
      const calendar = createTestIntegration({
        id: "int_1",
        name: "Google Calendar",
      });
      await db.integrations.save(calendar);

      const results = await db.integrations.search("google");
      expect(results).toHaveLength(1);
    });
  });

  describe("filter", () => {
    it("should filter by category", async () => {
      const calendar = createTestIntegration({
        id: "int_1",
        category: "calendar",
      });
      const email = createTestIntegration({
        id: "int_2",
        category: "email",
      });
      await db.integrations.save(calendar);
      await db.integrations.save(email);

      const results = await db.integrations.filter({ category: "calendar" });
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe("calendar");
    });

    it("should filter by status", async () => {
      const connected = createTestIntegration({
        id: "int_1",
        status: "connected",
      });
      const disconnected = createTestIntegration({
        id: "int_2",
        status: "disconnected",
      });
      await db.integrations.save(connected);
      await db.integrations.save(disconnected);

      const results = await db.integrations.filter({ status: "connected" });
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe("connected");
    });

    it("should filter by enabled state", async () => {
      const enabled = createTestIntegration({
        id: "int_1",
        isEnabled: true,
      });
      const disabled = createTestIntegration({
        id: "int_2",
        isEnabled: false,
      });
      await db.integrations.save(enabled);
      await db.integrations.save(disabled);

      const results = await db.integrations.filter({ isEnabled: true });
      expect(results).toHaveLength(1);
      expect(results[0].isEnabled).toBe(true);
    });

    it("should apply multiple filters", async () => {
      const calendar1 = createTestIntegration({
        id: "int_1",
        category: "calendar",
        status: "connected",
        isEnabled: true,
      });
      const calendar2 = createTestIntegration({
        id: "int_2",
        category: "calendar",
        status: "disconnected",
        isEnabled: true,
      });
      const email = createTestIntegration({
        id: "int_3",
        category: "email",
        status: "connected",
        isEnabled: true,
      });
      await db.integrations.save(calendar1);
      await db.integrations.save(calendar2);
      await db.integrations.save(email);

      const results = await db.integrations.filter({
        category: "calendar",
        status: "connected",
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("int_1");
    });
  });

  describe("getStatistics", () => {
    it("should return correct statistics", async () => {
      const connected = createTestIntegration({
        id: "int_1",
        status: "connected",
        isEnabled: true,
        stats: {
          totalSyncs: 10,
          dataItemsSynced: 100,
          lastSyncDurationMs: 2000,
          errorCount: 1,
        },
      });
      const disconnected = createTestIntegration({
        id: "int_2",
        status: "disconnected",
        isEnabled: false,
        stats: {
          totalSyncs: 5,
          dataItemsSynced: 50,
          lastSyncDurationMs: 1000,
          errorCount: 2,
        },
      });
      const error = createTestIntegration({
        id: "int_3",
        status: "error",
        isEnabled: true,
        stats: {
          totalSyncs: 0,
          dataItemsSynced: 0,
          lastSyncDurationMs: 0,
          errorCount: 5,
        },
      });

      await db.integrations.save(connected);
      await db.integrations.save(disconnected);
      await db.integrations.save(error);

      const stats = await db.integrations.getStatistics();

      expect(stats.totalIntegrations).toBe(3);
      expect(stats.connectedCount).toBe(1);
      expect(stats.disconnectedCount).toBe(1);
      expect(stats.errorCount).toBe(1);
      expect(stats.enabledCount).toBe(2);
      expect(stats.totalSyncs).toBe(15);
      expect(stats.totalDataItemsSynced).toBe(150);
      expect(stats.totalErrors).toBe(8);
      expect(stats.averageSyncDuration).toBe(1500); // (2000 + 1000) / 2
    });

    it("should count integrations by category", async () => {
      const calendar1 = createTestIntegration({
        id: "int_1",
        category: "calendar",
      });
      const calendar2 = createTestIntegration({
        id: "int_2",
        category: "calendar",
      });
      const email = createTestIntegration({
        id: "int_3",
        category: "email",
      });

      await db.integrations.save(calendar1);
      await db.integrations.save(calendar2);
      await db.integrations.save(email);

      const stats = await db.integrations.getStatistics();

      expect(stats.categoryCounts.calendar).toBe(2);
      expect(stats.categoryCounts.email).toBe(1);
    });

    it("should return recent syncs", async () => {
      const now = new Date();
      const int1 = createTestIntegration({
        id: "int_1",
        name: "Integration 1",
        lastSyncAt: new Date(now.getTime() - 1000).toISOString(),
      });
      const int2 = createTestIntegration({
        id: "int_2",
        name: "Integration 2",
        lastSyncAt: new Date(now.getTime() - 2000).toISOString(),
      });

      await db.integrations.save(int1);
      await db.integrations.save(int2);

      const stats = await db.integrations.getStatistics();

      expect(stats.recentSyncs).toHaveLength(2);
      expect(stats.recentSyncs[0].id).toBe("int_1"); // Most recent first
      expect(stats.recentSyncs[1].id).toBe("int_2");
    });
  });

  describe("triggerSync", () => {
    it("should update sync information", async () => {
      const integration = createTestIntegration({
        stats: {
          totalSyncs: 5,
          dataItemsSynced: 100,
          lastSyncDurationMs: 1000,
          errorCount: 0,
        },
      });
      await db.integrations.save(integration);

      await db.integrations.triggerSync("integration_1", 2500, 25);

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved?.stats.totalSyncs).toBe(6);
      expect(retrieved?.stats.dataItemsSynced).toBe(125);
      expect(retrieved?.stats.lastSyncDurationMs).toBe(2500);
      expect(retrieved?.status).toBe("connected");
    });
  });

  describe("recordSyncError", () => {
    it("should increment error count and set status to error", async () => {
      const integration = createTestIntegration({
        status: "connected",
        stats: {
          totalSyncs: 5,
          dataItemsSynced: 100,
          lastSyncDurationMs: 1000,
          errorCount: 1,
        },
      });
      await db.integrations.save(integration);

      await db.integrations.recordSyncError("integration_1");

      const retrieved = await db.integrations.getById("integration_1");
      expect(retrieved?.stats.errorCount).toBe(2);
      expect(retrieved?.status).toBe("error");
    });
  });

  describe("bulkSetEnabled", () => {
    it("should enable/disable multiple integrations", async () => {
      const int1 = createTestIntegration({
        id: "int_1",
        isEnabled: false,
      });
      const int2 = createTestIntegration({
        id: "int_2",
        isEnabled: false,
      });
      const int3 = createTestIntegration({
        id: "int_3",
        isEnabled: false,
      });

      await db.integrations.save(int1);
      await db.integrations.save(int2);
      await db.integrations.save(int3);

      await db.integrations.bulkSetEnabled(["int_1", "int_2"], true);

      const retrieved1 = await db.integrations.getById("int_1");
      const retrieved2 = await db.integrations.getById("int_2");
      const retrieved3 = await db.integrations.getById("int_3");

      expect(retrieved1?.isEnabled).toBe(true);
      expect(retrieved2?.isEnabled).toBe(true);
      expect(retrieved3?.isEnabled).toBe(false); // Not in the list
    });
  });

  describe("bulkUpdateStatus", () => {
    it("should update status for multiple integrations", async () => {
      const int1 = createTestIntegration({
        id: "int_1",
        status: "connected",
      });
      const int2 = createTestIntegration({
        id: "int_2",
        status: "connected",
      });

      await db.integrations.save(int1);
      await db.integrations.save(int2);

      await db.integrations.bulkUpdateStatus(
        ["int_1", "int_2"],
        "disconnected",
      );

      const retrieved1 = await db.integrations.getById("int_1");
      const retrieved2 = await db.integrations.getById("int_2");

      expect(retrieved1?.status).toBe("disconnected");
      expect(retrieved2?.status).toBe("disconnected");
    });
  });

  describe("exportToJSON", () => {
    it("should export integration to JSON", async () => {
      const integration = createTestIntegration();
      await db.integrations.save(integration);

      const json = await db.integrations.exportToJSON("integration_1");
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe("integration_1");
      expect(parsed.name).toBe("Google Calendar");
    });

    it("should throw error for non-existent integration", async () => {
      await expect(db.integrations.exportToJSON("nonexistent")).rejects.toThrow(
        'Integration with ID "nonexistent" not found',
      );
    });
  });

  describe("exportAllToJSON", () => {
    it("should export all integrations to JSON", async () => {
      const int1 = createTestIntegration({ id: "int_1" });
      const int2 = createTestIntegration({ id: "int_2" });

      await db.integrations.save(int1);
      await db.integrations.save(int2);

      const json = await db.integrations.exportAllToJSON();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe("int_1");
      expect(parsed[1].id).toBe("int_2");
    });
  });

  describe("getRequiringSync", () => {
    it("should return integrations that need sync", async () => {
      const now = new Date();
      const recentSync = createTestIntegration({
        id: "int_1",
        isEnabled: true,
        status: "connected",
        lastSyncAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      });
      const oldSync = createTestIntegration({
        id: "int_2",
        isEnabled: true,
        status: "connected",
        lastSyncAt: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
      });
      const neverSynced = createTestIntegration({
        id: "int_3",
        isEnabled: true,
        status: "connected",
        lastSyncAt: undefined,
      });

      await db.integrations.save(recentSync);
      await db.integrations.save(oldSync);
      await db.integrations.save(neverSynced);

      const requiring = await db.integrations.getRequiringSync(24);

      expect(requiring).toHaveLength(2); // oldSync and neverSynced
      expect(requiring.find((i) => i.id === "int_2")).toBeDefined();
      expect(requiring.find((i) => i.id === "int_3")).toBeDefined();
    });

    it("should not return disabled integrations", async () => {
      const now = new Date();
      const disabled = createTestIntegration({
        id: "int_1",
        isEnabled: false,
        status: "connected",
        lastSyncAt: new Date(now.getTime() - 1000 * 60 * 60 * 25).toISOString(),
      });

      await db.integrations.save(disabled);

      const requiring = await db.integrations.getRequiringSync(24);

      expect(requiring).toHaveLength(0);
    });
  });

  describe("getHealthReport", () => {
    it("should report healthy when no issues", async () => {
      const healthy = createTestIntegration({
        id: "int_1",
        status: "connected",
        isEnabled: true,
        lastSyncAt: new Date().toISOString(),
      });

      await db.integrations.save(healthy);

      const report = await db.integrations.getHealthReport();

      expect(report.healthy).toBe(true);
      expect(report.warnings).toHaveLength(0);
      expect(report.errorIntegrations).toHaveLength(0);
    });

    it("should warn about integrations with errors", async () => {
      const error = createTestIntegration({
        id: "int_1",
        status: "error",
      });

      await db.integrations.save(error);

      const report = await db.integrations.getHealthReport();

      expect(report.healthy).toBe(false);
      expect(report.warnings.length).toBeGreaterThan(0);
      expect(report.errorIntegrations).toHaveLength(1);
    });

    it("should warn about stale integrations", async () => {
      const now = new Date();
      const stale = createTestIntegration({
        id: "int_1",
        isEnabled: true,
        status: "connected",
        lastSyncAt: new Date(
          now.getTime() - 8 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 8 days ago
      });

      await db.integrations.save(stale);

      const report = await db.integrations.getHealthReport();

      expect(report.warnings.length).toBeGreaterThan(0);
      expect(report.staleIntegrations).toHaveLength(1);
    });

    it("should recommend enabling more integrations when most are disabled", async () => {
      const enabled = createTestIntegration({
        id: "int_1",
        isEnabled: true,
      });
      const disabled1 = createTestIntegration({
        id: "int_2",
        isEnabled: false,
      });
      const disabled2 = createTestIntegration({
        id: "int_3",
        isEnabled: false,
      });

      await db.integrations.save(enabled);
      await db.integrations.save(disabled1);
      await db.integrations.save(disabled2);

      const report = await db.integrations.getHealthReport();

      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it("should warn about high error rates", async () => {
      const highErrors = createTestIntegration({
        id: "int_1",
        stats: {
          totalSyncs: 10,
          dataItemsSynced: 100,
          lastSyncDurationMs: 1000,
          errorCount: 6,
        },
      });

      await db.integrations.save(highErrors);

      const report = await db.integrations.getHealthReport();

      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });
});
