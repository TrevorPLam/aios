/**
 * Dead Letter Queue (DLQ)
 *
 * Stores permanently failed events that exceeded max retries.
 * Enables manual recovery and analysis of failures.
 *
 * World-class standard: Snowplow, AWS Kinesis use DLQs
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnalyticsEvent } from "../types";

const DLQ_STORAGE_KEY = "@analytics:dlq";
const MAX_DLQ_SIZE = 500;

export interface DeadLetterEntry {
  event: AnalyticsEvent;
  failureReason: string;
  failedAt: number;
  retryCount: number;
  lastError?: string;
}

export class DeadLetterQueue {
  private queue: DeadLetterEntry[] = [];
  private isLoaded = false;

  /**
   * Initialize DLQ from storage
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const stored = await AsyncStorage.getItem(DLQ_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
      this.isLoaded = true;
    } catch (error) {
      console.error("[DLQ] Failed to load:", error);
      this.queue = [];
      this.isLoaded = true;
    }
  }

  /**
   * Add event to DLQ
   */
  async add(
    event: AnalyticsEvent,
    failureReason: string,
    retryCount: number,
    lastError?: string,
  ): Promise<void> {
    await this.initialize();

    const entry: DeadLetterEntry = {
      event,
      failureReason,
      failedAt: Date.now(),
      retryCount,
      lastError,
    };

    this.queue.push(entry);

    // Trim if too large (remove oldest)
    if (this.queue.length > MAX_DLQ_SIZE) {
      this.queue = this.queue.slice(-MAX_DLQ_SIZE);
      console.warn("[DLQ] Queue trimmed to max size");
    }

    await this.persist();

    if (__DEV__) {
      console.warn(
        `[DLQ] Event added: ${event.event_name} (${failureReason}), DLQ size: ${this.queue.length}`,
      );
    }
  }

  /**
   * Get all DLQ entries
   */
  async getAll(): Promise<DeadLetterEntry[]> {
    await this.initialize();
    return [...this.queue];
  }

  /**
   * Get DLQ entries by event name
   */
  async getByEventName(eventName: string): Promise<DeadLetterEntry[]> {
    await this.initialize();
    return this.queue.filter((entry) => entry.event.event_name === eventName);
  }

  /**
   * Get DLQ entries by failure reason
   */
  async getByFailureReason(reason: string): Promise<DeadLetterEntry[]> {
    await this.initialize();
    return this.queue.filter((entry) => entry.failureReason === reason);
  }

  /**
   * Retry a specific entry
   *
   * Returns the event for manual retry, removes from DLQ
   */
  async retry(index: number): Promise<AnalyticsEvent | null> {
    await this.initialize();

    if (index < 0 || index >= this.queue.length) {
      return null;
    }

    const entry = this.queue.splice(index, 1)[0];
    await this.persist();

    return entry.event;
  }

  /**
   * Retry all DLQ entries
   *
   * Returns all events for manual retry, clears DLQ
   */
  async retryAll(): Promise<AnalyticsEvent[]> {
    await this.initialize();

    const events = this.queue.map((entry) => entry.event);
    this.queue = [];
    await this.persist();

    console.log(`[DLQ] Retrying ${events.length} events`);
    return events;
  }

  /**
   * Remove specific entry
   */
  async remove(index: number): Promise<void> {
    await this.initialize();

    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
      await this.persist();
    }
  }

  /**
   * Clear entire DLQ
   */
  async clear(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(DLQ_STORAGE_KEY);
    this.isLoaded = false;
    console.log("[DLQ] Cleared");
  }

  /**
   * Get DLQ size
   */
  async size(): Promise<number> {
    await this.initialize();
    return this.queue.length;
  }

  /**
   * Get DLQ statistics
   */
  async getStats(): Promise<{
    size: number;
    oldestEntry: number | null;
    newestEntry: number | null;
    failureReasons: Record<string, number>;
    eventNameCounts: Record<string, number>;
  }> {
    await this.initialize();

    const failureReasons: Record<string, number> = {};
    const eventNameCounts: Record<string, number> = {};
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    for (const entry of this.queue) {
      // Count failure reasons
      failureReasons[entry.failureReason] =
        (failureReasons[entry.failureReason] || 0) + 1;

      // Count event names
      eventNameCounts[entry.event.event_name] =
        (eventNameCounts[entry.event.event_name] || 0) + 1;

      // Track oldest/newest
      if (oldestEntry === null || entry.failedAt < oldestEntry) {
        oldestEntry = entry.failedAt;
      }
      if (newestEntry === null || entry.failedAt > newestEntry) {
        newestEntry = entry.failedAt;
      }
    }

    return {
      size: this.queue.length,
      oldestEntry,
      newestEntry,
      failureReasons,
      eventNameCounts,
    };
  }

  /**
   * Persist DLQ to storage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(DLQ_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("[DLQ] Failed to persist:", error);
    }
  }
}
