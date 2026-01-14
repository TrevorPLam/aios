export type ModuleType =
  | "command"
  | "notebook"
  | "planner"
  | "calendar"
  | "email"
  | "lists"
  | "alerts"
  | "photos";

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

export interface ListItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface List {
  id: string;
  title: string;
  items: ListItem[];
  createdAt: string;
  lastOpenedAt: string;
  updatedAt: string;
}

export type AlertType = "alarm" | "reminder";

export interface Alert {
  id: string;
  title: string;
  description: string;
  time: string;
  type: AlertType;
  isEnabled: boolean;
  recurrenceRule: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  uri: string;
  localPath: string;
  thumbnailUri?: string;
  width: number;
  height: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  isBackedUp: boolean;
  tags: string[];
}

export interface PhotoEdit {
  photoId: string;
  editedUri: string;
  operations: PhotoEditOperation[];
  createdAt: string;
}

export type PhotoEditOperation =
  | { type: "crop"; x: number; y: number; width: number; height: number }
  | { type: "rotate"; degrees: number }
  | { type: "flip"; direction: "horizontal" | "vertical" }
  | { type: "brightness"; value: number }
  | { type: "contrast"; value: number }
  | { type: "saturation"; value: number }
  | { type: "filter"; name: string }
  | { type: "ai_auto_fix" };

export type PhotoGridSize = 2 | 3 | 4 | 5 | 6;

export interface Settings {
  aiName: string;
  enabledModules: ModuleType[];
  aiLimitTier: AILimitTier;
  darkMode: boolean;
  photoGridSize: PhotoGridSize;
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
  enabledModules: [
    "command",
    "notebook",
    "planner",
    "calendar",
    "email",
    "lists",
    "alerts",
    "photos",
  ],
  aiLimitTier: 1,
  darkMode: true,
  photoGridSize: 4,
};

export const TIER_LIMITS: Record<AILimitTier, number> = {
  0: 6,
  1: 12,
  2: 18,
  3: 24,
};
