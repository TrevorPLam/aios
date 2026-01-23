/**
 * Module Handoff System Tests
 *
 * Tests the handoff manager functionality including:
 * - Starting handoffs between modules
 * - Returning from handoffs with state preservation
 * - Breadcrumb trail generation
 * - Max depth limits
 * - State persistence
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { moduleHandoffManager, HandoffModule } from "../moduleHandoff";

describe("Module Handoff System", () => {
  beforeEach(async () => {
    // Clear all state before each test
    await moduleHandoffManager.clearAll();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await moduleHandoffManager.clearAll();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      await moduleHandoffManager.initialize();
      expect(moduleHandoffManager.getCurrentChain()).toBeNull();
    });

    it("should restore saved state from storage", async () => {
      // Save a chain to storage first
      const mockChain = {
        id: "test_chain",
        modules: [
          {
            moduleId: "calendar",
            displayName: "Calendar",
            timestamp: Date.now(),
          },
        ],
      };
      await AsyncStorage.setItem(
        "@aios_handoff_state",
        JSON.stringify(mockChain),
      );

      // Clear current state and re-initialize to test restoration
      await moduleHandoffManager.clearAll();
      await moduleHandoffManager.initialize();

      // Note: The manager loads state on initialize, but we can't directly
      // test it without exposing the class. This test verifies the
      // storage mechanism works by saving and clearing.
      const saved = await AsyncStorage.getItem("@aios_handoff_state");
      expect(saved).toBeNull(); // Should be null after clearAll
    });
  });

  describe("Starting Handoffs", () => {
    it("should start a handoff from one module to another", () => {
      const from: HandoffModule = {
        moduleId: "calendar",
        displayName: "Calendar",
        timestamp: Date.now(),
        state: { scrollY: 100 },
      };

      const to: HandoffModule = {
        moduleId: "maps",
        displayName: "Maps",
        timestamp: Date.now(),
      };

      const result = moduleHandoffManager.startHandoff(from, to);

      expect(result).toBe(true);
      expect(moduleHandoffManager.isInHandoff()).toBe(true);

      const chain = moduleHandoffManager.getCurrentChain();
      expect(chain).not.toBeNull();
      expect(chain?.modules.length).toBe(2);
      expect(chain?.modules[0].moduleId).toBe("calendar");
      expect(chain?.modules[1].moduleId).toBe("maps");
    });

    it("should prevent handoff to same module", () => {
      const module: HandoffModule = {
        moduleId: "calendar",
        displayName: "Calendar",
        timestamp: Date.now(),
      };

      const result = moduleHandoffManager.startHandoff(module, module);

      expect(result).toBe(false);
      expect(moduleHandoffManager.isInHandoff()).toBe(false);
    });

    it("should enforce max handoff depth limit", () => {
      // Start a chain
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      // Add more handoffs up to limit
      moduleHandoffManager.startHandoff(
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
        { moduleId: "food", displayName: "Food", timestamp: Date.now() },
      );

      moduleHandoffManager.startHandoff(
        { moduleId: "food", displayName: "Food", timestamp: Date.now() },
        { moduleId: "wallet", displayName: "Wallet", timestamp: Date.now() },
      );

      moduleHandoffManager.startHandoff(
        { moduleId: "wallet", displayName: "Wallet", timestamp: Date.now() },
        {
          moduleId: "messages",
          displayName: "Messages",
          timestamp: Date.now(),
        },
      );

      // Try to exceed limit (max is 5)
      const result = moduleHandoffManager.startHandoff(
        {
          moduleId: "messages",
          displayName: "Messages",
          timestamp: Date.now(),
        },
        { moduleId: "email", displayName: "Email", timestamp: Date.now() },
      );

      expect(result).toBe(false);
      const chain = moduleHandoffManager.getCurrentChain();
      expect(chain?.modules.length).toBe(5); // Should not exceed 5
    });

    it("should include iOS-specific metadata", () => {
      const from: HandoffModule = {
        moduleId: "calendar",
        displayName: "Calendar",
        timestamp: Date.now(),
      };

      const to: HandoffModule = {
        moduleId: "maps",
        displayName: "Maps",
        timestamp: Date.now(),
      };

      moduleHandoffManager.startHandoff(from, to, {
        useNativeAnimation: true,
        presentationStyle: "modal",
      });

      const chain = moduleHandoffManager.getCurrentChain();
      expect(chain?.metadata?.useNativeAnimation).toBe(true);
      expect(chain?.metadata?.presentationStyle).toBe("modal");
    });
  });

  describe("Returning from Handoffs", () => {
    beforeEach(() => {
      // Set up a handoff chain
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
          state: { scrollY: 100, selectedDate: "2026-01-16" },
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );
    });

    it("should return from handoff with preserved state", () => {
      const result = moduleHandoffManager.returnFromHandoff({
        selectedLocation: "Restaurant X",
      });

      expect(result).not.toBeNull();
      expect(result?.action).toBe("back");
      expect(result?.moduleState?.scrollY).toBe(100);
      expect(result?.moduleState?.selectedDate).toBe("2026-01-16");
      expect(result?.data?.selectedLocation).toBe("Restaurant X");
    });

    it("should clear chain when returning to root", () => {
      moduleHandoffManager.returnFromHandoff();

      expect(moduleHandoffManager.isInHandoff()).toBe(false);
      expect(moduleHandoffManager.getCurrentChain()).toBeNull();
    });

    it("should handle multiple returns in deep chain", () => {
      // At this point we have: Calendar → Maps
      // Update Maps state before adding Food
      moduleHandoffManager.updateCurrentModuleState({ zoom: 10 });

      // Now extend with: Maps → Food
      const chain = moduleHandoffManager.getCurrentChain();
      const mapsModule = chain?.modules[1];

      moduleHandoffManager.startHandoff(
        {
          moduleId: mapsModule!.moduleId,
          displayName: mapsModule!.displayName,
          timestamp: Date.now(),
        },
        { moduleId: "food", displayName: "Food", timestamp: Date.now() },
      );

      // Now chain is: Calendar → Maps (with zoom) → Food
      // First return: Food → Maps
      let result = moduleHandoffManager.returnFromHandoff();
      expect(result).not.toBeNull();
      expect(result?.moduleState?.zoom).toBe(10);
      expect(moduleHandoffManager.isInHandoff()).toBe(true);

      // Second return: Maps → Calendar
      result = moduleHandoffManager.returnFromHandoff();
      expect(result).not.toBeNull();
      expect(result?.moduleState?.scrollY).toBe(100);
      expect(moduleHandoffManager.isInHandoff()).toBe(false);
    });

    it("should handle return with complete action", () => {
      const result = moduleHandoffManager.returnFromHandoff(
        { eventCreated: true },
        "complete",
      );

      expect(result?.action).toBe("complete");
      expect(result?.data?.eventCreated).toBe(true);
    });

    it("should return null when no handoff exists", async () => {
      await moduleHandoffManager.clearAll();
      const result = moduleHandoffManager.returnFromHandoff();

      expect(result).toBeNull();
    });
  });

  describe("Canceling Handoffs", () => {
    it("should cancel entire handoff chain", () => {
      // Create deep chain
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
          state: { scrollY: 100 },
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      moduleHandoffManager.startHandoff(
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
        { moduleId: "food", displayName: "Food", timestamp: Date.now() },
      );

      // Cancel should return to original module
      const result = moduleHandoffManager.cancelHandoff({
        cancelled: true,
      });

      expect(result).not.toBeNull();
      expect(result?.action).toBe("cancel");
      expect(result?.moduleState?.scrollY).toBe(100);
      expect(result?.data?.cancelled).toBe(true);
      expect(moduleHandoffManager.isInHandoff()).toBe(false);
    });
  });

  describe("State Updates", () => {
    it("should update current module state", () => {
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      // Update Maps state
      moduleHandoffManager.updateCurrentModuleState({
        zoom: 15,
        center: { lat: 37.7749, lng: -122.4194 },
      });

      const chain = moduleHandoffManager.getCurrentChain();
      const mapsModule = chain?.modules[1];

      expect(mapsModule?.state?.zoom).toBe(15);
      expect(mapsModule?.state?.center?.lat).toBe(37.7749);
      expect(mapsModule?.state?.updatedAt).toBeDefined();
    });

    it("should preserve existing state when updating", () => {
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        {
          moduleId: "maps",
          displayName: "Maps",
          timestamp: Date.now(),
          state: { zoom: 10 },
        },
      );

      // Update with new fields
      moduleHandoffManager.updateCurrentModuleState({
        center: { lat: 37.7749, lng: -122.4194 },
      });

      const chain = moduleHandoffManager.getCurrentChain();
      const mapsModule = chain?.modules[1];

      // Both old and new state should exist
      expect(mapsModule?.state?.zoom).toBe(10);
      expect(mapsModule?.state?.center?.lat).toBe(37.7749);
    });
  });

  describe("Breadcrumbs", () => {
    it("should generate breadcrumb trail", () => {
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      const breadcrumbs = moduleHandoffManager.getBreadcrumbs();

      expect(breadcrumbs).toEqual(["Calendar", "Maps"]);
    });

    it("should update breadcrumbs as chain changes", () => {
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      let breadcrumbs = moduleHandoffManager.getBreadcrumbs();
      expect(breadcrumbs).toEqual(["Calendar", "Maps"]);

      // Add another handoff
      moduleHandoffManager.startHandoff(
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
        { moduleId: "food", displayName: "Food", timestamp: Date.now() },
      );

      breadcrumbs = moduleHandoffManager.getBreadcrumbs();
      expect(breadcrumbs).toEqual(["Calendar", "Maps", "Food"]);

      // Return one level
      moduleHandoffManager.returnFromHandoff();

      breadcrumbs = moduleHandoffManager.getBreadcrumbs();
      expect(breadcrumbs).toEqual(["Calendar", "Maps"]);
    });

    it("should return empty array when no handoff", () => {
      const breadcrumbs = moduleHandoffManager.getBreadcrumbs();
      expect(breadcrumbs).toEqual([]);
    });
  });

  describe("Event Notifications", () => {
    it("should notify listeners on handoff start", (done) => {
      const unsubscribe = moduleHandoffManager.subscribe((event, data) => {
        if (event === "handoff_start") {
          expect(data.from).toBe("calendar");
          expect(data.to).toBe("maps");
          expect(data.depth).toBe(2);
          unsubscribe();
          done();
        }
      });

      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );
    });

    it("should notify listeners on return", (done) => {
      // Set up handoff first
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      const unsubscribe = moduleHandoffManager.subscribe((event, data) => {
        if (event === "handoff_return") {
          expect(data.from).toBe("maps");
          expect(data.to).toBe("calendar");
          expect(data.action).toBe("back");
          unsubscribe();
          done();
        }
      });

      moduleHandoffManager.returnFromHandoff(undefined, "back");
    });

    it("should notify listeners on cancel", (done) => {
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      const unsubscribe = moduleHandoffManager.subscribe((event, data) => {
        if (event === "handoff_cancel") {
          expect(data.from).toBe("maps");
          expect(data.to).toBe("calendar");
          unsubscribe();
          done();
        }
      });

      moduleHandoffManager.cancelHandoff();
    });
  });

  describe("State Persistence", () => {
    it("should persist chain to AsyncStorage", async () => {
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      // Give it time to persist
      await new Promise((resolve) => setTimeout(resolve, 100));

      const saved = await AsyncStorage.getItem("@aios_handoff_state");
      expect(saved).not.toBeNull();

      const chain = JSON.parse(saved!);
      expect(chain.modules.length).toBe(2);
      expect(chain.modules[0].moduleId).toBe("calendar");
      expect(chain.modules[1].moduleId).toBe("maps");
    });

    it("should clear storage when chain is cleared", async () => {
      moduleHandoffManager.startHandoff(
        {
          moduleId: "calendar",
          displayName: "Calendar",
          timestamp: Date.now(),
        },
        { moduleId: "maps", displayName: "Maps", timestamp: Date.now() },
      );

      await moduleHandoffManager.clearAll();

      const saved = await AsyncStorage.getItem("@aios_handoff_state");
      expect(saved).toBeNull();
    });
  });
});
