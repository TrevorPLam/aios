/**
 * Unit tests for validation middleware
 * Tests Zod schema validation for body, params, and query
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { AppError } from "../../middleware/errorHandler";
import {
  validate,
  validateParams,
  validateQuery,
} from "../../middleware/validation";

describe("Validation Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe("validate (body validation)", () => {
    it("should pass validation with valid body data", () => {
      const schema = z.object({
        username: z.string().min(3),
        email: z.string().email(),
      });

      mockRequest.body = {
        username: "testuser",
        email: "test@example.com",
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it("should fail validation with invalid body data", () => {
      const schema = z.object({
        username: z.string().min(3),
        email: z.string().email(),
      });

      mockRequest.body = {
        username: "ab", // too short
        email: "invalid-email",
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });

    it("should fail validation with missing required fields", () => {
      const schema = z.object({
        username: z.string(),
        password: z.string(),
      });

      mockRequest.body = {
        username: "testuser",
        // password is missing
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("password");
    });

    it("should validate nested objects", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number().min(18),
        }),
      });

      mockRequest.body = {
        user: {
          name: "John",
          age: 25,
        },
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should fail validation for nested object errors", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number().min(18),
        }),
      });

      mockRequest.body = {
        user: {
          name: "John",
          age: 15, // below minimum
        },
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should validate arrays", () => {
      const schema = z.object({
        tags: z.array(z.string()).min(1),
      });

      mockRequest.body = {
        tags: ["tag1", "tag2"],
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should provide user-friendly error messages", () => {
      const schema = z.object({
        email: z.string().email(),
      });

      mockRequest.body = {
        email: "not-an-email",
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBeTruthy();
      expect(typeof error.message).toBe("string");
    });
  });

  describe("validateParams (URL params validation)", () => {
    it("should pass validation with valid params", () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      mockRequest.params = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should fail validation with invalid UUID", () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      mockRequest.params = {
        id: "not-a-uuid",
      };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });

    it("should validate numeric params", () => {
      const schema = z.object({
        page: z.string().regex(/^\d+$/),
      });

      mockRequest.params = {
        page: "5",
      };

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should fail with missing required params", () => {
      const schema = z.object({
        id: z.string(),
      });

      mockRequest.params = {};

      const middleware = validateParams(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("validateQuery (query string validation)", () => {
    it("should pass validation with valid query params", () => {
      const schema = z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
      });

      mockRequest.query = {
        page: "1",
        limit: "10",
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should fail validation with invalid query params", () => {
      const schema = z.object({
        page: z.string().regex(/^\d+$/),
      });

      mockRequest.query = {
        page: "not-a-number",
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should handle optional query parameters", () => {
      const schema = z.object({
        search: z.string().optional(),
        sort: z.enum(["asc", "desc"]).optional(),
      });

      mockRequest.query = {};

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should validate query param enums", () => {
      const schema = z.object({
        status: z.enum(["active", "inactive", "pending"]),
      });

      mockRequest.query = {
        status: "active",
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should fail on invalid enum value", () => {
      const schema = z.object({
        status: z.enum(["active", "inactive"]),
      });

      mockRequest.query = {
        status: "unknown",
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it("should handle multiple query parameters", () => {
      const schema = z.object({
        q: z.string().min(1),
        category: z.string().optional(),
        limit: z.string().regex(/^\d+$/).optional(),
      });

      mockRequest.query = {
        q: "search term",
        category: "tech",
        limit: "20",
      };

      const middleware = validateQuery(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe("error handling consistency", () => {
    it("should return AppError with status 400 for all validation failures", () => {
      const schemas = [
        {
          middleware: validate,
          data: "body",
          schema: z.object({ name: z.string() }),
        },
        {
          middleware: validateParams,
          data: "params",
          schema: z.object({ id: z.string() }),
        },
        {
          middleware: validateQuery,
          data: "query",
          schema: z.object({ q: z.string() }),
        },
      ];

      schemas.forEach(({ middleware: mw, schema }) => {
        const mockReq = { body: {}, params: {}, query: {} } as Request;
        const mockNext = jest.fn();

        const m = mw(schema);
        m(mockReq, {} as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
      });
    });

    it("should provide descriptive error messages", () => {
      const schema = z.object({
        email: z.string().email("Invalid email format"),
        age: z.number().min(18, "Must be 18 or older"),
      });

      mockRequest.body = {
        email: "bad-email",
        age: 10,
      };

      const middleware = validate(schema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBeTruthy();
    });
  });
});
