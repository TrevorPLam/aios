/**
 * Event Queue
 *
 * Persistent event queue using AsyncStorage with:
 * - Max size limits
 * - Compaction when full
 * - Backpressure handling
 * - Offline support
 *
 * Token optimization: Use `glob_file_search` for file finding instead of broad searches
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { AnalyticsEvent, QueuedEvent } from "./types";

const QUEUE_STORAGE_KEY = "@analytics:event_queue";
const DEFAULT_MAX_QUEUE_SIZE = 1000;
const COMPACTION_THRESHOLD = 0.9; // Compact when 90% full

export interface QueueConfig {
  maxSize: number;
}

export class EventQueue {
  private config: QueueConfig;
  private queue: QueuedEvent[] = [];
  private isLoaded = false;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || DEFAULT_MAX_QUEUE_SIZE,
    };
  }

  /**
   * Initialize queue by loading from storage
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      } else {
        this.queue = [];
      }
      this.isLoaded = true;
    } catch (error) {
      console.error("[Analytics] Failed to load queue from storage:", error);
      this.queue = [];
      this.isLoaded = true;
    }
  }

  /**
   * Enqueue an event
   *
   * Returns false if queue is full and backpressure should be applied
   */
  async enqueue(event: AnalyticsEvent): Promise<boolean> {
    await this.initialize();

    // Check if queue is at capacity
    if (this.queue.length >= this.config.maxSize) {
      if (__DEV__) {
        console.warn(
          "[Analytics] Queue is full, event dropped:",
          event.event_name,
        );
      }
      return false;
    }

    // Check if compaction is needed
    if (this.queue.length >= this.config.maxSize * COMPACTION_THRESHOLD) {
      await this.compact();
    }

    // Add event to queue
    const queuedEvent: QueuedEvent = {
      event,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedEvent);
    await this.persist();

    return true;
  }

  /**
   * Dequeue a batch of events
   */
  async dequeue(batchSize: number): Promise<QueuedEvent[]> {
    await this.initialize();

    const batch = this.queue.slice(0, batchSize);
    return batch;
  }

  /**
   * Remove events from queue (after successful send)
   */
  async remove(events: QueuedEvent[]): Promise<void> {
    await this.initialize();

    const eventIds = new Set(events.map((e) => e.event.event_id));
    this.queue = this.queue.filter((e) => !eventIds.has(e.event.event_id));

    await this.persist();
  }

  /**
   * Increment retry count for events (after failed send)
   */
  async incrementRetryCount(events: QueuedEvent[]): Promise<void> {
    await this.initialize();

    const eventIds = new Set(events.map((e) => e.event.event_id));
    this.queue = this.queue.map((e) => {
      if (eventIds.has(e.event.event_id)) {
        return { ...e, retryCount: e.retryCount + 1 };
      }
      return e;
    });

    await this.persist();
  }

  /**
   * Remove events that have exceeded max retry count
   */
  async removeFailedEvents(maxRetries: number): Promise<number> {
    await this.initialize();

    const originalLength = this.queue.length;
    this.queue = this.queue.filter((e) => e.retryCount < maxRetries);
    const removedCount = originalLength - this.queue.length;

    if (removedCount > 0) {
      await this.persist();
      if (__DEV__) {
        console.warn(
          `[Analytics] Removed ${removedCount} events that exceeded max retries`,
        );
      }
    }

    return removedCount;
  }

  /**
   * Get queue size
   */
  async size(): Promise<number> {
    await this.initialize();
    return this.queue.length;
  }

  /**
   * Clear entire queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.persist();
  }

  /**
   * Compact queue by removing oldest events when approaching capacity
   *
   * Removes 20% of oldest events to make room for new ones
   */
  private async compact(): Promise<void> {
    const removeCount = Math.floor(this.queue.length * 0.2);
    if (removeCount > 0) {
      this.queue = this.queue.slice(removeCount);
      if (__DEV__) {
        console.warn(
          `[Analytics] Compacted queue, removed ${removeCount} oldest events`,
        );
      }
    }
  }

  /**
   * Persist queue to AsyncStorage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("[Analytics] Failed to persist queue:", error);
    }
  }

  /**
   * Sanitize queued events (for privacy mode switch)
   *
   * This is used when privacy mode is enabled after events were queued
   * in default mode. Events are sanitized before being flushed.
   */
  async sanitizeQueuedEvents(
    sanitizer: (event: AnalyticsEvent) => AnalyticsEvent,
  ): Promise<void> {
    await this.initialize();

    this.queue = this.queue.map((queuedEvent) => ({
      ...queuedEvent,
      event: sanitizer(queuedEvent.event),
    }));

    await this.persist();
  }

  /**
   * Get queue stats for debugging
   */
  async getStats(): Promise<{
    size: number;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
    retryDistribution: Record<number, number>;
  }> {
    await this.initialize();

    const retryDistribution: Record<number, number> = {};
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;

    for (const event of this.queue) {
      // Track retry distribution
      retryDistribution[event.retryCount] =
        (retryDistribution[event.retryCount] || 0) + 1;

      // Track oldest/newest
      if (oldestTimestamp === null || event.timestamp < oldestTimestamp) {
        oldestTimestamp = event.timestamp;
      }
      if (newestTimestamp === null || event.timestamp > newestTimestamp) {
        newestTimestamp = event.timestamp;
      }
    }

    return {
      size: this.queue.length,
      oldestTimestamp,
      newestTimestamp,
      retryDistribution,
    };
  }
}
