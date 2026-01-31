/**
 * Integration tests for authentication endpoints
 * Tests register and login flows
 */

// Set JWT_SECRET before any imports
process.env.JWT_SECRET = "test-secret";

import express, { Express } from "express";
import request from "supertest";

import { registerRoutes } from "../../routes";

// Mock logger
jest.mock("../../utils/logger", () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock storage
jest.mock("../../storage", () => ({
  storage: {
    getUserByUsername: jest.fn(),
    createUser: jest.fn(),
    createSettings: jest.fn(),
    getUser: jest.fn(),
  },
}));

// Mock rate limiters to prevent rate limiting during tests
jest.mock("../../middleware/rateLimiter", () => ({
  loginRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  registerRateLimiter: (_req: unknown, _res: unknown, next: () => void) =>
    next(),
}));

// Mock notesData
jest.mock("@aios/features/notes/data", () => ({
  notesData: {
    getNotes: jest.fn(),
    getNote: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
  },
}));

import bcrypt from "bcryptjs";

import { storage } from "../../storage";

describe("Auth Integration Tests", () => {
  let app: Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: "user-123",
        username: "newuser",
        password: "hashedpassword",
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (storage.createUser as jest.Mock).mockResolvedValue(mockUser);
      (storage.createSettings as jest.Mock).mockResolvedValue({});

      const response = await request(app).post("/api/auth/register").send({
        username: "newuser",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.username).toBe("newuser");
      expect(response.body.user.id).toBe("user-123");

      expect(storage.getUserByUsername).toHaveBeenCalledWith("newuser");
      expect(storage.createUser).toHaveBeenCalled();
      expect(storage.createSettings).toHaveBeenCalled();
    });

    it("should reject registration with existing username", async () => {
      const existingUser = {
        id: "existing-user",
        username: "existinguser",
        password: "hashedpass",
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app).post("/api/auth/register").send({
        username: "existinguser",
        password: "password123",
      });

      expect(response.status).toBe(409);
      // Error responses may not have consistent body structure
    });

    it("should validate request body", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "ab", // too short
        password: "123", // too short
      });

      expect(response.status).toBe(400);
      // Error responses may not have consistent body structure
    });

    it("should require username and password", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "testuser",
        // password missing
      });

      expect(response.status).toBe(400);
    });

    it("should hash password before storing", async () => {
      const mockUser = {
        id: "user-456",
        username: "secureuser",
        password: "hashedpassword",
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (storage.createUser as jest.Mock).mockResolvedValue(mockUser);
      (storage.createSettings as jest.Mock).mockResolvedValue({});

      await request(app).post("/api/auth/register").send({
        username: "secureuser",
        password: "plainpassword",
      });

      expect(storage.createUser).toHaveBeenCalled();
      const createUserCall = (storage.createUser as jest.Mock).mock.calls[0][0];
      expect(createUserCall.password).not.toBe("plainpassword");
    });

    it("should create default settings for new user", async () => {
      const mockUser = {
        id: "user-789",
        username: "newuser",
        password: "hashedpassword",
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);
      (storage.createUser as jest.Mock).mockResolvedValue(mockUser);
      (storage.createSettings as jest.Mock).mockResolvedValue({});

      await request(app).post("/api/auth/register").send({
        username: "newuser",
        password: "password123",
      });

      expect(storage.createSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-789",
          aiName: "AIOS",
          darkMode: true,
        }),
      );
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 10);
      const mockUser = {
        id: "user-123",
        username: "testuser",
        password: hashedPassword,
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "correctpassword",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.username).toBe("testuser");
    });

    it("should reject login with invalid username", async () => {
      (storage.getUserByUsername as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        username: "nonexistent",
        password: "password123",
      });

      expect(response.status).toBe(401);
      // Error responses may not have consistent body structure
    });

    it("should reject login with invalid password", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 10);
      const mockUser = {
        id: "user-123",
        username: "testuser",
        password: hashedPassword,
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      // Error responses may not have consistent body structure
    });

    it("should validate request body", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: "ab", // too short
        password: "123", // too short
      });

      expect(response.status).toBe(400);
    });

    it("should return JWT token on successful login", async () => {
      const hashedPassword = await bcrypt.hash("testpass", 10);
      const mockUser = {
        id: "user-456",
        username: "jwtuser",
        password: hashedPassword,
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/login").send({
        username: "jwtuser",
        password: "testpass",
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.split(".")).toHaveLength(3);
    });

    it("should not expose password in response", async () => {
      const hashedPassword = await bcrypt.hash("testpass", 10);
      const mockUser = {
        id: "user-789",
        username: "secureuser",
        password: hashedPassword,
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/login").send({
        username: "secureuser",
        password: "testpass",
      });

      expect(response.body.user).not.toHaveProperty("password");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token", async () => {
      const hashedPassword = await bcrypt.hash("testpass", 10);
      const mockUser = {
        id: "user-123",
        username: "testuser",
        password: hashedPassword,
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      (storage.getUser as jest.Mock).mockResolvedValue(mockUser);

      // Login first to get token
      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "testpass",
      });

      const token = loginResponse.body.token;

      // Use token to access protected endpoint
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe("testuser");
      expect(response.body.id).toBe("user-123");
    });

    it("should reject request without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      // Error responses may not have consistent body structure
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully with valid token", async () => {
      const hashedPassword = await bcrypt.hash("testpass", 10);
      const mockUser = {
        id: "user-123",
        username: "testuser",
        password: hashedPassword,
      };

      (storage.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);

      const loginResponse = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "testpass",
      });

      const token = loginResponse.body.token;

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logged out successfully");
    });

    it("should reject logout without token", async () => {
      const response = await request(app).post("/api/auth/logout");

      expect(response.status).toBe(401);
    });
  });
});
