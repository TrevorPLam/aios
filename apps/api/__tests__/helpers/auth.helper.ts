/**
 * Auth Test Helpers
 * 
 * Reusable utilities for authentication in tests.
 * Reduces duplication of JWT token generation and user setup.
 * 
 * Related: TASK-089 (Test Helper Utilities)
 */

import { generateToken, type JWTPayload } from "../../middleware/auth";
import { randomUUID } from "crypto";

/**
 * Generate a test JWT token for a user
 */
export function generateTestToken(userId?: string, username?: string): string {
  const payload: JWTPayload = {
    userId: userId || randomUUID(),
    username: username || `testuser_${Date.now()}`,
  };
  return generateToken(payload);
}

/**
 * Create test user credentials
 */
export function createTestUser() {
  const userId = randomUUID();
  const username = `testuser_${Date.now()}`;
  const password = "testpassword123";
  const token = generateToken({ userId, username });

  return {
    userId,
    username,
    password,
    token,
  };
}

/**
 * Create auth headers for API requests
 */
export function createAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Create test user with auth headers
 */
export function createTestUserWithHeaders() {
  const user = createTestUser();
  const headers = createAuthHeaders(user.token);
  return { ...user, headers };
}
