# P1P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md - Repository Task List

Document Type: Workflow
Last Updated: 2026-01-21
Task Truth Source: **P1P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md**
Other Priority Files: `P0P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P2P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P3P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`

This file is the single source of truth for P1 tasks.
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

### 🔴 Critical Bugs

#### T-003A

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: COMPLETED
- **Context**:
  - Secondary navigation bar (oval, transparent) added to Command Center
  - Houses module-specific actions: Search, Attention Center, Command History
  - Need to replicate this pattern in other modules (Notebook, Lists, etc.)
  - Reduces navigation clutter and provides consistent UX
- **Acceptance Criteria**:
  - [x] Add secondary navigation to Command Center
  - [x] Add secondary navigation to Notebook module
  - [x] Add secondary navigation to Lists module
  - [x] Add secondary navigation to Planner module
  - [x] Add secondary navigation to Calendar module
  - [x] Test navigation consistency across modules
- **References**: apps/mobile/screens/CommandCenterScreen.tsx:494-559
- **Dependencies**: None
- **Effort**: M
- **Completion Date**: 2026-01-20
- **Implementation Details**:
  - NotebookScreen: AI Assist, Backup, Templates
  - ListsScreen: Share List, Templates, Statistics
  - PlannerScreen: AI Assist, Time Block, Dependencies
  - CalendarScreen: Sync, Export, Quick Add
  - All modules use scroll-based hide/show animation with shared values
  - 19 passing tests validating consistency and behavior

---

### 📋 Planner Module Expansion

#### T-058

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Planner AI Assist actions are listed but not implemented
  - Competing planners ship AI-assisted prioritization and task breakdown
  - This is a differentiator tied to the Command Center/AI narrative
- **Acceptance Criteria**:
  - [ ] Implement Planner AI Assist actions: priority suggestion, due date recommendation, task breakdown, dependency identification
  - [ ] Persist AI output into task fields or subtasks with user confirmation
  - [ ] Log AI Assist outcomes in History for auditability
  - [ ] Add empty/error states for AI Assist actions
  - [ ] Test AI Assist actions on iOS with sample tasks
- **References**:
  - apps/mobile/components/AIAssistSheet.tsx
  - docs/planning/MISSING_FEATURES.md
- **Dependencies**: None
- **Effort**: M

### T-059

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Task dependencies exist in the data model but UI/validation is incomplete
  - Competitive planners visualize dependency chains and block conflicting tasks
  - Dependency management unlocks critical-path planning
- **Acceptance Criteria**:
  - [ ] Add dependency selection UI in TaskDetailScreen
  - [ ] Validate cycles and blocked tasks before save
  - [ ] Surface dependency status in Planner list (blocked/ready)
  - [ ] Add dependency graph summary in task details
  - [ ] Add tests for dependency validation logic
- **References**:
  - apps/mobile/screens/TaskDetailScreen.tsx
  - apps/mobile/screens/PlannerScreen.tsx
  - docs/planning/MISSING_FEATURES.md
- **Dependencies**: None
- **Effort**: M

### 📅 Calendar Module Expansion

#### T-062

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Recurrence rules exist in the data model, but instances are not expanded
  - Competitors treat recurrence as a core capability
  - Missing recurrence logic blocks parity for everyday scheduling
- **Acceptance Criteria**:
  - [ ] Implement recurrence expansion logic for daily/weekly/monthly/custom rules
  - [ ] Support exception dates and overrides in recurrence series
  - [ ] Render recurring instances in day/week/month/agenda views
  - [ ] Add tests for recurrence expansion and exception handling
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - packages/contracts/schema.ts
  - docs/planning/MISSING_FEATURES.md
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

### T-063

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Calendar events have no reminders or notifications
  - Competitors rely on alerts for core utility
  - Lack of reminders reduces daily engagement
- **Acceptance Criteria**:
  - [ ] Add reminder configuration (none/5m/15m/1h/1d/custom) to event detail
  - [ ] Schedule local notifications for upcoming events with expo-notifications
  - [ ] Update/cancel notifications on event edits/deletes
  - [ ] Add tests for reminder scheduling and notification lifecycle
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - packages/contracts/schema.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

### 📋 Lists Module Expansion

#### T-076

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Shared lists and collaboration are table stakes in Todoist/MS To Do
  - Lists module lacks sharing, which blocks multi-user workflows
  - Collaboration is required to meet competitor parity
- **Acceptance Criteria**:
  - [ ] Add list sharing flow (invite via contacts/email)
  - [ ] Add roles/permissions (owner/editor/viewer) to list access
  - [ ] Sync shared list changes and show collaborator indicators
  - [ ] Add tests for permission enforcement and merge behavior
- **References**:
  - apps/mobile/screens/ListsScreen.tsx
  - apps/mobile/screens/ListEditorScreen.tsx
  - apps/mobile/models/types.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
  - docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- **Dependencies**: None
- **Effort**: L

### T-077

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Competitors support recurring tasks/lists
  - Lists module has due dates but no recurrence rules
  - Recurrence is critical for routine checklists
- **Acceptance Criteria**:
  - [ ] Add recurrence rules to list items (daily/weekly/monthly/custom)
  - [ ] Auto-create next occurrence on completion or schedule
  - [ ] Show recurrence indicators and filters in Lists UI
  - [ ] Add tests for recurrence scheduling logic
- **References**:
  - apps/mobile/models/types.ts
  - apps/mobile/screens/ListEditorScreen.tsx
  - apps/mobile/storage/database.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
  - docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- **Dependencies**: None
- **Effort**: M

### T-078

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Top list apps include reminders (time and location)
  - List items support due dates but no notifications
  - Reminders improve daily engagement and parity
- **Acceptance Criteria**:
  - [ ] Add reminder configuration (none/relative/custom) to list items
  - [ ] Schedule/update/cancel local notifications for list reminders
  - [ ] Add location-based reminder support for list items
  - [ ] Add tests for reminder scheduling and notification lifecycle
- **References**:
  - apps/mobile/models/types.ts
  - apps/mobile/screens/ListEditorScreen.tsx
  - docs/analysis/COMPETITIVE_ANALYSIS.md
  - docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- **Dependencies**: None
- **Effort**: L

### T-079

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Competitors support subtasks; Lists items are flat today
  - Nested checklists enable complex workflows and parity
  - Hierarchy improves clarity for multi-step lists
- **Acceptance Criteria**:
  - [ ] Add nested child items to ListItem schema
  - [ ] Build UI to indent/expand/collapse subitems
  - [ ] Roll up completion state based on child items
  - [ ] Add tests for nested item rendering and completion logic
- **References**:
  - apps/mobile/models/types.ts
  - apps/mobile/screens/ListEditorScreen.tsx
  - docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- **Dependencies**: None
- **Effort**: M

### 📧 Email Module Expansion

#### T-071

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Email module is UI-only for thread management; no real provider integration
  - Competitors require Gmail/Outlook integration for send/receive parity
  - Provider sync is the critical gap blocking production viability
- **Acceptance Criteria**:
  - [ ] Add OAuth flows for Gmail and Microsoft Graph (secure token storage)
  - [ ] Implement provider sync for inbox/sent/archives/labels into local storage
  - [ ] Support multiple connected accounts with unified inbox view
  - [ ] Add provider health/error states and retry workflows
  - [ ] Add integration tests for provider sync with mocked APIs
- **References**:
  - MODULE_DETAILS.md
  - docs/analysis/CODE_QUALITY_ANALYSIS.md
  - apps/mobile/screens/EmailScreen.tsx
  - apps/mobile/storage/database.ts
- **Dependencies**: None
- **Effort**: L

### T-072

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Compose/send/reply/forward workflows are not implemented
  - Competitors ship full composition with templates, signatures, and scheduling
  - Differentiator: compose flows should integrate with AI Assist and other modules
- **Acceptance Criteria**:
  - [ ] Build compose UI with reply/forward, CC/BCC, and draft autosave
  - [ ] Add rich-text editor with attachment upload/preview
  - [ ] Support signatures, templates, and scheduled send
  - [ ] Persist drafts and sent messages to storage with thread linkage
  - [ ] Add tests for draft lifecycle and composition validation
- **References**:
  - MODULE_DETAILS.md
  - docs/analysis/CODE_QUALITY_ANALYSIS.md
  - apps/mobile/screens/EmailScreen.tsx
  - apps/mobile/components/AIAssistSheet.tsx
- **Dependencies**: T-071
- **Effort**: L

### T-007

- **Priority**: P1
- **UPDATE: NEW PRIORITY STATUS**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: COMPLETED
- **Context**:
  - Recommendation engine exists with cross-module analysis
  - Only CommandCenter shows recommendations
  - No manual refresh, history, or preference settings
- **Acceptance Criteria**:
  - [x] Add "Refresh Recommendations" button in CommandCenter
  - [x] Add recommendation settings in AIPreferences screen
  - [x] Show evidence/reasoning in recommendation cards
  - [x] Wire up RecommendationHistoryScreen to navigation on iOS
- **References**: apps/mobile/lib/recommendationEngine.ts, apps/mobile/screens/RecommendationHistoryScreen.tsx
- **Dependencies**: None
- **Effort**: M
- **Completion Date**: 2026-01-20
- **Implementation Details**:
  - Added recommendation preference toggles for visibility, auto-refresh, and card evidence display.
  - Exposed manual refresh button and disabled state handling in Command Center footer.
  - Added reasoning and evidence preview rows on recommendation cards.
  - Confirmed history navigation stays reachable from Command Center secondary nav.
- **Note**: Platform-agnostic logic. AGENT can verify Android/Web compatibility in follow-up.

### T-057

- **Priority**: P1
- **UPDATE: NEW PRIORITY STATUS**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Current module-selection onboarding removed (T-009 reverted)
  - Future onboarding should focus on AI personality and behavior preferences
  - Goal: Understand how users want AIOS to act, not which modules they want
  - This is about configuring the AI assistant's behavior, not feature selection
- **Acceptance Criteria**:
  - [ ] Design onboarding flow asking about AI behavior preferences
  - [ ] Questions about: communication style (formal/casual), proactivity level (low/high), notification preferences
  - [ ] Questions about: learning style, decision support level, automation preferences
  - [ ] Store preferences in user profile/context engine
  - [ ] Use preferences to configure AI behavior across all modules
  - [ ] Skip option that uses sensible defaults
- **References**:
  - Previous onboarding: apps/mobile/screens/OnboardingWelcomeScreen.tsx (removed)
  - AI preferences: apps/mobile/screens/AIPreferencesScreen.tsx
  - Context engine: apps/mobile/lib/contextEngine.ts
- **Dependencies**: None
- **Effort**: L
- **Note**: This is a complete redesign of onboarding from module selection to AI personality configuration. Platform-agnostic questionnaire. AGENT can verify Android/Web compatibility in follow-up.

---

### T-016

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P1
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Only app-level ErrorBoundary exists
  - Screen crashes affect entire app instead of just that screen
  - No recovery options for users
- **Acceptance Criteria**:
  - [ ] Wrap each Stack.Screen with ErrorBoundary
  - [ ] Add recovery options (reload screen, go back, go home)
  - [ ] Test error boundary behavior with intentional errors on iOS
  - [ ] Add error logging for debugging
- **References**: apps/mobile/components/ErrorBoundary.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic error handling. AGENT can verify Android/Web compatibility in follow-up.

### T-017

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Screens don't show loading indicators during data load
  - Users see blank screens or stale data
  - Poor perceived performance
- **Acceptance Criteria**:
  - [ ] Phase 1: Create LoadingState component with skeleton variants
  - [ ] Phase 2: Add loading states to high-traffic screens (CommandCenter, Calendar, Notebook, Planner)
  - [ ] Phase 3: Add loading states to remaining module screens
  - [ ] Phase 4: Implement pull-to-refresh on list-based screens
  - [ ] Phase 5: Test loading states and measure performance improvement on iOS
- **References**: apps/mobile/screens/*.tsx
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic UI patterns. AGENT can verify Android/Web compatibility in follow-up.

### T-018

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - App doesn't show offline status or handle network errors
  - Silent failures when network unavailable
  - Users don't know why actions fail
- **Acceptance Criteria**:
  - [ ] Add network status indicator
  - [ ] Show offline mode banner
  - [ ] Cache data for offline viewing
  - [ ] Test offline behavior for all modules on iOS
- **References**: All network-dependent code
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic network handling. AGENT can verify Android/Web compatibility in follow-up.

### T-072 (Instance 2)

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 2: Product Analytics Features
  - Group analytics enables B2B company-level tracking
  - High business value for product teams
- **Acceptance Criteria**:
  - [ ] Group identification (company, team, workspace)
  - [ ] Group properties (name, plan, size, industry)
  - [ ] User-to-group associations (multi-group support)
  - [ ] Group event tracking
  - [ ] Backend integration for group data
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.1)
  - apps/mobile/analytics/advanced/groups.ts
- **Dependencies**: T-071 (Phase 1 complete)
- **Effort**: M (25-35 hours)
- **Note**: Enables B2B analytics use cases.

### T-073 (Instance 2)

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 2: Product Analytics Features
  - Funnel tracking critical for conversion optimization
  - Drop-off analysis identifies bottlenecks
- **Acceptance Criteria**:
  - [ ] Define funnel steps (event sequences)
  - [ ] Track funnel progression
  - [ ] Calculate conversion rates
  - [ ] Identify drop-off points
  - [ ] Time-to-convert metrics
  - [ ] Funnel comparison (A/B cohorts)
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.2)
  - apps/mobile/analytics/advanced/funnels.ts
- **Dependencies**: T-071 (Phase 1 complete)
- **Effort**: M (25-35 hours)
- **Note**: High value for product optimization.

### T-074 (Instance 2)

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 2: Product Analytics Features
  - A/B test integration enables experimentation
  - Statistical analysis for confidence intervals
- **Acceptance Criteria**:
  - [ ] Experiment registration
  - [ ] Variant assignment (deterministic by user ID)
  - [ ] Experiment tracking (exposure, goals)
  - [ ] Statistical analysis
  - [ ] Experiment state management
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.3)
  - apps/mobile/analytics/advanced/abTests.ts
- **Dependencies**: T-071 (Phase 1 complete)
- **Effort**: M (25-35 hours)
- **Note**: Enables data-driven experimentation.

### T-075 (Instance 2)

- **Priority**: P1
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 2: Product Analytics Features
  - Automatic screen tracking with React Navigation
  - Time on screen and flow analysis
- **Acceptance Criteria**:
  - [ ] Automatic screen view tracking
  - [ ] Time on screen metrics
  - [ ] Screen flow analysis (prev → current → next)
  - [ ] Entry/exit screens identification
  - [ ] Deep link tracking
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.4)
  - apps/mobile/analytics/advanced/screenTracking.ts
- **Dependencies**: T-071 (Phase 1 complete)
- **Effort**: M (15-25 hours)
- **Note**: Enhances useAnalyticsNavigation hook.


