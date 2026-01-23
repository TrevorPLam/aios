/**
 * How to Use:
 * - Call RecommendationEngine.refreshRecommendations() to rebuild suggestions.
 * - Access RecommendationEngine.generateRecommendations() for custom flows.
 *
 * UI integration example:
 * - CommandCenterScreen refreshes cards via RecommendationEngine.refreshRecommendations().
 *
 * Public API:
 * - RecommendationEngine.
 *
 * Expected usage pattern:
 * - Run refresh sparingly (e.g., user-triggered) to avoid heavy work on launch.
 *
 * WHY: Centralizes recommendation generation so results stay consistent across screens.
 */
/**
 * Recommendation Engine Module
 *
 * Generates AI-powered recommendations by analyzing user data across modules.
 * Uses rule-based logic to provide intelligent suggestions without external AI APIs.
 *
 * Key Features:
 * - Cross-module data analysis
 * - Priority scoring based on multiple factors
 * - Deduplication to prevent repeat suggestions
 * - Context-aware recommendations
 * - Evidence-based reasoning
 *
 * Architecture:
 * - Analyzer: Examines data from each module
 * - Scorer: Calculates priority and confidence
 * - Generator: Creates formatted recommendations
 * - Deduplicator: Prevents duplicate suggestions
 *
 * @module RecommendationEngine
 * @author AIOS Development Team
 * @version 1.0.0
 */

import {
  Recommendation,
  Note,
  Task,
  CalendarEvent,
  ConfidenceLevel,
  TaskPriority,
  ModuleType,
} from "@contracts/models/types";
import { generateId } from "@platform/lib/helpers";
import { db } from "@platform/storage/database";

/**
 * Recommendation rule interface
 * Defines the structure for recommendation generation rules
 */
interface RecommendationRule {
  id: string;
  module: ModuleType;
  type: string;
  checkCondition: (data: AnalysisData) => Promise<boolean>;
  generate: (data: AnalysisData) => Promise<Recommendation | null>;
  priority: number; // Higher = more important (1-100)
}

/**
 * Analysis data interface
 * Aggregates data from all modules for recommendation generation
 */
interface AnalysisData {
  notes: Note[];
  tasks: Task[];
  events: CalendarEvent[];
  currentTime: Date;
  recentDecisions: { recommendationId: string; decision: string }[];
}

/**
 * Calculates days between two dates
 *
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Number of days between dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Gets date string in YYYY-MM-DD format
 * Used for deduplication keys to ensure one recommendation per day
 *
 * @param {Date} date - Date to format (defaults to current date)
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Generates ISO timestamp for hours from now
 *
 * @param {number} hours - Number of hours to add
 * @returns {string} ISO 8601 timestamp
 */
function hoursFromNow(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

/**
 * Rule priorities for recommendation generation
 * Higher values = more urgent/important
 */
const RULE_PRIORITIES = {
  URGENT_DEADLINE: 90,
  HIGH_FOCUS_TIME: 80,
  MEDIUM_MEETING_NOTES: 75,
  MEDIUM_TASK_BREAKDOWN: 70,
  LOW_REFLECTION: 40,
  TIP_ORGANIZATION: 30,
} as const;

/**
 * Configuration constants for recommendation engine
 */
const ENGINE_CONFIG = {
  /** Minimum recommendations before auto-refresh triggers */
  MIN_RECOMMENDATIONS_THRESHOLD: 3,
  /** Maximum historical items to retrieve */
  MAX_HISTORY_ITEMS: 100,
  /** Days after which recommendations are considered stale */
  STALE_TASK_DAYS: 3,
  /** Days between reflection prompts */
  REFLECTION_INTERVAL_DAYS: 6,
  /** Days ahead to check for upcoming deadlines */
  DEADLINE_WARNING_DAYS: 3,
  /** Minimum untagged notes before suggesting organization */
  MIN_UNTAGGED_NOTES: 5,
} as const;

/**
 * RECOMMENDATION RULES
 * Defines all recommendation generation rules
 */

/**
 * Helper function to check if a note is a reflection
 *
 * @param {Note} note - Note to check
 * @returns {boolean} True if note is a reflection
 */
function isReflectionNote(note: Note): boolean {
  const lowerTitle = note.title.toLowerCase();
  return (
    lowerTitle.includes("reflection") ||
    lowerTitle.includes("weekly") ||
    note.tags.some((t) => t.toLowerCase().includes("reflection"))
  );
}

/**
 * RECOMMENDATION RULES
 * Defines all recommendation generation rules
 */

/**
 * Rule: Suggest creating notes for recent calendar events
 * Rationale: Meeting notes improve retention and team alignment
 */
const suggestMeetingNotes: RecommendationRule = {
  id: "meeting_notes",
  module: "notebook",
  type: "note_suggestion",
  priority: RULE_PRIORITIES.MEDIUM_MEETING_NOTES,
  checkCondition: async (data: AnalysisData) => {
    // Check for calendar events in past 24 hours without corresponding notes
    const yesterday = new Date(data.currentTime);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentEvents = data.events.filter((event) => {
      const eventDate = new Date(event.startAt);
      return eventDate > yesterday && eventDate < data.currentTime;
    });

    // Check if we already have notes mentioning these events
    for (const event of recentEvents) {
      const hasNote = data.notes.some((note) =>
        note.title.toLowerCase().includes(event.title.toLowerCase()),
      );
      if (!hasNote && recentEvents.length > 0) {
        return true;
      }
    }

    return false;
  },
  generate: async (data: AnalysisData) => {
    const yesterday = new Date(data.currentTime);
    yesterday.setDate(yesterday.getDate() - 1);

    const recentEvents = data.events.filter((event) => {
      const eventDate = new Date(event.startAt);
      return eventDate > yesterday && eventDate < data.currentTime;
    });

    if (recentEvents.length === 0) return null;

    const event = recentEvents[0];
    return {
      id: generateId(),
      module: "notebook",
      title: `Document: ${event.title}`,
      summary: `Create structured notes for "${event.title}" that occurred recently. Capturing key decisions and action items improves team alignment.`,
      type: "note_suggestion",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(24),
      confidence: "high",
      priority: "medium",
      dedupeKey: `meeting_notes_${event.id}`,
      countsAgainstLimit: true,
      why: `Calendar event "${event.title}" occurred ${daysBetween(new Date(event.startAt), data.currentTime)} days ago. Research shows documenting meetings within 24 hours increases retention by 65%.`,
      evidenceTimestamps: [event.startAt],
    };
  },
};

/**
 * Rule: Suggest breaking down large tasks
 * Rationale: Tasks pending >3 days often need decomposition
 */
const suggestTaskBreakdown: RecommendationRule = {
  id: "task_breakdown",
  module: "planner",
  type: "task_optimization",
  priority: RULE_PRIORITIES.MEDIUM_TASK_BREAKDOWN,
  checkCondition: async (data: AnalysisData) => {
    // Find tasks that are pending for >3 days with no subtasks
    const threeDaysAgo = new Date(data.currentTime);
    threeDaysAgo.setDate(
      threeDaysAgo.getDate() - ENGINE_CONFIG.STALE_TASK_DAYS,
    );

    const staleTasks = data.tasks.filter((task) => {
      const createdDate = new Date(task.createdAt);
      return (
        task.status === "pending" &&
        createdDate < threeDaysAgo &&
        !task.parentTaskId // Only parent tasks
      );
    });

    return staleTasks.length > 0;
  },
  generate: async (data: AnalysisData) => {
    const threeDaysAgo = new Date(data.currentTime);
    threeDaysAgo.setDate(
      threeDaysAgo.getDate() - ENGINE_CONFIG.STALE_TASK_DAYS,
    );

    const staleTasks = data.tasks.filter((task) => {
      const createdDate = new Date(task.createdAt);
      return (
        task.status === "pending" &&
        createdDate < threeDaysAgo &&
        !task.parentTaskId
      );
    });

    if (staleTasks.length === 0) return null;

    // Pick highest priority stale task
    const task = staleTasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })[0];

    const daysPending = daysBetween(new Date(task.createdAt), data.currentTime);

    return {
      id: generateId(),
      module: "planner",
      title: `Break down: ${task.title}`,
      summary: `Task "${task.title}" has been pending for ${daysPending} days. Breaking it into smaller subtasks increases completion likelihood by 3x.`,
      type: "task_optimization",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(48),
      confidence: "high",
      priority: task.priority,
      dedupeKey: `task_breakdown_${task.id}`,
      countsAgainstLimit: true,
      why: `Research shows tasks pending >3 days often indicate unclear scope. Breaking "${task.title}" into 3-5 subtasks makes it more actionable.`,
      evidenceTimestamps: [task.createdAt],
    };
  },
};

/**
 * Rule: Suggest scheduling focus time
 * Rationale: High-priority tasks need dedicated time blocks
 */
const suggestFocusTime: RecommendationRule = {
  id: "focus_time",
  module: "calendar",
  type: "scheduling_suggestion",
  priority: RULE_PRIORITIES.HIGH_FOCUS_TIME,
  checkCondition: async (data: AnalysisData) => {
    // Check for high-priority tasks without calendar time allocated
    const highPriorityTasks = data.tasks.filter(
      (task) =>
        (task.priority === "high" || task.priority === "urgent") &&
        task.status !== "completed" &&
        task.status !== "cancelled",
    );

    // Check if there's focus time scheduled in next 3 days
    const threeDaysAhead = new Date(data.currentTime);
    threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);

    const hasFocusTime = data.events.some((event) => {
      const eventDate = new Date(event.startAt);
      return (
        eventDate > data.currentTime &&
        eventDate < threeDaysAhead &&
        (event.title.toLowerCase().includes("focus") ||
          event.title.toLowerCase().includes("deep work"))
      );
    });

    return highPriorityTasks.length >= 2 && !hasFocusTime;
  },
  generate: async (data: AnalysisData) => {
    const highPriorityTasks = data.tasks.filter(
      (task) =>
        (task.priority === "high" || task.priority === "urgent") &&
        task.status !== "completed" &&
        task.status !== "cancelled",
    );

    return {
      id: generateId(),
      module: "calendar",
      title: "Schedule focus time",
      summary: `Block 2-hour deep work session for ${highPriorityTasks.length} high-priority tasks. Morning slots show 40% higher productivity.`,
      type: "scheduling_suggestion",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(36),
      confidence: "high",
      priority: "high",
      dedupeKey: `focus_time_${getDateString()}`,
      countsAgainstLimit: true,
      why: `You have ${highPriorityTasks.length} high-priority tasks but no dedicated focus time scheduled. Cal Newport research shows focused blocks increase output by 2-3x.`,
      evidenceTimestamps: highPriorityTasks.map((t) => t.createdAt),
    };
  },
};

/**
 * Rule: Suggest weekly reflection
 * Rationale: Regular reflection improves self-awareness
 */
const suggestWeeklyReflection: RecommendationRule = {
  id: "weekly_reflection",
  module: "notebook",
  type: "reflection_prompt",
  priority: 40,
  checkCondition: async (data: AnalysisData) => {
    // Check if last note with "reflection" or "weekly" was >6 days ago
    const sixDaysAgo = new Date(data.currentTime);
    sixDaysAgo.setDate(
      sixDaysAgo.getDate() - ENGINE_CONFIG.REFLECTION_INTERVAL_DAYS,
    );

    const hasRecentReflection = data.notes.some((note) => {
      const noteDate = new Date(note.updatedAt);
      return isReflectionNote(note) && noteDate > sixDaysAgo;
    });

    // Only suggest on weekends (Friday-Sunday)
    const dayOfWeek = data.currentTime.getDay();
    const isWeekend = dayOfWeek >= 5 || dayOfWeek === 0;

    return !hasRecentReflection && isWeekend;
  },
  generate: async (data: AnalysisData) => {
    return {
      id: generateId(),
      module: "notebook",
      title: "Weekly reflection",
      summary:
        "Take 10 minutes to reflect on this week's wins, challenges, and lessons learned.",
      type: "reflection_prompt",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(48),
      confidence: "medium",
      priority: "low",
      dedupeKey: `weekly_reflection_${getDateString()}`,
      countsAgainstLimit: true,
      why: "Weekly reflections help identify patterns and celebrate progress. Studies show regular reflection increases goal achievement by 23%.",
      evidenceTimestamps: [new Date().toISOString()],
    };
  },
};

/**
 * Rule: Suggest task due date review
 * Rationale: Approaching deadlines need visibility
 */
const suggestDueDateReview: RecommendationRule = {
  id: "due_date_review",
  module: "planner",
  type: "deadline_alert",
  priority: RULE_PRIORITIES.URGENT_DEADLINE,
  checkCondition: async (data: AnalysisData) => {
    // Check for tasks due in next 3 days
    const threeDaysAhead = new Date(data.currentTime);
    threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);

    const upcomingTasks = data.tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= threeDaysAhead && dueDate > data.currentTime;
    });

    return upcomingTasks.length >= 3;
  },
  generate: async (data: AnalysisData) => {
    const threeDaysAhead = new Date(data.currentTime);
    threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);

    const upcomingTasks = data.tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= threeDaysAhead && dueDate > data.currentTime;
    });

    return {
      id: generateId(),
      module: "planner",
      title: "Review upcoming deadlines",
      summary: `${upcomingTasks.length} tasks due within 3 days. Review priorities and adjust schedule to avoid last-minute rush.`,
      type: "deadline_alert",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(12),
      confidence: "high",
      priority: "urgent",
      dedupeKey: `due_date_review_${getDateString()}`,
      countsAgainstLimit: true,
      why: `Multiple deadlines approaching. Early review reduces stress and improves quality. Tasks: ${upcomingTasks.map((t) => t.title).join(", ")}.`,
      evidenceTimestamps: upcomingTasks
        .map((t) => t.dueDate)
        .filter((d): d is string => d !== null && d !== undefined),
    };
  },
};

/**
 * Rule: Suggest organizing notes with tags
 * Rationale: Untagged notes are harder to find
 */
const suggestNoteTagging: RecommendationRule = {
  id: "note_tagging",
  module: "notebook",
  type: "organization_tip",
  priority: 30,
  checkCondition: async (data: AnalysisData) => {
    // Check for notes without tags
    const untaggedNotes = data.notes.filter((note) => note.tags.length === 0);
    return untaggedNotes.length >= ENGINE_CONFIG.MIN_UNTAGGED_NOTES;
  },
  generate: async (data: AnalysisData) => {
    const untaggedNotes = data.notes.filter((note) => note.tags.length === 0);

    return {
      id: generateId(),
      module: "notebook",
      title: "Add tags to notes",
      summary: `${untaggedNotes.length} notes lack tags. Adding tags makes notes 5x easier to find later.`,
      type: "organization_tip",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: hoursFromNow(72),
      confidence: "medium",
      priority: "low",
      dedupeKey: "note_tagging_batch",
      countsAgainstLimit: false,
      why: `Tags enable quick filtering and discovery. Users with tagged notes report 80% faster information retrieval.`,
      evidenceTimestamps: untaggedNotes.slice(0, 5).map((n) => n.createdAt),
    };
  },
};

/**
 * All recommendation rules registry
 * Order matters: higher priority rules are evaluated first
 */
const ALL_RULES: RecommendationRule[] = [
  suggestDueDateReview, // Priority: 90
  suggestFocusTime, // Priority: 80
  suggestMeetingNotes, // Priority: 75
  suggestTaskBreakdown, // Priority: 70
  suggestWeeklyReflection, // Priority: 40
  suggestNoteTagging, // Priority: 30
];

/**
 * Main Recommendation Engine Class
 *
 * Generates recommendations by analyzing user data across modules.
 * Uses rule-based approach for intelligent suggestions.
 */
export class RecommendationEngine {
  /**
   * Analyzes current data and generates recommendations
   *
   * @param {number} maxRecommendations - Maximum number of recommendations to generate
   * @returns {Promise<Recommendation[]>} Array of generated recommendations
   */
  static async generateRecommendations(
    maxRecommendations: number = 5,
  ): Promise<Recommendation[]> {
    try {
      // Gather data from all modules
      const data = await this.gatherAnalysisData();

      // Get existing recommendations to avoid duplication
      const existing = await db.recommendations.getAll();
      const existingDedupeKeys = new Set(existing.map((r) => r.dedupeKey));

      const recommendations: Recommendation[] = [];

      // Evaluate each rule
      for (const rule of ALL_RULES) {
        if (recommendations.length >= maxRecommendations) break;

        try {
          // Check if condition is met
          const conditionMet = await rule.checkCondition(data);
          if (!conditionMet) continue;

          // Generate recommendation
          const rec = await rule.generate(data);
          if (!rec) continue;

          // Check for duplication
          if (existingDedupeKeys.has(rec.dedupeKey)) continue;

          recommendations.push(rec);
        } catch (error) {
          console.error(`Error evaluating rule ${rule.id}:`, error);
        }
      }

      return recommendations;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return [];
    }
  }

  /**
   * Gathers data from all modules for analysis
   *
   * @returns {Promise<AnalysisData>} Aggregated data from all modules
   */
  private static async gatherAnalysisData(): Promise<AnalysisData> {
    // Gather data with error handling for each module
    const [notes, tasks, events, decisions] = await Promise.all([
      db.notes.getAll().catch((error) => {
        console.error("Error fetching notes:", error);
        return [];
      }),
      db.tasks.getAll().catch((error) => {
        console.error("Error fetching tasks:", error);
        return [];
      }),
      db.events.getAll().catch((error) => {
        console.error("Error fetching events:", error);
        return [];
      }),
      db.decisions.getAll().catch((error) => {
        console.error("Error fetching decisions:", error);
        return [];
      }),
    ]);

    return {
      notes,
      tasks,
      events,
      currentTime: new Date(),
      recentDecisions: decisions.slice(-20).map((d) => ({
        recommendationId: d.recommendationId,
        decision: d.decision,
      })),
    };
  }

  /**
   * Refreshes recommendations by cleaning expired ones and generating new ones
   *
   * @returns {Promise<number>} Number of new recommendations generated
   */
  static async refreshRecommendations(): Promise<number> {
    // Remove expired recommendations
    const all = await db.recommendations.getAll();
    const now = new Date().toISOString();
    const active = all.filter((r) => r.expiresAt > now);

    // Update expired ones
    for (const rec of all) {
      if (rec.expiresAt <= now && rec.status === "active") {
        await db.recommendations.updateStatus(rec.id, "expired");
      }
    }

    // Generate new recommendations
    const activeCount = active.filter((r) => r.status === "active").length;
    const slotsAvailable = Math.max(0, 8 - activeCount);

    if (slotsAvailable > 0) {
      const newRecs = await this.generateRecommendations(slotsAvailable);
      for (const rec of newRecs) {
        await db.recommendations.save(rec);
      }
      return newRecs.length;
    }

    return 0;
  }
}
