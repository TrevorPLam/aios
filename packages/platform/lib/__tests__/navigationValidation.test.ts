import {
  getNavigationErrorMessage,
  validateRouteRegistration,
} from "@aios/platform/lib/navigationValidation";

describe("navigationValidation utilities", () => {
  describe("validateRouteRegistration", () => {
    it("returns valid when route exists", () => {
      // Happy path: route name is present and registered.
      const result = validateRouteRegistration({
        routeName: "Notebook",
        routeNames: ["Notebook", "Planner"],
        moduleName: "Notebook",
      });

      expect(result.isValid).toBe(true);
    });

    it("returns an error when routes list is empty", () => {
      // Empty state: navigator hasn't registered any routes yet.
      const result = validateRouteRegistration({
        routeName: "Notebook",
        routeNames: [],
        moduleName: "Notebook",
      });

      expect(result.isValid).toBe(false);
      expect("error" in result).toBe(true);
    });

    it("returns an error when route name is missing", () => {
      // Error case: missing route name should fail fast with a clear message.
      const result = validateRouteRegistration({
        routeName: "",
        routeNames: ["Notebook"],
      });

      expect(result.isValid).toBe(false);
      expect("error" in result).toBe(true);
    });
  });

  describe("getNavigationErrorMessage", () => {
    it("returns module-specific copy when module name is provided", () => {
      // Ensures we keep UX copy consistent for module-specific failures.
      const message = getNavigationErrorMessage("Notebook");
      expect(message).toContain("Notebook");
    });
  });
});
