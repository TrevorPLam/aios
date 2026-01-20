import {
  formatTimeForDisplay,
  formatTimeForInput,
  parseTimeInput,
} from "@/utils/timeInput";

describe("timeInput utilities", () => {
  describe("formatTimeForDisplay", () => {
    it("returns a readable time for a valid ISO string", () => {
      const result = formatTimeForDisplay("2026-01-20T08:15:00.000Z");
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it("returns an empty string for empty input", () => {
      expect(formatTimeForDisplay("")).toBe("");
    });
  });

  describe("formatTimeForInput", () => {
    it("returns HH:MM for a valid ISO string", () => {
      expect(formatTimeForInput("2026-01-20T05:09:00.000Z")).toMatch(
        /^\d{2}:\d{2}$/,
      );
    });

    it("returns an empty string for empty input", () => {
      expect(formatTimeForInput("")).toBe("");
    });
  });

  describe("parseTimeInput", () => {
    it("parses valid 24-hour input", () => {
      const referenceDate = new Date("2026-01-20T00:00:00.000Z");
      const result = parseTimeInput("14:30", referenceDate);
      expect(result.error).toBeUndefined();
      expect(result.date?.getHours()).toBe(14);
      expect(result.date?.getMinutes()).toBe(30);
    });

    it("returns an error for empty input", () => {
      const result = parseTimeInput("", new Date());
      expect(result.error).toBeDefined();
    });

    it("returns an error for invalid format", () => {
      const result = parseTimeInput("2pm", new Date());
      expect(result.error).toBeDefined();
    });

    it("returns an error for out-of-range values", () => {
      const result = parseTimeInput("25:99", new Date());
      expect(result.error).toBeDefined();
    });
  });
});
