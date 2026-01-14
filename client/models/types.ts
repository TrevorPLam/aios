import { DEFAULT_AI_CUSTOM_PROMPT } from "@/constants/aiDefaults";

export type ModuleType =
  | "command"
  | "notebook"
  | "planner"
  | "calendar"
  | "email"
  | "lists"
  | "alerts"
  | "photos"
  | "messages"
  | "contacts"
  | "translator"
  | "budget";

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

/**
 * Recommendation Interface
 *
 * Represents an AI-generated suggestion/recommendation.
 * Recommendations are time-bound, have confidence levels, and track evidence.
 *
 * @property {string} id - Unique identifier for the recommendation
 * @property {ModuleType} module - Which module this recommendation is for
 * @property {string} title - Short recommendation title
 * @property {string} summary - Detailed description of the recommendation
 * @property {string} type - Type/category of recommendation
 * @property {RecommendationStatus} status - Current status (active, accepted, declined, expired)
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} expiresAt - ISO 8601 timestamp when recommendation expires
 * @property {ConfidenceLevel} confidence - AI confidence level (low, medium, high)
 * @property {TaskPriority} priority - Priority level for the recommendation
 * @property {string} dedupeKey - Key to prevent duplicate recommendations
 * @property {boolean} countsAgainstLimit - Whether this counts against AI usage limits
 * @property {string} why - Explanation of why AI made this recommendation
 * @property {string[]} evidenceTimestamps - Array of ISO timestamps showing evidence
 */
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

/**
 * Recommendation Decision Interface
 *
 * Records user's decision on a recommendation (accepted or declined).
 * Used for tracking AI effectiveness and user preferences.
 *
 * @property {string} id - Unique identifier for the decision
 * @property {string} recommendationId - ID of the related recommendation
 * @property {DecisionType} decision - User's decision (accepted or declined)
 * @property {string} decidedAt - ISO 8601 timestamp when decision was made
 */
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

/**
 * Calendar Event Interface
 *
 * Represents a calendar event with support for recurrence and exceptions.
 * Events can be all-day or have specific start/end times.
 *
 * @property {string} id - Unique identifier for the event
 * @property {string} title - Event title/name
 * @property {string} description - Optional event description
 * @property {string} location - Optional event location
 * @property {string} startAt - ISO 8601 timestamp of event start
 * @property {string} endAt - ISO 8601 timestamp of event end
 * @property {boolean} allDay - Whether the event is an all-day event
 * @property {string} timezone - Timezone of the event (e.g., "America/New_York")
 * @property {RecurrenceRule} recurrenceRule - How often the event repeats
 * @property {string[]} exceptions - Array of ISO 8601 dates to exclude from recurrence
 * @property {Record<string, Partial<CalendarEvent>>} overrides - Date-specific overrides for recurring events
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 * @property {"LOCAL"} source - Event source (currently only LOCAL supported)
 */
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

/**
 * Alert Type
 *
 * Defines the type of alert/notification
 * - alarm: Sound-based alert (typically for wake-up times)
 * - reminder: Notification-based reminder (for tasks/events)
 */
export type AlertType = "alarm" | "reminder";

/**
 * Alert Sound Type
 *
 * Available sound options for alerts
 */
export type AlertSound =
  | "default"
  | "gentle"
  | "radar"
  | "bells"
  | "chimes"
  | "digital";

/**
 * Vibration Pattern Type
 *
 * Available vibration patterns for alerts
 */
export type VibrationPattern =
  | "default"
  | "pulse"
  | "double"
  | "long"
  | "none";

/**
 * Snooze Duration Type
 *
 * Pre-defined snooze duration options in minutes
 */
export type SnoozeDuration = 5 | 10 | 15 | 30 | 60;

/**
 * Alert History Entry Interface
 *
 * Tracks individual alert trigger events for analytics
 *
 * @property {string} id - Unique identifier for the history entry
 * @property {string} alertId - ID of the associated alert
 * @property {string} triggeredAt - ISO 8601 timestamp when alert was triggered
 * @property {string | null} dismissedAt - ISO 8601 timestamp when alert was dismissed (null if still active)
 * @property {number} snoozeCount - Number of times alert was snoozed
 * @property {number} totalSnoozeDuration - Total minutes snoozed
 * @property {boolean} wasOnTime - Whether the alert was dismissed within 5 minutes of trigger
 */
export interface AlertHistoryEntry {
  id: string;
  alertId: string;
  triggeredAt: string;
  dismissedAt: string | null;
  snoozeCount: number;
  totalSnoozeDuration: number;
  wasOnTime: boolean;
}

/**
 * Alert Statistics Interface
 *
 * Aggregated statistics for alert performance analytics
 *
 * @property {string} alertId - ID of the associated alert
 * @property {number} totalTriggers - Total number of times alert has triggered
 * @property {number} totalSnoozes - Total times snoozed across all triggers
 * @property {number} averageSnoozeCount - Average snoozes per trigger
 * @property {number} onTimeDismissalRate - Percentage of on-time dismissals (0-100)
 * @property {string | null} lastTriggeredAt - Last time alert triggered
 */
export interface AlertStatistics {
  alertId: string;
  totalTriggers: number;
  totalSnoozes: number;
  averageSnoozeCount: number;
  onTimeDismissalRate: number;
  lastTriggeredAt: string | null;
}

/**
 * Alert Interface
 *
 * Represents an alarm or reminder in the system.
 * Supports one-time and recurring alerts with enable/disable functionality.
 *
 * @property {string} id - Unique identifier for the alert
 * @property {string} title - Alert title/name
 * @property {string} description - Optional description or notes
 * @property {string} time - ISO 8601 timestamp when alert should trigger
 * @property {AlertType} type - Type of alert (alarm or reminder)
 * @property {boolean} isEnabled - Whether the alert is currently active
 * @property {RecurrenceRule} recurrenceRule - How often the alert repeats
 * @property {AlertSound} sound - Sound to play when alert triggers (default: "default")
 * @property {VibrationPattern} vibration - Vibration pattern for alert (default: "default")
 * @property {boolean} gradualVolume - Whether to gradually increase volume (gentle wake) (default: false)
 * @property {SnoozeDuration} snoozeDuration - Duration in minutes for snooze (default: 10)
 * @property {string[]} tags - Tags for categorization (e.g., "workout", "medication")
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Alert {
  id: string;
  title: string;
  description: string;
  time: string;
  type: AlertType;
  isEnabled: boolean;
  recurrenceRule: RecurrenceRule;
  sound: AlertSound;
  vibration: VibrationPattern;
  gradualVolume: boolean;
  snoozeDuration: SnoozeDuration;
  tags: string[];
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
export type MessageType = "text" | "image" | "video" | "audio" | "file" | "gif";
export type ColorTheme =
  | "cyan"
  | "purple"
  | "green"
  | "orange"
  | "pink"
  | "blue";
export type AIPersonality =
  | "default"
  | "enthusiastic"
  | "coach"
  | "witty"
  | "militant";

export type ConversationType = "direct" | "group";

export interface MessageAttachment {
  id: string;
  type: MessageType;
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  duration?: number; // For audio/video in seconds
  width?: number;
  height?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  replyToId: string | null;
  isEdited: boolean;
  isRead: boolean;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string; // For group chats, otherwise derived from participants
  participants: ConversationParticipant[];
  lastMessageId: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  unreadCount: number;
  isTyping: string[]; // Array of user IDs currently typing
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Contact Interface
 *
 * Represents a contact from the device with app-specific enhancements.
 * Includes sharing preferences for controlling what data is shared in-app.
 *
 * @property {string} id - Unique identifier (from device or generated)
 * @property {string} name - Contact's full name
 * @property {string} [firstName] - Optional first name
 * @property {string} [lastName] - Optional last name
 * @property {string[]} phoneNumbers - Array of phone numbers
 * @property {string[]} emails - Array of email addresses
 * @property {string} [birthday] - Optional birthday (ISO 8601 date)
 * @property {string} [company] - Optional company/organization name
 * @property {string} [jobTitle] - Optional job title
 * @property {string} [imageUri] - Optional profile image URI
 * @property {boolean} isRegistered - Whether contact is registered in the app
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers: string[];
  emails: string[];
  birthday?: string;
  company?: string;
  jobTitle?: string;
  imageUri?: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  userName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeenAt: string;
  joinedAt: string;
}

export interface VideoCallSession {
  id: string;
  conversationId: string;
  participants: VideoCallParticipant[];
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
}

export interface VideoCallParticipant {
  userId: string;
  userName: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  joinedAt: string;
  leftAt: string | null;
}

export type ContactSharingField = "email" | "birthday" | "business";

/**
 * Contact Sharing Preferences Interface
 *
 * Granular control over what contact information is shared within the app.
 *
 * @property {boolean} shareEmail - Share email address
 * @property {boolean} shareBirthday - Share birthday information
 * @property {boolean} shareBusinessInfo - Share business/work information (company, jobTitle)
 */
export interface ContactSharingPreferences {
  shareEmail: boolean;
  shareBirthday: boolean;
  shareBusinessInfo: boolean;
}

/**
 * Budget Line Item Interface
 *
 * Represents a single line item within a budget category.
 * Tracks both budgeted and actual amounts for comparison.
 *
 * @property {string} id - Unique identifier for the line item
 * @property {string} name - Line item name/description (e.g., "Rent", "Groceries")
 * @property {number} budgeted - Budgeted/planned amount
 * @property {number} actual - Actual spent amount
 */
export interface BudgetLineItem {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
}

/**
 * Budget Category Interface
 *
 * Represents a category containing multiple budget line items.
 * Categories can be expanded or collapsed in the UI.
 *
 * @property {string} id - Unique identifier for the category
 * @property {string} name - Category name (e.g., "Housing", "Transportation")
 * @property {BudgetLineItem[]} lineItems - Array of line items in this category
 * @property {boolean} isExpanded - Whether the category is expanded in the UI
 */
export interface BudgetCategory {
  id: string;
  name: string;
  lineItems: BudgetLineItem[];
  isExpanded: boolean;
}

/**
 * Budget Interface
 *
 * Represents a monthly budget with multiple categories and line items.
 * Used for tracking planned vs actual spending across various categories.
 *
 * @property {string} id - Unique identifier for the budget
 * @property {string} name - Budget name/title
 * @property {string} month - Month in YYYY-MM format (e.g., "2026-01")
 * @property {BudgetCategory[]} categories - Array of budget categories
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Budget {
  id: string;
  name: string;
  month: string;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Integration Category Type
 *
 * Represents the category/type of third-party service integration.
 */
export type IntegrationCategory =
  | "calendar"
  | "email"
  | "cloud_storage"
  | "task_management"
  | "communication"
  | "ai_services"
  | "productivity"
  | "finance";

/**
 * Integration Connection Status
 *
 * Tracks the current connection state of an integration.
 */
export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "syncing";

/**
 * Integration Sync Frequency
 *
 * Determines how often the integration should sync data.
 */
export type SyncFrequency =
  | "realtime"
  | "hourly"
  | "daily"
  | "weekly"
  | "manual";

/**
 * Integration Statistics Interface
 *
 * Tracks usage statistics for an integration.
 *
 * @property {number} totalSyncs - Total number of sync operations performed
 * @property {number} dataItemsSynced - Total number of data items synchronized
 * @property {number} lastSyncDurationMs - Duration of the last sync in milliseconds
 * @property {number} errorCount - Number of sync errors encountered
 */
export interface IntegrationStats {
  totalSyncs: number;
  dataItemsSynced: number;
  lastSyncDurationMs: number;
  errorCount: number;
}

/**
 * Integration Configuration Interface
 *
 * Stores configuration options for an integration.
 *
 * @property {SyncFrequency} syncFrequency - How often to sync data
 * @property {boolean} syncEnabled - Whether automatic syncing is enabled
 * @property {boolean} notificationsEnabled - Whether to show sync notifications
 * @property {boolean} twoWaySync - Whether to sync data bidirectionally
 * @property {string[]} syncedDataTypes - Types of data being synced (e.g., ["events", "contacts"])
 */
export interface IntegrationConfig {
  syncFrequency: SyncFrequency;
  syncEnabled: boolean;
  notificationsEnabled: boolean;
  twoWaySync: boolean;
  syncedDataTypes: string[];
}

/**
 * Integration Interface
 *
 * Represents a third-party service integration.
 * Integrations connect external services like Google Calendar, Dropbox, etc.
 *
 * @property {string} id - Unique identifier for the integration
 * @property {string} name - Integration name (e.g., "Google Calendar")
 * @property {string} serviceName - Service provider name (e.g., "Google")
 * @property {IntegrationCategory} category - Category of the integration
 * @property {string} description - Brief description of what the integration does
 * @property {string} iconName - Feather icon name for the integration
 * @property {IntegrationStatus} status - Current connection status
 * @property {boolean} isEnabled - Whether the integration is active
 * @property {string | null} lastSyncAt - ISO 8601 timestamp of last successful sync
 * @property {string | null} connectedAt - ISO 8601 timestamp when integration was connected
 * @property {IntegrationConfig} config - Configuration options for the integration
 * @property {IntegrationStats} stats - Usage statistics
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 * @property {Record<string, any>} metadata - Additional integration-specific data
 */
export interface Integration {
  id: string;
  name: string;
  serviceName: string;
  category: IntegrationCategory;
  description: string;
  iconName: string;
  status: IntegrationStatus;
  isEnabled: boolean;
  lastSyncAt: string | null;
  connectedAt: string | null;
  config: IntegrationConfig;
  stats: IntegrationStats;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface Settings {
  aiName: string;
  enabledModules: ModuleType[];
  aiLimitTier: AILimitTier;
  darkMode: boolean;
  photoGridSize: PhotoGridSize;
  contactSharingPreferences: ContactSharingPreferences;
  colorTheme: ColorTheme;
  aiPersonality: AIPersonality;
  aiCustomPrompt: string;
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
    "messages",
    "contacts",
    "translator",
    "budget",
  ] as ModuleType[],
  aiLimitTier: 1,
  darkMode: true,
  photoGridSize: 4,
  contactSharingPreferences: {
    shareEmail: true,
    shareBirthday: true,
    shareBusinessInfo: true,
  },
  colorTheme: "cyan",
  aiPersonality: "default",
  aiCustomPrompt: DEFAULT_AI_CUSTOM_PROMPT,
};

export const TIER_LIMITS: Record<AILimitTier, number> = {
  0: 6,
  1: 12,
  2: 18,
  3: 24,
};
