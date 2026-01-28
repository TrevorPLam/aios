import {
  LIST_VALIDATION_LIMITS,
  validateListDraft,
} from "@aios/features/lists/domain/listValidation";

const createItem = (text: string) => ({
  id: "item-1",
  text,
  isChecked: false,
  priority: "none" as const,
});

describe("listValidation", () => {
  test("test_valid_list_has_no_errors_or_warnings", () => {
    const result = validateListDraft({
      title: "Weekly Errands",
      items: [createItem("Buy coffee beans")],
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  test("test_empty_title_returns_error", () => {
    const result = validateListDraft({
      title: "   ",
      items: [createItem("Pay rent")],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining(["List title is required."]),
    );
  });

  test("test_empty_items_returns_warning", () => {
    const result = validateListDraft({
      title: "Fresh Start",
      items: [],
    });

    expect(result.isValid).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining(["List has no items yet."]),
    );
  });

  test("test_duplicate_and_large_inputs_return_errors_and_warnings", () => {
    const longTitle = "A".repeat(LIST_VALIDATION_LIMITS.maxTitleLength + 1);
    const longItem = "B".repeat(LIST_VALIDATION_LIMITS.maxItemTextLength + 1);
    const largeItemCount = LIST_VALIDATION_LIMITS.maxItemCount + 1;
    const items = Array.from({ length: largeItemCount }, () =>
      createItem("Duplicate"),
    );
    items[0] = createItem(longItem);

    const result = validateListDraft({
      title: longTitle,
      items,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
