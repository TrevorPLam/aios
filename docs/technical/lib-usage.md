# Lib Usage Guide

**Purpose:** Quick, copy-ready usage examples for the shared `apps/mobile/lib` utilities.

> WHY: The lib layer powers the "one app to rule them all" architecture in README.md by
> providing reusable, cross-module behaviors (navigation, attention, search) that keep
> the UI consistent across 14+ modules without duplication.

---

## Attention badges (`attentionBadge.ts`)

**Use when:** You need a single badge count and label for attention items.

```tsx
import { attentionManager } from "@/lib/attentionManager";
import {
  getAttentionBadgeCount,
  formatAttentionBadgeLabel,
} from "@/lib/attentionBadge";

const counts = attentionManager.getCounts();
const count = getAttentionBadgeCount(counts);
const label = formatAttentionBadgeLabel(count);
```

**UI integration example:** `HeaderNav` renders the attention badge using these helpers.

---

## Attention state (`attentionManager.ts`)

**Use when:** You need the canonical list of attention items/bundles.

```tsx
import { attentionManager } from "@/lib/attentionManager";

const items = attentionManager.getItems();
const unsubscribe = attentionManager.subscribe(() => {
  // Re-fetch items on updates.
});
```

**UI integration example:** `AttentionCenterScreen` renders items + bundles from the manager.

---

## Priority colors (`attentionPriorityColor.ts`)

**Use when:** You need consistent priority tinting across themes.

```tsx
import { getAttentionPriorityColor } from "@/lib/attentionPriorityColor";

const color = getAttentionPriorityColor("urgent", theme);
```

**UI integration example:** `AttentionCenterScreen` uses the helper to tint badges and chips.

---

## Context engine (`contextEngine.ts`)

**Use when:** You want adaptive module visibility based on context zones.

```tsx
import { contextEngine } from "@/lib/contextEngine";

const isVisible = contextEngine.shouldModuleBeVisible("planner");
const unsubscribe = contextEngine.onChange(() => {
  // Recompute visibility when the zone changes.
});
```

**UI integration example:** `PersistentSidebar` hides/shows modules with `shouldModuleBeVisible`.

---

## Event bus (`eventBus.ts`)

**Use when:** You need cross-module event tracking without direct dependencies.

```tsx
import { eventBus, EVENT_TYPES } from "@/lib/eventBus";

eventBus.emit(EVENT_TYPES.SEARCH_PERFORMED, {
  query: "budget",
  source: "omnisearch",
});
```

**UI integration example:** `OmnisearchScreen` emits `SEARCH_PERFORMED` on user input.

---

## Lazy loading (`lazyLoader.ts`)

**Use when:** You want to keep startup fast and load modules on demand.

```tsx
import { lazyLoader } from "@/lib/lazyLoader";

const LazyPhotosScreen = lazyLoader.getLazyComponent("photos");
```

**UI integration example:** `AppNavigator` uses `getLazyComponent` for heavy screens.

---

## Memory manager (`memoryManager.ts`)

**Use when:** You need to track module memory usage as users navigate.

```tsx
import { memoryManager } from "@/lib/memoryManager";

memoryManager.registerModuleAccess("planner");
const stats = memoryManager.getStatistics();
```

**UI integration example:** `useAnalyticsNavigation` (mounted in `App.tsx`) registers access.

---

## Mini-mode (`miniMode.ts`)

**Use when:** You want inline mini flows (quick capture, quick add).

```tsx
import { useMiniMode } from "@/lib/miniMode";

const { openMiniMode } = useMiniMode();
openMiniMode({ module: "calendar", source: "quick-capture" });
```

**UI integration example:** `QuickCaptureOverlay` triggers mini-mode launches.

---

## Module handoff (`moduleHandoff.ts`)

**Use when:** You need breadcrumbs and state preservation across modules.

```tsx
import { useModuleHandoff } from "@/lib/moduleHandoff";

const { startHandoff } = useModuleHandoff();
startHandoff({ moduleId: "calendar", displayName: "Calendar" }, {
  moduleId: "maps",
  displayName: "Maps",
});
```

**UI integration example:** `HandoffBreadcrumb` renders the breadcrumb trail.

---

## Module registry (`moduleRegistry.ts`)

**Use when:** You need module metadata for navigation, grids, or filtering.

```tsx
import { moduleRegistry } from "@/lib/moduleRegistry";

const modules = moduleRegistry.getModules();
```

**UI integration example:** `ModuleGridScreen` renders the module cards from this list.

---

## Omnisearch engine (`omnisearch.ts`)

**Use when:** You need cross-module search results.

```tsx
import { omnisearch } from "@/lib/omnisearch";

const results = await omnisearch.search("project update", {
  limitPerModule: 3,
});
```

**UI integration example:** `OmnisearchScreen` uses `omnisearch.search` to render results.

---

## Prefetch engine (`prefetchEngine.ts`)

**Use when:** You want to pre-load modules based on navigation patterns.

```tsx
import { prefetchEngine } from "@/lib/prefetchEngine";

await prefetchEngine.onModuleEnter("calendar");
```

**UI integration example:** `useAnalyticsNavigation` forwards navigation events here.

---

## Query client (`query-client.ts`)

**Use when:** You need consistent API configuration or React Query setup.

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

<QueryClientProvider client={queryClient}>{/* app */}</QueryClientProvider>;
```

**UI integration example:** `App.tsx` mounts `QueryClientProvider` with the shared client.

---

## Recommendation engine (`recommendationEngine.ts`)

**Use when:** You need to regenerate Command Center recommendations.

```tsx
import { RecommendationEngine } from "@/lib/recommendationEngine";

const count = await RecommendationEngine.refreshRecommendations();
```

**UI integration example:** `CommandCenterScreen` triggers refreshes on user action.

---

## Search index (`searchIndex.ts`)

**Use when:** You need fast, indexed lookups before hitting storage.

```tsx
import { searchIndex } from "@/lib/searchIndex";

await searchIndex.initialize();
const results = searchIndex.search("meeting", { maxResults: 5 });
```

**UI integration example:** `OmnisearchScreen` can query the index before DB fallbacks.

---

## Storage helpers (`storage.ts`)

**Use when:** You need small, local persistence outside the database layer.

```tsx
import { saveToStorage, loadFromStorage } from "@/lib/storage";

await saveToStorage("@preferences:commandCenter", { enabled: true });
const preferences = await loadFromStorage("@preferences:commandCenter");
```

**UI integration example:** `AIPreferencesScreen` persists user toggles with these helpers.

