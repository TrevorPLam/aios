export type ModuleType =
  | "command"
  | "notebook"
  | "planner"
  | "calendar"
  | "email";

export type ConfidenceLevel = "low" | "medium" | "high";

export type RecommendationStatus =
  | "active"
  | "accepted"
  | "declined"
  | "dismissed"
  | "expired";

export type DecisionType = "accepted" | "declined" | "dismissed";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type RecurrenceRule = "none" | "daily" | "weekly" | "monthly" | "custom";

export type AILimitTier = 0 | 1 | 2 | 3;

export interface Recommendation {
  id: string;
  module: ModuleType;
  title: string;
  summary: string;
  type: string;
  status: RecommendationStatus;
  createdAt: string;
  expiresAt: string;
  confidence: ConfidenceLevel;
  priority: TaskPriority;
  dedupeKey: string;
  countsAgainstLimit: boolean;
  why: string;
  evidenceTimestamps: string[];
}

export interface RecommendationDecision {
  id: string;
  recommendationId: string;
  decision: DecisionType;
  decidedAt: string;
}

export interface Note {
  id: string;
  title: string;
  bodyMarkdown: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  links: string[];
}

export interface Task {
  id: string;
  title: string;
  userNotes: string;
  aiNotes: string[];
  priority: TaskPriority;
  dueDate: string | null;
  status: TaskStatus;
  recurrenceRule: RecurrenceRule;
  projectId: string | null;
  parentTaskId: string | null;
  dependencyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  timezone: string;
  recurrenceRule: RecurrenceRule;
  exceptions: string[];
  overrides: Record<string, Partial<CalendarEvent>>;
  createdAt: string;
  updatedAt: string;
  source: "LOCAL";
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  messages: EmailMessage[];
  isRead: boolean;
  isStarred: boolean;
  lastMessageAt: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  sentAt: string;
  isRead: boolean;
}

export interface Settings {
  aiName: string;
  enabledModules: ModuleType[];
  aiLimitTier: AILimitTier;
  darkMode: boolean;
}

export interface HistoryLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "recommendation" | "archived" | "banked" | "deprecated" | "system";
  metadata?: Record<string, unknown>;
}

export interface AILimits {
  used: number;
  total: number;
  nextRefreshAt: string;
}

export const DEFAULT_SETTINGS: Settings = {
  aiName: "AIOS",
  enabledModules: ["command", "notebook", "planner", "calendar", "email"],
  aiLimitTier: 1,
  darkMode: true,
};

export const TIER_LIMITS: Record<AILimitTier, number> = {
  0: 6,
  1: 12,
  2: 18,
  3: 24,
};
