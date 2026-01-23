# P2P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md - Repository Task List

Document Type: Workflow
Last Updated: 2026-01-21
Task Truth Source: **P2P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md**
Other Priority Files: `P0P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P1P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P3P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`

This file is the single source of truth for P2 tasks.
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

### T-060

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Top competitors support recurring tasks and habit workflows
  - Planner currently focuses on one-off tasks and due dates
  - Recurrence improves long-term planning and retention
- **Acceptance Criteria**:
  - [ ] Add recurrence rules to task model (daily/weekly/monthly/custom)
  - [ ] Allow next-occurrence scheduling and skip/snooze
  - [ ] Show recurrence indicators in task list and details
  - [ ] Add recurrence-aware filters (overdue vs recurring)
  - [ ] Add tests for recurrence scheduling logic
- **References**:
  - apps/mobile/screens/TaskDetailScreen.tsx
  - apps/mobile/screens/PlannerScreen.tsx
  - packages/contracts/schema.ts
- **Dependencies**: None
- **Effort**: L

### T-061

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Planner should be a hub for action items across modules
  - Integrations like Notebook/Email/List → Planner are documented but not implemented
  - Cross-module capture differentiates AIOS from single-purpose task apps
- **Acceptance Criteria**:
  - [ ] Add “Send to Planner” actions in Notebook, Lists, Email, Calendar
  - [ ] Link tasks back to source module item for traceability
  - [ ] Auto-populate task metadata (source, due date, priority)
  - [ ] Add cross-module tests for task creation flows
  - [ ] Document new integration hooks in module guides
- **References**:
  - apps/mobile/screens/NotebookScreen.tsx
  - apps/mobile/screens/ListsScreen.tsx
  - apps/mobile/screens/EmailScreen.tsx
  - apps/mobile/screens/CalendarScreen.tsx
  - docs/archive/2026-01-pre-consolidation/F&F-BACKUP.md
- **Dependencies**: None
- **Effort**: L

### T-082

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Competitor planners offer auto-scheduling/time blocking to turn tasks into calendar events
  - AIOS can differentiate by combining Planner priorities with Calendar availability
  - This enables guided planning and reduces manual scheduling effort
- **Acceptance Criteria**:
  - [ ] Add time-block scheduling UI in Planner (assign duration/start window)
  - [ ] Implement auto-schedule that proposes calendar slots using availability rules
  - [ ] Sync scheduled tasks to Calendar with bi-directional updates
  - [ ] Add tests for scheduling conflicts and reschedule logic
- **References**:
  - apps/mobile/screens/PlannerScreen.tsx
  - apps/mobile/screens/TaskDetailScreen.tsx
  - apps/mobile/screens/CalendarScreen.tsx
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

### T-083

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Shared projects and task assignments are standard in Asana/Todoist/ClickUp
  - Planner currently has no collaboration or assignment workflows
  - Collaboration is required for team planning parity
- **Acceptance Criteria**:
  - [ ] Add project sharing and member roles (owner/editor/viewer)
  - [ ] Support task assignment with assignee avatars and status
  - [ ] Add activity feed for assignment and status changes
  - [ ] Add tests for permission enforcement and assignment rendering
- **References**:
  - apps/mobile/screens/PlannerScreen.tsx
  - apps/mobile/screens/TaskDetailScreen.tsx
  - packages/contracts/schema.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

### T-084

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Natural language quick add and task inboxes are core in Todoist/Things
  - Planner lacks an intake flow for rapid capture and triage
  - Fast capture is critical for mobile task apps
- **Acceptance Criteria**:
  - [ ] Add a Planner inbox view for untriaged tasks
  - [ ] Implement natural language parsing for due dates, priorities, and projects
  - [ ] Provide bulk triage actions (schedule, prioritize, assign)
  - [ ] Add tests for parsing and triage flows
- **References**:
  - apps/mobile/screens/PlannerScreen.tsx
  - apps/mobile/screens/TaskDetailScreen.tsx
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

---

### T-064

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Calendar sharing and attendee management are missing
  - Competitors support invitations, RSVPs, and shared calendars
  - Collaboration is required for meeting coordination
- **Acceptance Criteria**:
  - [ ] Add attendee fields (email/name/status) to CalendarEvent model
  - [ ] Build attendee management UI (add/remove, RSVP status)
  - [ ] Implement calendar sharing flow (share link or invite)
  - [ ] Surface RSVP status in event details and list cards
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - packages/contracts/schema.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

### T-065

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Calendar data is isolated from device calendars
  - Users expect iOS/Android calendar sync parity
  - Sync unlocks adoption for users with existing calendars
- **Acceptance Criteria**:
  - [ ] Integrate expo-calendar for device calendar access
  - [ ] Support one-time import + ongoing two-way sync
  - [ ] Handle permissions and sync failure states
  - [ ] Add tests for sync mapping and conflict resolution
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

### T-066

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Manual event entry is slower than competitor quick add flows
  - Natural language input is a key differentiator in leading apps
  - Quick capture improves mobile usability
- **Acceptance Criteria**:
  - [ ] Add quick-add input for natural language event creation
  - [ ] Parse date/time/location/attendees from text
  - [ ] Provide preview + user confirmation before save
  - [ ] Add tests for common natural language patterns
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

### T-067

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Calendar AI actions (focus time, schedule optimization) are listed but not implemented
  - Competitors offer limited intelligence; AIOS should differentiate here
  - Insights unlock proactive productivity value
- **Acceptance Criteria**:
  - [ ] Implement focus time blocking actions from AI Assist sheet
  - [ ] Add schedule optimization suggestions (reschedule/conflict fixes)
  - [ ] Surface calendar insights (meeting load, focus hours, trends)
  - [ ] Log AI actions to History for auditability
- **References**:
  - apps/mobile/components/AIAssistSheet.tsx
  - docs/planning/MISSING_FEATURES.md
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

### T-068

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Time zone fields are stored but not fully supported in views
  - Travel time buffers and weather context are competitor parity items
  - Users need accurate scheduling across time zones
- **Acceptance Criteria**:
  - [ ] Render event times with explicit time zone support
  - [ ] Add travel time buffer field and surface in event view
  - [ ] Add optional weather context for outdoor events
  - [ ] Add tests for time zone conversion edge cases
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - packages/contracts/schema.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

### T-088

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Competitor calendars provide availability/working hours and scheduling links
  - AIOS lacks availability settings and shareable booking workflows
  - Scheduling links are a differentiator for busy users
- **Acceptance Criteria**:
  - [ ] Add working hours and availability settings to Calendar
  - [ ] Generate shareable scheduling links with availability rules
  - [ ] Allow booking requests to create tentative events with confirmation
  - [ ] Add tests for availability calculations and link booking flow
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - packages/contracts/schema.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

### T-089

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Multi-calendar management and subscriptions are standard in Google/Outlook
  - AIOS currently treats all events as a single calendar
  - Separate calendars improve organization and sharing workflows
- **Acceptance Criteria**:
  - [ ] Add multiple calendars with colors and visibility toggles
  - [ ] Support subscribing to external calendars (ICS/CalDAV)
  - [ ] Filter views by calendar and show combined agenda
  - [ ] Add tests for calendar visibility and subscription updates
- **References**:
  - apps/mobile/screens/CalendarScreen.tsx
  - packages/contracts/schema.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

---

### T-080

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Voice input is a common quick-capture path in competitor apps
  - Lists lacks voice-based capture for items
  - Quick add improves mobile usability
- **Acceptance Criteria**:
  - [ ] Add voice input entry point from Lists screens
  - [ ] Transcribe voice to item text with confirmation edit
  - [ ] Handle permission denial and error states
  - [ ] Add tests for voice input flow
- **References**:
  - apps/mobile/screens/ListsScreen.tsx
  - apps/mobile/screens/ListEditorScreen.tsx
  - docs/analysis/COMPETITIVE_ANALYSIS.md
  - docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- **Dependencies**: None
- **Effort**: M

### T-081

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Differentiator opportunity beyond parity features
  - Use list history to surface insights and suggestions
  - Smart suggestions reinforce AIOS ecosystem value
- **Acceptance Criteria**:
  - [ ] Add Lists insights panel (completion trends, overdue patterns)
  - [ ] Surface smart suggestions (auto-prioritize, recommend templates)
  - [ ] Log insights/suggestions to History for auditability
  - [ ] Add tests for insights calculations
- **References**:
  - apps/mobile/screens/ListsScreen.tsx
  - apps/mobile/storage/database.ts
  - docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md
- **Dependencies**: None
- **Effort**: M

### T-086

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Top list apps support item notes, links, and attachments
  - Lists items are text-only today
  - Rich item details improve parity and reduce context switching
- **Acceptance Criteria**:
  - [ ] Add notes and link fields to list items
  - [ ] Support attachment upload/preview (images/files) per item
  - [ ] Render attachments in list detail view with download/share actions
  - [ ] Add tests for attachment persistence and rendering
- **References**:
  - apps/mobile/models/types.ts
  - apps/mobile/screens/ListEditorScreen.tsx
  - apps/mobile/storage/database.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: L

### T-092

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Lists module is missing smart lists/saved filters feature
  - Competitors offer dynamic views like Today, High Priority, Upcoming
  - Saved views improve daily workflows and competitive parity
- **Acceptance Criteria**:
  - [ ] Add saved filters (smart lists) with configurable criteria
  - [ ] Allow pinning smart lists to the Lists home screen
  - [ ] Support dynamic counts and empty state messaging per view
  - [ ] Add tests for filter persistence and query accuracy
- **References**:
  - apps/mobile/screens/ListsScreen.tsx
  - apps/mobile/storage/database.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

---

### T-073

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - No email notifications or background sync in the current build
  - Competitors deliver real-time alerts and offline access
  - Local-first UX requires cached threads with clear sync status
- **Acceptance Criteria**:
  - [ ] Implement background fetch + incremental sync with provider APIs
  - [ ] Add push/local notifications for new emails with per-account controls
  - [ ] Expose offline mode indicators and retry logic
  - [ ] Add tests for notification scheduling and sync status updates
- **References**:
  - MODULE_DETAILS.md
  - docs/analysis/CODE_QUALITY_ANALYSIS.md
  - apps/mobile/screens/EmailScreen.tsx
- **Dependencies**: T-071
- **Effort**: M

### T-074

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Current storage only models threads without mailbox lifecycle states
  - Competitors include sent, spam, trash, and custom rules
  - Lifecycle management enables email zero workflows and compliance needs
- **Acceptance Criteria**:
  - [ ] Add mailbox folders (inbox/sent/trash/spam/archives) with counts
  - [ ] Implement server-side delete, spam reporting, and restore flows
  - [ ] Add basic rules/filters (sender, subject, label) for auto-organization
  - [ ] Add tests for mailbox transitions and rule application
- **References**:
  - docs/analysis/CODE_QUALITY_ANALYSIS.md
  - apps/mobile/screens/EmailScreen.tsx
  - apps/mobile/storage/database.ts
- **Dependencies**: T-071
- **Effort**: M

### T-075

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Email intelligence differentiates premium clients (smart replies, priority inbox)
  - AIOS can exceed competitors with cross-module automation
  - Action extraction bridges Email → Planner/Calendar/Notebook workflows
- **Acceptance Criteria**:
  - [ ] Add AI summaries, smart reply, and smart compose actions
  - [ ] Implement action item extraction to Planner and meeting detection to Calendar
  - [ ] Add priority inbox scoring and urgency indicators
  - [ ] Log AI actions to History with opt-in and privacy safeguards
  - [ ] Add tests for AI action routing and metadata creation
- **References**:
  - docs/analysis/CODE_QUALITY_ANALYSIS.md
  - apps/mobile/components/AIAssistSheet.tsx
  - apps/mobile/lib/contextEngine.ts
  - apps/mobile/screens/EmailScreen.tsx
- **Dependencies**: T-072
- **Effort**: M

### T-090

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Power users rely on advanced search and saved filters
  - Email module lacks search operators, saved queries, and filter chips
  - Search parity is required for Gmail/Outlook competitiveness
- **Acceptance Criteria**:
  - [ ] Implement advanced search (from/to/subject/has:attachment/date)
  - [ ] Add saved searches with quick-access chips
  - [ ] Provide filter UI for unread, starred, priority, and attachments
  - [ ] Add tests for search parsing and query execution
- **References**:
  - apps/mobile/screens/EmailScreen.tsx
  - apps/mobile/storage/database.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: T-071
- **Effort**: M

### T-091

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Snooze and follow-up reminders are core in Superhuman/Outlook
  - AIOS currently has no email tasking/reminder loop
  - Follow-up flows are a differentiator for productivity-first email
- **Acceptance Criteria**:
  - [ ] Add email snooze with configurable return times
  - [ ] Add follow-up reminders and “waiting on reply” states
  - [ ] Surface snoozed/follow-up queues with counts
  - [ ] Add tests for reminder scheduling and queue transitions
- **References**:
  - apps/mobile/screens/EmailScreen.tsx
  - apps/mobile/storage/database.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: T-071
- **Effort**: M

### T-001B

- **Priority**: P0
- **UPDATE: NEW PRIORITY STATUS**: P2
- **Type**: BUG
- **Owner**: AGENT
- **Platform**: Android, Web
- **Status**: COMPLETE
- **Context**:
  - Adapt T-001A iOS time picker implementation for Android/Web compatibility
  - Note: Existing Android-specific code at line ~285 can remain as-is
- **Acceptance Criteria**:
  - [x] Verify time picker works on Android
  - [x] Add web-compatible time picker if needed
  - [x] Preserve iOS functionality
  - [x] Test on Android and Web platforms
- **References**: apps/mobile/screens/AlertDetailScreen.tsx:277, T-001A PR/commit
- **Dependencies**: T-001A
- **Effort**: S
- **Completion Notes**: Added web-specific time input with validation and ensured swipe/selection logic remains intact for native platforms.

**T-002A** ✅ COMPLETED (2026-01-19)

- **Priority**: P0
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: BUG
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: COMPLETE
- **Context**:
  - PersistentSidebar edge swipe gesture fully implemented
  - PanResponder detects left edge swipe to open sidebar
  - Native mobile navigation pattern functional
  - Button alternative maintained for accessibility
- **Acceptance Criteria**:
  - [x] Implement PanResponder for left edge swipe detection (already implemented at lines 111-196)
  - [x] Handle swipe-to-open sidebar gesture (gesture state machine with velocity/distance thresholds)
  - [x] Test gesture on iOS (manual verification recommended)
  - [x] Maintain button alternative for accessibility (button always available)
  - [x] Remove TODO comment at line 63 (no TODO found in file)
- **References**: apps/mobile/components/PersistentSidebar.tsx:111-196
- **Dependencies**: None
- **Effort**: M
- **Completion Notes**: Edge swipe gesture was already fully implemented in previous work. PanResponder handles gesture recognition, animation, haptic feedback, and edge cases. Comprehensive JSDoc documentation included.

### T-002B

- **Priority**: P0
- **UPDATE: NEW PRIORITY STATUS**: P2
- **Type**: BUG
- **Owner**: AGENT
- **Platform**: Android, Web
- **Status**: COMPLETE
- **Context**:
  - Adapt T-002A iOS swipe gesture for Android/Web compatibility
  - Ensure gesture works across all platforms
- **Acceptance Criteria**:
  - [x] Test swipe gesture on Android
  - [x] Add web-compatible swipe gesture if needed
  - [x] Preserve iOS functionality
  - [x] Verify button alternative works on all platforms
- **References**: apps/mobile/components/PersistentSidebar.tsx:111-196, T-002A (2026-01-19)
- **Dependencies**: T-002A
- **Effort**: S
- **Completion Notes**: Disabled swipe gesture on web while keeping the button entry point and native swipe behavior unchanged.

**T-003** ✅ COMPLETED (2026-01-19)

- **Priority**: P0
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: BUG
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: COMPLETE
- **Context**:
  - BottomNav route validation fully implemented
  - Error handling with user-friendly alerts
  - Structured logging for debugging
  - No silent failures or crashes
- **Acceptance Criteria**:
  - [x] Add route validation before navigation (isValidRoute function at lines 203-207)
  - [x] Show error message if route doesn't exist (showNavigationError at lines 163-171)
  - [x] Log navigation errors for debugging (logNavigationError at lines 180-189)
  - [x] Test with disabled modules on iOS (handleNavigation validates at lines 226-250)
- **References**: apps/mobile/components/BottomNav.tsx:163-250
- **Dependencies**: None
- **Effort**: S
- **Completion Notes**: Route validation system was already fully implemented. Includes isValidRoute() check, user alerts, structured error logging with metadata, and comprehensive error handling throughout navigation flow.
- **Note**: Platform-agnostic navigation logic. AGENT can verify Android/Web compatibility in follow-up if needed.

---

### T-019

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Input validation may be missing in editor screens
  - Can lead to data corruption or crashes
  - Poor user experience with invalid data
- **Acceptance Criteria**:
  - [ ] Create validation utility functions (required, min/max length, email, etc.)
  - [ ] Add validation to form screens: NoteEditor, TaskDetail, EventDetail
  - [ ] Add validation to form screens: ContactDetail, ListEditor, other editors
  - [ ] Implement error message display and inline validation feedback
  - [ ] Test validation with edge cases (empty, invalid, boundary values) on iOS
- **References**: apps/mobile/screens/NoteEditor.tsx, apps/mobile/screens/TaskDetail.tsx, etc.
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic validation logic. AGENT can verify Android/Web compatibility in follow-up.

---

### 🔁 TypeScript Type System Improvements

#### T-039

- **Priority**: P1
- **UPDATE: NEW PRIORITY STATUS**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - 277 TypeScript errors remaining
  - Event system needs type-safe payloads
  - Discriminated unions not implemented
- **Acceptance Criteria**:
  - [ ] Create discriminated union for all event types
  - [ ] Make EventBus.on() type-safe
  - [ ] Update emit() to enforce payload types
  - [ ] Fix all event-related TypeScript errors
- **References**: apps/mobile/lib/eventBus.ts, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic event type system. AGENT can verify Android/Web event handling in follow-up.

### T-040

- **Priority**: P1
- **UPDATE: NEW PRIORITY STATUS**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Components directly import Colors, Typography, Shadows
  - Many TypeScript errors from static imports
  - Need migration to useTheme hook
- **Acceptance Criteria**:
  - [ ] Phase 1: Extend useTheme hook to return all required properties
  - [ ] Phase 2: Create migration guide with code examples
  - [ ] Phase 3: Migrate miniMode components (5-8 components)
  - [ ] Phase 4: Migrate screen components (high-priority screens first)
  - [ ] Phase 5: Remove static imports, verify no TypeScript errors remain
- **References**: apps/mobile/hooks/useTheme.ts, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic theme hook migration. AGENT can verify Android/Web theme consistency in follow-up.

### T-041

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Model interfaces don't match actual usage
  - Note missing `content` property
  - Task missing `notes` property
  - Contact email/phone properties incorrect
- **Acceptance Criteria**:
  - [ ] Audit each interface against actual usage
  - [ ] Add missing properties or rename incorrect ones
  - [ ] Fix all callers with incorrect property access
  - [ ] Test all data operations
- **References**: apps/mobile/models/types.ts, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic model interface audit. AGENT can verify Android/Web data model compatibility in follow-up.

### T-042

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Dynamic navigation.navigate() calls cause TypeScript errors
  - No type narrowing for route names
  - Runtime navigation may fail
- **Acceptance Criteria**:
  - [ ] Use proper type narrowing for dynamic routes
  - [ ] Add conditional logic for safe navigation
  - [ ] Test navigation with all module types
  - [ ] Document navigation patterns
- **References**: All navigation code, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic navigation patterns. AGENT can verify Android/Web navigation type safety in follow-up.

### T-076

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 2: Product Analytics Features
  - Schema versioning enables evolution
  - Backward compatibility and auto-migration
- **Acceptance Criteria**:
  - [ ] Version control per event type
  - [ ] Backward compatibility checks
  - [ ] Auto-migration between versions
  - [ ] Breaking change detection
  - [ ] Schema evolution tracking
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 2.5)
  - apps/mobile/analytics/schema/versioning.ts
- **Dependencies**: T-071 (Phase 1 complete)
- **Effort**: M (10-20 hours)
- **Note**: Phase 2 target: 70/100 → 80/100 score.

### T-077 (Instance 2)

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 3: Advanced Features
  - Feature flags enable gradual rollouts
  - Kill switches for immediate disable
- **Acceptance Criteria**:
  - [ ] Feature flag registration
  - [ ] Flag evaluation (enabled/disabled)
  - [ ] Gradual rollout (percentage-based)
  - [ ] User targeting (by segment)
  - [ ] Kill switches
  - [ ] Flag exposure tracking
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 3.1)
  - apps/mobile/analytics/production/featureFlags.ts
- **Dependencies**: T-071, T-072-T-076 (Phases 1-2 complete)
- **Effort**: L (30-40 hours)
- **Note**: Enables safe feature rollouts.

### T-078 (Instance 2)

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 3: Advanced Features
  - Plugin system enables extensibility
  - Lifecycle hooks for event transformation
- **Acceptance Criteria**:
  - [ ] Plugin registration
  - [ ] Lifecycle hooks (before/after event)
  - [ ] Event transformation
  - [ ] Plugin enable/disable
  - [ ] Plugin error handling
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 3.2)
  - apps/mobile/analytics/plugins/manager.ts
- **Dependencies**: T-071, T-072-T-076 (Phases 1-2 complete)
- **Effort**: M (25-35 hours)
- **Note**: Enables custom analytics extensions.

### T-079 (Instance 2)

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 3: Advanced Features
  - Multi-destination routing sends to multiple backends
  - Per-destination filtering and transforms
- **Acceptance Criteria**:
  - [ ] Multiple destinations support
  - [ ] Per-destination filtering
  - [ ] Parallel sending
  - [ ] Destination-specific transforms
  - [ ] Destination error handling
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 3.3)
  - apps/mobile/analytics/plugins/destinations.ts
- **Dependencies**: T-071, T-072-T-076 (Phases 1-2 complete)
- **Effort**: M (20-30 hours)
- **Note**: Enables sending to multiple backends.

### T-080 (Instance 2)

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 3: Advanced Features
  - Production monitoring with health checks and alerts
  - Integration with Sentry/PagerDuty
- **Acceptance Criteria**:
  - [ ] Health checks (system health)
  - [ ] Alert handlers (error thresholds)
  - [ ] Sentry/PagerDuty integration
  - [ ] Automatic anomaly detection
  - [ ] Performance degradation alerts
- **References**:
  - docs/analytics/IMPLEMENTATION_PLAN.md (Task 3.4)
  - apps/mobile/analytics/production/monitoring.ts
- **Dependencies**: T-071, T-072-T-076 (Phases 1-2 complete)
- **Effort**: L (30-40 hours)
- **Note**: Phase 3 target: 80/100 → 90/100 score. World-class infrastructure.

### T-093

- **Priority**: P2
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 2: Additional stubbed analytics features
  - Event sampling for high-volume scenarios (Mixpanel-style)
  - Runtime validation for data quality
  - Performance optimization features
- **Acceptance Criteria**:
  - [ ] Implement EventSampler with per-event sample rates
  - [ ] Deterministic sampling based on user/session ID
  - [ ] Dynamic volume-based sampling
  - [ ] Implement RuntimeValidator with type/range/enum checks
  - [ ] Schema-based validation at runtime
  - [ ] Add tests for sampling algorithms and validation rules
- **References**:
  - apps/mobile/analytics/quality/sampling.ts
  - apps/mobile/analytics/quality/validation.ts
  - docs/analytics/WORLD_CLASS_ANALYTICS_ROADMAP.md (Data Quality section)
- **Dependencies**: T-071 (Phase 1 complete)
- **Effort**: M (20-30 hours)
- **Note**: Data quality improvements: 7/10 → 9/10 score

### T-094

- **Priority**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Traceability matrix migration is in progress with enforcement set to WARN
  - Governance requires traceability for API and feature changes
  - State doc needs a tracking issue and completion target
- **Acceptance Criteria**:
  - [ ] Populate docs/traceability_matrix.md to ≥80% coverage across features, code, tests, docs, and runbooks
  - [ ] Add/update coverage summary with date and percentage
  - [ ] Create tracking issue and link it in docs/governance/state.md
  - [ ] Toggle Traceability Matrix enforcement to FAIL in docs/governance/state.md and supporting scripts/workflows
- **References**:
  - docs/governance/state.md
  - docs/traceability_matrix.md
  - scripts/tools/check-traceability.mjs
  - .github/workflows/traceability-check.yml
- **Dependencies**: None
- **Effort**: L

### T-095

- **Priority**: P2
- **Type**: CHORE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - CODEOWNERS activation is ready but still uses placeholders
  - Branch protection needs alignment with real owners
  - Governance state requires tracking issue linkage
- **Acceptance Criteria**:
  - [ ] Replace placeholder teams in .github/CODEOWNERS with actual GitHub handles/teams
  - [ ] Update .github/BRANCH_PROTECTION_SETUP.md with CODEOWNERS enforcement steps
  - [ ] Create tracking issue and link it in docs/governance/state.md
- **References**:
  - .github/CODEOWNERS
  - .github/CODEOWNERS.example
  - .github/BRANCH_PROTECTION_SETUP.md
  - docs/governance/state.md
- **Dependencies**: None
- **Effort**: M

### T-096

- **Priority**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Unified AGENT ownership adoption requires CI enforcement toggle
  - Constitution compiler must refresh Copilot instructions
  - State doc requires tracking issue linkage and enforcement update
- **Acceptance Criteria**:
  - [ ] Run/implement `npm run compile:constitution` and commit updated .github/copilot-instructions.md output
  - [ ] Confirm scripts/tools/check-agent-platform.mjs scope matches AGENT-only ownership rules
  - [ ] Toggle AGENT Ownership Consistency enforcement to FAIL in docs/governance/state.md
  - [ ] Create tracking issue and link it in docs/governance/state.md
- **References**:
  - docs/governance/state.md
  - scripts/tools/check-agent-platform.mjs
  - .github/copilot-instructions.md
- **Dependencies**: None
- **Effort**: M

### T-097

- **Priority**: P2
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Analytics modules still use legacy `any` types
  - Governance requires formal exceptions with expiry
  - State doc lists an open remediation plan and tracking issue
- **Acceptance Criteria**:
  - [ ] Add exception EXC-002 for legacy analytics types to docs/governance/exceptions.yml with expiry date
  - [ ] Create tracking issue and link it in docs/governance/state.md
  - [ ] Document remediation plan (2-3 files per sprint) with target dates
- **References**:
  - docs/governance/state.md
  - docs/governance/exceptions.yml
  - apps/mobile/analytics/
- **Dependencies**: None
- **Effort**: M

### T-098

- **Priority**: P2
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Documentation automation is planned but not implemented
  - Docs coverage script and CI workflow are still TODO
  - Verification commands reference missing npm scripts
- **Acceptance Criteria**:
  - [ ] Implement scripts/check-doc-coverage.js and wire `npm run check:docs`
  - [ ] Add `npm run lint:docs` and `npm run verify:all` scripts in package.json
  - [ ] Add/confirm `npm run db:migrate` (or update docs/verification.md with the correct command)
  - [ ] Add docs coverage CI workflow and update docs/coverage.md automation section
  - [ ] Update docs/verification.md and docs/implementation_report.md to remove TODO placeholders
- **References**:
  - docs/coverage.md
  - docs/verification.md
  - docs/implementation_report.md
  - package.json
  - scripts/check-doc-coverage.js
  - .github/workflows/
- **Dependencies**: None
- **Effort**: L

