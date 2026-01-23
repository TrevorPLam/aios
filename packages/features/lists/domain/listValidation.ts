import { ListItem } from "@contracts/models/types";

export type ListDraft = {
  title: string;
  items: ListItem[];
};

export type ListValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export const LIST_VALIDATION_LIMITS = {
  maxTitleLength: 80,
  maxItemTextLength: 200,
  maxItemCount: 200,
} as const;

const EMPTY_TITLE_ERROR = "List title is required.";
const EMPTY_ITEMS_WARNING = "List has no items yet.";

const formatLimitError = (label: string, limit: number): string =>
  `${label} must be ${limit} characters or fewer.`;

const formatDuplicateError = (duplicates: string[]): string =>
  `Duplicate item names: ${duplicates.join(", ")}.`;

const formatItemCountWarning = (count: number): string =>
  `List has ${count} items. Large lists may load more slowly.`;

const normalizeItemText = (text: string): string => text.trim();

const findDuplicateItems = (items: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  items.forEach((item) => {
    const normalized = item.toLowerCase();
    if (seen.has(normalized)) {
      duplicates.add(item);
    } else {
      seen.add(normalized);
    }
  });

  return Array.from(duplicates);
};

const getNormalizedItemTexts = (items: ListItem[]): string[] =>
  items
    .map((item) => normalizeItemText(item.text))
    .filter((text) => text.length > 0);

export const validateListDraft = (draft: ListDraft): ListValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const title = draft.title.trim();
  const normalizedItems = getNormalizedItemTexts(draft.items);

  if (title.length === 0) {
    errors.push(EMPTY_TITLE_ERROR);
  }

  if (title.length > LIST_VALIDATION_LIMITS.maxTitleLength) {
    errors.push(
      formatLimitError("List title", LIST_VALIDATION_LIMITS.maxTitleLength),
    );
  }

  if (normalizedItems.length === 0) {
    warnings.push(EMPTY_ITEMS_WARNING);
  }

  if (normalizedItems.length > LIST_VALIDATION_LIMITS.maxItemCount) {
    warnings.push(formatItemCountWarning(normalizedItems.length));
  }

  const itemWithTooLongText = normalizedItems.find(
    (text) => text.length > LIST_VALIDATION_LIMITS.maxItemTextLength,
  );

  if (itemWithTooLongText) {
    errors.push(
      formatLimitError(
        "List items",
        LIST_VALIDATION_LIMITS.maxItemTextLength,
      ),
    );
  }

  const duplicates = findDuplicateItems(normalizedItems);
  if (duplicates.length > 0) {
    errors.push(formatDuplicateError(duplicates));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
