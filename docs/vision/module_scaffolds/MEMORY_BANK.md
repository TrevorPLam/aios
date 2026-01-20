# Memory Bank — Module Scaffolding Stub

## Source Snapshot (from SUPER_APP_MODULE_EXPANSION.md)
- **Purpose:** Unified, searchable life log across modules.
- **MVP Feature Set:** Timeline view (day/week); memory search (keyword + module filters); "On this day" highlights; manual memory capture entry.
- **Data Model Draft:** `MemoryItem`, `MemorySource`, `MemoryTag`, `TimelineEntry`.
- **Core Screens (no UI implementation yet):** Memory timeline, memory detail, search results, capture sheet.
- **Integration Hooks:** History, Photos, Calendar, Messages, Notebook.
- **Analytics & Telemetry:** Recall usage, search success, memory resurfacing CTR.
- **Security & Privacy:** Opt-in capture settings, retention controls, encryption.
- **Open Questions:** Default capture sources safest to enable.

## Scope & Intent
This stub defines the Memory Bank module as a cross-module aggregation layer. It focuses on data capture contracts, indexing, and retrieval logic while deferring all UI/UX implementation.

## Core Functional Areas (Planned)
1. **Memory Capture**
   - Manual capture entries.
   - Automated module event ingestion (opt-in).
2. **Timeline & Search**
   - Timeline view by day/week.
   - Search by keyword and module filters.
3. **Highlights & Resurfacing**
   - "On this day" and contextual resurfacing.
   - Memory tagging and grouping.

## Data & Domain Modeling Notes
- **MemoryItem:** Source, timestamp, title, body, linked entities.
- **MemorySource:** Module identifier, capture type, permissions.
- **MemoryTag:** Tag, confidence, source.
- **TimelineEntry:** Aggregated representation for UI/analytics.

## Integration Touchpoints
- **History:** Source of activity events.
- **Photos:** Media references for memories.
- **Calendar:** Events and attendance context.
- **Messages:** Conversation snippets (opt-in).
- **Notebook:** Notes as memory anchors.

## External Service Considerations
- Indexing/search engine adapter (local-first).
- Optional cloud sync for encrypted backups.

## Analytics & Telemetry (Planned)
- Search success rate and recall usage.
- CTR for resurfaced memories.
- Capture volume by source.

## Security & Privacy Baselines
- Opt-in capture with per-module toggles.
- Retention controls and deletion workflow.
- Encryption by default for memory payloads.

## Iterative Reasoning (No Implementation Yet)
### Iteration 1 — Minimal Viable Scaffold
- Define memory item schemas and storage interfaces.
- Establish ingest contracts for History and Photos.

### Iteration 2 — Cross-Module Cohesion
- Add link resolution for Calendar and Messages.
- Define query filters for module-based search.

### Iteration 3 — External Integration Readiness
- Add indexing adapter interface and sync placeholders.
- Define privacy policy hooks for opt-in capture settings.

## Proposed File Scaffolding (No Code Yet)
- `shared/models/memory/` — memory domain types
- `server/services/memory/` — indexing/search stubs
- `client/modules/memory/` — module entry points (no UI implementation)
- `docs/vision/module_scaffolds/MEMORY_BANK.md` — this plan

## Open Questions to Resolve
- Default capture sources and user consent UX.
- Indexing technology and storage footprint.
