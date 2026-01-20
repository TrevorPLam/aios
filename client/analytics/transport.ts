/**
 * Transport Layer
 *
 * Handles batched POST to backend endpoint with:
 * - Exponential backoff
 * - Jitter
 * - Retry limits
 * - Network error handling
 */

import { AnalyticsEvent, BatchPayload, AnalyticsMode } from "./types";

const DEFAULT_ENDPOINT = "/api/telemetry/events";
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

export interface TransportConfig {
  endpoint: string;
  maxRetries: number;
  enabled: boolean;
}

export interface TransportResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  shouldRetry: boolean;
}

/**
 * Calculate exponential backoff with jitter
 */
function calculateBackoff(attempt: number): number {
  const exponentialBackoff = Math.min(
    BASE_BACKOFF_MS * Math.pow(2, attempt),
    MAX_BACKOFF_MS,
  );
  // Add jitter: random value between 0 and exponentialBackoff
  const jitter = Math.random() * exponentialBackoff;
  return exponentialBackoff + jitter;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Transport class for sending analytics events
 */
export class Transport {
  private config: TransportConfig;

  constructor(config: Partial<TransportConfig> = {}) {
    this.config = {
      endpoint: config.endpoint || DEFAULT_ENDPOINT,
      maxRetries: config.maxRetries || MAX_RETRIES,
      enabled: config.enabled !== undefined ? config.enabled : true,
    };
  }

  /**
   * Send a batch of events
   *
   * Implements retry logic with exponential backoff and jitter
   */
  async send(
    events: AnalyticsEvent[],
    mode: AnalyticsMode,
    schemaVersion: string = "1.0.0",
  ): Promise<TransportResult> {
    // If transport is disabled (e.g., in dev), skip sending
    if (!this.config.enabled) {
      if (__DEV__) {
        console.debug(
          "[Analytics] Transport disabled, events not sent:",
          events.length,
        );
      }
      return { success: true, shouldRetry: false };
    }

    // Build batch payload
    const payload: BatchPayload = {
      schema_version: schemaVersion,
      mode,
      events,
    };

    // Attempt to send with retries
    let lastError: string | undefined;
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const result = await this.sendRequest(payload);

        if (result.success) {
          return result;
        }

        // If not successful and shouldn't retry, return immediately
        if (!result.shouldRetry) {
          return result;
        }

        lastError = result.error;

        // Wait before retrying (except on last attempt)
        if (attempt < this.config.maxRetries - 1) {
          const backoffMs = calculateBackoff(attempt);
          if (__DEV__) {
            console.log(
              `[Analytics] Retry attempt ${attempt + 1}/${this.config.maxRetries} after ${Math.round(backoffMs)}ms`,
            );
          }
          await sleep(backoffMs);
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);

        // Wait before retrying (except on last attempt)
        if (attempt < this.config.maxRetries - 1) {
          const backoffMs = calculateBackoff(attempt);
          await sleep(backoffMs);
        }
      }
    }

    // All retries exhausted
    return {
      success: false,
      error: lastError || "All retry attempts failed",
      shouldRetry: false,
    };
  }

  /**
   * Send a single HTTP request
   */
  private async sendRequest(payload: BatchPayload): Promise<TransportResult> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle different status codes
      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          shouldRetry: false,
        };
      }

      // Client errors (4xx) - don't retry
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          statusCode: response.status,
          error: `Client error: ${response.status}`,
          shouldRetry: false,
        };
      }

      // Server errors (5xx) - retry
      if (response.status >= 500) {
        return {
          success: false,
          statusCode: response.status,
          error: `Server error: ${response.status}`,
          shouldRetry: true,
        };
      }

      // Other errors - retry
      return {
        success: false,
        statusCode: response.status,
        error: `Unexpected status: ${response.status}`,
        shouldRetry: true,
      };
    } catch (error) {
      // Network errors - retry
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        shouldRetry: true,
      };
    }
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<TransportConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current config
   */
  getConfig(): TransportConfig {
    return { ...this.config };
  }
}
