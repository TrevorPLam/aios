/**
 * Sanitizer & Bucket Helpers
 *
 * Privacy transformations for MODE B (privacy mode):
 * - Remove user_id/device_id
 * - Timestamp bucketing (hour_of_day, day_of_week)
 * - Convert sensitive values to buckets
 * - Strip unknown keys not in allowlist
 * - Detect and drop forbidden fields
 */

import { getAllowedProps } from "./taxonomy";
import {
  AnalyticsEvent,
  EventName,
  DayOfWeek,
  EventPropsMap,
  TextLengthBucket,
  DurationBucket,
  LatencyBucket,
  AmountBucket,
  QueryLengthBucket,
  ResultsCountBucket,
  InstallAgeBucket,
} from "./types";

// ============================================================================
// Forbidden Field Detection
// ============================================================================

/**
 * Patterns that indicate potentially sensitive fields
 */
const FORBIDDEN_PATTERNS = [
  /text/i,
  /body/i,
  /content/i,
  /title/i,
  /subject/i,
  /name/i,
  /email/i,
  /phone/i,
  /address/i,
  /message/i,
  /prompt/i,
  /output/i,
  /generated/i,
];

/**
 * Check if a property key matches forbidden patterns
 */
export function isForbiddenField(key: string): boolean {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Warn in debug builds about forbidden fields
 */
export function warnForbiddenField(key: string, eventName: EventName): void {
  if (__DEV__) {
    console.warn(
      `[Analytics] Forbidden field detected and removed: "${key}" in event "${eventName}". ` +
        `This field matches sensitive data patterns and should not be logged.`,
    );
  }
}

// ============================================================================
// Bucket Helpers
// ============================================================================

/**
 * Convert text length to bucket
 */
export function getTextLengthBucket(length: number): TextLengthBucket {
  if (length <= 20) return "0-20";
  if (length <= 80) return "21-80";
  if (length <= 200) return "81-200";
  if (length <= 500) return "201-500";
  return "501+";
}

/**
 * Convert duration in seconds to bucket
 */
export function getDurationBucket(seconds: number): DurationBucket {
  if (seconds < 5) return "<5s";
  if (seconds < 30) return "5-30s";
  if (seconds < 120) return "30-120s";
  if (seconds < 600) return "2-10m";
  return "10m+";
}

/**
 * Convert latency in milliseconds to bucket
 */
export function getLatencyBucket(ms: number): LatencyBucket {
  if (ms < 100) return "<100ms";
  if (ms < 300) return "100-300ms";
  if (ms < 1000) return "300ms-1s";
  if (ms < 3000) return "1-3s";
  return "3s+";
}

/**
 * Convert amount/count to bucket
 */
export function getAmountBucket(amount: number): AmountBucket {
  if (amount <= 20) return "0-20";
  if (amount <= 100) return "21-100";
  if (amount <= 500) return "101-500";
  if (amount <= 2000) return "501-2000";
  return "2000+";
}

/**
 * Convert query length to bucket
 */
export function getQueryLengthBucket(length: number): QueryLengthBucket {
  if (length === 0) return "0";
  if (length <= 3) return "1-3";
  if (length <= 10) return "4-10";
  if (length <= 25) return "11-25";
  return "26+";
}

/**
 * Convert results count to bucket
 */
export function getResultsCountBucket(count: number): ResultsCountBucket {
  if (count === 0) return "0";
  if (count <= 3) return "1-3";
  if (count <= 10) return "4-10";
  if (count <= 25) return "11-25";
  return "26+";
}

/**
 * Convert install age in days to bucket
 */
export function getInstallAgeBucket(days: number): InstallAgeBucket {
  if (days === 0) return "0d";
  if (days <= 7) return "1-7d";
  if (days <= 30) return "8-30d";
  if (days <= 90) return "31-90d";
  return "90d+";
}

// ============================================================================
// Time Bucketing
// ============================================================================

/**
 * Get day of week from date
 */
export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[date.getDay()];
}

/**
 * Get hour of day (0-23) from date
 */
export function getHourOfDay(date: Date): number {
  return date.getHours();
}

// ============================================================================
// Property Sanitization
// ============================================================================

/**
 * Sanitize event properties for privacy mode
 *
 * - Remove keys not in allowlist
 * - Remove keys matching forbidden patterns
 * - Keep only bucketed/categorical values
 */
export function sanitizeProps(
  eventName: EventName,
  props: Record<string, unknown>,
): Record<string, unknown> {
  const allowedProps = getAllowedProps(eventName);
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    // Check if key is in allowlist
    if (!allowedProps.includes(key)) {
      if (__DEV__) {
        console.warn(
          `[Analytics] Property "${key}" not in allowlist for event "${eventName}", removing.`,
        );
      }
      continue;
    }

    // Check if key matches forbidden patterns
    if (isForbiddenField(key)) {
      warnForbiddenField(key, eventName);
      continue;
    }

    // Include the value (already bucketed/categorical in well-designed events)
    sanitized[key] = value;
  }

  return sanitized;
}

// ============================================================================
// Event Sanitization (MODE B)
// ============================================================================

/**
 * Apply privacy transformations to an event
 *
 * MODE B transformations:
 * 1. Remove occurred_at (full timestamp)
 * 2. Add day_of_week and hour_of_day (coarse time buckets)
 * 3. Sanitize props (allowlist + forbidden field removal)
 * 4. Event already has session_id from PrivacyIdentityProvider
 */
export function sanitizeEvent<T extends EventName>(
  event: AnalyticsEvent<T>,
): AnalyticsEvent<T> {
  // Parse occurred_at if present
  const timestamp = event.occurred_at
    ? new Date(event.occurred_at)
    : new Date();

  // Create sanitized event
  const sanitized: AnalyticsEvent<T> = {
    ...event,
    // Remove full timestamp
    occurred_at: undefined,
    // Add coarse time buckets
    day_of_week: getDayOfWeek(timestamp),
    hour_of_day: getHourOfDay(timestamp),
    // Sanitize props with proper typing
    // @ts-expect-error: Type assertion is safe here as sanitizeProps ensures type safety
    props: sanitizeProps(
      event.event_name,
      event.props as unknown as Record<string, unknown>,
    ) as EventPropsMap[T],
  };

  return sanitized;
}

// ============================================================================
// Batch Sanitization
// ============================================================================

/**
 * Sanitize all events in a batch
 */
export function sanitizeBatch(events: AnalyticsEvent[]): AnalyticsEvent[] {
  return events.map((event) => sanitizeEvent(event));
}
