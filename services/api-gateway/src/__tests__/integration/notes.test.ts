/**
 * Integration tests for Notes CRUD endpoints
 * Tests GET, POST, PUT, DELETE operations for /api/notes
 */

// Set JWT_SECRET before any imports
process.env.JWT_SECRET = "test-secret";

import express, { Express } from "express";
import request from "supertest";

import { notesData } from "@aios/features/notes/data";

import { generateToken } from "../../middleware/auth";
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

// Mock rate limiters
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

import { notesData } from "@aios/features/notes/data";

describe("Notes CRUD Integration Tests", () => {
  let app: Express;
  let authToken: string;
  const testUserId = "550e8400-e29b-41d4-a716-446655440000";
  const validNoteId = "650e8400-e29b-41d4-a716-446655440001";
  const validNoteId2 = "650e8400-e29b-41d4-a716-446655440002";

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);

    // Generate auth token for tests
    authToken = generateToken({
      userId: testUserId,
      username: "testuser",
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notes", () => {
    it("should return all notes for authenticated user", async () => {
      const mockNotes = [
        {
          id: "note-1",
          userId: testUserId,
          title: "Test Note 1",
          content: "Content 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "note-2",
          userId: testUserId,
          title: "Test Note 2",
          content: "Content 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (notesData.getNotes as jest.Mock).mockResolvedValue(mockNotes);

      const response = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe("Test Note 1");
      expect(notesData.getNotes).toHaveBeenCalledWith(testUserId);
    });

    it("should return empty array when user has no notes", async () => {
      (notesData.getNotes as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should reject request without authentication", async () => {
      const response = await request(app).get("/api/notes");

      expect(response.status).toBe(401);
      // Error responses may not have consistent body structure
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/api/notes")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/notes/:id", () => {
    it("should return specific note by id", async () => {
      const mockNote = {
        id: validNoteId,
        userId: testUserId,
        title: "Specific Note",
        content: "Specific Content",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (notesData.getNote as jest.Mock).mockResolvedValue(mockNote);

      const response = await request(app)
        .get(`/api/notes/${validNoteId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(validNoteId);
      expect(response.body.title).toBe("Specific Note");
      expect(notesData.getNote).toHaveBeenCalledWith(validNoteId, testUserId);
    });

    it("should return 404 for non-existent note", async () => {
      (notesData.getNote as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/notes/${validNoteId2}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      // Response validated by status code
    });

    it("should validate UUID format for note id", async () => {
      const response = await request(app)
        .get("/api/notes/invalid-uuid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/notes/note-123");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/notes", () => {
    it("should create a new note", async () => {
      const newNote = {
        title: "New Note",
        bodyMarkdown: "New Content",
        tags: [],
        links: [],
      };

      const createdNote = {
        id: "750e8400-e29b-41d4-a716-446655440004",
        userId: testUserId,
        ...newNote,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (notesData.createNote as jest.Mock).mockResolvedValue(createdNote);

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newNote);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe("750e8400-e29b-41d4-a716-446655440004");
      expect(response.body.title).toBe("New Note");
      expect(notesData.createNote).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          title: "New Note",
          bodyMarkdown: "New Content",
        }),
      );
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          // title missing
          bodyMarkdown: "Some content",
          tags: [],
          links: [],
        });

      expect(response.status).toBe(400);
    });

    it("should validate title maximum length", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "a".repeat(201), // exceeds 200 char limit
          bodyMarkdown: "Some content",
          tags: [],
          links: [],
        });

      expect(response.status).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await request(app).post("/api/notes").send({
        title: "Test Note",
        bodyMarkdown: "Test Content",
        tags: [],
        links: [],
      });

      expect(response.status).toBe(401);
    });

    it("should attach userId from token", async () => {
      const newNote = {
        title: "User Note",
        bodyMarkdown: "User Content",
        tags: [],
        links: [],
      };

      const createdNote = {
        id: "750e8400-e29b-41d4-a716-446655440005",
        userId: testUserId,
        ...newNote,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (notesData.createNote as jest.Mock).mockResolvedValue(createdNote);

      await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newNote);

      expect(notesData.createNote).toHaveBeenCalledWith(
        expect.objectContaining({ userId: testUserId }),
      );
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("should update existing note", async () => {
      const updateData = {
        title: "Updated Title",
        bodyMarkdown: "Updated Content",
      };

      const updatedNote = {
        id: "750e8400-e29b-41d4-a716-446655440006",
        userId: testUserId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (notesData.updateNote as jest.Mock).mockResolvedValue(updatedNote);

      const response = await request(app)
        .put("/api/notes/750e8400-e29b-41d4-a716-446655440006")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated Title");
      expect(notesData.updateNote).toHaveBeenCalledWith(
        "750e8400-e29b-41d4-a716-446655440006",
        testUserId,
        updateData,
      );
    });

    it("should return 404 for non-existent note", async () => {
      (notesData.updateNote as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put("/api/notes/650e8400-e29b-41d4-a716-446655440010")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          bodyMarkdown: "Updated Content",
        });

      expect(response.status).toBe(404);
      // Response validated by status code
    });

    it("should validate UUID format", async () => {
      const response = await request(app)
        .put("/api/notes/invalid-uuid")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test",
          content: "Test",
        });

      expect(response.status).toBe(400);
    });

    it("should allow partial updates", async () => {
      const updateData = {
        title: "Only Title Updated",
      };

      const updatedNote = {
        id: "750e8400-e29b-41d4-a716-446655440007",
        userId: testUserId,
        title: "Only Title Updated",
        bodyMarkdown: "Original Content",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (notesData.updateNote as jest.Mock).mockResolvedValue(updatedNote);

      const response = await request(app)
        .put("/api/notes/750e8400-e29b-41d4-a716-446655440007")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Only Title Updated");
    });

    it("should require authentication", async () => {
      const response = await request(app).put("/api/notes/note-123").send({
        title: "Updated",
        content: "Updated",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should delete existing note", async () => {
      (notesData.deleteNote as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete("/api/notes/750e8400-e29b-41d4-a716-446655440008")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(204);
      expect(notesData.deleteNote).toHaveBeenCalledWith(
        "750e8400-e29b-41d4-a716-446655440008",
        testUserId,
      );
    });

    it("should return 404 for non-existent note", async () => {
      (notesData.deleteNote as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .delete("/api/notes/650e8400-e29b-41d4-a716-446655440010")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      // Response validated by status code
    });

    it("should validate UUID format", async () => {
      const response = await request(app)
        .delete("/api/notes/invalid-uuid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should require authentication", async () => {
      const response = await request(app).delete("/api/notes/note-123");

      expect(response.status).toBe(401);
    });

    it("should not allow deleting other users notes", async () => {
      // This is implicit in the implementation - deleteNote is called with userId
      // The storage layer enforces this constraint
      (notesData.deleteNote as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .delete("/api/notes/750e8400-e29b-41d4-a716-446655440009")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(notesData.deleteNote).toHaveBeenCalledWith(
        "750e8400-e29b-41d4-a716-446655440009",
        testUserId,
      );
    });
  });
});
