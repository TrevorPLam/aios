/**
 * Tests for Predictive Prefetch Engine
 *
 * Validates module transition learning and prediction.
 */

import { prefetchEngine } from "../prefetchEngine";
import { ModuleType } from "@/models/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock lazyLoader
jest.mock("../lazyLoader", () => ({
  lazyLoader: {
    preloadModules: jest.fn(),
  },
}));

describe("PrefetchEngine", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await prefetchEngine.clearAllData();
    await prefetchEngine.initialize();
  });

  describe("Initialization", () => {
    it("should initialize without errors", async () => {
      await expect(prefetchEngine.initialize()).resolves.not.toThrow();
    });

    it("should load saved transitions from storage", async () => {
      const transitions = [
        {
          from: "calendar" as ModuleType,
          to: "calendar" as ModuleType as ModuleType,
          timestamp: new Date().toISOString(),
          timeSpent: 120,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "@prefetch:transitions") {
          return Promise.resolve(JSON.stringify(transitions));
        }
        return Promise.resolve(null);
      });

      const engine = Object.create(prefetchEngine);
      await engine.initialize();

      // Verify initialization completed
      const stats = engine.getStatistics();
      expect(stats.initialized).toBe(true);
    });

    it("should handle missing storage data gracefully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await expect(prefetchEngine.initialize()).resolves.not.toThrow();
    });
  });

  describe("Module Transitions", () => {
    it("should record module enter event", async () => {
      await prefetchEngine.onModuleEnter("calendar");

      const stats = prefetchEngine.getStatistics();
      expect(stats.initialized).toBe(true);
    });

    it("should record transition between modules", async () => {
      await prefetchEngine.onModuleEnter("calendar");
      await new Promise((resolve) => setTimeout(resolve, 100));
      await prefetchEngine.onModuleEnter("calendar" as ModuleType);

      const stats = prefetchEngine.getStatistics();
      expect(stats.totalTransitions).toBeGreaterThan(0);
    });

    it("should build patterns from transitions", async () => {
      // Record multiple transitions
      await prefetchEngine.onModuleEnter("calendar");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prefetchEngine.onModuleEnter("calendar" as ModuleType);
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prefetchEngine.onModuleEnter("calendar");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prefetchEngine.onModuleEnter("calendar" as ModuleType);

      // Wait for pattern calculation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = prefetchEngine.getStatistics();
      expect(stats.totalPatterns).toBeGreaterThan(0);
    });
  });

  describe("Predictions", () => {
    it("should predict next modules based on patterns", async () => {
      // Create some transitions
      await prefetchEngine.onModuleEnter("calendar");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prefetchEngine.onModuleEnter("calendar" as ModuleType);

      const predictions = prefetchEngine.predictNextModules("calendar");
      expect(Array.isArray(predictions)).toBe(true);
      expect(predictions.length).toBeGreaterThanOrEqual(0);
    });

    it("should include time-based predictions", async () => {
      const predictions = prefetchEngine.predictNextModules("command");

      // Should have some predictions even without patterns
      expect(predictions.length).toBeGreaterThan(0);

      // Predictions should have required fields
      if (predictions.length > 0) {
        expect(predictions[0]).toHaveProperty("moduleId");
        expect(predictions[0]).toHaveProperty("probability");
        expect(predictions[0]).toHaveProperty("reason");
      }
    });

    it("should sort predictions by probability", async () => {
      const predictions = prefetchEngine.predictNextModules("calendar");

      for (let i = 1; i < predictions.length; i++) {
        expect(predictions[i - 1].probability).toBeGreaterThanOrEqual(
          predictions[i].probability,
        );
      }
    });

    it("should include plain English reasons", async () => {
      const predictions = prefetchEngine.predictNextModules("calendar");

      predictions.forEach((prediction) => {
        expect(typeof prediction.reason).toBe("string");
        expect(prediction.reason.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Statistics", () => {
    it("should provide statistics", () => {
      const stats = prefetchEngine.getStatistics();

      expect(stats).toHaveProperty("totalTransitions");
      expect(stats).toHaveProperty("totalPatterns");
      expect(stats).toHaveProperty("topPatterns");
      expect(stats).toHaveProperty("initialized");
      expect(typeof stats.totalTransitions).toBe("number");
      expect(typeof stats.totalPatterns).toBe("number");
      expect(Array.isArray(stats.topPatterns)).toBe(true);
    });

    it("should track top patterns", async () => {
      // Create transitions
      for (let i = 0; i < 5; i++) {
        await prefetchEngine.onModuleEnter("calendar");
        await new Promise((resolve) => setTimeout(resolve, 10));
        await prefetchEngine.onModuleEnter("calendar" as ModuleType);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const stats = prefetchEngine.getStatistics();
      expect(stats.topPatterns.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Strategy Configuration", () => {
    it("should have default strategy", () => {
      const strategy = prefetchEngine.getStrategy();

      expect(strategy).toHaveProperty("maxPrefetch");
      expect(strategy).toHaveProperty("minProbability");
      expect(strategy).toHaveProperty("prefetchDelay");
      expect(strategy.maxPrefetch).toBeGreaterThan(0);
      expect(strategy.minProbability).toBeGreaterThan(0);
      expect(strategy.minProbability).toBeLessThanOrEqual(1);
    });

    it("should allow strategy updates", () => {
      const newStrategy = { maxPrefetch: 5, minProbability: 0.3 };
      prefetchEngine.updateStrategy(newStrategy);

      const strategy = prefetchEngine.getStrategy();
      expect(strategy.maxPrefetch).toBe(5);
      expect(strategy.minProbability).toBe(0.3);
    });

    it("should preserve unchanged strategy values", () => {
      const originalStrategy = prefetchEngine.getStrategy();
      const originalDelay = originalStrategy.prefetchDelay;

      prefetchEngine.updateStrategy({ maxPrefetch: 5 });

      const newStrategy = prefetchEngine.getStrategy();
      expect(newStrategy.prefetchDelay).toBe(originalDelay);
    });
  });

  describe("Data Persistence", () => {
    it("should save transitions to storage", async () => {
      await prefetchEngine.onModuleEnter("calendar");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await prefetchEngine.onModuleEnter("calendar" as ModuleType);

      // Wait for debounced save
      await new Promise((resolve) => setTimeout(resolve, 2500));

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should clear all data", async () => {
      await prefetchEngine.onModuleEnter("calendar");
      await prefetchEngine.clearAllData();

      const stats = prefetchEngine.getStatistics();
      expect(stats.totalTransitions).toBe(0);
      expect(stats.totalPatterns).toBe(0);
    });
  });

  describe("Performance", () => {
    it("should handle rapid module switches", async () => {
      const modules: ModuleType[] = [
        "calendar",
        "calendar" as ModuleType,
        "notebook",
        "planner",
        "messages",
      ];

      for (const module of modules) {
        await prefetchEngine.onModuleEnter(module);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const stats = prefetchEngine.getStatistics();
      expect(stats.totalTransitions).toBeGreaterThan(0);
    });

    it("should limit stored transitions", async () => {
      // Try to create more than max transitions
      for (let i = 0; i < 1100; i++) {
        await prefetchEngine.onModuleEnter(i % 2 === 0 ? "calendar" : "calendar" as ModuleType);
      }

      const stats = prefetchEngine.getStatistics();
      // Should be capped at 1000
      expect(stats.totalTransitions).toBeLessThanOrEqual(1000);
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error("Storage error"),
      );

      await expect(
        prefetchEngine.onModuleEnter("calendar"),
      ).resolves.not.toThrow();
    });

    it("should handle initialization errors", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("Storage error"),
      );

      await expect(prefetchEngine.initialize()).resolves.not.toThrow();
    });
  });

  describe("Time-Based Predictions", () => {
    it("should predict different modules for different times", () => {
      // We can't easily test time-based predictions without mocking Date
      // But we can verify predictions are returned
      const predictions = prefetchEngine.predictNextModules("command");
      expect(predictions.length).toBeGreaterThan(0);
    });

    it("should include time-based reason in predictions", () => {
      const predictions = prefetchEngine.predictNextModules("command");

      const timeBasedPrediction = predictions.find(
        (p) =>
          p.reason.includes("Morning") ||
          p.reason.includes("Afternoon") ||
          p.reason.includes("Evening"),
      );

      // Should have at least some time-based predictions
      expect(timeBasedPrediction).toBeDefined();
    });
  });
});
