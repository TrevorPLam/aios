# Telemetry & Analytics

This document describes the analytics/telemetry system implemented in this app, including event taxonomy, privacy modes, forbidden data, and how to safely add new events.

## Table of Contents

- [Overview](#overview)
- [Modes of Operation](#modes-of-operation)
- [Event Taxonomy](#event-taxonomy)
- [Forbidden Data](#forbidden-data)
- [Privacy Transformations](#privacy-transformations)
- [Module Registry](#module-registry)
- [Adding New Events](#adding-new-events)
- [Testing](#testing)
- [API Reference](#api-reference)

## Overview

The analytics system provides centralized, type-safe event tracking with two modes:

- **MODE A (Default)**: "Ultimate Data Compiler" - Standard analytics with stable identifiers
- **MODE B (Premium)**: "Ultimate Privacy-Respecting Data Compiler" - Privacy-first analytics with de-identification

Key features:

- ✅ Single instrumentation codebase for both modes
- ✅ Strong TypeScript typing with compile-time validation
- ✅ Offline queueing with automatic batching and retry
- ✅ Privacy-safe by design (forbidden data automatically blocked)
- ✅ Module registry as single source of truth
- ✅ Comprehensive test coverage

## Modes of Operation

### MODE A: Default Mode

#### What we collect

- Stable user ID (if logged in)
- Stable device/install ID
- Full timestamps (ISO 8601)
- Session ID
- Event properties (already bucketed/categorical)

**Use case:** Standard product analytics for understanding user behavior and improving the product.

### MODE B: Privacy Mode

#### What we collect (2)

- Ephemeral session ID (new each app launch)
- Rotating pseudonymous ID (rotates daily)
- Coarse time buckets (day of week, hour of day)
- Event properties (bucketed/categorical only)

### What we DON'T collect

- User ID
- Device ID
- Full timestamps
- Raw content or sensitive data

**Use case:** Premium privacy feature for users who want privacy-respecting analytics without disabling telemetry entirely.

### Switching Modes

Users can toggle privacy mode at runtime through Settings:

```typescript
import analytics from "@/analytics";

// Enable privacy mode
await analytics.enablePrivacyMode();

// Disable privacy mode
await analytics.disablePrivacyMode();

// Check current mode
const isPrivacy = analytics.isPrivacyModeEnabled();
```text

When privacy mode is enabled, all subsequent events are processed with MODE B transformations. Events already queued are sanitized before being sent.

## Event Taxonomy

The canonical event taxonomy defines all events and their allowed properties. Events are organized into categories:

### Lifecycle Events

- `app_opened` - App launched or foregrounded
- `session_start` - New user session started
- `session_end` - User session ended
- `onboarding_started` - Onboarding flow started
- `onboarding_completed` - Onboarding flow completed
- `app_backgrounded` - App moved to background

### Navigation / Module Events

- `module_opened` - User opened a module
- `module_closed` - User closed a module
- `module_switch` - User switched between modules
- `module_search` - User searched in module grid
- `module_pinned` - User pinned a module
- `module_unpinned` - User unpinned a module
- `module_reordered` - User reordered modules
- `module_focus_start` - User began focused work in module
- `module_focus_end` - User ended focused work in module

### CRUD Events (Universal)

- `item_created` - Item created in any module
- `item_viewed` - Item viewed in any module
- `item_updated` - Item updated in any module
- `item_deleted` - Item deleted in any module
- `item_completed` - Item marked as completed

### AI Events

- `ai_opened` - AI assistant opened
- `ai_suggestion_generated` - AI generated a suggestion
- `ai_suggestion_applied` - User applied AI suggestion
- `ai_suggestion_rejected` - User rejected AI suggestion
- `ai_edit_before_apply` - User edited AI suggestion before applying
- `ai_auto_action` - AI performed automatic action

**Important:** AI events track effectiveness metrics only. Never log prompt text, generated output, or any content.

### Performance Events

- `screen_render_time` - Screen render performance
- `api_latency` - API call latency
- `crash_reported` - App crash occurred
- `error_boundary_hit` - React error boundary caught error

### Settings Events

- `theme_changed` - Theme changed
- `accent_color_changed` - Accent color changed
- `privacy_mode_enabled` - Privacy mode enabled
- `privacy_mode_disabled` - Privacy mode disabled

## Forbidden Data

The following types of data are **strictly forbidden** and automatically blocked:

### Content Data

- ❌ Note text/bodies
- ❌ Task titles/descriptions
- ❌ Email subjects/bodies
- ❌ Message content
- ❌ Calendar event titles
- ❌ List item text
- ❌ AI prompts or generated text

### Personal Information

- ❌ Contact names
- ❌ Email addresses
- ❌ Phone numbers
- ❌ Physical addresses
- ❌ User-entered names or identifiers

### Media Data

- ❌ Photo content or EXIF data
- ❌ Precise location data
- ❌ Voice recordings

### Identifiers

- ❌ Advertising IDs
- ❌ Cross-app tracking identifiers
- ❌ Device fingerprints (in privacy mode)

### What We DO Collect

✅ **Product telemetry only:**

- Event names (what happened)
- Module IDs (where it happened)
- Item types (what kind of thing, not content)
- Bucketed values (counts, durations, sizes as ranges)
- Performance metrics (latency, render time as buckets)
- Confidence scores (AI effectiveness as buckets)
- Navigation sources (how user got there)

## Privacy Transformations

When privacy mode is enabled, the following transformations are applied:

### 1. Identity Removal

```typescript
// MODE A
{ user_id: "user_123", device_id: "device_456" }

// MODE B (removed)
{ /* no stable IDs */ }
```text

### 2. Time Bucketing

```typescript
// MODE A
{ occurred_at: "2026-01-16T14:32:15.123Z" }

// MODE B
{ day_of_week: "friday", hour_of_day: 14 }
```text

### 3. Value Bucketing

All numeric values are converted to categorical buckets:

```typescript
// Text length: 0-20, 21-80, 81-200, 201-500, 501+
textLength: 350 → text_length_bucket: "201-500"

// Duration: <5s, 5-30s, 30-120s, 2-10m, 10m+
duration: 45 → duration_bucket: "5-30s"

// Latency: <100ms, 100-300ms, 300ms-1s, 1-3s, 3s+
latency: 250 → latency_bucket: "100-300ms"
```text

### 4. Property Allowlisting

Only properties defined in the event taxonomy are included. Unknown properties are automatically dropped with a warning in debug builds.

### 5. Forbidden Field Detection

Any property key matching forbidden patterns is automatically removed:

```typescript
// These patterns trigger automatic removal:
 /text | body | content | title | subject | name | email | phone | address | message/i
```text

## Module Registry

The module registry is the single source of truth for module metadata, used by both navigation and analytics:

```typescript
export const MODULE_REGISTRY: Record<ModuleType, ModuleMetadata> = {
  notebook: {
    id: "notebook",
    displayName: "Notebook",
    route: "Notebook",
    category: "productivity",
  },
  // ... other modules
};
```text

This ensures consistency between navigation and analytics instrumentation.

## Adding New Events

### Step 1: Add Event Type

Add the event name to `EventName` union in `types.ts`:

```typescript
export type EventName =
  | "existing_event"
  | "your_new_event"; // Add here
```text

### Step 2: Define Properties Interface

Add property interface in `types.ts`:

```typescript
export interface YourNewEventProps {
  required_prop: string;
  optional_prop?: number;
}
```text

### Step 3: Add to Event Props Map

Add to `EventPropsMap` in `types.ts`:

```typescript
export interface EventPropsMap {
  existing_event: ExistingEventProps;
  your_new_event: YourNewEventProps; // Add here
}
```text

### Step 4: Add to Taxonomy

Define the event in `taxonomy.ts`:

```typescript
export const EVENT_TAXONOMY: Record<EventName, EventDefinition> = {
  // ...
  your_new_event: {
    name: "your_new_event",
    description: "Description of what this event tracks",
    requiredProps: ["required_prop"],
    optionalProps: ["optional_prop"],
  },
};
```text

### Step 5: Add Convenience Method (Optional)

Add helper method in `index.ts`:

```typescript
export async function trackYourNewEvent(
  requiredProp: string,
  optionalProp?: number
): Promise<void> {
  await log("your_new_event", {
    required_prop: requiredProp,
    optional_prop: optionalProp,
  });
}
```text

### Step 6: Instrument

Use the event in your code:

```typescript
import analytics from "@/analytics";

// Using convenience method
await analytics.trackYourNewEvent("value");

// Or using generic log method
await analytics.log("your_new_event", {
  required_prop: "value",
});
```text

### Safety Checklist

Before adding a new event, verify:

- [ ] Event name is descriptive and follows naming conventions
- [ ] No forbidden data in property names or values
- [ ] All values are categorical or bucketed (no raw numbers/text)
- [ ] Required props are truly required
- [ ] Event is added to all 4 places (type union, props interface, props map, taxonomy)
- [ ] Tests added for new event if complex logic involved

## Testing

### Running Tests

```bash
npm test apps/mobile/analytics
```text

### Test Coverage

The analytics system includes comprehensive tests for:

- ✅ Bucket helpers (correct categorization)
- ✅ Privacy transformations (MODE B)
- ✅ Queue behavior (backpressure, compaction, retry)
- ✅ Taxonomy (no forbidden fields in definitions)
- ✅ Sanitizer (forbidden field detection, allowlist enforcement)

### Adding Tests for New Events

When adding a new event, consider adding tests if:

- Event has complex property transformations
- Event has unusual allowlist rules
- Event includes sensitive data that must be carefully handled

## API Reference

### Core API

```typescript
import analytics from "@/analytics";

// Initialize (call early in app lifecycle)
await analytics.initialize();

// Log generic event (type-safe)
await analytics.log(eventName, props);

// Flush queued events
await analytics.flush();

// Privacy mode control
await analytics.enablePrivacyMode();
await analytics.disablePrivacyMode();
const isPrivacy = analytics.isPrivacyModeEnabled();

// Shutdown (call before app exit)
await analytics.shutdown();
```text

### Lifecycle Methods

```typescript
await analytics.trackAppOpened(installAgeDays, networkState);
await analytics.trackSessionStart();
await analytics.trackSessionEnd();
await analytics.trackAppBackgrounded();
```text

### Navigation Methods

```typescript
await analytics.trackModuleOpened(moduleId, source);
await analytics.trackModuleClosed(moduleId);
await analytics.trackModuleSwitch(fromModule, toModule);
await analytics.trackModuleSearch(queryLength, resultsCount);
await analytics.trackModulePinned(moduleId);
await analytics.trackModuleUnpinned(moduleId);
await analytics.trackModuleFocusStart(moduleId);
await analytics.trackModuleFocusEnd(moduleId, durationSeconds);
```text

### CRUD Methods

```typescript
await analytics.trackItemCreated(moduleId, itemType);
await analytics.trackItemViewed(moduleId, itemType);
await analytics.trackItemUpdated(moduleId, itemType);
await analytics.trackItemDeleted(moduleId, itemType);
await analytics.trackItemCompleted(moduleId, itemType);
```text

### AI Methods

```typescript
await analytics.trackAIOpened(contextModule, selectionState);
await analytics.trackAISuggestionGenerated(suggestionType, confidence, latencyMs);
await analytics.trackAISuggestionApplied(suggestionType, confidence);
await analytics.trackAISuggestionRejected(suggestionType);
await analytics.trackAIEditBeforeApply(suggestionType, editDistance);
await analytics.trackAIAutoAction(actionType);
```text

### Performance Methods

```typescript
await analytics.trackScreenRenderTime(moduleId, renderTimeMs);
await analytics.trackAPILatency(endpointKey, latencyMs);
await analytics.trackErrorBoundaryHit(errorHash, moduleId?);
```text

### Settings Methods

```typescript
await analytics.trackThemeChanged(themeId);
await analytics.trackAccentColorChanged(accentColor);
```text

### Debug Methods

```typescript
// Get queue statistics
const stats = await analytics.getQueueStats();

// Clear queue (testing only)
await analytics.clearQueue();
```text

## Configuration

Analytics can be configured via environment variables:

```bash
# Disable analytics entirely
EXPO_PUBLIC_ANALYTICS_ENABLED=false

# Custom endpoint (default: /api/telemetry/events)
EXPO_PUBLIC_ANALYTICS_ENDPOINT=/custom/endpoint
```text

## Architecture

```text
┌─────────────────┐
│  Instrumentation │
│   (App code)     │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│ AnalyticsClient │  ← Main orchestrator
└────────┬─────────┘
         │
         ├──→ IdentityProvider (MODE A or B)
         │
         ├──→ Sanitizer (MODE B transformations)
         │
         ├──→ EventQueue (offline persistence)
         │
         └──→ Transport (batched HTTP)
                   │
                   ▼
            Backend endpoint
```text

## Backend Endpoint

The analytics system expects a POST endpoint at `/api/telemetry/events` (configurable) that accepts:

```typescript
{
  schema_version: "1.0.0",
  mode: "default" | "privacy",
  events: [
    {
      event_name: "item_created",
      event_id: "unique_id",
      occurred_at?: "2026-01-16T14:32:15.123Z", // MODE A only
      day_of_week?: "friday", // MODE B only
      hour_of_day?: 14, // MODE B only
      session_id: "session_id",
      module_id?: "notebook",
      props: { ... },
      app_version: "1.0.0",
      platform: "ios",
      locale?: "en-US"
    }
  ]
}
```text

## Best Practices

1. **Always use convenience methods** when available (better ergonomics, less error-prone)
2. **Never log raw content** - only structural/behavioral data
3. **Use buckets for numeric values** - provides privacy + useful data
4. **Keep event names descriptive** - `item_created` not `ic`
5. **Test your instrumentation** - verify events are logged correctly
6. **Use module registry** - don't hardcode module IDs
7. **Handle errors gracefully** - analytics failures shouldn't crash the app
8. **Respect privacy mode** - don't try to work around MODE B restrictions

## Troubleshooting

### Events not appearing

1. Check if analytics is enabled: `EXPO_PUBLIC_ANALYTICS_ENABLED`
2. Check queue stats: `await analytics.getQueueStats()`
3. Check network connectivity
4. Check backend endpoint health
5. Look for errors in console (debug mode)

### Privacy mode not working

1. Verify mode is enabled: `analytics.isPrivacyModeEnabled()`
2. Check that events don't have `occurred_at` or stable IDs
3. Review sanitizer logs in debug mode

### Type errors

1. Ensure event is defined in all 4 places (union, interface, map, taxonomy)
2. Check that property types match interface definition
3. Verify TypeScript version supports the type definitions

## Support

For issues or questions about the analytics system:

1. Check this documentation first
2. Review test files for examples
3. Check debug logs in development mode
4. Review event taxonomy for available events
5. Consult the team if sensitive data handling is unclear

