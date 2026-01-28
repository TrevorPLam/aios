import {
  isOmnisearchShortcut,
  shouldIgnoreShortcutTarget,
} from "@aios/platform/lib/keyboardShortcuts";

describe("keyboardShortcuts", () => {
  describe("isOmnisearchShortcut", () => {
    it("returns true for Cmd+K", () => {
      const event = {
        key: "k",
        metaKey: true,
        ctrlKey: false,
      } as KeyboardEvent;

      expect(isOmnisearchShortcut(event)).toBe(true);
    });

    it("returns true for Ctrl+K", () => {
      const event = {
        key: "K",
        metaKey: false,
        ctrlKey: true,
      } as KeyboardEvent;

      expect(isOmnisearchShortcut(event)).toBe(true);
    });

    it("returns false for other keys", () => {
      const event = {
        key: "l",
        metaKey: true,
        ctrlKey: false,
      } as KeyboardEvent;

      expect(isOmnisearchShortcut(event)).toBe(false);
    });

    it("returns false without modifier keys", () => {
      const event = {
        key: "k",
        metaKey: false,
        ctrlKey: false,
      } as KeyboardEvent;

      expect(isOmnisearchShortcut(event)).toBe(false);
    });
  });

  describe("shouldIgnoreShortcutTarget", () => {
    it("returns false for null targets", () => {
      expect(shouldIgnoreShortcutTarget(null)).toBe(false);
    });

    it("returns false when target lacks tagName", () => {
      expect(shouldIgnoreShortcutTarget({} as EventTarget)).toBe(false);
    });

    it("returns true for editable form controls", () => {
      const inputTarget = { tagName: "INPUT" } as EventTarget;
      const textareaTarget = { tagName: "textarea" } as EventTarget;
      const selectTarget = { tagName: "select" } as EventTarget;

      expect(shouldIgnoreShortcutTarget(inputTarget)).toBe(true);
      expect(shouldIgnoreShortcutTarget(textareaTarget)).toBe(true);
      expect(shouldIgnoreShortcutTarget(selectTarget)).toBe(true);
    });

    it("returns true for content editable elements", () => {
      const editableTarget = {
        tagName: "div",
        isContentEditable: true,
      } as EventTarget;

      expect(shouldIgnoreShortcutTarget(editableTarget)).toBe(true);
    });

    it("returns false for non-editable elements", () => {
      const target = { tagName: "button" } as EventTarget;

      expect(shouldIgnoreShortcutTarget(target)).toBe(false);
    });
  });
});
