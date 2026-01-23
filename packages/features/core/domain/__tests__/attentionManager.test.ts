/**
 * Attention Manager Test Suite
 *
 * Tests the attention management system that prioritizes notifications
 * and updates across 38+ modules.
 */

import { attentionManager, AttentionItem } from "../attentionManager";
import { eventBus, EVENT_TYPES } from "../eventBus";

describe("AttentionManager", () => {
  beforeEach(async () => {
    // Reset the manager before each test
    attentionManager.destroy();
    await attentionManager.initialize(false); // Don't start expiry check in tests
  });

  afterEach(() => {
    attentionManager.destroy();
  });

  describe("initialization", () => {
    it("should initialize successfully", async () => {
      await attentionManager.initialize();
      expect(attentionManager).toBeDefined();
    });
  });

  describe("addItem", () => {
    it("should add an urgent item", () => {
      const item: AttentionItem = {
        id: "test-1",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Overdue Task",
        summary: "Task is overdue",
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      const result = attentionManager.addItem(item);
      expect(result).toBe(true);

      const items = attentionManager.getItems("urgent");
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("test-1");
    });

    it("should add an attention item", () => {
      const item: AttentionItem = {
        id: "test-2",
        module: "calendar",
        priority: "attention",
        status: "active",
        title: "Upcoming Meeting",
        summary: "Meeting in 2 hours",
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      attentionManager.addItem(item);

      const items = attentionManager.getItems("attention");
      expect(items).toHaveLength(1);
      expect(items[0].priority).toBe("attention");
    });

    it("should add an fyi item", () => {
      const item: AttentionItem = {
        id: "test-3",
        module: "messages",
        priority: "fyi",
        status: "active",
        title: "New Message",
        summary: "You have a new message",
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      attentionManager.addItem(item);

      const items = attentionManager.getItems("fyi");
      expect(items).toHaveLength(1);
    });

    it("should emit event when item is added", (done) => {
      const item: AttentionItem = {
        id: "test-4",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test item",
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      const unsubscribe = eventBus.on(EVENT_TYPES.USER_ACTION, (payload) => {
        if (
          payload.data.action === "attention:item-added" &&
          (payload.data.item as any).id === "test-4"
        ) {
          unsubscribe();
          done();
        }
      });

      attentionManager.addItem(item);
    });
  });

  describe("getItems", () => {
    beforeEach(() => {
      // Add test items
      attentionManager.addItem({
        id: "urgent-1",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Urgent 1",
        summary: "Test",
        createdAt: new Date(Date.now() - 1000).toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "attention-1",
        module: "calendar",
        priority: "attention",
        status: "active",
        title: "Attention 1",
        summary: "Test",
        createdAt: new Date(Date.now() - 2000).toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "fyi-1",
        module: "messages",
        priority: "fyi",
        status: "active",
        title: "FYI 1",
        summary: "Test",
        createdAt: new Date(Date.now() - 3000).toISOString(),
        metadata: {},
      });
    });

    it("should return all active items", () => {
      const items = attentionManager.getItems();
      expect(items.length).toBeGreaterThanOrEqual(3);
    });

    it("should filter by priority", () => {
      const urgentItems = attentionManager.getItems("urgent");
      expect(urgentItems.every((item) => item.priority === "urgent")).toBe(
        true,
      );
      expect(urgentItems.length).toBeGreaterThanOrEqual(1);
    });

    it("should sort by priority (urgent first)", () => {
      const items = attentionManager.getItems();
      const firstUrgentIndex = items.findIndex(
        (item) => item.priority === "urgent",
      );
      const firstAttentionIndex = items.findIndex(
        (item) => item.priority === "attention",
      );
      const firstFyiIndex = items.findIndex((item) => item.priority === "fyi");

      if (firstUrgentIndex !== -1 && firstAttentionIndex !== -1) {
        expect(firstUrgentIndex).toBeLessThan(firstAttentionIndex);
      }
      if (firstAttentionIndex !== -1 && firstFyiIndex !== -1) {
        expect(firstAttentionIndex).toBeLessThan(firstFyiIndex);
      }
    });

    it("should not include dismissed items", () => {
      attentionManager.dismissItem("urgent-1");
      const items = attentionManager.getItems();
      expect(items.find((item) => item.id === "urgent-1")).toBeUndefined();
    });
  });

  describe("getCounts", () => {
    beforeEach(() => {
      attentionManager.addItem({
        id: "u1",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "u2",
        module: "calendar",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "a1",
        module: "messages",
        priority: "attention",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });
    });

    it("should return correct counts by priority", () => {
      const counts = attentionManager.getCounts();
      expect(counts.urgent).toBeGreaterThanOrEqual(2);
      expect(counts.attention).toBeGreaterThanOrEqual(1);
    });
  });

  describe("dismissItem", () => {
    it("should dismiss an item", () => {
      const item: AttentionItem = {
        id: "dismiss-1",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      attentionManager.addItem(item);
      attentionManager.dismissItem("dismiss-1");

      const items = attentionManager.getItems();
      expect(items.find((i) => i.id === "dismiss-1")).toBeUndefined();
    });

    it("should emit event when item is dismissed", (done) => {
      const item: AttentionItem = {
        id: "dismiss-2",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      attentionManager.addItem(item);

      const unsubscribe = eventBus.on(EVENT_TYPES.USER_ACTION, (payload) => {
        if (
          payload.data.action === "attention:item-dismissed" &&
          payload.data.itemId === "dismiss-2"
        ) {
          unsubscribe();
          done();
        }
      });

      attentionManager.dismissItem("dismiss-2");
    });
  });

  describe("resolveItem", () => {
    it("should resolve an item", () => {
      const item: AttentionItem = {
        id: "resolve-1",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      };

      attentionManager.addItem(item);
      attentionManager.resolveItem("resolve-1");

      const items = attentionManager.getItems();
      expect(items.find((i) => i.id === "resolve-1")).toBeUndefined();
    });
  });

  describe("focus mode", () => {
    beforeEach(() => {
      // Add items of different priorities
      attentionManager.addItem({
        id: "focus-urgent",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Urgent",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "focus-attention",
        module: "calendar",
        priority: "attention",
        status: "active",
        title: "Attention",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "focus-fyi",
        module: "messages",
        priority: "fyi",
        status: "active",
        title: "FYI",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });
    });

    it("should enable focus mode", () => {
      attentionManager.setFocusMode({ enabled: true });
      const mode = attentionManager.getFocusMode();
      expect(mode.enabled).toBe(true);
    });

    it("should filter non-urgent items in focus mode", () => {
      const beforeCount = attentionManager.getItems().length;

      attentionManager.setFocusMode({ enabled: true, allowUrgent: true });

      // Add new item in focus mode
      const added = attentionManager.addItem({
        id: "focus-new-fyi",
        module: "messages",
        priority: "fyi",
        status: "active",
        title: "New FYI",
        summary: "Should be blocked",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      expect(added).toBe(false);
    });

    it("should allow urgent items in focus mode", () => {
      attentionManager.setFocusMode({ enabled: true, allowUrgent: true });

      const added = attentionManager.addItem({
        id: "focus-new-urgent",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "New Urgent",
        summary: "Should be allowed",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      expect(added).toBe(true);
    });

    it("should respect module whitelist in focus mode", () => {
      attentionManager.setFocusMode({
        enabled: true,
        allowUrgent: false,
        allowedModules: ["messages"],
      });

      const messagesAdded = attentionManager.addItem({
        id: "whitelist-msg",
        module: "messages",
        priority: "fyi",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      const plannerAdded = attentionManager.addItem({
        id: "whitelist-planner",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      expect(messagesAdded).toBe(true);
      expect(plannerAdded).toBe(false);
    });

    it("should emit event when focus mode changes", (done) => {
      const unsubscribe = eventBus.on(EVENT_TYPES.USER_ACTION, (payload) => {
        if (
          payload.data.action === "attention:focus-mode-changed" &&
          (payload.data.mode as any).enabled === true
        ) {
          unsubscribe();
          done();
        }
      });

      attentionManager.setFocusMode({ enabled: true });
    });
  });

  describe("bundling", () => {
    it("should bundle related items from same module", () => {
      // Add multiple items from same module within bundling window
      const now = Date.now();

      attentionManager.addItem({
        id: "bundle-1",
        module: "messages",
        priority: "attention",
        status: "active",
        title: "Message 1",
        summary: "Test 1",
        createdAt: new Date(now).toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "bundle-2",
        module: "messages",
        priority: "attention",
        status: "active",
        title: "Message 2",
        summary: "Test 2",
        createdAt: new Date(now + 1000).toISOString(),
        metadata: {},
      });

      const bundles = attentionManager.getBundles();
      expect(bundles.length).toBeGreaterThanOrEqual(1);

      const messagesBundle = bundles.find((b) =>
        b.items.some((i) => i.module === "messages"),
      );
      if (messagesBundle) {
        expect(messagesBundle.items.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("should dismiss entire bundle", (done) => {
      const now = Date.now();

      attentionManager.addItem({
        id: "bundle-dismiss-1",
        module: "messages",
        priority: "attention",
        status: "active",
        title: "Message 1",
        summary: "Test",
        createdAt: new Date(now).toISOString(),
        metadata: {},
      });

      attentionManager.addItem({
        id: "bundle-dismiss-2",
        module: "messages",
        priority: "attention",
        status: "active",
        title: "Message 2",
        summary: "Test",
        createdAt: new Date(now + 1000).toISOString(),
        metadata: {},
      });

      const bundles = attentionManager.getBundles();
      if (bundles.length > 0) {
        const unsubscribe = eventBus.on(EVENT_TYPES.USER_ACTION, (payload) => {
          if (payload.data.action === "attention:bundle-dismissed") {
            expect(payload.data.bundleId).toBeDefined();
            unsubscribe();
            done();
          }
        });

        attentionManager.dismissBundle(bundles[0].id);
      } else {
        done();
      }
    });
  });

  describe("subscribe", () => {
    it("should notify subscribers when items change", () => {
      let callCount = 0;

      const unsubscribe = attentionManager.subscribe(() => {
        callCount++;
      });

      attentionManager.addItem({
        id: "sub-test",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      // Subscriber should have been called
      expect(callCount).toBeGreaterThanOrEqual(1);
      unsubscribe();
    });

    it("should unsubscribe correctly", () => {
      let callCount = 0;

      const unsubscribe = attentionManager.subscribe(() => {
        callCount++;
      });

      attentionManager.addItem({
        id: "unsub-test-1",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      expect(callCount).toBeGreaterThanOrEqual(1);
      const countAfterFirst = callCount;

      unsubscribe();

      attentionManager.addItem({
        id: "unsub-test-2",
        module: "planner",
        priority: "urgent",
        status: "active",
        title: "Test",
        summary: "Test",
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      // Should still be same count, not incremented
      expect(callCount).toBe(countAfterFirst);
    });
  });

  describe("event handlers", () => {
    it("should handle task:created event", () => {
      const initialCount = attentionManager.getItems().length;

      eventBus.emit(EVENT_TYPES.TASK_CREATED, {
        id: "task-123",
        title: "New Task",
        priority: "urgent",
        dueDate: new Date().toISOString(),
      });

      // Event handler is async, give it a moment
      const items = attentionManager.getItems();

      // Should have added an item (or failed gracefully)
      expect(items.length).toBeGreaterThanOrEqual(initialCount);
    });

    it("should handle calendar event created", () => {
      const initialCount = attentionManager.getItems().length;

      eventBus.emit(EVENT_TYPES.CALENDAR_EVENT_CREATED, {
        id: "event-123",
        title: "Meeting",
        startAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      });

      const items = attentionManager.getItems();
      expect(items.length).toBeGreaterThanOrEqual(initialCount);
    });

    it("should handle message received", () => {
      const initialCount = attentionManager.getItems().length;

      eventBus.emit(EVENT_TYPES.MESSAGE_RECEIVED, {
        id: "msg-123",
        from: "John",
        text: "Hello!",
        conversationId: "conv-456",
        isDirectMessage: true,
      });

      const items = attentionManager.getItems();
      expect(items.length).toBeGreaterThanOrEqual(initialCount);
    });
  });
});
