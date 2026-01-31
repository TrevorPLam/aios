/**
 * Unit tests for error handler middleware
 * Tests AppError class, errorHandler middleware, and asyncHandler wrapper
 */

import { Request, Response, NextFunction } from "express";
import { AppError, errorHandler, asyncHandler } from "../../middleware/errorHandler";

// Mock logger to prevent console noise during tests
jest.mock("../../utils/logger", () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("Error Handler Middleware", () => {
  describe("AppError", () => {
    it("should create AppError with status code and message", () => {
      const error = new AppError(404, "Resource not found");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Resource not found");
      expect(error.isOperational).toBe(true);
    });

    it("should set isOperational to true by default", () => {
      const error = new AppError(400, "Bad request");

      expect(error.isOperational).toBe(true);
    });

    it("should allow custom isOperational value", () => {
      const error = new AppError(500, "Unexpected error", false);

      expect(error.isOperational).toBe(false);
    });

    it("should have proper prototype chain", () => {
      const error = new AppError(403, "Forbidden");

      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("errorHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });

      mockRequest = {
        path: "/api/test",
        method: "GET",
      };

      mockResponse = {
        status: statusMock,
      };

      mockNext = jest.fn();
    });

    it("should handle AppError with correct status code and message", () => {
      const error = new AppError(400, "Invalid input");

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "Invalid input",
      });
    });

    it("should handle 404 errors correctly", () => {
      const error = new AppError(404, "User not found");

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "User not found",
      });
    });

    it("should handle 401 unauthorized errors", () => {
      const error = new AppError(401, "Unauthorized access");

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "Unauthorized access",
      });
    });

    it("should handle unexpected errors with generic message", () => {
      const error = new Error("Database connection failed");

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
      });
    });

    it("should not leak error details for non-operational errors", () => {
      const sensitiveError = new Error("SQL: SELECT * FROM users WHERE password='secret'");

      errorHandler(sensitiveError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "Internal server error",
      });
      expect(jsonMock).not.toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining("SQL") })
      );
    });

    it("should handle AppError with different status codes", () => {
      const testCases = [
        { status: 400, message: "Bad Request" },
        { status: 403, message: "Forbidden" },
        { status: 409, message: "Conflict" },
        { status: 422, message: "Unprocessable Entity" },
      ];

      testCases.forEach(({ status, message }) => {
        const error = new AppError(status, message);
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        expect(statusMock).toHaveBeenCalledWith(status);
        expect(jsonMock).toHaveBeenCalledWith({
          status: "error",
          message,
        });
      });
    });
  });

  describe("asyncHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {};
      mockNext = jest.fn();
    });

    it("should call async function and resolve successfully", async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should catch rejected promises and call next with error", async () => {
      const error = new Error("Async operation failed");
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should catch AppError and pass to next", async () => {
      const appError = new AppError(400, "Validation failed");
      const asyncFn = jest.fn().mockRejectedValue(appError);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(appError);
    });

    it("should handle thrown errors in async function", async () => {
      const asyncFn = jest.fn().mockImplementation(async () => {
        throw new AppError(404, "Not found");
      });
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
    });

    it("should pass through successful async operations", async () => {
      const asyncFn = jest.fn().mockImplementation(async (req, res) => {
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        res.status(200).json({ success: true });
      });
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(mockRequest as Request, mockResponse as Response, mockNext);

      expect(asyncFn).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle multiple async handlers independently", async () => {
      const asyncFn1 = jest.fn().mockResolvedValue(undefined);
      const asyncFn2 = jest.fn().mockRejectedValue(new Error("Error 2"));

      const wrappedFn1 = asyncHandler(asyncFn1);
      const wrappedFn2 = asyncHandler(asyncFn2);

      const next1 = jest.fn();
      const next2 = jest.fn();

      await wrappedFn1(mockRequest as Request, mockResponse as Response, next1);
      await wrappedFn2(mockRequest as Request, mockResponse as Response, next2);

      expect(next1).not.toHaveBeenCalled();
      expect(next2).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
