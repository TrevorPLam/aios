import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  allDay: boolean("all_day").notNull().default(false),
  timezone: text("timezone").notNull(),
  recurrenceRule: text("recurrence_rule").notNull().default("none"),
  exceptions: jsonb("exceptions").$type<string[]>().notNull().default([]),
  overrides: jsonb("overrides")
    .$type<Record<string, any>>()
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
    .default(["command", "notebook", "planner", "calendar", "email"]),
  aiLimitTier: integer("ai_limit_tier").notNull().default(1),
  darkMode: boolean("dark_mode").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertRecommendationSchema = createInsertSchema(
  recommendations,
).omit({
  id: true,
  createdAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateNoteSchema = insertNoteSchema.partial();

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTaskSchema = insertTaskSchema.partial();

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProjectSchema = insertProjectSchema.partial();

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEventSchema = insertEventSchema.partial();

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSettingsSchema = insertSettingsSchema.partial();

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Settings = typeof settings.$inferSelect;
