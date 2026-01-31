/**
 * Event Deduplication
 *
 * Prevents duplicate events from being sent to the backend.
 * Uses event_id + user_id/session_id + timestamp window for deduplication.
 *
 * World-class standard: Amplitude, Mixpanel use similar strategies
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { AnalyticsEvent } from "../types";

const DEDUP_CACHE_KEY = "@analytics:dedup_cache";
const DEDUP_WINDOW_MS = 60000; // 1 minute window
const MAX_CACHE_SIZE = 1000;

interface DedupEntry {
  eventId: string;
  identityKey: string; // user_id or session_id
  timestamp: number;
  eventName: string;
}

export class EventDeduplicator {
  private cache: DedupEntry[] = [];
  private isLoaded = false;

  /**
   * Initialize deduplication cache from storage
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const stored = await AsyncStorage.getItem(DEDUP_CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
        // Clean expired entries
        this.cleanExpiredEntries();
      }
      this.isLoaded = true;
    } catch (error) {
      console.error("[Deduplicator] Failed to load cache:", error);
      this.cache = [];
      this.isLoaded = true;
    }
  }

  /**
   * Check if event is a duplicate
   *
   * Returns true if event should be dropped (is duplicate)
   */
  async isDuplicate(event: AnalyticsEvent): Promise<boolean> {
    await this.initialize();

    const identityKey = this.getIdentityKey(event);
    const now = Date.now();

    // Check if event exists in cache within time window
    const exists = this.cache.some(
      (entry) =>
        entry.eventId === event.event_id &&
        entry.identityKey === identityKey &&
        entry.eventName === event.event_name &&
        now - entry.timestamp < DEDUP_WINDOW_MS,
    );

    if (exists) {
      if (__DEV__) {
        console.warn(
          "[Deduplicator] Duplicate event dropped:",
          event.event_name,
          event.event_id,
        );
      }
      return true;
    }

    // Add to cache
    await this.addToCache(event, identityKey);
    return false;
  }

  /**
   * Add event to deduplication cache
   */
  private async addToCache(
    event: AnalyticsEvent,
    identityKey: string,
  ): Promise<void> {
    const entry: DedupEntry = {
      eventId: event.event_id,
      identityKey,
      timestamp: Date.now(),
      eventName: event.event_name,
    };

    this.cache.push(entry);

    // Trim cache if too large
    if (this.cache.length > MAX_CACHE_SIZE) {
      this.cache = this.cache.slice(-MAX_CACHE_SIZE);
    }

    // Clean expired entries periodically
    if (Math.random() < 0.1) {
      // 10% chance on each add
      this.cleanExpiredEntries();
    }

    await this.persist();
  }

  /**
   * Get identity key for deduplication
   */
  private getIdentityKey(event: AnalyticsEvent): string {
    // In default mode, use user_id if available, otherwise session_id
    // In privacy mode, always use session_id
    return event.session_id; // Always use session_id for consistent deduplication
  }

  /**
   * Remove expired entries from cache
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    const originalSize = this.cache.length;
    this.cache = this.cache.filter(
      (entry) => now - entry.timestamp < DEDUP_WINDOW_MS,
    );

    if (__DEV__ && this.cache.length < originalSize) {
      console.log(
        `[Deduplicator] Cleaned ${originalSize - this.cache.length} expired entries`,
      );
    }
  }

  /**
   * Persist cache to storage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(DEDUP_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error("[Deduplicator] Failed to persist cache:", error);
    }
  }

  /**
   * Clear all cache (for testing or reset)
   */
  async clear(): Promise<void> {
    this.cache = [];
    await AsyncStorage.removeItem(DEDUP_CACHE_KEY);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; oldestEntry: number | null } {
    return {
      size: this.cache.length,
      oldestEntry: this.cache.length > 0 ? this.cache[0].timestamp : null,
    };
  }
}
