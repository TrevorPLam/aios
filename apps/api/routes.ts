import type { Express } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { authenticate, generateToken } from "./middleware/auth";
import { asyncHandler, AppError } from "./middleware/errorHandler";
import {
  validate,
  validateParams,
  validateQuery,
} from "./middleware/validation";
import { notesData } from "@features/notes/data";
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
  insertConversationSchema,
  updateConversationSchema,
  insertMessageSchema,
  updateMessageSchema,
  analyticsBatchSchema,
} from "@contracts/schema";
import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

const messageSearchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  conversationId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});

/**
 * Helper to ensure param is a string (not string[])
 * Express params can be string | string[], but we always expect single values
 */
function ensureString(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Replit
  app.get("/status", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

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
        colorTheme: "cyan",
        aiPersonality: "default",
        aiCustomPrompt: "",
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
        ensureString(req.params.id),
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
      const notes = await notesData.getNotes(req.user!.userId);
      res.json(notes);
    }),
  );

  app.get(
    "/api/notes/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const note = await notesData.getNote(
        ensureString(req.params.id),
        req.user!.userId,
      );
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
      const note = await notesData.createNote({
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
      const note = await notesData.updateNote(
        ensureString(req.params.id),
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
      const deleted = await notesData.deleteNote(
        ensureString(req.params.id),
        req.user!.userId,
      );
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
      const task = await storage.getTask(
        ensureString(req.params.id),
        req.user!.userId,
      );
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
        ensureString(req.params.id),
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
      const deleted = await storage.deleteTask(
        ensureString(req.params.id),
        req.user!.userId,
      );
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
      const project = await storage.getProject(
        ensureString(req.params.id),
        req.user!.userId,
      );
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
        ensureString(req.params.id),
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
        ensureString(req.params.id),
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
      const event = await storage.getEvent(
        ensureString(req.params.id),
        req.user!.userId,
      );
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
        ensureString(req.params.id),
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
        ensureString(req.params.id),
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

  // Conversation routes
  app.get(
    "/api/conversations",
    authenticate,
    asyncHandler(async (req, res) => {
      const conversations = await storage.getConversations(req.user!.userId);
      res.json(conversations);
    }),
  );

  app.get(
    "/api/conversations/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const conversation = await storage.getConversation(
        ensureString(req.params.id),
        req.user!.userId,
      );
      if (!conversation) {
        throw new AppError(404, "Conversation not found");
      }
      res.json(conversation);
    }),
  );

  app.post(
    "/api/conversations",
    authenticate,
    validate(insertConversationSchema),
    asyncHandler(async (req, res) => {
      const conversation = await storage.createConversation({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json(conversation);
    }),
  );

  app.put(
    "/api/conversations/:id",
    authenticate,
    validateParams(idParamSchema),
    validate(updateConversationSchema),
    asyncHandler(async (req, res) => {
      const conversation = await storage.updateConversation(
        ensureString(req.params.id),
        req.user!.userId,
        req.body,
      );
      if (!conversation) {
        throw new AppError(404, "Conversation not found");
      }
      res.json(conversation);
    }),
  );

  app.delete(
    "/api/conversations/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteConversation(
        ensureString(req.params.id),
        req.user!.userId,
      );
      if (!deleted) {
        throw new AppError(404, "Conversation not found");
      }
      res.status(204).send();
    }),
  );

  // Message routes
  // Search endpoint to support message lookups without UI changes.
  app.get(
    "/api/messages/search",
    authenticate,
    validateQuery(messageSearchQuerySchema),
    asyncHandler(async (req, res) => {
      // req.query is already validated and typed by validateQuery middleware
      const { q, conversationId, limit } = req.query;
      const results = await storage.searchMessages(
        q as string,
        req.user!.userId,
        {
          conversationId: conversationId as string | undefined,
          limit: limit as number | undefined,
        },
      );
      res.json(results);
    }),
  );

  app.get(
    "/api/conversations/:id/messages",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const messages = await storage.getMessages(
        ensureString(req.params.id),
        req.user!.userId,
      );
      res.json(messages);
    }),
  );

  app.get(
    "/api/messages/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const message = await storage.getMessage(
        ensureString(req.params.id),
        req.user!.userId,
      );
      if (!message) {
        throw new AppError(404, "Message not found");
      }
      res.json(message);
    }),
  );

  app.post(
    "/api/conversations/:id/messages",
    authenticate,
    validateParams(idParamSchema),
    validate(insertMessageSchema),
    asyncHandler(async (req, res) => {
      const message = await storage.createMessage({
        ...req.body,
        conversationId: ensureString(req.params.id),
      });
      res.status(201).json(message);
    }),
  );

  app.put(
    "/api/messages/:id",
    authenticate,
    validateParams(idParamSchema),
    validate(updateMessageSchema),
    asyncHandler(async (req, res) => {
      const message = await storage.updateMessage(
        ensureString(req.params.id),
        req.user!.userId,
        req.body,
      );
      if (!message) {
        throw new AppError(404, "Message not found");
      }
      res.json(message);
    }),
  );

  app.delete(
    "/api/messages/:id",
    authenticate,
    validateParams(idParamSchema),
    asyncHandler(async (req, res) => {
      const deleted = await storage.deleteMessage(
        ensureString(req.params.id),
        req.user!.userId,
      );
      if (!deleted) {
        throw new AppError(404, "Message not found");
      }
      res.status(204).send();
    }),
  );

  // Translation route
  app.post(
    "/api/translate",
    asyncHandler(async (req, res) => {
      const { text, sourceLang, targetLang } = req.body;

      if (!text || !sourceLang || !targetLang) {
        throw new AppError(
          400,
          "Missing required fields: text, sourceLang, targetLang",
        );
      }

      // Using LibreTranslate API (free and open source)
      // In production, you might want to use Google Translate API, DeepL, or another service
      const apiUrl = "https://libretranslate.com/translate";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: "text",
          }),
        });

        if (!response.ok) {
          throw new Error(`Translation API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json({ translatedText: data.translatedText });
      } catch (error) {
        console.error("Translation error:", error);
        throw new AppError(500, "Translation service unavailable");
      }
    }),
  );

  // Analytics telemetry endpoint
  app.post(
    "/api/telemetry/events",
    authenticate,
    validate(analyticsBatchSchema),
    asyncHandler(async (req, res) => {
      const { events, schemaVersion } = req.body;

      // Map client event format to storage format
      const mappedEvents = events.map((event: any) => ({
        eventId: event.eventId,
        eventName: event.eventName,
        timestamp: event.timestamp,
        properties: event.properties,
        identity: event.identity,
        appVersion: event.appVersion,
        platform: event.platform,
      }));

      // Save events to storage
      await storage.saveAnalyticsEvents(mappedEvents);

      // Return 202 Accepted (async processing)
      res.status(202).json({
        received: events.length,
        timestamp: new Date().toISOString(),
        schemaVersion,
      });
    }),
  );

  const httpServer = createServer(app);

  return httpServer;
}
