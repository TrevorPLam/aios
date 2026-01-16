/**
 * Plugin / Middleware System
 *
 * Extensible plugin architecture for event processing.
 * Allows custom logic at different stages of pipeline.
 *
 * TODO: Implement plugin system similar to Segment/Rudderstack
 * - Before/after event logging
 * - Before/after sanitization
 * - Before/after queuing
 * - Before/after transport
 * - Plugin registration and lifecycle
 */

import { AnalyticsEvent } from "../types";

export interface Plugin {
  name: string;
  version: string;
  enabled: boolean;

  // Lifecycle hooks
  onBeforeLog?: (event: AnalyticsEvent) => AnalyticsEvent | null;
  onAfterLog?: (event: AnalyticsEvent) => void;
  onBeforeQueue?: (event: AnalyticsEvent) => AnalyticsEvent | null;
  onBeforeSend?: (events: AnalyticsEvent[]) => AnalyticsEvent[];
  onAfterSend?: (events: AnalyticsEvent[], success: boolean) => void;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  /**
   * TODO: Register a plugin
   */
  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
    console.log(`[Plugins] Registered: ${plugin.name} v${plugin.version}`);
  }

  /**
   * TODO: Unregister a plugin
   */
  unregister(pluginName: string): void {
    this.plugins.delete(pluginName);
  }

  /**
   * TODO: Run onBeforeLog hooks
   */
  async runBeforeLog(event: AnalyticsEvent): Promise<AnalyticsEvent | null> {
    let processedEvent: AnalyticsEvent | null = event;

    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && plugin.onBeforeLog) {
        processedEvent = plugin.onBeforeLog(processedEvent!);
        if (processedEvent === null) {
          console.log(`[Plugins] Event blocked by ${plugin.name}`);
          return null;
        }
      }
    }

    return processedEvent;
  }

  /**
   * TODO: List all registered plugins
   */
  listPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}

/**
 * Example Plugin:
 *
 * const enrichmentPlugin: Plugin = {
 *   name: "user-enrichment",
 *   version: "1.0.0",
 *   enabled: true,
 *   onBeforeLog: (event) => {
 *     // Add extra context
 *     return {
 *       ...event,
 *       props: {
 *         ...event.props,
 *         userAgent: navigator.userAgent
 *       }
 *     };
 *   }
 * };
 */
