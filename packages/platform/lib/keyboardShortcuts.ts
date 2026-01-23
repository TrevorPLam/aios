/**
 * Keyboard shortcut utilities.
 *
 * Provides web-only helpers for keyboard-driven navigation.
 */

type ShortcutTarget = EventTarget & {
  tagName?: string;
  isContentEditable?: boolean;
};

const EDITABLE_TAGS = ["input", "textarea", "select"];

export function isOmnisearchShortcut(event: KeyboardEvent): boolean {
  const key = event.key.toLowerCase();
  return key === "k" && (event.metaKey || event.ctrlKey);
}

export function shouldIgnoreShortcutTarget(target: EventTarget | null): boolean {
  const element = target as ShortcutTarget | null;
  if (!element || typeof element.tagName !== "string") {
    return false;
  }

  if (element.isContentEditable) {
    return true;
  }

  const tagName = element.tagName.toLowerCase();
  return EDITABLE_TAGS.includes(tagName);
}
