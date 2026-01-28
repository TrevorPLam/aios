import {
  resolveModuleFromRoute,
  runPerformanceHooks,
} from "@aios/platform/lib/navigationPerformance";
import { logger } from "@aios/platform/lib/logger";

jest.mock("@aios/platform/lib/logger", () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("resolveModuleFromRoute", () => {
  it("test_resolveModuleFromRoute_happy", () => {
    // Happy path: known route should map to module id.
    expect(resolveModuleFromRoute("CommandCenter")).toBe("command");
  });

  it("test_resolveModuleFromRoute_empty", () => {
    // Empty input should fail safely and log why we skipped.
    expect(resolveModuleFromRoute(null)).toBeNull();
    expect(logger.debug).toHaveBeenCalledWith(
      "NavigationPerformance",
      "Missing route name; skipping module lookup",
    );
  });
});

describe("runPerformanceHooks", () => {
  it("test_runPerformanceHooks_happy", async () => {
    const onModuleMount = jest.fn();
    const onModuleAccess = jest.fn();
    const onModuleEnter = jest.fn();

    // Happy path: all handlers should be invoked for tracked modules.
    await runPerformanceHooks({
      moduleId: "command",
      onModuleEnter,
      onModuleAccess,
      onModuleMount,
    });

    expect(onModuleMount).toHaveBeenCalledWith("command");
    expect(onModuleAccess).toHaveBeenCalledWith("command");
    expect(onModuleEnter).toHaveBeenCalledWith("command");
  });

  it("test_runPerformanceHooks_error", async () => {
    const onModuleMount = jest.fn();
    const onModuleAccess = jest.fn();
    const onModuleEnter = jest.fn(() => {
      throw new Error("Boom");
    });

    // Error path: failures should be caught and logged without throwing.
    await expect(
      runPerformanceHooks({
        moduleId: "command",
        onModuleEnter,
        onModuleAccess,
        onModuleMount,
      }),
    ).resolves.not.toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      "NavigationPerformance",
      "Failed to run performance hooks",
      expect.objectContaining({
        moduleId: "command",
        error: "Boom",
      }),
    );
  });

  it("test_runPerformanceHooks_missingHandlers", async () => {
    // Edge case: missing handlers should short-circuit with a warning.
    await runPerformanceHooks({
      moduleId: "command",
      onModuleEnter: undefined,
      onModuleAccess: undefined,
      onModuleMount: undefined,
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "NavigationPerformance",
      "Missing performance handlers",
      expect.objectContaining({
        moduleId: "command",
        hasEnter: false,
        hasAccess: false,
        hasMount: false,
      }),
    );
  });
});
