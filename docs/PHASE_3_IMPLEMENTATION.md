# Phase 3 Implementation Guide

## Overview

Phase 3 of the AIOS Build Orchestration focuses on **Refinement** - advanced UI patterns and performance optimization to create a seamless, intelligent user experience across 38+ modules.

**Status:** In Progress
**Completion:** ~20%
**Last Updated:** January 16, 2026

---

## Completed Features

### 1. Mini-Mode Composable UI Pattern ✅

#### Plain English

Mini-modes allow users to perform quick actions from one module without leaving their current screen. For example, creating a calendar event while in the messages app, or capturing a note while viewing photos.

### Technical Implementation

- **Registry System** (`client/lib/miniMode.ts`): Central registration and lifecycle management
- **Container Component** (`client/components/MiniModeContainer.tsx`): Modal rendering with animations
- **Provider Components** (`client/components/miniModes/`):
  - `CalendarMiniMode.tsx` - Quick event creation
  - `TaskMiniMode.tsx` - Quick task creation
  - `NoteMiniMode.tsx` - Quick note capture

### Key Features

- Self-contained mini-mode components (no navigation dependency)
- Callback-based result handling (onComplete, onDismiss)
- Subscription system for UI updates
- Haptic feedback and accessibility support
- Comprehensive error handling

**Test Coverage:** 18 unit tests, 100% passing

### Usage Example

```typescript
import { useMiniMode } from '../lib/miniMode';

function MessagesScreen() {
  const { openMiniMode } = useMiniMode();

  const handleAddEvent = () => {
    openMiniMode({
      module: 'calendar',
      initialData: { title: 'Dinner with Sarah' },
      source: 'messages',
      onComplete: (result) => {
        console.log('Event created:', result.data);
      },
      onDismiss: () => {
        console.log('User cancelled');
      },
    });
  };

  return <Button onPress={handleAddEvent} label="Add to Calendar" />;
}
```text

### 2. Quick Capture Overlay ✅

#### Plain English (2)
A global menu accessible from anywhere that lets users quickly capture notes, tasks, events, expenses, or photos without losing their place in the app.

### Technical Implementation (2)
- **Overlay Component** (`client/components/QuickCaptureOverlay.tsx`): Modal menu with action grid
- **Context Hook** (`client/hooks/useQuickCapture.ts`): Global state management
- **Integration** with mini-mode system for seamless capture flows

### Key Features (2)
- Modal overlay with animated appearance (zoom + fade)
- Grid layout with 5 capture actions (note, task, event, expense, photo)
- Color-coded actions with icons
- Dismissible backdrop
- Source tracking for analytics
- Accessibility labels and hints

### Usage Example (2)
```typescript
import { useQuickCapture } from '../hooks/useQuickCapture';

function HeaderNav() {
  const { show } = useQuickCapture();

  return (
    <TouchableOpacity
      onLongPress={() => show('header_nav')}
      onPress={() => show('header_button')}
    >
      <Icon name="plus" />
    </TouchableOpacity>
  );
}
```text

---

## In Progress Features

### 3. Module Handoff with Breadcrumbs 🚧

#### Plain English (3)
When jumping between modules (e.g., Calendar → Maps for directions), show where you are and let you return with one tap. Your scroll position and state are preserved in both places.

### Planned Implementation
- **Navigation Stack Manager**: Serialize/deserialize module state
- **Breadcrumb Component**: Visual indicator of navigation path
- **State Preservation**: Save scroll position, filters, selections
- **Handoff API**: Module-to-module communication protocol

### Target Modules
- Calendar → Maps (directions to event location)
- Messages → Calendar (schedule from chat)
- Planner → Calendar (add task deadline as event)
- Contacts → Messages (start conversation)

**Status:** Design phase - not yet implemented

---

## Pending Features

### 4. Status-Aware UI Polish ⏸️

#### Goals
- Visual indicators for attention urgency levels (urgent/attention/fyi)
- Color-coded priority system
- Smart bundling visualization
- Focus mode UI treatment
- Polished animations and transitions

### 5. Performance Optimization ⏸️

#### Goals (2)
- Predictive prefetch implementation (<2s module load)
- Lazy loading for modules (React.lazy)
- Search optimization (<500ms target)
- Memory footprint reduction (<200MB target)
- Performance instrumentation and profiling

---

## Integration Instructions

### Step 1: Register Mini-Modes at App Startup

In your `App.tsx` or app entry point:

```typescript
import React, { useEffect } from 'react';
import { registerAllMiniModes } from './components/miniModes';

export default function App() {
  useEffect(() => {
    // Register all mini-mode providers
    registerAllMiniModes();
  }, []);

  return <YourAppContent />;
}
```text

### Step 2: Add MiniModeContainer to App Root

The container must be above all screens to render overlays:

```typescript
import { MiniModeContainer } from './components/MiniModeContainer';

export default function App() {
  return (
    <>
      <YourNavigationStack />
      <MiniModeContainer />
    </>
  );
}
```text

### Step 3: Add QuickCaptureProvider and Overlay

Wrap your app and add the overlay:

```typescript
import { QuickCaptureProvider, useQuickCapture } from './hooks/useQuickCapture';
import { QuickCaptureOverlay } from './components/QuickCaptureOverlay';

function AppContent() {
  const { isVisible, source, hide } = useQuickCapture();

  return (
    <>
      <YourNavigationStack />
      <MiniModeContainer />
      <QuickCaptureOverlay
        visible={isVisible}
        source={source}
        onDismiss={hide}
      />
    </>
  );
}

export default function App() {
  return (
    <QuickCaptureProvider>
      <AppContent />
    </QuickCaptureProvider>
  );
}
```text

### Step 4: Add Long-Press Gesture (Optional)

For global long-press activation:

```typescript
import { GestureHandlerRootView, LongPressGestureHandler } from 'react-native-gesture-handler';

function AppWithGestures() {
  const { show } = useQuickCapture();

  const handleLongPress = () => {
    show('long_press');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LongPressGestureHandler
        onActivated={handleLongPress}
        minDurationMs={800}
      >
        <View style={{ flex: 1 }}>
          <AppContent />
        </View>
      </LongPressGestureHandler>
    </GestureHandlerRootView>
  );
}
```text

---

## Testing

### Unit Tests

Run mini-mode tests:

```bash
npm test -- client/lib/__tests__/miniMode.test.ts
```text

### Coverage
- Registration and unregistration
- Opening and closing mini-modes
- Completing actions
- Error handling
- Event notifications

### Manual Testing Checklist

- [ ] Open calendar mini-mode from different screens
- [ ] Create event and verify it saves
- [ ] Dismiss mini-mode without saving
- [ ] Open task mini-mode and create task
- [ ] Open note mini-mode and create note
- [ ] Try to open two mini-modes simultaneously (should fail)
- [ ] Test quick capture overlay from various screens
- [ ] Test all quick capture actions
- [ ] Dismiss quick capture by tapping backdrop
- [ ] Verify haptic feedback works (on device)
- [ ] Test keyboard navigation (tab, enter, esc)
- [ ] Test with screen reader enabled

### Accessibility Checklist

- [x] All interactive elements have accessibility labels
- [x] Modals announce when opened (accessibilityViewIsModal)
- [x] Backdrop dismissal has label and hint
- [x] Form inputs have proper labels
- [x] Buttons have role="button"
- [x] Keyboard navigation supported
- [ ] E2E accessibility tests added

---

## Performance Considerations

### Current Metrics

- **Mini-mode load time:** <100ms (components are lightweight)
- **Quick capture open time:** <200ms (animated)
- **Memory footprint:** ~5MB per mini-mode (measured in dev mode)

### Optimization Targets

- Lazy load mini-mode components (not loaded until first use)
- Virtualize action lists in quick capture (if > 10 actions)
- Memoize expensive computations
- Use React.memo for stable components

---

## Known Issues & Limitations

### Current Limitations

1. **Date/Time Pickers:** Calendar mini-mode shows current date but doesn't allow picking yet
   - **Workaround:** Users can edit in full calendar screen
   - **Fix:** Add DateTimePicker component integration

2. **Photo/Expense Capture:** Quick capture buttons show "coming soon" alert
   - **Reason:** Budget and photo mini-modes not yet implemented
   - **Fix:** Implement remaining mini-modes in next iteration

3. **No Gesture Conflicts Prevention:** Long-press may interfere with other gestures
   - **Workaround:** Use explicit button for now
   - **Fix:** Add gesture priority system

### Future Enhancements

- **Voice Input:** Add speech-to-text for quick note capture
- **Recent Captures:** Show last 3 captures for quick access
- **Templates:** Pre-filled forms for common capture types
- **Batch Capture:** Capture multiple items in one session
- **Smart Defaults:** AI-suggested content based on context

---

## Architecture Decisions

### Why Not Use Navigation for Mini-Modes?

**Decision:** Render mini-modes as modals, not navigation screens.

### Rationale
- Preserves navigation stack (user doesn't lose place)
- Faster to open/close (no navigation animation)
- Can be dismissed easily (tap outside)
- Works consistently across navigation patterns
- Easier to test (no navigation mocking needed)

### Why Custom Event System Instead of Event Bus?

**Decision:** Mini-modes use their own subscription system, not the global event bus.

### Rationale (2)
- Event bus uses typed enums (EVENT_TYPES) which don't fit mini-mode events well
- Mini-mode events are UI-only (don't need cross-module coordination)
- Simpler API for React components (subscribe/unsubscribe)
- Avoids polluting global event namespace
- Easier to test (no event bus mocking needed)

### Why Callback-Based Instead of Promise-Based?

**Decision:** Mini-modes use callbacks (onComplete, onDismiss) not Promises.

### Rationale (3)
- Callbacks are more React-idiomatic
- User might keep mini-mode open for a while (Promise would pend)
- Allows separate success and cancel handlers
- Easier to integrate with React component lifecycle
- Matches existing patterns in codebase

---

## Next Steps

### Immediate (Next 1-2 Days)

1. Add remaining mini-modes (Contacts, Budget)
2. Implement DateTimePicker for Calendar mini-mode
3. Add E2E tests for mini-mode flows
4. Document module handoff design

### Short-term (Next Week)

1. Implement module handoff system
2. Add breadcrumb navigation UI
3. Implement state preservation
4. Add performance instrumentation

### Medium-term (Next 2-3 Weeks)

1. Build remaining mini-modes for all core modules
2. Implement predictive prefetch
3. Add lazy loading for modules
4. Performance profiling and optimization
5. Security review with CodeQL
6. Accessibility audit

---

## References

- [AIOS UI/UX Revolutionary Strategy](../vision/UI_UX_REVOLUTIONARY_STRATEGY.md)
- [Architecture Documentation](../architecture.md)
- [UX Flows Documentation](../ux.md)
- [Final Analysis Report](../FINAL_ANALYSIS_REPORT.md)

---

## Contact & Support

For questions or issues with Phase 3 implementation:

- Review this guide first
- Check existing tests for usage examples
- Consult architecture.md for system design
- Open an issue if you find a bug
