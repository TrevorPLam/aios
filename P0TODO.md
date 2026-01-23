# P0P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md - Repository Task List

Document Type: Workflow
Last Updated: 2026-01-21
Task Truth Source: **P0P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md**
Other Priority Files: `P1P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P2P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P3P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`

This file is the single source of truth for P0 tasks.
If another document disagrees, the task record in this file wins (unless the Constitution overrides).

## Task schema (required)

- **ID**: `T-###` (unique)
- **Priority**: `P0 | P1 | P2 | P3`
- **Type**: `SECURITY | RELEASE | DEPENDENCY | DOCS | QUALITY | BUG | FEATURE | CHORE`
- **Owner**: `AGENT`
- **Platform**: `iOS | Android | Web | Platform-Agnostic` (when applicable)
- **Status**: `READY | BLOCKED | IN-PROGRESS | IN-REVIEW`
- **Context**: why the task exists (1–5 bullets)
- **Acceptance Criteria**: verifiable checklist
- **References**: file paths and/or links inside this repo
- **Dependencies**: task IDs (if any)
- **Effort**: `S | M | L` (relative; explain if unclear)

### Priority meaning

- **P0**: blocks production readiness or causes security/data loss
- **P1**: high impact; do within 7 days
- **P2**: important but not urgent; do within 30 days
- **P3**: backlog/tech debt; do when convenient

### Ownership rule

- **Owner: AGENT** = Responsible for all task execution across platforms and for architectural decisions.


## Prompt Scaffold (Required for AGENT-owned tasks in this file)

Role: Who the agent should act as (e.g., senior engineer, docs editor).
Goal: What "done" means in one sentence.
Non-Goals: Explicit exclusions to prevent scope creep.
Context: Relevant files, prior decisions, and why the task exists.
Constraints: Tooling, style, security, and architecture rules to follow.
Examples: Expected input/output or format examples when applicable.
Validation: Exact verification steps (tests, lint, build, manual checks).
Output Format: Required response format or artifacts.
Uncertainty: If details are missing, mark UNKNOWN and cite what was checked.

### Task Prompt Template (paste into each task)
Role:
Goal:
Non-Goals:
Context:
Constraints:
Examples:
Validation:
Output Format:
Uncertainty:

---

## Active tasks

### T-085

- **Priority**: P0
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Phase 0: Integration Testing
  - End-to-end test from client to database
  - Verify offline queueing, retry, GDPR deletion
  - Critical to ensure Phase 0 works before Phase 1
  - T-081 through T-084 already COMPLETED - need tests
- **Acceptance Criteria**:
  - [ ] E2E test: Client sends events → Server receives → DB persists
  - [ ] Test offline queueing (events queue when server down)
  - [ ] Test retry logic (events retry on failure)
  - [ ] Test batch sending (50 events sent as batch)
  - [ ] Test GDPR deletion (deleteUserAnalytics removes all events)
  - [ ] Test error handling (bad payload returns 400)
  - [ ] Test coverage >80%
- **References**:
  - docs/analytics/PHASE_0_HANDOFF.md
  - docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.5)
  - apps/api/**tests**/analytics.test.ts (NEW FILE)
- **Dependencies**: None (T-081-T-084 already complete)
- **Effort**: M (4-6 hours)
- **Note**: Last step for Phase 0. Once complete, unblocks Phase 1 (T-071).

### Phase 0: Server Foundation (BLOCKING) ⭐ NEW

#### T-081

- **Priority**: P0
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic (Server)
- **Status**: COMPLETE
- **Context**:
  - Phase 0: Server Foundation - Database Schema
  - Analytics client sends events to `/api/telemetry/events`
  - Database schema created with indexes for performance
  - COMPLETED: packages/contracts/schema.ts lines 304-327
- **Acceptance Criteria**:
  - [x] Create analytics_events table schema
  - [x] Table includes: id, user_id, event_name, event_properties (JSONB), timestamp, session_id, device_id, platform
  - [x] Indexes on: user_id, event_name, timestamp (DESC), session_id
  - [x] Timestamp with timezone for correct time handling
  - [x] Validation schemas (analyticsEventSchema, analyticsBatchSchema)
- **References**:
  - packages/contracts/schema.ts:304-354
  - docs/analytics/PHASE_0_HANDOFF.md
  - docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.1)
- **Dependencies**: None
- **Effort**: S (COMPLETE)
- **Completion Date**: 2026-01-20

### T-082 (Instance 2)

- **Priority**: P0
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic (Server)
- **Status**: COMPLETE
- **Context**:
  - Phase 0: Server Foundation - Storage Methods
  - Storage methods for analytics event persistence implemented
  - Supports batch inserts, querying, and GDPR deletion
  - COMPLETED: apps/api/storage.ts lines 748-850
- **Acceptance Criteria**:
  - [x] Add saveAnalyticsEvents(events: AnalyticsEvent[]): Promise<void>
  - [x] Batch insert with idempotency (skip duplicate event IDs)
  - [x] Add getAnalyticsEvents(userId, filters) for querying
  - [x] Add deleteUserAnalytics(userId) for GDPR deletion
  - [x] Error logging for monitoring
- **References**:
  - apps/api/storage.ts:748-850
  - docs/analytics/PHASE_0_HANDOFF.md
  - docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.2)
- **Dependencies**: T-081 (COMPLETE)
- **Effort**: M (COMPLETE)
- **Completion Date**: 2026-01-20

### T-083 (Instance 2)

- **Priority**: P0
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic (Server)
- **Status**: COMPLETE
- **Context**:
  - Phase 0: Server Foundation - API Endpoint
  - POST /api/telemetry/events endpoint created
  - Client successfully configured to send to this endpoint
  - COMPLETED: apps/api/routes.ts lines 687-719
- **Acceptance Criteria**:
  - [x] POST /api/telemetry/events endpoint in apps/api/routes.ts
  - [x] Require authentication (JWT token)
  - [x] Validate payload with Zod schema (analyticsBatchSchema)
  - [x] Call storage.saveAnalyticsEvents(events)
  - [x] Return 202 Accepted with confirmation
  - [x] Error handling for storage failures
- **References**:
  - apps/api/routes.ts:687-719
  - docs/analytics/PHASE_0_HANDOFF.md
  - docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.3)
  - apps/mobile/analytics/transport.ts (client-side POST)
- **Dependencies**: T-082 (COMPLETE)
- **Effort**: M (COMPLETE)
- **Completion Date**: 2026-01-20
- **Note**: Analytics now work end-to-end! Client → Server → Storage

### T-084 (Instance 2)

- **Priority**: P0
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic (Shared)
- **Status**: COMPLETE
- **Context**:
  - Phase 0: Server Foundation - Validation Schemas
  - Zod validation schemas for analytics payloads created
  - Ensures data quality and security on server
  - COMPLETED: packages/contracts/schema.ts lines 329-354
- **Acceptance Criteria**:
  - [x] Add analyticsEventSchema to packages/contracts/schema.ts
  - [x] Validate: eventId (UUID), eventName (string), timestamp (datetime), properties (object)
  - [x] Validate identity: userId, deviceId, sessionId
  - [x] Add analyticsBatchSchema (array of events, 1-100 limit)
  - [x] Schema compatible with client types
  - [x] Export for use in server validation
- **References**:
  - packages/contracts/schema.ts:329-354
  - docs/analytics/PHASE_0_HANDOFF.md
  - docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.4)
- **Dependencies**: None
- **Effort**: S (COMPLETE)
- **Completion Date**: 2026-01-20

### T-085 (Instance 2)

- **Priority**: P0
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 0: Integration Testing
  - End-to-end test from client to database
  - Verify offline queueing, retry, GDPR deletion
  - Critical to ensure Phase 0 works before Phase 1
- **Acceptance Criteria**:
  - [ ] E2E test: Client sends events → Server receives → DB persists
  - [ ] Test offline queueing (events queue when server down)
  - [ ] Test retry logic (events retry on failure)
  - [ ] Test batch sending (50 events sent as batch)
  - [ ] Test GDPR deletion (deleteUserAnalytics removes all events)
  - [ ] Test error handling (bad payload returns 400)
  - [ ] Test coverage >80%
- **References**:
  - docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.5)
- **Dependencies**: T-081, T-082, T-083, T-084 (all Phase 0 tasks)
- **Effort**: M (4-6 hours)
- **Note**: Validates Phase 0 complete. Unblocks Phase 1.

**Phase 0 Total Effort:** 21-30 hours (1-1.5 weeks)
**Phase 0 Unblocks:** T-071 (Phase 1)

---

### Phase 1: Production Readiness (Client Features)

#### T-071

- **Priority**: P0
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 1: Production Readiness (Critical observability and privacy features)
  - Event Inspector and Metrics Collection are critical for production monitoring
  - Consent Management required for GDPR/CCPA compliance
  - **BLOCKED BY:** Phase 0 (T-081-T-085) must complete first
- **Acceptance Criteria**:
  - [ ] Task 1.1: Event Inspector UI (20-30h) - Real-time event visualization
  - [ ] Task 1.2: Metrics Collection (20-30h) - Throughput, latency, error rates
  - [ ] Task 1.3: Consent Management (15-20h) - GDPR compliance
  - [ ] Task 1.4: Data Retention (15-20h) - Automatic cleanup
  - [ ] Task 1.5: Data Deletion API (10-15h) - User data deletion
  - [ ] Task 1.6: Testing & Documentation (10-20h) - 80%+ coverage
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Phase 1)
  - docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Phase 1 details)
  - apps/mobile/analytics/observability/inspector.ts
  - apps/mobile/analytics/observability/metrics.ts
  - apps/mobile/analytics/privacy/consent.ts
  - apps/mobile/analytics/privacy/retention.ts
  - apps/mobile/analytics/privacy/deletion.ts
- **Dependencies**: T-085 (Phase 0 complete and tested)
- **Effort**: L (80-120 hours total for Phase 1)
- **Note**: Phase 1 is production-critical. Target: 53/100 → 70/100 score.


