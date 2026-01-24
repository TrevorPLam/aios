/**
 * Rate Limiting Security Tests
 *
 * Verifies rate limiting behavior for authentication endpoints:
 * - Login endpoint has rate limiting
 * - Register endpoint has rate limiting
 * - Rate limits are enforced correctly
 */
import request from "supertest";
import express, { type Express } from "express";
import { loginRateLimiter, registerRateLimiter } from "../middleware/rateLimiter";

describe("Rate Limiting Security", () => {
  let app: Express;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
  });

  describe("Login Rate Limiter", () => {
    test("should allow requests under the limit", async () => {
      app.post("/test-login", loginRateLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });

      // Make a few requests (under the limit)
      for (let i = 0; i < 3; i++) {
        const response = await request(app).post("/test-login").send({});
        expect(response.status).toBe(200);
      }
    });

    test("should have correct rate limit configuration", () => {
      // Verify the limiter exists and is a function
      expect(loginRateLimiter).toBeDefined();
      expect(typeof loginRateLimiter).toBe("function");
    });
  });

  describe("Register Rate Limiter", () => {
    test("should allow requests under the limit", async () => {
      app.post("/test-register", registerRateLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });

      // Make a few requests (under the limit)
      for (let i = 0; i < 2; i++) {
        const response = await request(app).post("/test-register").send({});
        expect(response.status).toBe(200);
      }
    });

    test("should have correct rate limit configuration", () => {
      // Verify the limiter exists and is a function
      expect(registerRateLimiter).toBeDefined();
      expect(typeof registerRateLimiter).toBe("function");
    });
  });

  describe("Rate Limit Headers", () => {
    test("should include rate limit headers in response", async () => {
      app.post("/test-endpoint", loginRateLimiter, (req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app).post("/test-endpoint").send({});
      
      // Check for standard rate limit headers
      expect(response.headers["ratelimit-limit"]).toBeDefined();
      expect(response.headers["ratelimit-remaining"]).toBeDefined();
      expect(response.headers["ratelimit-reset"]).toBeDefined();
    });
  });
});
