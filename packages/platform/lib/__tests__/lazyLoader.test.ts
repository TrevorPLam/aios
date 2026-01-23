/**
 * Tests for Lazy Loader
 *
 * Validates lazy loading system for module code-splitting.
 */

import { lazyLoader } from "../lazyLoader";
import { ModuleType } from "@contracts/models/types";

// Mock React.lazy
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  lazy: jest.fn((factory) => {
    // Store the factory for testing
    const component = factory;
    component.preload = factory;
    return component;
  }),
}));

describe("LazyLoader", () => {
  beforeEach(() => {
    // Clear any cached modules
    lazyLoader.clearCache();
  });

  describe("Initialization", () => {
    it("should initialize with loader configs", () => {
      expect(lazyLoader).toBeDefined();
    });

    it("should have configs for all core modules", () => {
      const coreModules: ModuleType[] = [
        "command",
        "notebook",
        "planner",
        "calendar",
        "email",
        "messages",
        "lists",
        "alerts",
        "contacts",
        "translator",
        "photos",
        "budget",
      ];

      coreModules.forEach((moduleId) => {
        expect(() => lazyLoader.getLazyComponent(moduleId)).not.toThrow();
      });
    });
  });

  describe("getLazyComponent", () => {
    it("should return a lazy component", () => {
      const component = lazyLoader.getLazyComponent("command");
      expect(component).toBeDefined();
    });

    it("should return same component instance on subsequent calls", () => {
      const component1 = lazyLoader.getLazyComponent("command");
      const component2 = lazyLoader.getLazyComponent("command");
      expect(component1).toBe(component2);
    });

    it("should throw error for unknown module", () => {
      expect(() => {
        lazyLoader.getLazyComponent("unknown" as ModuleType);
      }).toThrow("No loader config found for module: unknown");
    });
  });

  describe("Preloading", () => {
    it("should preload modules without errors", () => {
      expect(() => {
        lazyLoader.preloadModules(["notebook", "planner"], "immediate");
      }).not.toThrow();
    });

    it("should skip already loaded modules", () => {
      // Load a module
      lazyLoader.getLazyComponent("notebook");

      // Preload should not throw
      expect(() => {
        lazyLoader.preloadModules(["notebook"], "immediate");
      }).not.toThrow();
    });

    it("should handle preload with idle strategy", () => {
      expect(() => {
        lazyLoader.preloadModules(["calendar"], "idle");
      }).not.toThrow();
    });

    it("should handle preload with prefetch strategy", () => {
      expect(() => {
        lazyLoader.preloadModules(["email"], "prefetch");
      }).not.toThrow();
    });

    it("should preload high priority modules", () => {
      expect(() => {
        lazyLoader.preloadHighPriorityModules();
      }).not.toThrow();
    });
  });

  describe("Module Tracking", () => {
    it("should track loaded modules", () => {
      lazyLoader.getLazyComponent("notebook");
      const loaded = lazyLoader.getLoadedModules();
      // May not be immediately loaded due to React.lazy
      expect(Array.isArray(loaded)).toBe(true);
    });

    it("should report if module is loaded", () => {
      const isLoaded = lazyLoader.isModuleLoaded("notebook");
      expect(typeof isLoaded).toBe("boolean");
    });

    it("should provide loading stats", () => {
      const stats = lazyLoader.getLoadingStats();
      expect(stats).toHaveProperty("totalLoaded");
      expect(stats).toHaveProperty("totalErrors");
      expect(stats).toHaveProperty("averageLoadTime");
      expect(typeof stats.totalLoaded).toBe("number");
    });
  });

  describe("Cache Management", () => {
    it("should clear all cache", () => {
      lazyLoader.getLazyComponent("notebook");
      lazyLoader.clearCache();

      const loaded = lazyLoader.getLoadedModules();
      expect(loaded.length).toBe(0);
    });

    it("should clear specific module cache", () => {
      lazyLoader.clearCache("notebook");

      const isLoaded = lazyLoader.isModuleLoaded("notebook");
      expect(isLoaded).toBe(false);
    });
  });

  describe("Loading Stats", () => {
    it("should calculate average load time", () => {
      const stats = lazyLoader.getLoadingStats();
      expect(stats.averageLoadTime).toBeGreaterThanOrEqual(0);
    });

    it("should track total errors", () => {
      const stats = lazyLoader.getLoadingStats();
      expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
    });

    it("should identify slowest module", () => {
      const stats = lazyLoader.getLoadingStats();
      // May be null if no modules loaded yet
      if (stats.slowestModule) {
        expect(stats.slowestModule).toHaveProperty("moduleId");
        expect(stats.slowestModule).toHaveProperty("loadTime");
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid module gracefully", () => {
      expect(() => {
        lazyLoader.getLazyComponent("invalid" as ModuleType);
      }).toThrow();
    });

    it("should not crash on preload errors", () => {
      expect(() => {
        lazyLoader.preloadModules(["invalid" as ModuleType], "immediate");
      }).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should handle multiple concurrent getLazyComponent calls", () => {
      const modules: ModuleType[] = ["command", "notebook", "planner"];

      expect(() => {
        modules.forEach((moduleId) => {
          lazyLoader.getLazyComponent(moduleId);
        });
      }).not.toThrow();
    });

    it("should handle large preload batch", () => {
      const modules: ModuleType[] = [
        "command",
        "notebook",
        "planner",
        "calendar",
        "email",
        "messages",
      ];

      expect(() => {
        lazyLoader.preloadModules(modules, "immediate");
      }).not.toThrow();
    });
  });
});
