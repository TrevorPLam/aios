# Visual Changes Summary - Recommendation Cards UI Improvements

**Date**: 2026-01-19
**PR Branch**: copilot/update-recommendation-cards-ui
**Files Changed**:

- `apps/mobile/models/types.ts`
- `apps/mobile/storage/database.ts`
- `apps/mobile/screens/CommandCenterScreen.tsx`
- `P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`

## Changes Overview

### 1. Card Spacing Reduction

**Before**: Cards had 4px spacing (Spacing.xs)
**After**: Cards have 2px spacing
**Visual Effect**: Cards appear stacked almost on top of each other, creating a denser, more compact card deck appearance

### 2. White Glow for Unread Recommendations

**Feature**: New recommendation cards that have not been tapped/opened display a soft white glow
**Implementation**:

- Added `openedAt?: string | null` field to `Recommendation` interface
- Cards without `openedAt` value receive:
  - shadowColor: "#FFFFFF"
  - shadowOffset: { width: 0, height: 0 }
  - shadowOpacity: 0.4
  - shadowRadius: 16
  - elevation: 8
- Tapping a card marks it as opened via `db.recommendations.markAsOpened()`
- Glow disappears after card is opened

**Visual Effect**: Unread cards stand out with a gentle white halo, drawing attention to new recommendations

### 3. Navigation Bar Edge-to-Edge

**Before**: Bottom footer/navigation bar had horizontal padding (Spacing.lg = 16px) creating margins
**After**:

- Footer background extends to screen edges (0px horizontal padding)
- Content is wrapped in `footerContent` div with proper padding
- Background color fills full width of screen
- Top header maintains original padding (Spacing.lg)

**Visual Effect**: Bottom navigation bar feels more integrated with the app shell, matching modern mobile app patterns

### 4. Secondary Navigation Bar

**New Component**: Module-specific navigation positioned below main header

**Design**:

- Oval/pill shape (borderRadius: full)
- Transparent container with semi-transparent content (opacity: 0.8)
- Horizontally centered with padding
- Contains three buttons in a row:
  1. **Search** - Opens Omnisearch
  2. **Attention** - Opens Attention Center (with badge count)
  3. **History** - Opens Command History

**Button Layout**:

- Icon (20px) above label text
- Vertical alignment with small gap
- Minimum width: 60px per button

**Visual Effect**:

- Reduces clutter in main navigation
- Provides quick access to frequently used module actions
- Floating appearance with transparent/translucent style
- Consistent with modern iOS design patterns (similar to action bars in Photos, Messages, etc.)

## Technical Implementation

### Type Changes

```typescript
export interface Recommendation {
  // ... existing fields
  openedAt?: string | null; // NEW: ISO 8601 timestamp when first opened
}
```text

### Database Method

```typescript
async markAsOpened(id: string): Promise<void> {
  const all = await this.getAll();
  const rec = all.find((r) => r.id === id);
  if (rec && !rec.openedAt) {
    rec.openedAt = new Date().toISOString();
    await setData(KEYS.RECOMMENDATIONS, all);
  }
}
```text

### Style Changes

```typescript
cardSeparator: {
  height: 2, // Very minimal spacing
},

// Footer extends to edges
footer: {
  paddingHorizontal: 0, // Remove horizontal padding to extend to edges
},
footerContent: {
  paddingHorizontal: Spacing.lg,
},

// New styles
secondaryNav: {
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.sm,
},
secondaryNavContent: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.full,
},
secondaryNavButton: {
  alignItems: "center",
  justifyContent: "center",
  gap: Spacing.xs,
  minWidth: 60,
},
```text

## Future Work

Task **T-003A** created in P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md to replicate secondary navigation pattern in:

- Notebook module
- Lists module
- Planner module
- Calendar module
- Other modules as needed

This will provide consistent UX and reduce navigation clutter across the entire app.

## Testing Notes

**Manual Testing Required**:

1. Verify card spacing appears correct on iOS device/simulator
2. Confirm white glow appears on new recommendations
3. Confirm white glow disappears after tapping a card
4. Test secondary navigation buttons (Search, Attention, History)
5. Verify bottom footer/navigation bar extends to screen edges
6. Test in both light and dark themes
7. Verify attention badge count displays correctly

**Automated Testing**:

- Type checking passes (excluding unrelated config issues)
- No linting errors in changed files

## Screenshots

*Screenshots to be added after testing on iOS device/simulator*

### Before

- [ ] Card spacing (wide gaps)
- [ ] All cards look identical (no glow)
- [ ] Bottom navigation bar with margins
- [ ] Cluttered header with many icons

### After

- [ ] Card spacing (minimal 2px gaps)
- [ ] Unread cards with white glow
- [ ] Edge-to-edge bottom navigation bar
- [ ] Secondary navigation bar with key actions

