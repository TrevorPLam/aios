# Context Zones — Module Scaffolding Stub

## Source Snapshot (from SUPER_APP_MODULE_EXPANSION.md)

- **Purpose:** Context-based UI, notifications, and AI behavior.
- **MVP Feature Set:** Context profiles (Work, Personal, Family); manual context switcher; context-filtered home modules; context-specific notification rules.
- **Data Model Draft:** `ContextProfile`, `ContextRule`, `ContextTrigger`, `ContextPreference`.
- **Core Screens (no UI implementation yet):** Context manager, context rule editor, quick switcher.
- **Integration Hooks:** Command Center, Notifications, Module Grid, Alerts.
- **Analytics & Telemetry:** Context switch frequency, module usage by context.
- **Open Questions:** Trigger precedence; multi-context blending rules.

## Scope & Intent

This stub defines Context Zones as a cross-module filter layer, with rules and triggers that influence visibility and notifications. UI/UX implementation is deferred.

## Core Functional Areas (Planned)

1. **Context Profiles**
   - Named contexts with preferences and module visibility.
2. **Triggers & Rules**
   - Time, location, and calendar-based triggers.
   - Rule precedence and conflict resolution (future).
3. **Manual Switching**
   - Quick switcher and temporary overrides.
4. **Notification Filtering**
   - Context-specific alert routing rules.

## Data & Domain Modeling Notes

- **ContextProfile:** Name, priority, active window.
- **ContextRule:** Conditions, actions, scope.
- **ContextTrigger:** Time/location/calendar inputs.
- **ContextPreference:** Module visibility, notification rules.

## Integration Touchpoints

- **Command Center:** Context-aware recommendations.
- **Module Grid:** Context-based module visibility.
- **Alerts/Notifications:** Filter and mute behaviors.
- **History:** Context switch log for Memory Bank.

## External Service Considerations

- Calendar/timezone services for triggers.
- Location providers for geofence triggers.

## Analytics & Telemetry (Planned)

- Switch frequency and manual overrides.
- Module usage distribution by context.
- Rule effectiveness (trigger fires vs user action).

## Security & Privacy Baselines

- Minimal location data retention.
- Clear opt-in for context automation.

## Iterative Reasoning (No Implementation Yet)

### Iteration 1 — Minimal Viable Scaffold

- Define context profiles and manual switching.
- Establish module visibility rules for Module Grid.

### Iteration 2 — Cross-Module Cohesion

- Integrate Alerts and Command Center filtering.
- Emit context switch events for History.

### Iteration 3 — External Integration Readiness

- Add trigger adapters for calendar/location.
- Define conflict resolution strategy placeholders.

## Proposed File Scaffolding (No Code Yet)

- `shared/models/context/` — context domain types
- `server/services/context/` — trigger evaluation stubs
- `client/modules/context/` — module entry points (no UI implementation)
- `docs/vision/module_scaffolds/CONTEXT_ZONES.md` — this plan

## Open Questions to Resolve

- Rule precedence and multi-context blending.
- Safe defaults for automated switching.
