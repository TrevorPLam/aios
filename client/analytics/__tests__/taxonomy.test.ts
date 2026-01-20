/**
 * Taxonomy Tests
 *
 * Tests to ensure event taxonomy is properly defined and enforced
 */

import {
  EVENT_TAXONOMY,
  getAllowedProps,
  getRequiredProps,
  isAllowedProp,
} from "../taxonomy";
import { EventName } from "../types";

describe("Taxonomy", () => {
  describe("EVENT_TAXONOMY", () => {
    it("should have definitions for all event names", () => {
      const eventNames: EventName[] = [
        "app_opened",
        "session_start",
        "session_end",
        "onboarding_started",
        "onboarding_completed",
        "app_backgrounded",
        "module_opened",
        "module_closed",
        "module_switch",
        "module_search",
        "module_pinned",
        "module_unpinned",
        "module_reordered",
        "module_focus_start",
        "module_focus_end",
        "item_created",
        "item_viewed",
        "item_updated",
        "item_deleted",
        "item_completed",
        "ai_opened",
        "ai_suggestion_generated",
        "ai_suggestion_applied",
        "ai_suggestion_rejected",
        "ai_edit_before_apply",
        "ai_auto_action",
        "screen_render_time",
        "api_latency",
        "crash_reported",
        "error_boundary_hit",
        "theme_changed",
        "accent_color_changed",
        "privacy_mode_enabled",
        "privacy_mode_disabled",
      ];

      for (const eventName of eventNames) {
        expect(EVENT_TAXONOMY[eventName]).toBeDefined();
        expect(EVENT_TAXONOMY[eventName].name).toBe(eventName);
        expect(EVENT_TAXONOMY[eventName].description).toBeTruthy();
        expect(Array.isArray(EVENT_TAXONOMY[eventName].requiredProps)).toBe(
          true,
        );
        expect(Array.isArray(EVENT_TAXONOMY[eventName].optionalProps)).toBe(
          true,
        );
      }
    });

    it("should have correct required props for key events", () => {
      expect(EVENT_TAXONOMY.app_opened.requiredProps).toContain(
        "install_age_bucket",
      );
      expect(EVENT_TAXONOMY.app_opened.requiredProps).toContain(
        "network_state",
      );

      expect(EVENT_TAXONOMY.module_opened.requiredProps).toContain("module_id");
      expect(EVENT_TAXONOMY.module_opened.requiredProps).toContain("source");

      expect(EVENT_TAXONOMY.item_created.requiredProps).toContain("module_id");
      expect(EVENT_TAXONOMY.item_created.requiredProps).toContain("item_type");

      expect(EVENT_TAXONOMY.ai_opened.requiredProps).toContain("source_module");
      expect(EVENT_TAXONOMY.ai_opened.requiredProps).toContain(
        "selection_state",
      );
    });
  });

  describe("getAllowedProps", () => {
    it("should return combined required and optional props", () => {
      const allowedProps = getAllowedProps("module_opened");
      expect(allowedProps).toContain("module_id");
      expect(allowedProps).toContain("source");
    });

    it("should return empty array for events with no props", () => {
      const allowedProps = getAllowedProps("privacy_mode_enabled");
      expect(allowedProps).toEqual([]);
    });
  });

  describe("getRequiredProps", () => {
    it("should return only required props", () => {
      const requiredProps = getRequiredProps("module_opened");
      expect(requiredProps).toContain("module_id");
      expect(requiredProps).toContain("source");
      expect(requiredProps.length).toBe(2);
    });
  });

  describe("isAllowedProp", () => {
    it("should return true for allowed props", () => {
      expect(isAllowedProp("module_opened", "module_id")).toBe(true);
      expect(isAllowedProp("module_opened", "source")).toBe(true);
    });

    it("should return false for disallowed props", () => {
      expect(isAllowedProp("module_opened", "unknown_prop")).toBe(false);
      expect(isAllowedProp("module_opened", "random_field")).toBe(false);
    });
  });

  describe("No forbidden fields in taxonomy", () => {
    it("should not have any forbidden field patterns in event props", () => {
      const forbiddenPatterns = [
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
      ];

      for (const eventName of Object.keys(EVENT_TAXONOMY) as EventName[]) {
        const definition = EVENT_TAXONOMY[eventName];
        const allProps = [
          ...definition.requiredProps,
          ...definition.optionalProps,
        ];

        for (const prop of allProps) {
          const hasForbiddenPattern = forbiddenPatterns.some((pattern) =>
            pattern.test(prop),
          );

          if (hasForbiddenPattern) {
            throw new Error(
              `Event "${eventName}" has forbidden field pattern in prop "${prop}". ` +
                `This could lead to sensitive data being logged.`,
            );
          }
        }
      }
    });
  });
});
