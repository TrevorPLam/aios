/**
 * Express Rate Limiter Mock
 * 
 * Mock for express-rate-limit to allow tests to run without the actual dependency.
 * Tests can run independently and faster without rate limiting delays.
 * 
 * Related: TASK-088 (Test Mocking Infrastructure)
 */

import type { Request, Response, NextFunction } from "express";

/**
 * Mock rate limiter that always allows requests
 */
export function createMockRateLimiter() {
  return (_req: Request, _res: Response, next: NextFunction) => {
    // Mock rate limiter - just pass through
    next();
  };
}

/**
 * Mock rate limiter factory (matches express-rate-limit API)
 */
export function rateLimit(_options?: any) {
  return createMockRateLimiter();
}

/**
 * Setup rate limiter mock for Jest
 */
export function setupRateLimiterMock() {
  jest.mock("express-rate-limit", () => ({
    rateLimit: jest.fn(() => createMockRateLimiter()),
    __esModule: true,
    default: jest.fn(() => createMockRateLimiter()),
  }));
}
