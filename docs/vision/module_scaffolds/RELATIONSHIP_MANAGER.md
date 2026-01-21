# Relationship Manager — Module Scaffolding Stub

## Source Snapshot (from SUPER_APP_MODULE_EXPANSION.md)

- **Purpose:** Strengthen relationships with reminders and shared context.
- **MVP Feature Set:** Relationship dashboard (health score + last contact); important dates tracking; "reach out" reminders; shared memory highlights.
- **Data Model Draft:** `Relationship`, `Interaction`, `ImportantDate`, `SharedMemory`.
- **Core Screens (no UI implementation yet):** Relationship list, person detail, reminder scheduler.
- **Integration Hooks:** Contacts, Messages, Calendar, Photos, History.
- **Analytics & Telemetry:** Outreach cadence, response rates, reminder effectiveness.
- **Open Questions:** Scoring logic; manual vs automated interaction logging.

## Scope & Intent

This stub defines the Relationship Manager module structure and its cross-module dependencies without UI or backend implementation. It is designed to operate as a personal CRM aligned with existing modules.

## Core Functional Areas (Planned)

1. **Relationship Profiles**
   - Relationship health score and contact cadence.
   - Key notes and preferences.
2. **Interaction Tracking**
   - Communication history summary (messages, calls).
   - Manual logging for offline interactions.
3. **Important Dates & Reminders**
   - Birthdays, anniversaries, milestones.
   - Reminder scheduling via Alerts/Calendar.
4. **Shared Memories**
   - Surface memories linked to contacts.

## Data & Domain Modeling Notes

- **Relationship:** Contact ref, status, health score, notes.
- **Interaction:** Type, timestamp, duration, summary.
- **ImportantDate:** Date, label, recurrence.
- **SharedMemory:** Memory ref, relevance score.

## Integration Touchpoints

- **Contacts:** Source of people and metadata.
- **Messages:** Communication frequency tracking.
- **Calendar:** Important dates and reminders.
- **Photos:** Shared memory association.
- **History:** Interaction timeline for Memory Bank.

## External Service Considerations

- Optional integration with email/phone logs (opt-in).
- Social network connectors (future).

## Analytics & Telemetry (Planned)

- Outreach cadence per relationship.
- Reminder effectiveness and follow-through.
- Response rate trends.

## Security & Privacy Baselines

- Sensitive relationship notes stored locally.
- Opt-in access to communication logs.

## Iterative Reasoning (No Implementation Yet)

### Iteration 1 — Minimal Viable Scaffold

- Define relationship, interaction, and important date models.
- Establish reminder hooks to Alerts/Calendar.

### Iteration 2 — Cross-Module Cohesion

- Link communication frequency to Messages/Email metadata.
- Add shared memory linkage from Memory Bank.

### Iteration 3 — External Integration Readiness

- Add optional connectors for phone/email logs.
- Define scoring algorithm placeholders.

## Proposed File Scaffolding (No Code Yet)

- `shared/models/relationships/` — relationship domain types
- `server/services/relationships/` — scoring/connector stubs
- `client/modules/relationships/` — module entry points (no UI implementation)
- `docs/vision/module_scaffolds/RELATIONSHIP_MANAGER.md` — this plan

## Open Questions to Resolve

- Health score calculation and weighting.
- Automated vs manual interaction logging defaults.
