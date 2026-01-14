import type { Express } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { authenticate, generateToken } from "./middleware/auth";
import { asyncHandler, AppError } from "./middleware/errorHandler";
import { validate, validateParams } from "./middleware/validation";
import {
  insertUserSchema,
  loginSchema,
  insertNoteSchema,
  updateNoteSchema,
  insertTaskSchema,
  updateTaskSchema,
  insertProjectSchema,
  updateProjectSchema,
  insertEventSchema,
  updateEventSchema,
  updateSettingsSchema,
} from "@shared/schema";
import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post(
    "/api/auth/register",
    validate(insertUserSchema),
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        throw new AppError(409, "Username already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // Create default settings for user
      await storage.createSettings({
        userId: user.id,
        aiName: "AIOS",
        enabledModules: ["command", "notebook", "planner", "calendar", "email"],
        aiLimitTier: 1,
        darkMode: true,
      });

      // Generate token
      const token = generateToken({ userId: user.id, username: user.username });

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    }),
  );

  app.post(
    "/api/auth/login",
    validate(loginSchema),
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        throw new AppError(401, "Invalid credentials");
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AppError(401, "Invalid credentials");
      }

      // Generate token
      const token = generateToken({ userId: user.id, username: user.username });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    }),
  );

  app.get(
    "/api/auth/me",
    authenticate,
    asyncHandler(async (req, res) => {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        throw new AppError(404, "User not found");
      }

      res.json({
        id: user.id,
        username: user.username,
      });
    }),
  );

  app.post("/api/auth/logout", authenticate, (_req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: "Logged out successfully" });
  });

  // Recommendations routes
  app.get(
    "/api/recommendations",
    authenticate,
    asyncHandler(async (req, res) => {
      const recommendations = await storage.getRecommendations(
        req.user!.userId,
      );
      res.json(recommendations);
    }),
  );

  app.get(
    "/api/recommendations/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const recommendation = await storage.getRecommendation(
        req.params.id,
        req.user!.userId,
      );
      if (!recommendation) {
        throw new AppError(404, "Recommendation not found");
      }
      res.json(recommendation);
    }),
  );

  // Notes routes
  app.get(
    "/api/notes",
    authenticate,
    asyncHandler(async (req, res) => {
      const notes = await storage.getNotes(req.user!.userId);
      res.json(notes);
    }),
  );

  app.get(
    "/api/notes/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const note = await storage.getNote(req.params.id, req.user!.userId);
      if (!note) {
        throw new AppError(404, "Note not found");
      }
      res.json(note);
    }),
  );

  app.post(
    "/api/notes",
    authenticate,
    validate(insertNoteSchema),
    asyncHandler(async (req, res) => {
      const note = await storage.createNote({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json(note);
    }),
  );

  app.put(
    "/api/notes/:id",
    authenticate,
    validateParams(idParamSchema),
    validate(updateNoteSchema),
    asyncHandler(async (req, res) => {
      const note = await storage.updateNote(
        req.params.id,
        req.user!.userId,
        req.body,
      );
      if (!note) {
        throw new AppError(404, "Note not found");
      }
      res.json(note);
    }),
  );

  app.delete(
    "/api/notes/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteNote(req.params.id, req.user!.userId);
      if (!deleted) {
        throw new AppError(404, "Note not found");
      }
      res.status(204).send();
    }),
  );

  // Tasks routes
  app.get(
    "/api/tasks",
    authenticate,
    asyncHandler(async (req, res) => {
      const tasks = await storage.getTasks(req.user!.userId);
      res.json(tasks);
    }),
  );

  app.get(
    "/api/tasks/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const task = await storage.getTask(req.params.id, req.user!.userId);
      if (!task) {
        throw new AppError(404, "Task not found");
      }
      res.json(task);
    }),
  );

  app.post(
    "/api/tasks",
    authenticate,
    validate(insertTaskSchema),
    asyncHandler(async (req, res) => {
      const task = await storage.createTask({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json(task);
    }),
  );

  app.put(
    "/api/tasks/:id",
    authenticate,
    validateParams(idParamSchema),
    validate(updateTaskSchema),
    asyncHandler(async (req, res) => {
      const task = await storage.updateTask(
        req.params.id,
        req.user!.userId,
        req.body,
      );
      if (!task) {
        throw new AppError(404, "Task not found");
      }
      res.json(task);
    }),
  );

  app.delete(
    "/api/tasks/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteTask(req.params.id, req.user!.userId);
      if (!deleted) {
        throw new AppError(404, "Task not found");
      }
      res.status(204).send();
    }),
  );

  // Projects routes
  app.get(
    "/api/projects",
    authenticate,
    asyncHandler(async (req, res) => {
      const projects = await storage.getProjects(req.user!.userId);
      res.json(projects);
    }),
  );

  app.get(
    "/api/projects/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const project = await storage.getProject(req.params.id, req.user!.userId);
      if (!project) {
        throw new AppError(404, "Project not found");
      }
      res.json(project);
    }),
  );

  app.post(
    "/api/projects",
    authenticate,
    validate(insertProjectSchema),
    asyncHandler(async (req, res) => {
      const project = await storage.createProject({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json(project);
    }),
  );

  app.put(
    "/api/projects/:id",
    authenticate,
    validateParams(idParamSchema),
    validate(updateProjectSchema),
    asyncHandler(async (req, res) => {
      const project = await storage.updateProject(
        req.params.id,
        req.user!.userId,
        req.body,
      );
      if (!project) {
        throw new AppError(404, "Project not found");
      }
      res.json(project);
    }),
  );

  app.delete(
    "/api/projects/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteProject(
        req.params.id,
        req.user!.userId,
      );
      if (!deleted) {
        throw new AppError(404, "Project not found");
      }
      res.status(204).send();
    }),
  );

  // Events routes
  app.get(
    "/api/events",
    authenticate,
    asyncHandler(async (req, res) => {
      const events = await storage.getEvents(req.user!.userId);
      res.json(events);
    }),
  );

  app.get(
    "/api/events/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const event = await storage.getEvent(req.params.id, req.user!.userId);
      if (!event) {
        throw new AppError(404, "Event not found");
      }
      res.json(event);
    }),
  );

  app.post(
    "/api/events",
    authenticate,
    validate(insertEventSchema),
    asyncHandler(async (req, res) => {
      const event = await storage.createEvent({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json(event);
    }),
  );

  app.put(
    "/api/events/:id",
    authenticate,
    validateParams(idParamSchema),
    validate(updateEventSchema),
    asyncHandler(async (req, res) => {
      const event = await storage.updateEvent(
        req.params.id,
        req.user!.userId,
        req.body,
      );
      if (!event) {
        throw new AppError(404, "Event not found");
      }
      res.json(event);
    }),
  );

  app.delete(
    "/api/events/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteEvent(
        req.params.id,
        req.user!.userId,
      );
      if (!deleted) {
        throw new AppError(404, "Event not found");
      }
      res.status(204).send();
    }),
  );

  // Settings routes
  app.get(
    "/api/settings",
    authenticate,
    asyncHandler(async (req, res) => {
      const settings = await storage.getSettings(req.user!.userId);
      if (!settings) {
        throw new AppError(404, "Settings not found");
      }
      res.json(settings);
    }),
  );

  app.put(
    "/api/settings",
    authenticate,
    validate(updateSettingsSchema),
    asyncHandler(async (req, res) => {
      const settings = await storage.updateSettings(req.user!.userId, req.body);
      if (!settings) {
        throw new AppError(404, "Settings not found");
      }
      res.json(settings);
    }),
  );

  const httpServer = createServer(app);

  return httpServer;
}
