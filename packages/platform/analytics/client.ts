/**
 * Analytics Client
 *
 * Main orchestrator for analytics system:
 * - Manages identity providers
 * - Handles privacy mode switching
 * - Coordinates queue and transport
 * - Provides app lifecycle hooks
 *
 * Token optimization: Use INDEX.json files to find major functions/classes/relevant sections
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { AppState, AppStateStatus, Platform } from "react-native";

import {
  IdentityProvider,
  DefaultIdentityProvider,
  PrivacyIdentityProvider,
} from "./identity";
import { EventQueue } from "./queue";
import { sanitizeEvent } from "./sanitizer";
import { Transport } from "./transport";
import {
  AnalyticsEvent,
  EventName,
  EventPropsMap,
  AnalyticsConfig,
  AnalyticsMode,
} from "./types";

const DEFAULT_CONFIG: AnalyticsConfig = {
  mode: "default",
  endpoint: "/api/telemetry/events",
  enabled: true,
  maxQueueSize: 1000,
  flushInterval: 30000, // 30 seconds
  batchSize: 50,
  maxRetries: 3,
  debugMode: __DEV__,
};

const PRIVACY_MODE_KEY = "@analytics:privacy_mode";
const SESSION_START_TIME_KEY = "@analytics:session_start_time";

/**
 * AnalyticsClient
 *
 * Main client for logging analytics events with support for:
 * - Type-safe event logging
 * - Privacy mode (MODE B)
 * - Offline queueing
 * - Automatic batching and flushing
 * - App lifecycle integration
 */
export class AnalyticsClient {
  private config: AnalyticsConfig;
  private identityProvider: IdentityProvider;
  private queue: EventQueue;
  private transport: Transport;
  private flushTimer: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private isInitialized = false;
  private sessionStartTime: number | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.identityProvider = this.createIdentityProvider();
    this.queue = new EventQueue({ maxSize: this.config.maxQueueSize });
    this.transport = new Transport({
      endpoint: this.config.endpoint,
      maxRetries: this.config.maxRetries,
      enabled: this.config.enabled,
    });
  }

  /**
   * Initialize analytics client
   *
   * - Load privacy mode preference
   * - Initialize queue
   * - Start flush timer
   * - Hook into app lifecycle
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Load privacy mode preference
    const savedMode = await AsyncStorage.getItem(PRIVACY_MODE_KEY);
    if (savedMode === "privacy") {
      this.config.mode = "privacy";
      this.identityProvider = this.createIdentityProvider();
    }

    // Initialize queue
    await this.queue.initialize();

    // Start automatic flush timer
    this.startFlushTimer();

    // Hook into app lifecycle
    this.setupAppStateListener();

    this.isInitialized = true;

    if (this.config.debugMode) {
      console.log(
        "[Analytics] Client initialized in",
        this.config.mode,
        "mode",
      );
    }
  }

  /**
   * Log an event
   *
   * Type-safe event logging with automatic identity and timestamp injection
   */
  async log<T extends EventName>(
    eventName: T,
    props: EventPropsMap[T],
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get identity information
      const identity = await this.identityProvider.getIdentity();

      // Create event
      const event: AnalyticsEvent<T> = {
        event_name: eventName,
        event_id: this.generateEventId(),
        occurred_at: new Date().toISOString(),
        session_id: identity.session_id,
        props,
        app_version: Constants.expoConfig?.version || "unknown",
        platform: Platform.OS,
        locale: undefined, // Could be populated from device locale if needed
      };

      // Apply privacy mode transformations if enabled
      const processedEvent =
        this.config.mode === "privacy" ? sanitizeEvent(event) : event;

      // Enqueue event
      const enqueued = await this.queue.enqueue(processedEvent);

      if (!enqueued && this.config.debugMode) {
        console.warn(
          "[Analytics] Event dropped due to queue backpressure:",
          eventName,
        );
      }

      if (this.config.debugMode) {
        console.log("[Analytics] Event logged:", eventName, props);
      }
    } catch (error) {
      console.error("[Analytics] Failed to log event:", error);
    }
  }

  /**
   * Flush queued events
   *
   * Sends batched events to backend
   */
  async flush(): Promise<void> {
    try {
      // Remove events that have exceeded max retries
      await this.queue.removeFailedEvents(this.config.maxRetries);

      // Get batch of events
      const queuedEvents = await this.queue.dequeue(this.config.batchSize);

      if (queuedEvents.length === 0) {
        return;
      }

      // If privacy mode was enabled after events were queued, sanitize them now
      const events = queuedEvents.map((qe) => {
        if (this.config.mode === "privacy" && qe.event.occurred_at) {
          // Event was queued in default mode but now privacy mode is on
          return sanitizeEvent(qe.event);
        }
        return qe.event;
      });

      // Send batch
      const result = await this.transport.send(events, this.config.mode);

      if (result.success) {
        // Remove successfully sent events from queue
        await this.queue.remove(queuedEvents);

        if (this.config.debugMode) {
          console.log("[Analytics] Flushed", events.length, "events");
        }
      } else if (result.shouldRetry) {
        // Increment retry count for failed events
        await this.queue.incrementRetryCount(queuedEvents);

        if (this.config.debugMode) {
          console.warn("[Analytics] Flush failed, will retry:", result.error);
        }
      } else {
        // Permanent failure, remove from queue
        await this.queue.remove(queuedEvents);

        if (this.config.debugMode) {
          console.error("[Analytics] Flush failed permanently:", result.error);
        }
      }
    } catch (error) {
      console.error("[Analytics] Flush error:", error);
    }
  }

  /**
   * Enable privacy mode
   *
   * Switches to MODE B (privacy-respecting data collection)
   */
  async enablePrivacyMode(): Promise<void> {
    if (this.config.mode === "privacy") {
      return;
    }

    this.config.mode = "privacy";
    this.identityProvider = this.createIdentityProvider();

    // Persist preference
    await AsyncStorage.setItem(PRIVACY_MODE_KEY, "privacy");

    // Log the mode change
    await this.log("privacy_mode_enabled", {});

    if (this.config.debugMode) {
      console.log("[Analytics] Privacy mode enabled");
    }
  }

  /**
   * Disable privacy mode
   *
   * Switches back to MODE A (default data collection)
   */
  async disablePrivacyMode(): Promise<void> {
    if (this.config.mode === "default") {
      return;
    }

    // Log the mode change before switching
    await this.log("privacy_mode_disabled", {});

    this.config.mode = "default";
    this.identityProvider = this.createIdentityProvider();

    // Persist preference
    await AsyncStorage.setItem(PRIVACY_MODE_KEY, "default");

    if (this.config.debugMode) {
      console.log("[Analytics] Privacy mode disabled");
    }
  }

  /**
   * Check if privacy mode is enabled
   */
  isPrivacyModeEnabled(): boolean {
    return this.config.mode === "privacy";
  }

  /**
   * Get queue statistics (for debugging)
   */
  async getQueueStats(): Promise<any> {
    return this.queue.getStats();
  }

  /**
   * Clear all queued events
   */
  async clearQueue(): Promise<void> {
    await this.queue.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    // Update transport config
    this.transport.updateConfig({
      endpoint: this.config.endpoint,
      maxRetries: this.config.maxRetries,
      enabled: this.config.enabled,
    });

    // Restart flush timer if interval changed
    if (config.flushInterval) {
      this.stopFlushTimer();
      this.startFlushTimer();
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch((error) => {
        console.error("[Analytics] Auto-flush error:", error);
      });
    }, this.config.flushInterval);
  }

  /**
   * Stop automatic flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Setup app state listener for lifecycle events
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange.bind(this),
    );
  }

  /**
   * Handle app state changes
   */
  private async handleAppStateChange(
    nextAppState: AppStateStatus,
  ): Promise<void> {
    if (nextAppState === "active") {
      // App came to foreground
      await this.flush();
    } else if (nextAppState === "background" || nextAppState === "inactive") {
      // App went to background
      await this.flush();
    }
  }

  /**
   * Create identity provider based on current mode
   */
  private createIdentityProvider(): IdentityProvider {
    return this.config.mode === "privacy"
      ? new PrivacyIdentityProvider()
      : new DefaultIdentityProvider();
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Track session start
   */
  async trackSessionStart(): Promise<void> {
    this.sessionStartTime = Date.now();
    await AsyncStorage.setItem(
      SESSION_START_TIME_KEY,
      String(this.sessionStartTime),
    );
    await this.log("session_start", {
      session_id: (await this.identityProvider.getIdentity()).session_id,
    });
  }

  /**
   * Track session end
   */
  async trackSessionEnd(): Promise<void> {
    if (this.sessionStartTime) {
      const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
      const { getDurationBucket } = await import("./sanitizer");
      await this.log("session_end", {
        duration_bucket: getDurationBucket(duration),
      });
    }
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown(): Promise<void> {
    await this.trackSessionEnd();
    this.stopFlushTimer();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    await this.flush();
  }
}
