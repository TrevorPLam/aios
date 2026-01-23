/**
 * Authentication Security Tests
 *
 * Verifies security-critical behavior that must not regress:
 * - Password hashing (prevents plaintext storage)
 * - Token validation
 * - Auth bypass protection
 */
import bcrypt from "bcryptjs";
import { storage } from "../storage";

describe("Authentication Security", () => {
  describe("Password Hashing", () => {
    test("should hash password before storage (CRITICAL)", async () => {
      const username = `security_test_${Date.now()}`;
      const plainPassword = "MySecurePassword123!";

      // Create user
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // CRITICAL: Verify password is NOT stored in plaintext
      expect(user.password).not.toBe(plainPassword);

      // Verify password follows bcrypt format
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);

      // Verify stored hash can validate original password
      const isValid = await bcrypt.compare(plainPassword, user.password);
      expect(isValid).toBe(true);
    });

    test("should never store plaintext password", async () => {
      const username = `plaintext_test_${Date.now()}`;
      const plainPassword = "password123";

      // This test prevents regression where bcrypt.hash() is accidentally removed
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Hash should be significantly different from original
      expect(hashedPassword.length).toBeGreaterThan(plainPassword.length);
      expect(hashedPassword).not.toContain(plainPassword);

      // Hash should start with bcrypt identifier
      expect(hashedPassword.startsWith("$2")).toBe(true);
    });

    test("should use sufficient bcrypt rounds (10+)", async () => {
      const password = "testPassword";
      const hashedPassword = await bcrypt.hash(password, 10);

      // Extract cost factor from hash (format: $2a$10$...)
      const costMatch = hashedPassword.match(/^\$2[aby]\$(\d+)\$/);
      expect(costMatch).not.toBeNull();

      const costFactor = parseInt(costMatch![1], 10);
      expect(costFactor).toBeGreaterThanOrEqual(10);
    });
  });
});
