# Navigation System Improvements

## Overview

This document describes the recent improvements to the mobile app's navigation system, including visual fixes, new features, and code constraints to prevent regressions.

## Changes Made

### 1. Bottom Navigation Bar Fixes

**Problem**: The bottom navigation bar was reverting to smaller sizes on some modules.

**Solution**:

- Added explicit width and height constraints to the bottom navigation container
- Set `width: "100%"` and `minHeight: 80` to ensure the bar fills to screen edges
- Added code comments with "IMPORTANT" markers to prevent accidental changes
- Changed navigation buttons to fixed size (56x56) with bold arrows only (removed module names and icons)
- Increased arrow font size to 32px with bold weight for better visibility

**Code Constraints**:

```typescript
// apps/mobile/components/BottomNav.tsx
const styles = StyleSheet.create({
  container: {
    // IMPORTANT: These constraints ensure the bar fills to screen edges
    // Do not change width or minHeight without updating this comment
    width: "100%",
    minHeight: 80,
  },
  navButton: {
    // FIXED SIZE: Do not change without updating constraint comment
    width: 56,
    height: 56,
  },
  arrow: {
    // BOLD ARROWS ONLY: size 32, bold - per requirements
    fontSize: 32,
    fontWeight: "bold",
  },
});
```text

### 2. Module Grid Screen Improvements

**Removed**:

- Command Center from modules menu (still accessible via home button)
- Settings from modules menu (still accessible via header)
- Integrations from modules menu (accessible via Settings)

**Added**:

- **View Mode Toggle**: Grid/List view switcher in the header (left button)
  - Grid view: 2-column card layout
  - List view: Single-column row layout with drag-and-drop support

- **Arrangement Settings**: Cycle through different sorting modes (center button)
  - **Smart (Intuitive)**: Sorts by usage count (most used first)
  - **Recent**: Sorts by last accessed time
  - **A-Z**: Alphabetical sorting
  - **Custom**: User-defined order with drag-and-drop

- **Home Button**: Quick access to Command Center (right button in header)

### 3. Header Navigation Updates

**Added**:

- Grid icon button (opens modules menu)
- Home icon button (returns to Command Center)
- Settings icon button (opens settings)

All header icons are now centered and consistently sized.

### 4. Intuitive Navigation System

**Usage Tracking**:

- Every module navigation is tracked automatically
- Tracks count and last access time per module
- Data stored in Settings under `moduleUsageStats`

**Navigation Logic**:

- Left arrow (‹): Previous module in current ordering
- Right arrow (›): Next module in current ordering
- Default ordering is "intuitive" (most used first)
- Command Center is conceptually in the center of the navigation loop
- All navigation updates usage statistics

**Implementation**:

```typescript
// Automatic usage tracking on module navigation
await db.settings.trackModuleUsage(moduleId);
```text

### 5. Contextual Navigation

**Purpose**: Allow context-aware module suggestions based on user focus.

**Example**: When viewing an email with a date/time reference, the Calendar module becomes the next navigation target (via right arrow) regardless of usual ordering.

**How to Use**:

```typescript
import { useNavigationContext } from "@/context/NavigationContext";

function SomeScreen() {
  const { setContextualModule, clearContextualModule } = useNavigationContext();

  useEffect(() => {
    // Detect context (e.g., email with date)
    if (hasRelevantContext) {
      setContextualModule("calendar");
    }

    return () => clearContextualModule();
  }, [dependency]);
}
```text

**Behavior**:

- Only affects the right arrow (next module)
- Automatically clears after navigation
- Reverts to assigned position on next cycle or app close

See [CONTEXTUAL_NAVIGATION.md](./CONTEXTUAL_NAVIGATION.md) for detailed usage guide.

## New Types & Interfaces

```typescript
// Module view mode
export type ModuleViewMode = "grid" | "list";

// Module arrangement/sorting
 export type ModuleArrangement = "most_recent" | "intuitive" | "alphabetical" | "static";

// Module usage statistics
export interface ModuleUsageStats {
  [moduleId: string]: {
    count: number;
    lastUsed: string; // ISO 8601 timestamp
  };
}

// Settings interface additions
export interface Settings {
  // ... existing fields
  moduleViewMode: ModuleViewMode;
  moduleArrangement: ModuleArrangement;
  moduleOrder?: ModuleType[]; // For static arrangement
  moduleUsageStats?: ModuleUsageStats;
}
```text

## Database Methods

```typescript
// Track module usage
await db.settings.trackModuleUsage(moduleId: string): Promise<void>

// Update settings
await db.settings.update(partial: Partial<Settings>): Promise<Settings>
```text

## Visual Constraints

To prevent the bottom navigation bar from reverting to smaller sizes again:

1. **Do NOT** remove the `width: "100%"` style from the container
2. **Do NOT** reduce the `minHeight` below 80
3. **Do NOT** change arrow `fontSize` below 32 or remove `fontWeight: "bold"`
4. **Do NOT** change button sizes from their fixed dimensions without review
5. All style changes to BottomNav should be reviewed for layout impact

## Testing

To test the changes:

1. **Bottom Nav Bar**: Verify it fills the full width on all screens
2. **Module Grid**:
   - Toggle between grid and list views
   - Try all arrangement modes
   - Drag to reorder in Custom mode
3. **Usage Tracking**: Navigate between modules and verify order changes in "Smart" mode
4. **Contextual Nav**: Set a contextual module and verify right arrow navigates to it

## Dependencies Added

- `react-native-draggable-flatlist`: For drag-and-drop module reordering in Custom mode

## Files Modified

- `apps/mobile/components/BottomNav.tsx` - Navigation bar with arrows and constraints
- `apps/mobile/components/HeaderNav.tsx` - Grid, home, and settings buttons
- `apps/mobile/screens/ModuleGridScreen.tsx` - Grid/list view and arrangement settings
- `apps/mobile/models/types.ts` - New types for view mode and arrangement
- `apps/mobile/storage/database.ts` - Usage tracking method
- `apps/mobile/App.tsx` - Navigation context provider
- `apps/mobile/context/NavigationContext.tsx` - New contextual navigation system

## Files Created

- `CONTEXTUAL_NAVIGATION.md` - Guide for contextual navigation
- `NAVIGATION_IMPROVEMENTS.md` - This file

