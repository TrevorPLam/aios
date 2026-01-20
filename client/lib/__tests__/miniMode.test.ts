/**
 * Mini-Mode Registry Tests
 *
 * Tests the core mini-mode registry functionality including registration,
 * opening/closing mini-modes, and completion handling.
 */

import { miniModeRegistry, MiniModeProvider } from "../miniMode";

// Mock React component
const MockComponent = () => null;

describe("Mini-Mode Registry", () => {
  // Sample provider for testing
  const testProvider: MiniModeProvider = {
    id: "test-module",
    displayName: "Test Module",
    description: "Test module for mini-mode",
    component: MockComponent as any,
  };

  beforeEach(() => {
    // Unregister test provider to start fresh
    miniModeRegistry.unregister("test-module");

    // Close any open mini-modes
    if (miniModeRegistry.getCurrent()) {
      miniModeRegistry.close();
    }
  });

  describe("Registration", () => {
    it("should register a mini-mode provider", () => {
      miniModeRegistry.register(testProvider);

      const provider = miniModeRegistry.getProvider("test-module");
      expect(provider).toBeDefined();
      expect(provider?.id).toBe("test-module");
      expect(provider?.displayName).toBe("Test Module");
    });

    it("should overwrite existing provider with warning", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      miniModeRegistry.register(testProvider);
      miniModeRegistry.register(testProvider);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("already registered"),
      );

      consoleSpy.mockRestore();
    });

    it("should unregister a provider", () => {
      miniModeRegistry.register(testProvider);
      expect(miniModeRegistry.supportsModule("test-module")).toBe(true);

      miniModeRegistry.unregister("test-module");
      expect(miniModeRegistry.supportsModule("test-module")).toBe(false);
    });

    it("should get all providers", () => {
      miniModeRegistry.register(testProvider);

      const provider2: MiniModeProvider = {
        ...testProvider,
        id: "test-module-2",
      };
      miniModeRegistry.register(provider2);

      const allProviders = miniModeRegistry.getAllProviders();
      expect(allProviders).toHaveLength(2);
      expect(allProviders.map((p) => p.id)).toContain("test-module");
      expect(allProviders.map((p) => p.id)).toContain("test-module-2");

      // Cleanup
      miniModeRegistry.unregister("test-module-2");
    });
  });

  describe("Opening Mini-Modes", () => {
    beforeEach(() => {
      miniModeRegistry.register(testProvider);
    });

    it("should open a mini-mode", () => {
      const onComplete = jest.fn();
      const onDismiss = jest.fn();

      const success = miniModeRegistry.open({
        module: "test-module",
        initialData: { test: "data" },
        onComplete,
        onDismiss,
        source: "test",
      });

      expect(success).toBe(true);

      const current = miniModeRegistry.getCurrent();
      expect(current).toBeDefined();
      expect(current?.config.module).toBe("test-module");
      expect(current?.config.initialData).toEqual({ test: "data" });
    });

    it("should notify listeners when opened", () => {
      const listener = jest.fn();
      const unsubscribe = miniModeRegistry.subscribe(listener);

      miniModeRegistry.open({
        module: "test-module",
        source: "test",
      });

      expect(listener).toHaveBeenCalledWith("mini_mode_open", {
        module: "test-module",
        source: "test",
        hasInitialData: false,
      });

      unsubscribe();
      miniModeRegistry.close();
    });

    it("should fail to open unregistered module", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const success = miniModeRegistry.open({
        module: "non-existent",
      });

      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No provider registered"),
      );

      consoleSpy.mockRestore();
    });

    it("should prevent nesting mini-modes", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      miniModeRegistry.open({ module: "test-module" });

      const success = miniModeRegistry.open({ module: "test-module" });

      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("already open"),
      );

      consoleSpy.mockRestore();
      miniModeRegistry.close();
    });
  });

  describe("Closing Mini-Modes", () => {
    beforeEach(() => {
      miniModeRegistry.register(testProvider);
    });

    it("should close a mini-mode", () => {
      miniModeRegistry.open({ module: "test-module" });
      expect(miniModeRegistry.getCurrent()).toBeDefined();

      miniModeRegistry.close();
      expect(miniModeRegistry.getCurrent()).toBeNull();
    });

    it("should invoke onDismiss callback", () => {
      const onDismiss = jest.fn();

      miniModeRegistry.open({
        module: "test-module",
        onDismiss,
      });

      miniModeRegistry.close();

      expect(onDismiss).toHaveBeenCalled();
    });

    it("should notify listeners when closed", () => {
      const listener = jest.fn();
      const unsubscribe = miniModeRegistry.subscribe(listener);

      miniModeRegistry.open({ module: "test-module" });

      // Clear previous calls
      listener.mockClear();

      miniModeRegistry.close();

      expect(listener).toHaveBeenCalledWith("mini_mode_close", {
        module: "test-module",
        reason: "dismissed",
      });

      unsubscribe();
    });

    it("should handle close when no mini-mode is open", () => {
      expect(() => {
        miniModeRegistry.close();
      }).not.toThrow();
    });

    it("should handle onDismiss callback errors", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const onDismiss = jest.fn(() => {
        throw new Error("Callback error");
      });

      miniModeRegistry.open({
        module: "test-module",
        onDismiss,
      });

      miniModeRegistry.close();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error in onDismiss callback"),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Completing Mini-Modes", () => {
    beforeEach(() => {
      miniModeRegistry.register(testProvider);
    });

    it("should complete a mini-mode", () => {
      const onComplete = jest.fn();

      miniModeRegistry.open({
        module: "test-module",
        onComplete,
      });

      miniModeRegistry.complete({
        action: "created",
        data: { id: "123", title: "Test" },
        module: "test-module",
      });

      expect(onComplete).toHaveBeenCalledWith({
        action: "created",
        data: { id: "123", title: "Test" },
        module: "test-module",
      });

      expect(miniModeRegistry.getCurrent()).toBeNull();
    });

    it("should notify listeners when completed", () => {
      const listener = jest.fn();
      const unsubscribe = miniModeRegistry.subscribe(listener);

      miniModeRegistry.open({ module: "test-module", source: "test" });

      // Clear previous calls
      listener.mockClear();

      miniModeRegistry.complete({
        action: "created",
        module: "test-module",
      });

      expect(listener).toHaveBeenCalledWith("mini_mode_complete", {
        module: "test-module",
        action: "created",
        source: "test",
      });

      unsubscribe();
    });

    it("should handle complete when no mini-mode is open", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      miniModeRegistry.complete({
        action: "created",
        module: "test-module",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No mini-mode currently open"),
      );

      consoleSpy.mockRestore();
    });

    it("should handle onComplete callback errors", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const onComplete = jest.fn(() => {
        throw new Error("Callback error");
      });

      miniModeRegistry.open({
        module: "test-module",
        onComplete,
      });

      miniModeRegistry.complete({
        action: "created",
        module: "test-module",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error in onComplete callback"),
        expect.any(Error),
      );

      // Mini-mode should still close despite error
      expect(miniModeRegistry.getCurrent()).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Support Checking", () => {
    it("should check if module supports mini-mode", () => {
      expect(miniModeRegistry.supportsModule("test-module")).toBe(false);

      miniModeRegistry.register(testProvider);
      expect(miniModeRegistry.supportsModule("test-module")).toBe(true);

      miniModeRegistry.unregister("test-module");
      expect(miniModeRegistry.supportsModule("test-module")).toBe(false);
    });
  });
});
