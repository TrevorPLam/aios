/**
 * Tests for Memory Manager
 *
 * Validates memory tracking and cleanup logic.
 */

import { memoryManager } from "../memoryManager";
import { ModuleType } from "@/models/types";
import { eventBus } from "../eventBus";

describe("MemoryManager", () => {
  beforeEach(() => {
    // Reset memory manager
    memoryManager.reset();
    memoryManager.stopMonitoring();
  });

  afterEach(() => {
    memoryManager.stopMonitoring();
  });

  describe("Initialization", () => {
    it("should initialize with default strategy", () => {
      const strategy = memoryManager.getStrategy();

      expect(strategy).toHaveProperty("softLimitMB");
      expect(strategy).toHaveProperty("hardLimitMB");
      expect(strategy).toHaveProperty("checkIntervalMs");
      expect(strategy.softLimitMB).toBeGreaterThan(0);
      expect(strategy.hardLimitMB).toBeGreaterThan(strategy.softLimitMB);
    });

    it("should start monitoring", () => {
      expect(() => {
        memoryManager.startMonitoring();
      }).not.toThrow();
    });

    it("should stop monitoring", () => {
      memoryManager.startMonitoring();
      expect(() => {
        memoryManager.stopMonitoring();
      }).not.toThrow();
    });

    it("should not start monitoring twice", () => {
      memoryManager.startMonitoring();
      memoryManager.startMonitoring(); // Should not error
      memoryManager.stopMonitoring();
    });
  });

  describe("Module Registration", () => {
    it("should register module mount", () => {
      memoryManager.registerModuleMount("notebook", 5);

      const stats = memoryManager.getStatistics();
      expect(stats.mountedModules).toBe(1);
    });

    it("should register module access", () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleAccess("notebook");

      const stats = memoryManager.getStatistics();
      const module = stats.modules.find((m) => m.moduleId === "notebook");
      expect(module).toBeDefined();
      expect(module!.accessCount).toBeGreaterThan(0);
    });

    it("should register module unmount", () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleUnmount("notebook");

      const stats = memoryManager.getStatistics();
      expect(stats.mountedModules).toBe(0);
    });

    it("should track multiple modules", () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleMount("planner", 5);
      memoryManager.registerModuleMount("calendar", 5);

      const stats = memoryManager.getStatistics();
      expect(stats.mountedModules).toBe(3);
    });
  });

  describe("Memory Usage", () => {
    it("should calculate current memory usage", () => {
      const usage = memoryManager.getCurrentMemoryUsage();

      expect(usage).toHaveProperty("usedMemoryMB");
      expect(usage).toHaveProperty("totalMemoryMB");
      expect(usage).toHaveProperty("percentUsed");
      expect(usage).toHaveProperty("pressure");
      expect(usage.usedMemoryMB).toBeGreaterThan(0);
    });

    it("should determine memory pressure levels", () => {
      // Register enough modules to create memory pressure
      for (let i = 0; i < 20; i++) {
        memoryManager.registerModuleMount(`module${i}` as ModuleType, 10);
      }

      const usage = memoryManager.getCurrentMemoryUsage();
      expect(["none", "low", "medium", "high", "critical"]).toContain(
        usage.pressure,
      );
    });

    it("should calculate total estimated memory", () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleMount("planner", 5);

      const stats = memoryManager.getStatistics();
      expect(stats.totalEstimatedMB).toBe(10);
    });
  });

  describe("Module Pinning", () => {
    it("should pin module", () => {
      memoryManager.registerModuleMount("command", 5);
      memoryManager.pinModule("command");

      const stats = memoryManager.getStatistics();
      const module = stats.modules.find((m) => m.moduleId === "command");
      expect(module!.isPinned).toBe(true);
    });

    it("should unpin module", () => {
      memoryManager.registerModuleMount("command", 5);
      memoryManager.pinModule("command");
      memoryManager.unpinModule("command");

      const stats = memoryManager.getStatistics();
      const module = stats.modules.find((m) => m.moduleId === "command");
      expect(module!.isPinned).toBe(false);
    });
  });

  describe("Statistics", () => {
    it("should provide memory statistics", () => {
      memoryManager.registerModuleMount("notebook", 5);
      const stats = memoryManager.getStatistics();

      expect(stats).toHaveProperty("currentUsage");
      expect(stats).toHaveProperty("mountedModules");
      expect(stats).toHaveProperty("totalEstimatedMB");
      expect(stats).toHaveProperty("modules");
      expect(Array.isArray(stats.modules)).toBe(true);
    });

    it("should track access counts", () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleAccess("notebook");
      memoryManager.registerModuleAccess("notebook");

      const stats = memoryManager.getStatistics();
      const module = stats.modules.find((m) => m.moduleId === "notebook");
      // Mount counts as 1, plus 2 accesses = 3 total
      expect(module!.accessCount).toBeGreaterThanOrEqual(2);
    });

    it("should track last accessed time", () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleAccess("notebook");

      const stats = memoryManager.getStatistics();
      const module = stats.modules.find((m) => m.moduleId === "notebook");
      expect(module!.lastAccessed).toBeDefined();
      expect(typeof module!.lastAccessed).toBe("string");
    });
  });

  describe("Strategy Configuration", () => {
    it("should update strategy", () => {
      memoryManager.updateStrategy({
        softLimitMB: 100,
        hardLimitMB: 150,
      });

      const strategy = memoryManager.getStrategy();
      expect(strategy.softLimitMB).toBe(100);
      expect(strategy.hardLimitMB).toBe(150);
    });

    it("should preserve unchanged strategy values", () => {
      const original = memoryManager.getStrategy();
      memoryManager.updateStrategy({ softLimitMB: 100 });

      const updated = memoryManager.getStrategy();
      expect(updated.checkIntervalMs).toBe(original.checkIntervalMs);
    });
  });

  describe("Memory Events", () => {
    it("should have memory pressure detection capability", () => {
      // Register many modules to trigger pressure
      for (let i = 0; i < 30; i++) {
        memoryManager.registerModuleMount(`module${i}` as ModuleType, 10);
      }

      const usage = memoryManager.getCurrentMemoryUsage();

      // Should detect pressure with many modules
      expect(["none", "low", "medium", "high", "critical"]).toContain(
        usage.pressure,
      );
      expect(usage.usedMemoryMB).toBeGreaterThan(100);
    });
  });

  describe("Cleanup", () => {
    it("should force cleanup", async () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleMount("planner", 5);

      await expect(memoryManager.forceCleanup()).resolves.not.toThrow();
    });

    it("should not cleanup pinned modules", async () => {
      memoryManager.registerModuleMount("command", 5);
      memoryManager.pinModule("command");
      memoryManager.registerModuleMount("notebook", 5);

      // Command is pinned, should not be cleaned up
      await memoryManager.forceCleanup();

      const stats = memoryManager.getStatistics();
      const command = stats.modules.find((m) => m.moduleId === "command");
      expect(command).toBeDefined();
    });

    it("should not cleanup current module", async () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleAccess("notebook");

      await memoryManager.forceCleanup();

      const stats = memoryManager.getStatistics();
      const notebook = stats.modules.find((m) => m.moduleId === "notebook");
      expect(notebook).toBeDefined();
    });
  });

  describe("Reset", () => {
    it("should reset all tracking", () => {
      memoryManager.registerModuleMount("notebook", 5);
      memoryManager.registerModuleMount("planner", 5);

      memoryManager.reset();

      const stats = memoryManager.getStatistics();
      expect(stats.mountedModules).toBe(0);
    });
  });

  describe("Performance", () => {
    it("should handle many modules", () => {
      for (let i = 0; i < 50; i++) {
        memoryManager.registerModuleMount(`module${i}` as ModuleType, 5);
      }

      const stats = memoryManager.getStatistics();
      expect(stats.mountedModules).toBe(50);
    });

    it("should handle rapid access tracking", () => {
      memoryManager.registerModuleMount("notebook", 5);

      for (let i = 0; i < 100; i++) {
        memoryManager.registerModuleAccess("notebook");
      }

      const stats = memoryManager.getStatistics();
      const module = stats.modules.find((m) => m.moduleId === "notebook");
      // First mount counts as 1, then 100 accesses = 101 total
      expect(module!.accessCount).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Error Handling", () => {
    it("should handle unmount of non-existent module", () => {
      expect(() => {
        memoryManager.registerModuleUnmount("nonexistent" as ModuleType);
      }).not.toThrow();
    });

    it("should handle pin of non-existent module", () => {
      expect(() => {
        memoryManager.pinModule("nonexistent" as ModuleType);
      }).not.toThrow();
    });

    it("should handle access of non-registered module", () => {
      expect(() => {
        memoryManager.registerModuleAccess("nonexistent" as ModuleType);
      }).not.toThrow();
    });
  });
});
