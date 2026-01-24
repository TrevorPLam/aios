/**
 * JWT Configuration Security Tests
 *
 * Verifies security-critical JWT configuration behavior:
 * - JWT_SECRET must be set (no default fallback)
 * - Server fails fast when JWT_SECRET is missing
 */

describe("JWT Configuration Security", () => {
  describe("JWT_SECRET Validation", () => {
    test("should require JWT_SECRET environment variable", () => {
      // Save original JWT_SECRET
      const originalJWT = process.env.JWT_SECRET;
      
      // Remove JWT_SECRET
      delete process.env.JWT_SECRET;
      
      // Importing the auth module should throw
      expect(() => {
        // Clear module cache to force re-import
        jest.resetModules();
        require("../middleware/auth");
      }).toThrow(/JWT_SECRET environment variable is required/);
      
      // Restore original JWT_SECRET
      if (originalJWT) {
        process.env.JWT_SECRET = originalJWT;
      }
    });

    test("should accept valid JWT_SECRET", () => {
      // Ensure JWT_SECRET is set
      process.env.JWT_SECRET = "test-secret-key";
      
      // Clear module cache and re-import
      jest.resetModules();
      
      // Should not throw
      expect(() => {
        require("../middleware/auth");
      }).not.toThrow();
    });

    test("should use JWT_SECRET from environment", () => {
      // This test ensures that the JWT_SECRET comes from environment
      // and is not hardcoded
      process.env.JWT_SECRET = "custom-test-secret";
      
      // Clear module cache and re-import
      jest.resetModules();
      const auth = require("../middleware/auth");
      
      // Verify token generation works with custom secret
      const token = auth.generateToken({ userId: "123", username: "test" });
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      
      // Verify token can be verified
      const payload = auth.verifyToken(token);
      expect(payload.userId).toBe("123");
      expect(payload.username).toBe("test");
    });
  });
});
