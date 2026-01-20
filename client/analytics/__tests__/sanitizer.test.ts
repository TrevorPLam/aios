/**
 * Sanitizer Tests
 *
 * Tests for privacy transformations and forbidden field detection
 */

import {
  sanitizeEvent,
  sanitizeProps,
  isForbiddenField,
  getDayOfWeek,
  getHourOfDay,
} from "../sanitizer";
import { AnalyticsEvent } from "../types";

describe("Sanitizer", () => {
  describe("isForbiddenField", () => {
    it("should detect forbidden field patterns", () => {
      // Text/content patterns
      expect(isForbiddenField("text")).toBe(true);
      expect(isForbiddenField("body")).toBe(true);
      expect(isForbiddenField("content")).toBe(true);
      expect(isForbiddenField("title")).toBe(true);
      expect(isForbiddenField("subject")).toBe(true);
      expect(isForbiddenField("message")).toBe(true);
      expect(isForbiddenField("prompt")).toBe(true);
      expect(isForbiddenField("output")).toBe(true);
      expect(isForbiddenField("generated")).toBe(true);

      // PII patterns
      expect(isForbiddenField("name")).toBe(true);
      expect(isForbiddenField("email")).toBe(true);
      expect(isForbiddenField("phone")).toBe(true);
      expect(isForbiddenField("address")).toBe(true);

      // Case insensitive
      expect(isForbiddenField("USER_NAME")).toBe(true);
      expect(isForbiddenField("emailAddress")).toBe(true);
      expect(isForbiddenField("messageText")).toBe(true);

      // Safe fields
      expect(isForbiddenField("module_id")).toBe(false);
      expect(isForbiddenField("duration_bucket")).toBe(false);
      expect(isForbiddenField("confidence_bucket")).toBe(false);
      expect(isForbiddenField("item_type")).toBe(false);
    });
  });

  describe("sanitizeProps", () => {
    it("should remove props not in allowlist", () => {
      const props = {
        module_id: "notebook",
        item_type: "note",
        unknown_prop: "value",
      };

      const sanitized = sanitizeProps("item_created", props);

      expect(sanitized).toHaveProperty("module_id");
      expect(sanitized).toHaveProperty("item_type");
      expect(sanitized).not.toHaveProperty("unknown_prop");
    });

    it("should remove forbidden fields", () => {
      const props = {
        module_id: "notebook",
        item_type: "note",
        title: "Secret note title", // Forbidden
        content: "Secret content", // Forbidden
      };

      const sanitized = sanitizeProps("item_created", props);

      expect(sanitized).toHaveProperty("module_id");
      expect(sanitized).toHaveProperty("item_type");
      expect(sanitized).not.toHaveProperty("title");
      expect(sanitized).not.toHaveProperty("content");
    });

    it("should keep only allowed props", () => {
      const props = {
        module_id: "planner",
        source: "dock",
        extra_field: "should be removed",
      };

      const sanitized = sanitizeProps("module_opened", props);

      expect(sanitized).toEqual({
        module_id: "planner",
        source: "dock",
      });
    });
  });

  describe("sanitizeEvent", () => {
    it("should remove occurred_at in privacy mode", () => {
      const event: AnalyticsEvent<"item_created"> = {
        event_name: "item_created",
        event_id: "test_123",
        occurred_at: "2026-01-16T12:30:45.123Z",
        session_id: "session_123",
        props: {
          module_id: "notebook",
          item_type: "note",
        },
        app_version: "1.0.0",
        platform: "ios",
      };

      const sanitized = sanitizeEvent(event);

      expect(sanitized.occurred_at).toBeUndefined();
      expect(sanitized.day_of_week).toBeDefined();
      expect(sanitized.hour_of_day).toBeDefined();
    });

    it("should add coarse time buckets", () => {
      const event: AnalyticsEvent<"item_created"> = {
        event_name: "item_created",
        event_id: "test_123",
        occurred_at: "2026-01-16T12:30:45.123Z", // Thursday
        session_id: "session_123",
        props: {
          module_id: "notebook",
          item_type: "note",
        },
        app_version: "1.0.0",
        platform: "ios",
      };

      const sanitized = sanitizeEvent(event);

      expect(sanitized.day_of_week).toBe("friday"); // 2026-01-16 is Friday
      expect(sanitized.hour_of_day).toBe(12);
    });

    it("should sanitize props in the event", () => {
      const event: AnalyticsEvent<"item_created"> = {
        event_name: "item_created",
        event_id: "test_123",
        occurred_at: "2026-01-16T12:30:45.123Z",
        session_id: "session_123",
        props: {
          module_id: "notebook",
          item_type: "note",
          // @ts-expect-error Testing forbidden field
          title: "Should be removed",
        },
        app_version: "1.0.0",
        platform: "ios",
      };

      const sanitized = sanitizeEvent(event);

      expect(sanitized.props).toHaveProperty("module_id");
      expect(sanitized.props).toHaveProperty("item_type");
      expect(sanitized.props).not.toHaveProperty("title");
    });
  });

  describe("getDayOfWeek", () => {
    it("should return correct day of week", () => {
      expect(getDayOfWeek(new Date("2026-01-11T00:00:00Z"))).toBe("sunday");
      expect(getDayOfWeek(new Date("2026-01-12T00:00:00Z"))).toBe("monday");
      expect(getDayOfWeek(new Date("2026-01-13T00:00:00Z"))).toBe("tuesday");
      expect(getDayOfWeek(new Date("2026-01-14T00:00:00Z"))).toBe("wednesday");
      expect(getDayOfWeek(new Date("2026-01-15T00:00:00Z"))).toBe("thursday");
      expect(getDayOfWeek(new Date("2026-01-16T00:00:00Z"))).toBe("friday");
      expect(getDayOfWeek(new Date("2026-01-17T00:00:00Z"))).toBe("saturday");
    });
  });

  describe("getHourOfDay", () => {
    it("should return correct hour of day", () => {
      expect(getHourOfDay(new Date("2026-01-16T00:00:00Z"))).toBe(0);
      expect(getHourOfDay(new Date("2026-01-16T06:30:00Z"))).toBe(6);
      expect(getHourOfDay(new Date("2026-01-16T12:45:00Z"))).toBe(12);
      expect(getHourOfDay(new Date("2026-01-16T18:15:00Z"))).toBe(18);
      expect(getHourOfDay(new Date("2026-01-16T23:59:59Z"))).toBe(23);
    });
  });
});
