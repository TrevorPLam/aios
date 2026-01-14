import { db } from "../database";
import { Integration, IntegrationCategory, IntegrationStatus } from "@/models/types";

describe("Integrations Storage", () => {
  beforeEach(async () => {
    await db.clearAll();
  });

  const createTestIntegration = (overrides?: Partial<Integration>): Integration => ({
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

      const calendarIntegrations = await db.integrations.getByCategory("calendar");
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

      const connectedIntegrations = await db.integrations.getByStatus("connected");
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
});
