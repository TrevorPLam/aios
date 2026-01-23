import { resolveListsSecondaryNavAction } from "../listSecondaryNav";

describe("resolveListsSecondaryNavAction", () => {
  it("forces templates filter without changing stats state", () => {
    const result = resolveListsSecondaryNavAction({
      action: "templates",
      filter: "active",
      showStatsExpanded: false,
    });

    expect(result).toEqual({
      filter: "templates",
      showStatsExpanded: false,
    });
  });

  it("toggles stats visibility while preserving current filter", () => {
    const result = resolveListsSecondaryNavAction({
      action: "statistics",
      filter: "archived",
      showStatsExpanded: false,
    });

    expect(result).toEqual({
      filter: "archived",
      showStatsExpanded: true,
    });
  });
});
