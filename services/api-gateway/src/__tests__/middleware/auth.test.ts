/**
 * Unit tests for auth middleware
 * Tests JWT token generation, verification, and authentication middleware
 */

// Set JWT_SECRET before any imports
process.env.JWT_SECRET = "test-secret";

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import {
  generateToken,
  verifyToken,
  authenticate,
  JWTPayload,
} from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";

describe("Auth Middleware", () => {
  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const payload: JWTPayload = {
        userId: "test-user-id",
        username: "testuser",
      };

      const token = generateToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should include userId and username in token payload", () => {
      const payload: JWTPayload = {
        userId: "user-123",
        username: "john",
      };

      const token = generateToken(payload);
      const decoded = jwt.verify(token, "test-secret") as JWTPayload;

      expect(decoded.userId).toBe("user-123");
      expect(decoded.username).toBe("john");
    });

    it("should set expiration on token", () => {
      const payload: JWTPayload = {
        userId: "user-123",
        username: "john",
      };

      const token = generateToken(payload);
      const decoded = jwt.verify(token, "test-secret") as any;

      expect(decoded.exp).toBeTruthy();
      expect(decoded.iat).toBeTruthy();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const payload: JWTPayload = {
        userId: "user-456",
        username: "jane",
      };

      const token = generateToken(payload);
      const result = verifyToken(token);

      expect(result.userId).toBe("user-456");
      expect(result.username).toBe("jane");
    });

    it("should throw AppError for invalid token", () => {
      const invalidToken = "invalid.token.string";

      expect(() => verifyToken(invalidToken)).toThrow(AppError);
      expect(() => verifyToken(invalidToken)).toThrow(
        "Invalid or expired token",
      );
    });

    it("should throw AppError for expired token", () => {
      const payload: JWTPayload = {
        userId: "user-789",
        username: "bob",
      };

      // Create token that expires immediately
      const expiredToken = jwt.sign(payload, "test-secret", {
        expiresIn: "0s",
      });

      // Wait a moment to ensure expiration
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(() => verifyToken(expiredToken)).toThrow(AppError);
          expect(() => verifyToken(expiredToken)).toThrow(
            "Invalid or expired token",
          );
          resolve();
        }, 100);
      });
    });

    it("should throw AppError for token with wrong secret", () => {
      const token = jwt.sign(
        { userId: "user-123", username: "test" },
        "wrong-secret",
      );

      expect(() => verifyToken(token)).toThrow(AppError);
    });
  });

  describe("authenticate middleware", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };
      mockResponse = {};
      mockNext = jest.fn();
    });

    it("should authenticate valid token and attach user to request", () => {
      const payload: JWTPayload = {
        userId: "user-999",
        username: "alice",
      };

      const token = generateToken(payload);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe("user-999");
      expect(mockRequest.user?.username).toBe("alice");
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should call next with error when no authorization header", () => {
      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("No token provided");
    });

    it("should call next with error when authorization header is malformed", () => {
      mockRequest.headers = {
        authorization: "InvalidFormat token123",
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it("should call next with error when token is invalid", () => {
      mockRequest.headers = {
        authorization: "Bearer invalid.token.here",
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Invalid or expired token");
    });

    it("should handle Bearer token with correct format", () => {
      const payload: JWTPayload = {
        userId: "user-111",
        username: "testuser",
      };

      const token = generateToken(payload);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should not attach user when authentication fails", () => {
      mockRequest.headers = {
        authorization: "Bearer invalid",
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
