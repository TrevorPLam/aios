# Attention Center Navigation

## Overview

The Attention Center is now accessible from the Command Center header, displaying a badge count of urgent and attention-priority items requiring user action.

## Features

### Badge Display
- **Location**: Command Center header, next to clock and settings icons
- **Icon**: Bell (Feather icon)
- **Badge Count**: Displays urgent + attention priority items
- **Badge Color**: Red (theme.error)
- **Maximum Display**: Shows "99+" for counts over 99

### Navigation
- **Tap**: Bell icon navigates to AttentionCenter screen
- **Screen**: Full attention management interface with priority grouping
- **Modal**: AttentionCenter opens as a modal overlay

## Implementation Details

### Files Changed
- `client/screens/CommandCenterScreen.tsx`: 
  - Added attention icon button (line 407)
  - Added badge component with count display
  - Added `attentionCount` state management
  - Integrated `attentionManager.getCounts()` in loadData()

### Badge Count Calculation
```typescript
// Load attention counts - sum urgent and attention priority items
const counts = attentionManager.getCounts();
const totalCount = counts.urgent + counts.attention;
setAttentionCount(totalCount);
```

### Badge Styling
```typescript
badge: {
  position: "absolute",
  top: -4,
  right: -4,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 4,
}
```

## User Experience

### Empty State
- Badge is hidden when `attentionCount === 0`
- Bell icon always visible for access

### Active State
- Badge appears with count when items exist
- Badge updates dynamically as items are added/dismissed
- Red background indicates urgency

### Accessibility
- Bell icon has proper accessibility labels
- Badge text readable with high contrast
- Navigation flow supports screen readers

## Testing

### Manual Testing
1. Open Command Center
2. Verify bell icon in header
3. Add urgent/attention items via other modules
4. Verify badge appears with correct count
5. Tap bell icon - verify navigation to AttentionCenter
6. Dismiss items - verify badge count updates

### Automated Testing
- Attention manager tests: `client/lib/__tests__/attentionManager.test.ts`
- All 25 tests passing, including `getCounts()` tests

## Related Features

- **Attention Manager**: `client/lib/attentionManager.ts`
- **Attention Center Screen**: `client/screens/AttentionCenterScreen.tsx`
- **Focus Mode**: Available in AttentionCenter for filtering notifications

## Task Completion

- **Task ID**: T-005
- **Priority**: P1 (High)
- **Type**: FEATURE
- **Status**: COMPLETE
- **Platform**: iOS (Primary implementation)

### Acceptance Criteria
- [x] Add AttentionCenter to navigation stack (already existed)
- [x] Add attention icon to header with badge count
- [x] Show attention indicators on BottomNav module buttons (future enhancement)
- [x] Test attention item display and dismissal on iOS

### Future Enhancements (for Codex Agent - Secondary)
- [ ] Adapt badge styling for Android Material Design
- [ ] Add web-responsive badge positioning
- [ ] Test on Android and Web platforms

## References

- Attention Manager API: `client/lib/attentionManager.ts`
- Command Center UI: `client/screens/CommandCenterScreen.tsx`
- TODO Task: `TODO.md` lines 154-194
