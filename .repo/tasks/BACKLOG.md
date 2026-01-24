# 🤖 Task Backlog

> **Prioritized queue of tasks waiting to be worked on.**

Tasks are ordered by priority (P0 → P1 → P2 → P3). When `TODO.md` is empty, promote the highest priority task from this file.

**Note:** This backlog was migrated from P0TODO.md, P1TODO.md, P2TODO.md, and P3TODO.md on 2026-01-21. All tasks have been converted to the new format.

---

## Priority Guide

| Level | Name | Meaning | Expected Turnaround |
|-------|------|---------|---------------------|
| **P0** | Critical | Blocking issues, security, broken CI | Immediate |
| **P1** | High | Important features, significant improvements | This week |
| **P2** | Medium | Standard features, non-urgent improvements | This month |
| **P3** | Low | Nice-to-haves, polish, minor enhancements | When possible |

---

## Backlog Tasks

### P0 - Critical Priority

#### [TASK-071] Phase 1: Production Readiness (Client Features)
- **Priority:** P0
- **Status:** Blocked
- **Created:** 2026-01-21
- **Context:** Phase 1: Production Readiness (Critical observability and privacy features). Event Inspector and Metrics Collection are critical for production monitoring. Consent Management required for GDPR/CCPA compliance. **BLOCKED BY:** Phase 0 (T-081-T-085) must complete first.

#### Acceptance Criteria
- [ ] Task 1.1: Event Inspector UI (20-30h) - Real-time event visualization
- [ ] Task 1.2: Metrics Collection (20-30h) - Throughput, latency, error rates
- [ ] Task 1.3: Consent Management (15-20h) - GDPR compliance
- [ ] Task 1.4: Data Retention (15-20h) - Automatic cleanup
- [ ] Task 1.5: Data Deletion API (10-15h) - User data deletion
- [ ] Task 1.6: Testing & Documentation (10-20h) - 80%+ coverage

#### Notes
- References: docs/analytics/IMPLEMENTATION_PLAN.md (Phase 1), docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Phase 1 details)
- Dependencies: T-085 (Phase 0 complete and tested)
- Effort: L (80-120 hours total for Phase 1)
- Note: Phase 1 is production-critical. Target: 53/100 → 70/100 score.

---

### P1 - High Priority

#### [TASK-058] Planner AI Assist Actions
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Planner AI Assist actions are listed but not implemented. Competing planners ship AI-assisted prioritization and task breakdown. This is a differentiator tied to the Command Center/AI narrative.

#### Acceptance Criteria
- [ ] Implement Planner AI Assist actions: priority suggestion, due date recommendation, task breakdown, dependency identification
- [ ] Persist AI output into task fields or subtasks with user confirmation
- [ ] Log AI Assist outcomes in History for auditability
- [ ] Add empty/error states for AI Assist actions
- [ ] Test AI Assist actions on iOS with sample tasks

#### Notes
- References: apps/mobile/components/AIAssistSheet.tsx, docs/planning/MISSING_FEATURES.md
- Effort: M

---

#### [TASK-059] Task Dependency Management
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Task dependencies exist in the data model but UI/validation is incomplete. Competitive planners visualize dependency chains and block conflicting tasks. Dependency management unlocks critical-path planning.

#### Acceptance Criteria
- [ ] Add dependency selection UI in TaskDetailScreen
- [ ] Validate cycles and blocked tasks before save
- [ ] Surface dependency status in Planner list (blocked/ready)
- [ ] Add dependency graph summary in task details
- [ ] Add tests for dependency validation logic

#### Notes
- References: apps/mobile/screens/TaskDetailScreen.tsx, apps/mobile/screens/PlannerScreen.tsx, docs/planning/MISSING_FEATURES.md
- Effort: M

---

#### [TASK-062] Calendar Recurrence Expansion
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Recurrence rules exist in the data model, but instances are not expanded. Competitors treat recurrence as a core capability. Missing recurrence logic blocks parity for everyday scheduling.

#### Acceptance Criteria
- [ ] Implement recurrence expansion logic for daily/weekly/monthly/custom rules
- [ ] Support exception dates and overrides in recurrence series
- [ ] Render recurring instances in day/week/month/agenda views
- [ ] Add tests for recurrence expansion and exception handling

#### Notes
- References: apps/mobile/screens/CalendarScreen.tsx, packages/contracts/schema.ts, docs/planning/MISSING_FEATURES.md, docs/analysis/COMPETITIVE_ANALYSIS.md
- Effort: M

---

#### [TASK-063] Calendar Event Reminders
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Calendar events have no reminders or notifications. Competitors rely on alerts for core utility. Lack of reminders reduces daily engagement.

#### Acceptance Criteria
- [ ] Add reminder configuration (none/5m/15m/1h/1d/custom) to event detail
- [ ] Schedule local notifications for upcoming events with expo-notifications
- [ ] Update/cancel notifications on event edits/deletes
- [ ] Add tests for reminder scheduling and notification lifecycle

#### Notes
- References: apps/mobile/screens/CalendarScreen.tsx, packages/contracts/schema.ts, docs/analysis/COMPETITIVE_ANALYSIS.md
- Effort: M

---

#### [TASK-076] Lists Sharing and Collaboration
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Shared lists and collaboration are table stakes in Todoist/MS To Do. Lists module lacks sharing, which blocks multi-user workflows. Collaboration is required to meet competitor parity.

#### Acceptance Criteria
- [ ] Add list sharing flow (invite via contacts/email)
- [ ] Add roles/permissions (owner/editor/viewer) to list access
- [ ] Sync shared list changes and show collaborator indicators
- [ ] Add tests for permission enforcement and merge behavior

#### Notes
- References: apps/mobile/screens/ListsScreen.tsx, apps/mobile/screens/ListEditorScreen.tsx, apps/mobile/models/types.ts, docs/analysis/COMPETITIVE_ANALYSIS.md, docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- Effort: L

---

#### [TASK-077] Lists Recurrence Rules
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Competitors support recurring tasks/lists. Lists module has due dates but no recurrence rules. Recurrence is critical for routine checklists.

#### Acceptance Criteria
- [ ] Add recurrence rules to list items (daily/weekly/monthly/custom)
- [ ] Auto-create next occurrence on completion or schedule
- [ ] Show recurrence indicators and filters in Lists UI
- [ ] Add tests for recurrence scheduling logic

#### Notes
- References: apps/mobile/models/types.ts, apps/mobile/screens/ListEditorScreen.tsx, apps/mobile/storage/database.ts, docs/analysis/COMPETITIVE_ANALYSIS.md, docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- Effort: M

---

#### [TASK-078] Lists Reminders
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Top list apps include reminders (time and location). List items support due dates but no notifications. Reminders improve daily engagement and parity.

#### Acceptance Criteria
- [ ] Add reminder configuration (none/relative/custom) to list items
- [ ] Schedule/update/cancel local notifications for list reminders
- [ ] Add location-based reminder support for list items
- [ ] Add tests for reminder scheduling and notification lifecycle

#### Notes
- References: apps/mobile/models/types.ts, apps/mobile/screens/ListEditorScreen.tsx, docs/analysis/COMPETITIVE_ANALYSIS.md, docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- Effort: L

---

#### [TASK-079] Lists Nested Items
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Competitors support subtasks; Lists items are flat today. Nested checklists enable complex workflows and parity. Hierarchy improves clarity for multi-step lists.

#### Acceptance Criteria
- [ ] Add nested child items to ListItem schema
- [ ] Build UI to indent/expand/collapse subitems
- [ ] Roll up completion state based on child items
- [ ] Add tests for nested item rendering and completion logic

#### Notes
- References: apps/mobile/models/types.ts, apps/mobile/screens/ListEditorScreen.tsx, docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- Effort: M

---

#### [TASK-071-EMAIL] Email Provider Integration
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Email module is UI-only for thread management; no real provider integration. Competitors require Gmail/Outlook integration for send/receive parity. Provider sync is the critical gap blocking production viability.

#### Acceptance Criteria
- [ ] Add OAuth flows for Gmail and Microsoft Graph (secure token storage)
- [ ] Implement provider sync for inbox/sent/archives/labels into local storage
- [ ] Support multiple connected accounts with unified inbox view
- [ ] Add provider health/error states and retry workflows
- [ ] Add integration tests for provider sync with mocked APIs

#### Notes
- References: MODULE_DETAILS.md, docs/analysis/CODE_QUALITY_ANALYSIS.md, apps/mobile/screens/EmailScreen.tsx, apps/mobile/storage/database.ts
- Effort: L

---

#### [TASK-072-EMAIL] Email Compose/Send/Reply
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Compose/send/reply/forward workflows are not implemented. Competitors ship full composition with templates, signatures, and scheduling. Differentiator: compose flows should integrate with AI Assist and other modules.

#### Acceptance Criteria
- [ ] Build compose UI with reply/forward, CC/BCC, and draft autosave
- [ ] Add rich-text editor with attachment upload/preview
- [ ] Support signatures, templates, and scheduled send
- [ ] Persist drafts and sent messages to storage with thread linkage
- [ ] Add tests for draft lifecycle and composition validation

#### Notes
- References: MODULE_DETAILS.md, docs/analysis/CODE_QUALITY_ANALYSIS.md, apps/mobile/screens/EmailScreen.tsx, apps/mobile/components/AIAssistSheet.tsx
- Dependencies: T-071-EMAIL
- Effort: L

---

#### [TASK-057] AI Behavior Onboarding
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Current module-selection onboarding removed (T-009 reverted). Future onboarding should focus on AI personality and behavior preferences. Goal: Understand how users want AIOS to act, not which modules they want. This is about configuring the AI assistant's behavior, not feature selection.

#### Acceptance Criteria
- [ ] Design onboarding flow asking about AI behavior preferences
- [ ] Questions about: communication style (formal/casual), proactivity level (low/high), notification preferences
- [ ] Questions about: learning style, decision support level, automation preferences
- [ ] Store preferences in user profile/context engine
- [ ] Use preferences to configure AI behavior across all modules
- [ ] Skip option that uses sensible defaults

#### Notes
- References: Previous onboarding: apps/mobile/screens/OnboardingWelcomeScreen.tsx (removed), AI preferences: apps/mobile/screens/AIPreferencesScreen.tsx, Context engine: apps/mobile/lib/contextEngine.ts
- Effort: L
- Note: This is a complete redesign of onboarding from module selection to AI personality configuration. Platform-agnostic questionnaire.

---

#### [TASK-016] Screen-Level Error Boundaries
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Only app-level ErrorBoundary exists. Screen crashes affect entire app instead of just that screen. No recovery options for users.

#### Acceptance Criteria
- [ ] Wrap each Stack.Screen with ErrorBoundary
- [ ] Add recovery options (reload screen, go back, go home)
- [ ] Test error boundary behavior with intentional errors on iOS
- [ ] Add error logging for debugging

#### Notes
- References: apps/mobile/components/ErrorBoundary.tsx
- Effort: M
- Note: Platform-agnostic error handling.

---

#### [TASK-017] Loading States for Screens
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Screens don't show loading indicators during data load. Users see blank screens or stale data. Poor perceived performance.

#### Acceptance Criteria
- [ ] Phase 1: Create LoadingState component with skeleton variants
- [ ] Phase 2: Add loading states to high-traffic screens (CommandCenter, Calendar, Notebook, Planner)
- [ ] Phase 3: Add loading states to remaining module screens
- [ ] Phase 4: Implement pull-to-refresh on list-based screens
- [ ] Phase 5: Test loading states and measure performance improvement on iOS

#### Notes
- References: apps/mobile/screens/*.tsx
- Effort: M (broken down from L)
- Note: Platform-agnostic UI patterns.

---

#### [TASK-018] Network Status and Offline Handling
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** App doesn't show offline status or handle network errors. Silent failures when network unavailable. Users don't know why actions fail.

#### Acceptance Criteria
- [ ] Add network status indicator
- [ ] Show offline mode banner
- [ ] Cache data for offline viewing
- [ ] Test offline behavior for all modules on iOS

#### Notes
- References: All network-dependent code
- Effort: M
- Note: Platform-agnostic network handling.

---

#### [TASK-072-ANALYTICS] Phase 2: Group Analytics
- **Priority:** P1
- **Status:** Blocked
- **Created:** 2026-01-21
- **Context:** Phase 2: Product Analytics Features. Group analytics enables B2B company-level tracking. High business value for product teams.

#### Acceptance Criteria
- [ ] Group identification (company, team, workspace)
- [ ] Group properties (name, plan, size, industry)
- [ ] User-to-group associations (multi-group support)
- [ ] Group event tracking
- [ ] Backend integration for group data

#### Notes
- References: docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.1), apps/mobile/analytics/advanced/groups.ts
- Dependencies: T-071 (Phase 1 complete)
- Effort: M (25-35 hours)
- Note: Enables B2B analytics use cases.

---

#### [TASK-073-ANALYTICS] Phase 2: Funnel Tracking
- **Priority:** P1
- **Status:** Blocked
- **Created:** 2026-01-21
- **Context:** Phase 2: Product Analytics Features. Funnel tracking critical for conversion optimization. Drop-off analysis identifies bottlenecks.

#### Acceptance Criteria
- [ ] Define funnel steps (event sequences)
- [ ] Track funnel progression
- [ ] Calculate conversion rates
- [ ] Identify drop-off points
- [ ] Time-to-convert metrics
- [ ] Funnel comparison (A/B cohorts)

#### Notes
- References: docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.2), apps/mobile/analytics/advanced/funnels.ts
- Dependencies: T-071 (Phase 1 complete)
- Effort: M (25-35 hours)
- Note: High value for product optimization.

---

#### [TASK-074-ANALYTICS] Phase 2: A/B Test Integration
- **Priority:** P1
- **Status:** Blocked
- **Created:** 2026-01-21
- **Context:** Phase 2: Product Analytics Features. A/B test integration enables experimentation. Statistical analysis for confidence intervals.

#### Acceptance Criteria
- [ ] Experiment registration
- [ ] Variant assignment (deterministic by user ID)
- [ ] Experiment tracking (exposure, goals)
- [ ] Statistical analysis
- [ ] Experiment state management

#### Notes
- References: docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.3), apps/mobile/analytics/advanced/abTests.ts
- Dependencies: T-071 (Phase 1 complete)
- Effort: M (25-35 hours)
- Note: Enables data-driven experimentation.

---

#### [TASK-075-ANALYTICS] Phase 2: Automatic Screen Tracking
- **Priority:** P1
- **Status:** Blocked
- **Created:** 2026-01-21
- **Context:** Phase 2: Product Analytics Features. Automatic screen tracking with React Navigation. Time on screen and flow analysis.

#### Acceptance Criteria
- [ ] Automatic screen view tracking
- [ ] Time on screen metrics
- [ ] Screen flow analysis (prev → current → next)
- [ ] Entry/exit screens identification
- [ ] Deep link tracking

#### Notes
- References: docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.4), apps/mobile/analytics/advanced/screenTracking.ts
- Dependencies: T-071 (Phase 1 complete)
- Effort: M (15-25 hours)
- Note: Enhances useAnalyticsNavigation hook.

---

### P2 - Medium Priority

_Note: P2 and P3 tasks are extensive. See original P2TODO.md and P3TODO.md files for complete list. Key P2 tasks include:_

#### [TASK-086] Test Organization: Separate Unit and Integration Tests
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-24
- **Context:** Current test files mix unit tests (storage layer) with integration tests (E2E API tests). Separating them improves maintainability, makes test purpose clear, and allows different test configurations (e.g., faster unit tests vs slower integration tests).

#### Acceptance Criteria
- [ ] Create `apps/api/__tests__/analytics.storage.test.ts` for storage unit tests
- [ ] Create `apps/api/__tests__/analytics.integration.test.ts` for E2E integration tests
- [ ] Move existing storage tests from `analytics.test.ts` to `analytics.storage.test.ts`
- [ ] Move existing E2E tests from `analytics.test.ts` to `analytics.integration.test.ts`
- [ ] Update test scripts to run both test files
- [ ] Verify all tests still pass after separation
- [ ] Document test organization pattern in `docs/testing/TEST_ORGANIZATION.md`

#### Notes
- References: apps/api/__tests__/analytics.test.ts, apps/api/__tests__/api.e2e.test.ts
- Effort: S (2-3 hours)
- Note: Follows pattern from api.e2e.test.ts separation

---

#### [TASK-087] Test Index and Location Mapping
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-24
- **Context:** As test files grow, it becomes hard to find which tests cover which functionality. A test index/map helps developers quickly locate relevant tests, understand test coverage, and identify gaps.

#### Acceptance Criteria
- [ ] Create `docs/testing/TEST_INDEX.md` documenting all test files
- [ ] For each test file, document:
  - What it tests (module/feature)
  - Test type (unit/integration/E2E)
  - Key test cases covered
  - Dependencies/mocks required
  - How to run it
- [ ] Create test location map showing:
  - Test file → Source file(s) being tested
  - Source file → Test file(s) covering it
- [ ] Add test index to main README or testing docs
- [ ] Keep index updated as tests are added/modified

#### Notes
- References: apps/api/__tests__/, packages/platform/analytics/__tests__/
- Effort: S (2-3 hours)
- Note: Can be automated with script to scan test files

---

#### [TASK-088] Test Mocking Infrastructure
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-24
- **Context:** Tests currently fail due to missing dependencies (express-rate-limit, etc.). Creating a mocking infrastructure allows tests to run independently, faster, and without external dependencies. Also needed for testing offline queueing and retry logic.

#### Acceptance Criteria
- [ ] Create `apps/api/__tests__/mocks/` directory structure
- [ ] Create mock for Express app setup (reusable across tests)
- [ ] Create mock for JWT authentication (generate test tokens)
- [ ] Create mock for storage layer (in-memory test storage)
- [ ] Create mock for HTTP requests (for client-side retry testing)
- [ ] Create mock for network conditions (offline/online simulation)
- [ ] Document mock usage patterns in `docs/testing/MOCKING_GUIDE.md`
- [ ] Update existing tests to use mocks where appropriate
- [ ] Add example test using mocks

#### Notes
- References: apps/api/__tests__/api.e2e.test.ts, packages/platform/analytics/transport.ts
- Effort: M (4-6 hours)
- Note: Enables testing offline queueing and retry logic

---

#### [TASK-089] Test Helper Utilities
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-24
- **Context:** Common test setup code is duplicated across test files (JWT token generation, server setup, test data creation). Test helpers reduce duplication, improve consistency, and make tests easier to write.

#### Acceptance Criteria
- [ ] Create `apps/api/__tests__/helpers/` directory
- [ ] Create `testServer.ts` helper for Express server setup/teardown
- [ ] Create `testAuth.ts` helper for JWT token generation
- [ ] Create `testData.ts` helper for creating test fixtures (users, events, etc.)
- [ ] Create `testStorage.ts` helper for storage setup/cleanup
- [ ] Create `testClient.ts` helper for making authenticated HTTP requests
- [ ] Document helper usage in `docs/testing/TEST_HELPERS.md`
- [ ] Refactor existing tests to use helpers
- [ ] Add TypeScript types for all helpers

#### Notes
- References: apps/api/__tests__/api.e2e.test.ts, apps/api/__tests__/analytics.test.ts
- Effort: M (4-6 hours)
- Note: Reduces test setup code by ~50%

---

#### [TASK-090] Testing Documentation: Test Requirements and Patterns
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-24
- **Context:** TASK-085 requirements were unclear about what's testable at API level vs client level. Comprehensive testing documentation clarifies test boundaries, patterns, and requirements, reducing confusion and improving test quality.

#### Acceptance Criteria
- [ ] Create `docs/testing/TEST_REQUIREMENTS.md` documenting:
  - What should be tested at API level (server-side)
  - What should be tested at client level (React Native)
  - What requires integration tests (client + server)
  - Test coverage requirements by module type
- [ ] Create `docs/testing/TEST_PATTERNS.md` documenting:
  - Unit test patterns (storage, utilities)
  - Integration test patterns (API endpoints)
  - E2E test patterns (full flows)
  - Mock usage patterns
  - Test data management
- [ ] Create `docs/testing/CLIENT_VS_SERVER_TESTING.md` explaining:
  - Offline queueing testing (client-side)
  - Retry logic testing (client-side)
  - API endpoint testing (server-side)
  - When to use each approach
- [ ] Update TASK-085 acceptance criteria to clarify test boundaries
- [ ] Add testing docs to main documentation index

#### Notes
- References: .repo/logs/TESTING_ISSUES_EXPLANATION.md, docs/analytics/PHASE_0_HANDOFF.md
- Effort: M (4-6 hours)
- Note: Prevents future confusion about test scope

---

#### [TASK-091] Test Architecture: Split into API, Client, and Integration Tests
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-24
- **Context:** Current testing approach mixes concerns - API tests try to test client-side features (offline queueing, retry logic) which are in React Native code. We need a clear three-tier test architecture: API tests (server-side), Client tests (React Native), and Integration tests (client + server together). This addresses the confusion in TASK-085 about what's testable where.

#### Acceptance Criteria
- [ ] **API Tests** (`apps/api/__tests__/`):
  - Test server-side functionality only (endpoints, storage, validation)
  - Use Node.js test environment
  - Mock external dependencies (databases, services)
  - Focus: Server behavior, request/response handling, data persistence
- [ ] **Client Tests** (`apps/mobile/__tests__/` or `packages/platform/analytics/__tests__/`):
  - Test React Native/mobile functionality (queue, transport, client logic)
  - Use React Native test environment (Jest + React Native Testing Library)
  - Mock network/HTTP layer
  - Focus: Offline queueing, retry logic, client-side state management
- [ ] **Integration Tests** (`apps/__tests__/integration/` or similar):
  - Test full client → server flows
  - Use both React Native and Node.js environments (or test harness)
  - Mock network conditions (offline, slow, failures)
  - Focus: End-to-end workflows, real-world scenarios
- [ ] Create test directory structure:
  ```
  apps/api/__tests__/          # API tests only
  apps/mobile/__tests__/        # Client tests only
  apps/__tests__/integration/   # Integration tests
  ```
- [ ] Migrate existing tests to appropriate category:
  - Move API endpoint tests to `apps/api/__tests__/`
  - Create client tests for queue/transport in `apps/mobile/__tests__/` or `packages/platform/analytics/__tests__/`
  - Create integration tests for full flows
- [ ] Update test scripts in `package.json`:
  - `test:api` - Run API tests only
  - `test:client` - Run client tests only
  - `test:integration` - Run integration tests only
  - `test:all` - Run all tests
- [ ] Document test architecture in `docs/testing/TEST_ARCHITECTURE.md`:
  - When to write API tests vs Client tests vs Integration tests
  - Test boundaries and responsibilities
  - How to run each test type
  - Examples of each test type
- [ ] Update TASK-085 acceptance criteria to reflect three-tier architecture
- [ ] Verify all tests pass in their new locations

#### Notes
- References: .repo/logs/TESTING_ISSUES_EXPLANATION.md, apps/api/__tests__/analytics.test.ts, packages/platform/analytics/queue.ts, packages/platform/analytics/transport.ts
- Dependencies: TASK-088 (mocking infrastructure), TASK-089 (test helpers)
- Effort: L (8-12 hours)
- Note: This is the foundational task that enables proper testing of offline queueing and retry logic. Should be done before or alongside TASK-085 completion.

---

#### [TASK-060] Planner Recurring Tasks
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Top competitors support recurring tasks and habit workflows. Planner currently focuses on one-off tasks and due dates. Recurrence improves long-term planning and retention.

#### Acceptance Criteria
- [ ] Add recurrence rules to task model (daily/weekly/monthly/custom)
- [ ] Allow next-occurrence scheduling and skip/snooze
- [ ] Show recurrence indicators in task list and details
- [ ] Add recurrence-aware filters (overdue vs recurring)
- [ ] Add tests for recurrence scheduling logic

#### Notes
- References: apps/mobile/screens/TaskDetailScreen.tsx, apps/mobile/screens/PlannerScreen.tsx, packages/contracts/schema.ts
- Effort: L

---

#### [TASK-061] Cross-Module Task Capture
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Planner should be a hub for action items across modules. Integrations like Notebook/Email/List → Planner are documented but not implemented. Cross-module capture differentiates AIOS from single-purpose task apps.

#### Acceptance Criteria
- [ ] Add "Send to Planner" actions in Notebook, Lists, Email, Calendar
- [ ] Link tasks back to source module item for traceability
- [ ] Auto-populate task metadata (source, due date, priority)
- [ ] Add cross-module tests for task creation flows
- [ ] Document new integration hooks in module guides

#### Notes
- References: apps/mobile/screens/NotebookScreen.tsx, apps/mobile/screens/ListsScreen.tsx, apps/mobile/screens/EmailScreen.tsx, apps/mobile/screens/CalendarScreen.tsx
- Effort: L

---

_For complete P2 and P3 task lists, refer to the original P2TODO.md and P3TODO.md files. All tasks have been preserved and can be migrated individually as needed._

---

## Additional Open Tasks from TODO.md

**Note:** The root `TODO.md` file contains 88 additional open tasks that need to be migrated. These include:

- **P0 Tasks (4):** Critical blocking issues
- **P1 Tasks (17):** High-priority features and improvements  
- **P2 Tasks (43):** Medium-priority features and enhancements
- **P3 Tasks (24):** Low-priority polish and tech debt

Key open tasks from TODO.md include:
- T-059: Task Dependency Management (P1)
- T-060: Planner Recurring Tasks (P2)
- T-061: Cross-Module Task Capture (P2)
- T-062: Calendar Recurrence Expansion (P1)
- T-063: Calendar Event Reminders (P1)
- T-064-T-091: Various Calendar, Lists, Email, and other module enhancements
- T-010-T-056: Testing, documentation, and quality improvements

**Action Required:** Review `TODO.md` and migrate remaining open tasks to this backlog as they become priorities. Many tasks are already represented in the backlog above, but TODO.md may contain additional context or updates.

---

## Adding New Tasks

When creating a new task:

1. Determine priority (P0-P3)
2. Use sequential task number: `[TASK-XXX]` (increment from highest existing number)
3. Add to appropriate priority section
4. Include clear context explaining WHY the task matters
5. Write specific, testable acceptance criteria

### Task Format

```markdown
### [TASK-XXX] Task Title
- **Priority:** P0 | P1 | P2 | P3
- **Status:** Pending
- **Created:** YYYY-MM-DD
- **Context:** Brief description of why this task matters

#### Acceptance Criteria
- [ ] Specific, measurable criterion 1
- [ ] Specific, measurable criterion 2

#### Notes
- Relevant context, links, or references
```
