/**
 * Lazy mini-mode loader tests
 *
 * Ensures the mini-mode lazy loading registry behaves with good input,
 * empty input, and missing modules.
 */

import { createLazyMiniModeComponent, getMiniModeLoader } from "../miniModes";

describe("lazy mini-mode loader", () => {
  it("test_happy_returns_loader_for_known_module", () => {
    // Happy path: known module IDs must resolve to a loader function.
    const loader = getMiniModeLoader("calendar");

    expect(typeof loader).toBe("function");
  });

  it("test_empty_requires_module_id", () => {
    // Empty input should fail fast to prevent silent runtime behavior.
    expect(() => getMiniModeLoader("")).toThrow(
      "Mini-mode module id is required.",
    );
  });

  it("test_error_missing_module_throws", () => {
    // Missing modules should throw a clear error for debugging.
    expect(() => createLazyMiniModeComponent("missing-module")).toThrow(
      "No mini-mode loader registered for module: missing-module",
    );
  });
});
