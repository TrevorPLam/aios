export type ListsFilterType = "all" | "active" | "archived" | "templates";

export type ListsSecondaryNavAction = "templates" | "statistics";

interface ResolveListsSecondaryNavActionInput {
  action: ListsSecondaryNavAction;
  filter: ListsFilterType;
  showStatsExpanded: boolean;
}

interface ResolveListsSecondaryNavActionOutput {
  filter: ListsFilterType;
  showStatsExpanded: boolean;
}

export function resolveListsSecondaryNavAction({
  action,
  filter,
  showStatsExpanded,
}: ResolveListsSecondaryNavActionInput): ResolveListsSecondaryNavActionOutput {
  switch (action) {
    case "templates":
      // WHY: Ensure the templates shortcut always lands in the templates filter deterministically.
      return { filter: "templates", showStatsExpanded };
    case "statistics":
      // WHY: Keep filter stable while toggling stats for quick visibility control.
      return { filter, showStatsExpanded: !showStatsExpanded };
  }
}
