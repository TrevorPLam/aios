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
