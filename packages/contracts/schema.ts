import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { DEFAULT_AI_CUSTOM_PROMPT } from "./constants";
import { meetingLinkSchema } from "./meetingLinks";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  module: text("module").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  confidence: text("confidence").notNull(),
  priority: text("priority").notNull(),
  dedupeKey: text("dedupe_key").notNull(),
  countsAgainstLimit: boolean("counts_against_limit").notNull().default(true),
  why: text("why").notNull(),
  evidenceTimestamps: jsonb("evidence_timestamps").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const notes = pgTable("notes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  bodyMarkdown: text("body_markdown").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  links: jsonb("links").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  userNotes: text("user_notes").notNull().default(""),
  aiNotes: jsonb("ai_notes").$type<string[]>().notNull().default([]),
  priority: text("priority").notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").notNull(),
  recurrenceRule: text("recurrence_rule").notNull().default("none"),
  projectId: varchar("project_id"),
  parentTaskId: varchar("parent_task_id"),
  dependencyIds: jsonb("dependency_ids")
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  taskIds: jsonb("task_ids").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  meetingLink: text("meeting_link"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  allDay: boolean("all_day").notNull().default(false),
  timezone: text("timezone").notNull(),
  recurrenceRule: text("recurrence_rule").notNull().default("none"),
  exceptions: jsonb("exceptions").$type<string[]>().notNull().default([]),
  overrides: jsonb("overrides")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  source: text("source").notNull().default("LOCAL"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  aiName: text("ai_name").notNull().default("AIOS"),
  enabledModules: jsonb("enabled_modules")
    .$type<string[]>()
    .notNull()
    .default([
      "command",
      "notebook",
      "planner",
      "calendar",
      "email",
      "messages",
    ]),
  aiLimitTier: integer("ai_limit_tier").notNull().default(1),
  darkMode: boolean("dark_mode").notNull().default(true),
  colorTheme: text("color_theme").notNull().default("cyan"),
  aiPersonality: text("ai_personality").notNull().default("default"),
  aiCustomPrompt: text("ai_custom_prompt")
    .notNull()
    .default(DEFAULT_AI_CUSTOM_PROMPT),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  participants: jsonb("participants")
    .$type<
      {
        userId: string;
        userName: string;
        avatarUrl?: string;
        isOnline: boolean;
        lastSeenAt: string;
        joinedAt: string;
      }[]
    >()
    .notNull()
    .default([]),
  lastMessageId: varchar("last_message_id"),
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview").notNull().default(""),
  unreadCount: integer("unread_count").notNull().default(0),
  isTyping: jsonb("is_typing").$type<string[]>().notNull().default([]),
  isPinned: boolean("is_pinned").notNull().default(false),
  isMuted: boolean("is_muted").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  attachments: jsonb("attachments")
    .$type<
      {
        id: string;
        type: string;
        url: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        thumbnailUrl?: string;
        duration?: number;
        width?: number;
        height?: number;
      }[]
    >()
    .notNull()
    .default([]),
  replyToId: varchar("reply_to_id"),
  isEdited: boolean("is_edited").notNull().default(false),
  isRead: boolean("is_read").notNull().default(false),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation with max length limits for security
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must not exceed 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must not exceed 100 characters"),
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must not exceed 50 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must not exceed 100 characters"),
});

export const insertRecommendationSchema = createInsertSchema(
  recommendations,
).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  title: z.string().max(200, "Title must not exceed 200 characters"),
  summary: z.string().max(1000, "Summary must not exceed 1000 characters"),
  why: z.string().max(2000, "Why field must not exceed 2000 characters"),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().max(200, "Title must not exceed 200 characters"),
  bodyMarkdown: z.string().max(50000, "Note content must not exceed 50000 characters"),
});

export const updateNoteSchema = insertNoteSchema.partial();

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().max(200, "Title must not exceed 200 characters"),
  userNotes: z.string().max(5000, "User notes must not exceed 5000 characters"),
});

export const updateTaskSchema = insertTaskSchema.partial();

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().max(200, "Name must not exceed 200 characters"),
  description: z.string().max(5000, "Description must not exceed 5000 characters"),
});

export const updateProjectSchema = insertProjectSchema.partial();

export const insertEventSchema = createInsertSchema(events)
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    title: z.string().max(200, "Title must not exceed 200 characters"),
    description: z.string().max(5000, "Description must not exceed 5000 characters"),
    location: z.string().max(500, "Location must not exceed 500 characters"),
    // Centralized meeting link validation keeps API sync aligned with client UI.
    meetingLink: meetingLinkSchema,
  });

export const updateEventSchema = insertEventSchema.partial();

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  aiName: z.string().max(50, "AI name must not exceed 50 characters"),
  aiCustomPrompt: z.string().max(10000, "Custom prompt must not exceed 10000 characters"),
});

export const updateSettingsSchema = insertSettingsSchema.partial();

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().max(200, "Conversation name must not exceed 200 characters"),
  lastMessagePreview: z.string().max(500, "Message preview must not exceed 500 characters"),
});

export const updateConversationSchema = insertConversationSchema.partial();

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  senderName: z.string().max(100, "Sender name must not exceed 100 characters"),
  content: z.string().max(10000, "Message content must not exceed 10000 characters"),
});

export const updateMessageSchema = insertMessageSchema.partial();

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Analytics events table with indexes for performance
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id"),
    eventName: varchar("event_name", { length: 100 }).notNull(),
    eventProperties: jsonb("event_properties").notNull().default({}),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    sessionId: varchar("session_id", { length: 50 }),
    deviceId: varchar("device_id", { length: 100 }),
    platform: varchar("platform", { length: 20 }),
    appVersion: varchar("app_version", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("analytics_user_id_idx").on(table.userId),
    eventNameIdx: index("analytics_event_name_idx").on(table.eventName),
    timestampIdx: index("analytics_timestamp_idx").on(table.timestamp),
    sessionIdIdx: index("analytics_session_id_idx").on(table.sessionId),
  }),
);

// Analytics validation schemas
export const analyticsEventSchema = z.object({
  eventId: z.string().uuid(),
  eventName: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  properties: z.record(z.string(), z.any()),
  identity: z.object({
    userId: z.string().uuid().optional(),
    deviceId: z.string().optional(),
    sessionId: z.string().optional(),
  }),
  appVersion: z.string().optional(),
  platform: z.string().optional(),
});

export const analyticsBatchSchema = z.object({
  events: z.array(analyticsEventSchema).min(1).max(100),
  schemaVersion: z.string().default("1.0.0"),
  mode: z.enum(["default", "privacy"]).optional(),
});

// Type exports for analytics
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type AnalyticsEventPayload = z.infer<typeof analyticsEventSchema>;
export type AnalyticsBatchPayload = z.infer<typeof analyticsBatchSchema>;
