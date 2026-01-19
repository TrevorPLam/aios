/**
 * Onboarding Manager Test Suite
 *
 * Tests the progressive onboarding system that starts users with 3 modules
 * and gradually unlocks more based on usage patterns.
 */

import {
  onboardingManager,
  OnboardingStage,
  UnlockedModule,
} from "../onboardingManager";
import { eventBus, EVENT_TYPES } from "../eventBus";

describe("OnboardingManager", () => {
  beforeEach(async () => {
    onboardingManager.destroy();
    await onboardingManager.initialize();
  });

  afterEach(() => {
    onboardingManager.destroy();
  });

  describe("initialization", () => {
    it("should initialize with command center unlocked", async () => {
      await onboardingManager.initialize();
      expect(onboardingManager.isModuleUnlocked("command")).toBe(true);
    });

    it("should start in not_started stage", () => {
      const stage = onboardingManager.getStage();
      expect(stage).toBe("not_started");
    });
  });

  describe("startOnboarding", () => {
    it("should unlock selected modules", async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);

      expect(onboardingManager.isModuleUnlocked("notebook")).toBe(true);
      expect(onboardingManager.isModuleUnlocked("planner")).toBe(true);
      expect(onboardingManager.isModuleUnlocked("calendar")).toBe(true);
    });

    it("should transition to active stage", async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);

      expect(onboardingManager.getStage()).toBe("active");
    });

    it("should require exactly 3 modules", async () => {
      await expect(
        onboardingManager.startOnboarding(["notebook", "planner"]),
      ).rejects.toThrow("Must select exactly 3 modules");
    });

    it("should create welcome tips for unlocked modules", async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);

      const tips = onboardingManager.getActiveTips();
      // Should have tips for the 3 selected modules + command center
      expect(tips.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("isModuleUnlocked", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should return true for unlocked modules", () => {
      expect(onboardingManager.isModuleUnlocked("notebook")).toBe(true);
    });

    it("should return false for locked modules", () => {
      expect(onboardingManager.isModuleUnlocked("messages")).toBe(false);
    });
  });

  describe("getUnlockedModules", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should return all unlocked modules", () => {
      const unlocked = onboardingManager.getUnlockedModules();
      expect(unlocked.length).toBeGreaterThanOrEqual(4); // 3 selected + command
    });

    it("should include unlock metadata", () => {
      const unlocked = onboardingManager.getUnlockedModules();
      const notebook = unlocked.find((u) => u.module === "notebook");

      expect(notebook).toBeDefined();
      expect(notebook?.reason).toBe("initial_selection");
      expect(notebook?.unlockedAt).toBeDefined();
    });
  });

  describe("getLockedModules", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should return modules that are still locked", () => {
      const locked = onboardingManager.getLockedModules();
      expect(locked.length).toBeGreaterThan(0);
      expect(locked).toContain("messages");
    });

    it("should not include unlocked modules", () => {
      const locked = onboardingManager.getLockedModules();
      expect(locked).not.toContain("notebook");
      expect(locked).not.toContain("planner");
    });
  });

  describe("manualUnlock", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should unlock a module manually", async () => {
      expect(onboardingManager.isModuleUnlocked("messages")).toBe(false);

      await onboardingManager.manualUnlock("messages");

      expect(onboardingManager.isModuleUnlocked("messages")).toBe(true);
    });

    it("should set reason to manual_unlock", async () => {
      await onboardingManager.manualUnlock("messages");

      const unlocked = onboardingManager.getUnlockedModules();
      const messages = unlocked.find((u) => u.module === "messages");

      expect(messages?.reason).toBe("manual_unlock");
    });

    it("should create a welcome tip", async () => {
      const tipsBefore = onboardingManager.getActiveTips().length;

      await onboardingManager.manualUnlock("messages");

      const tipsAfter = onboardingManager.getActiveTips().length;
      expect(tipsAfter).toBeGreaterThan(tipsBefore);
    });
  });

  describe("completeOnboarding", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should transition to completed stage", async () => {
      await onboardingManager.completeOnboarding(false);

      expect(onboardingManager.getStage()).toBe("completed");
    });

    it("should unlock all modules if requested", async () => {
      const lockedBefore = onboardingManager.getLockedModules().length;
      expect(lockedBefore).toBeGreaterThan(0);

      await onboardingManager.completeOnboarding(true);

      const lockedAfter = onboardingManager.getLockedModules().length;
      expect(lockedAfter).toBe(0);
    });

    it("should not unlock modules if not requested", async () => {
      const lockedBefore = onboardingManager.getLockedModules().length;

      await onboardingManager.completeOnboarding(false);

      const lockedAfter = onboardingManager.getLockedModules().length;
      expect(lockedAfter).toBe(lockedBefore);
    });
  });

  describe("skipOnboarding", () => {
    it("should unlock all modules", async () => {
      await onboardingManager.skipOnboarding();

      const locked = onboardingManager.getLockedModules();
      expect(locked.length).toBe(0);
    });

    it("should transition to completed stage", async () => {
      await onboardingManager.skipOnboarding();

      expect(onboardingManager.getStage()).toBe("completed");
    });
  });

  describe("contextual tips", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should return active tips", () => {
      const tips = onboardingManager.getActiveTips();
      expect(tips.length).toBeGreaterThan(0);
    });

    it("should dismiss tips", async () => {
      const tips = onboardingManager.getActiveTips();
      const firstTip = tips[0];

      await onboardingManager.dismissTip(firstTip.id);

      const tipsAfter = onboardingManager.getActiveTips();
      const dismissed = tipsAfter.find((t) => t.id === firstTip.id);
      expect(dismissed).toBeUndefined();
    });
  });

  describe("progress tracking", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should calculate progress percentage", () => {
      const progress = onboardingManager.getProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it("should return usage statistics", () => {
      const stats = onboardingManager.getStats();

      expect(stats.unlockedCount).toBeGreaterThanOrEqual(4);
      expect(stats.lockedCount).toBeGreaterThan(0);
      expect(stats.usageCount).toBe(0); // No usage yet
      expect(stats.daysSinceStart).toBe(0); // Just started
    });
  });

  describe("auto-unlock on usage", () => {
    beforeEach(async () => {
      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);
    });

    it("should increment usage count when module is opened", () => {
      const statsBefore = onboardingManager.getStats();

      eventBus.emit(EVENT_TYPES.MODULE_OPENED, { module: "notebook" });

      const statsAfter = onboardingManager.getStats();
      expect(statsAfter.usageCount).toBe(statsBefore.usageCount + 1);
    });

    it("should auto-unlock a module after usage threshold", () => {
      const unlockedBefore = onboardingManager.getUnlockedModules();
      const beforeModules = new Set(unlockedBefore.map((u) => u.module));

      // Trigger usage milestone (every 3 uses by default)
      eventBus.emit(EVENT_TYPES.MODULE_OPENED, { module: "notebook" });
      eventBus.emit(EVENT_TYPES.MODULE_OPENED, { module: "planner" });
      eventBus.emit(EVENT_TYPES.MODULE_OPENED, { module: "calendar" });

      const unlockedAfter = onboardingManager.getUnlockedModules();
      const afterModules = new Set(unlockedAfter.map((u) => u.module));

      // Check that we have at least one new module
      const newModules = Array.from(afterModules).filter(
        (m) => !beforeModules.has(m),
      );
      expect(newModules.length).toBeGreaterThanOrEqual(1);
    });

    it("should not count usage for locked modules", () => {
      // Verify messages is locked
      expect(onboardingManager.isModuleUnlocked("messages")).toBe(false);

      const statsBefore = onboardingManager.getStats();

      // Try to open a locked module
      eventBus.emit(EVENT_TYPES.MODULE_OPENED, { module: "messages" });

      const statsAfter = onboardingManager.getStats();
      expect(statsAfter.usageCount).toBe(statsBefore.usageCount); // No change
    });
  });

  describe("subscribe", () => {
    it("should notify subscribers on state changes", async () => {
      let callCount = 0;

      const unsubscribe = onboardingManager.subscribe(() => {
        callCount++;
      });

      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);

      expect(callCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it("should unsubscribe correctly", async () => {
      let callCount = 0;

      const unsubscribe = onboardingManager.subscribe(() => {
        callCount++;
      });

      await onboardingManager.startOnboarding([
        "notebook",
        "planner",
        "calendar",
      ]);

      const countAfterFirst = callCount;
      unsubscribe();

      await onboardingManager.manualUnlock("messages");

      // Count should not have increased after unsubscribe
      expect(callCount).toBe(countAfterFirst);
    });
  });
});
