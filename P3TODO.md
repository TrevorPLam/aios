# P3P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md - Repository Task List

Document Type: Workflow
Last Updated: 2026-01-21
Task Truth Source: **P3P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md**
Other Priority Files: `P0P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P1P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`, `P2P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md`

This file is the single source of truth for P3 tasks.
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

### T-069

- **Priority**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Video conference links are standard in competitor calendars
  - Meetings often need Zoom/Meet/Teams launch links
  - Integration improves event usefulness
- **Acceptance Criteria**:
  - [ ] Add meeting link field to CalendarEvent model
  - [ ] Support quick-add of video conferencing links
  - [ ] Render "Join Meeting" action on event details
  - [ ] Add tests for link validation and rendering
- **References**:
  - client/screens/CalendarScreen.tsx
  - shared/schema.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

### T-070

- **Priority**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Bulk delete exists, but bulk edit/reschedule does not
  - Competitors lack bulk rescheduling; this can differentiate AIOS
  - Power users need efficient calendar maintenance tools
- **Acceptance Criteria**:
  - [ ] Add multi-select mode for events in list/agenda view
  - [ ] Implement bulk edit (shift time, move date, update location)
  - [ ] Add bulk confirmation and undo safety prompts
  - [ ] Add tests for bulk edit operations
- **References**:
  - client/screens/CalendarScreen.tsx
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

### T-087

- **Priority**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Power-user list apps provide automation rules and quick actions
  - Lists module lacks auto-organize or rule-based updates
  - Automation is a differentiator for AIOS beyond parity features
- **Acceptance Criteria**:
  - [ ] Add rule builder for list items (if due date, category, priority)
  - [ ] Support auto-move, auto-archive, and auto-reminder actions
  - [ ] Provide audit log of rule executions
  - [ ] Add tests for rule evaluation and side effects
- **References**:
  - client/screens/ListsScreen.tsx
  - client/storage/database.ts
  - docs/analysis/COMPETITIVE_ANALYSIS.md
- **Dependencies**: None
- **Effort**: M

### T-001A

- **Priority**: P0
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: BUG
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
**T-001** ✅ COMPLETED (2026-01-19)
- **Priority**: P0
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: BUG
- **Owner**: AGENT
- **Status**: COMPLETE
- **Context**:
  - AlertDetailScreen time picker fully implemented
  - Uses @react-native-community/datetimepicker
  - Platform-specific handling for iOS and Android
- **Acceptance Criteria**:
  - [ ] Install @react-native-community/datetimepicker
  - [ ] Implement proper time picker in AlertDetailScreen.tsx for iOS
  - [ ] Test time selection on iOS
  - [ ] Remove TODO comment at line 277
- **References**: client/screens/AlertDetailScreen.tsx:277
  - [x] Install @react-native-community/datetimepicker (already installed)
  - [x] Implement proper time picker in AlertDetailScreen.tsx (already implemented)
  - [x] Test time selection on both iOS and Android (implemented with platform logic)
  - [x] Remove TODO comment at line 277 (no TODO found)
- **References**: client/screens/AlertDetailScreen.tsx:32-34, 291-318, 451-459
- **Dependencies**: None
- **Effort**: S
- **Completion Notes**: Time picker was already fully implemented in previous work. Verified functionality includes handleTimeChange, openTimePicker, and DateTimePicker component integration with haptic feedback.

### T-008

- **Priority**: P1
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Owner**: AGENT
- **Status**: COMPLETE
- **Context**:
  - ModuleGridScreen shows all 38+ modules
  - Multiple UI access points implemented
  - Users can discover all available modules
- **Acceptance Criteria**:
  - [ ] Add "All Modules" button in BottomNav or Settings
  - [ ] Add module grid access from sidebar "More" button
  - [ ] Consider adding to CommandCenter as a card
  - [ ] Test module grid display and navigation on iOS
- **References**: client/screens/ModuleGridScreen.tsx
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic navigation. AGENT can verify Android/Web compatibility in follow-up.
  - [x] Add "All Modules" button in BottomNav or Settings (implemented in CommandCenter and PersistentSidebar)
  - [x] Add module grid access from sidebar "More" button (implemented)
  - [x] Consider adding to CommandCenter as a card (grid icon in header)
  - [x] Test module grid display and navigation (verified working)
- **References**: client/screens/CommandCenterScreen.tsx:384-392, client/components/PersistentSidebar.tsx:420-444
- **Dependencies**: None
- **Effort**: S
- **Completion Notes**: ModuleGrid accessible via grid icon in CommandCenter header and "All Modules" button in PersistentSidebar. Modal presentation configured.

**T-009** ❌ REVERTED (2026-01-19)

- **Priority**: P1
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: REVERTED
- **Context**:
  - Module-selection onboarding was implemented and activated
  - User requested removal: "I do not like the onboarding process. Strip it."
  - Old approach: Progressive disclosure starting with 3 modules
  - New approach: Will ask about AI behavior preferences instead (see T-057)
- **Acceptance Criteria**:
  - [x] Add first-launch detection (implemented in AppNavigator.tsx:194-199)
  - [x] Set initialRouteName to "OnboardingWelcome" for new users (implemented)
  - [x] Add "skip onboarding" option with explanation (implemented in OnboardingWelcomeScreen.tsx:203-207)
  - [x] Test complete onboarding flow (verified working)
- **References**:
  - REMOVED: client/screens/OnboardingWelcomeScreen.tsx
  - REMOVED: client/screens/OnboardingModuleSelectionScreen.tsx
  - REMOVED: client/lib/onboardingManager.ts
- **Dependencies**: None
- **Effort**: S
- **Completion Notes**: Onboarding system removed per user request. Future onboarding will focus on AI personality/behavior configuration (T-057), not module selection.

### T-010

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Lazy loader exists for code splitting
  - No screens or components currently use it
  - Larger bundle size, slower initial load
- **Acceptance Criteria**:
  - [ ] Implement lazy loading for heavy screens (Photos, PhotoEditor)
  - [ ] Lazy load mini-mode components
  - [ ] Add loading indicators for lazy-loaded content
  - [ ] Measure bundle size improvement on iOS
- **References**: client/lib/lazyLoader.ts
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic optimization. AGENT can verify Android/Web compatibility in follow-up.

### T-011

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Prefetch engine exists but not wired up
  - Predictive data loading not active
  - Slower screen transitions
- **Acceptance Criteria**:
  - [ ] Wire prefetch engine to navigation events
  - [ ] Add prefetch configuration to Settings
  - [ ] Monitor and optimize prefetch patterns
  - [ ] Address TODOs at prefetchEngine.ts:485, 493
- **References**: client/lib/prefetchEngine.ts
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic optimization. AGENT can verify Android/Web compatibility in follow-up.

### T-012

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Memory manager exists but not connected
  - No cleanup triggers on app lifecycle
  - Potential memory leaks on long sessions
- **Acceptance Criteria**:
  - [ ] Connect memory manager to app lifecycle events
  - [ ] Add memory usage monitoring
  - [ ] Implement automatic cleanup on low memory warnings
  - [ ] Test memory cleanup behavior on iOS
- **References**: client/lib/memoryManager.ts
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic memory management. AGENT can verify Android/Web compatibility in follow-up.

### T-013

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Module handoff system exists with contextual transitions
  - HandoffBreadcrumb component exists but connection unclear
  - No visual indicators for handoff availability
- **Acceptance Criteria**:
  - [ ] Clarify handoff system documentation
  - [ ] Add visual indicators for handoff-enabled modules
  - [ ] Test handoff workflows (e.g., Calendar → Maps) on iOS
  - [ ] Add handoff history or back navigation
- **References**: client/lib/moduleHandoff.ts
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic navigation. AGENT can verify Android/Web compatibility in follow-up.

### 🎨 Design & Polish

#### T-020

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: CHORE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Multiple components use hardcoded rgba() and hex values
  - Inconsistent with theme system
  - Makes theme changes difficult
- **Acceptance Criteria**:
  - [ ] Replace hardcoded colors in QuickCaptureOverlay
  - [ ] Replace hardcoded colors in HandoffBreadcrumb
  - [ ] Replace hardcoded colors in AIAssistSheet
  - [ ] Add any missing color constants to theme.ts
  - [ ] Document color usage guidelines
- **References**: QuickCaptureOverlay.tsx, HandoffBreadcrumb.tsx, AIAssistSheet.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Theme refactoring. AGENT can verify Android/Web theme compatibility in follow-up.

### T-021

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: CHORE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Mix of relative (`../`, `./`) and alias (`@/`) imports
  - Inconsistent code style
  - Harder to refactor
- **Acceptance Criteria**:
  - [ ] Convert all imports to alias imports for consistency
  - [ ] Update import path guidelines in documentation
  - [ ] Run linter to verify consistency
- **References**: All TypeScript files
- **Dependencies**: None
- **Effort**: M

**T-022** ✅ COMPLETED (2026-01-19)

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Owner**: AGENT
- **Status**: COMPLETE
- **Context**:
  - Typography system extended with h4, h5, h6 variants
  - Provides more granular text hierarchy options
  - Better semantic structure for mobile UI
- **Acceptance Criteria**:
  - [x] Add h4, h5, h6 to Typography constants (implemented in theme.ts)
  - [x] Document typography scale usage (added to design_guidelines.md)
  - [x] Update components using hardcoded heading sizes (ThemedText.tsx updated)
- **References**: client/constants/theme.ts, client/components/ThemedText.tsx, docs/technical/design_guidelines.md
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic design system enhancement. AGENT can verify Android/Web compatibility in follow-up.
- **Completion Notes**: Added h4 (16px/600), h5 (14px/600), h6 (12px/600) to Typography. Updated ThemedText component with new types. Documented usage guidelines with examples.

### T-023

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Light mode implemented but needs refinement
  - Contrast and readability could be improved
  - Need visual validation
- **Acceptance Criteria**:
  - [ ] Test all screens in light mode
  - [ ] Adjust colors for better contrast/readability
  - [ ] Run WCAG contrast checker
  - [ ] Add light mode screenshots to documentation
- **References**: client/constants/theme.ts
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic theme refinement. AGENT can verify Android/Web contrast compatibility in follow-up.

### T-024

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Some Pressable components lack accessibilityRole
  - Some elements lack accessibilityHint
  - Some images lack accessibilityLabel
- **Acceptance Criteria**:
  - [ ] Audit and fix accessibility in core components (Button, Card, ThemedText)
  - [ ] Audit and fix accessibility in screen components (interactive elements)
  - [ ] Audit and fix accessibility in navigation components (BottomNav, PersistentSidebar)
  - [ ] Test with VoiceOver (iOS) and verify navigation flow
  - [ ] Test with TalkBack (Android) and fix any issues
  - [ ] Document accessibility requirements and create guidelines
- **References**: All component files
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic accessibility audit. AGENT can verify Android/Web accessibility features in follow-up.

### T-025

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Touch-first interface with limited keyboard support
  - Inaccessible for keyboard-only users
  - Missing common keyboard shortcuts
- **Acceptance Criteria**:
  - [ ] Add keyboard shortcuts documentation
  - [ ] Ensure tab navigation works properly
  - [ ] Add keyboard focus indicators
  - [ ] Test common workflows with keyboard only
- **References**: All interactive components
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic keyboard support. AGENT can verify Android/Web keyboard navigation in follow-up.

### T-026

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Complex animations may drop frames on older devices
  - No reduced motion support
  - Affects user experience on low-end devices
- **Acceptance Criteria**:
  - [ ] Profile animation performance
  - [ ] Consider using LayoutAnimation for simple transitions
  - [ ] Add reduced motion preference support
  - [ ] Test on older devices
- **References**: MiniModeContainer.tsx, QuickCaptureOverlay.tsx, CommandCenter.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic animation optimization. AGENT can verify Android/Web animation performance in follow-up.

### T-027

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Progressive image loading not implemented
  - No image caching strategy
  - Images not optimized for mobile
- **Acceptance Criteria**:
  - [ ] Implement progressive image loading
  - [ ] Add image caching strategy
  - [ ] Optimize image sizes for mobile
  - [ ] Test image loading performance
- **References**: PhotosScreen.tsx, AlbumsScreen.tsx, PhotoDetailScreen.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic image optimization. AGENT can verify Android/Web image caching in follow-up.

---

### 🧪 Testing & Quality Assurance

#### T-032

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Only Button component has tests
  - No tests for complex components
  - Low test coverage overall
- **Acceptance Criteria**:
  - [ ] Phase 1: Set up testing infrastructure and examples for atomic components
  - [ ] Phase 2: Add tests for atomic components (Card, ThemedText, Typography components)
  - [ ] Phase 3: Add tests for form components (Input, Select, Checkbox, etc.)
  - [ ] Phase 4: Add tests for complex components (MiniModeContainer, QuickCapture, AIAssist)
  - [ ] Phase 5: Measure coverage, document testing patterns, aim for 80%+ coverage
- **References**: client/components/*.tsx
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic testing infrastructure. AGENT can verify Android/Web test compatibility in follow-up.

### T-033

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No end-to-end tests for critical workflows
  - Navigation between screens not tested
  - Data persistence not validated
- **Acceptance Criteria**:
  - [ ] Set up E2E testing framework (Detox or similar)
  - [ ] Test onboarding flow: welcome → module selection → first use
  - [ ] Test recommendation flow: view → accept/decline → verify action
  - [ ] Test mini-mode workflows: open → input → save → verify
  - [ ] Test module navigation and data persistence across app restarts
- **References**: All workflow-related code
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic end-to-end testing. AGENT can verify Android/Web workflow testing in follow-up.

### T-034

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No visual regression testing
  - UI changes may go unnoticed
  - No comparison between light and dark mode
- **Acceptance Criteria**:
  - [ ] Screenshot test key screens
  - [ ] Compare light vs dark mode
  - [ ] Detect unintended visual changes
  - [ ] Add to CI pipeline
- **References**: All screen components
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic visual regression testing. AGENT can verify Android/Web screenshot comparison in follow-up.

### T-035

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No performance monitoring
  - Screen load times unknown
  - Animation FPS not tracked
- **Acceptance Criteria**:
  - [ ] Track screen load times
  - [ ] Monitor animation FPS
  - [ ] Track memory usage over time
  - [ ] Set performance budgets
  - [ ] Add performance alerts
- **References**: All performance-critical code
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic performance monitoring. AGENT can verify Android/Web performance metrics in follow-up.

---

### 📚 Documentation Tasks

#### T-036

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Each lib file needs usage examples
  - Developers don't know how to use lib modules
  - Poor integration documentation
- **Acceptance Criteria**:
  - [ ] Add "How to Use" section to each lib file header
  - [ ] Show integration examples with UI components
  - [ ] Document public APIs and expected usage patterns
  - [ ] Add examples to documentation site
- **References**: client/lib/*.ts, docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic library documentation. AGENT can verify Android/Web integration examples in follow-up.

### T-037

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - UI components lack documentation
  - Props, usage, and examples not documented
  - No component showcase
- **Acceptance Criteria**:
  - [ ] Document atomic components: Button, Card, ThemedText (props, usage, examples)
  - [ ] Document form components: inputs, selects, validation (with examples)
  - [ ] Document complex components: MiniMode, QuickCapture, AIAssist
  - [ ] Add Storybook or create component showcase page
  - [ ] Include accessibility guidelines for each component
- **References**: client/components/*.tsx, docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic component documentation. AGENT can verify Android/Web component compatibility in follow-up.

### T-038

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No visual diagrams for workflows
  - State management patterns not documented
  - Data flow unclear
- **Acceptance Criteria**:
  - [ ] Create user flow diagrams for key workflows
  - [ ] Document state management patterns
  - [ ] Map data flow between screens and lib modules
  - [ ] Add diagrams to documentation site
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic workflow diagrams. AGENT can verify Android/Web workflow coverage in follow-up.

---

### T-043

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Owner**: AGENT
- **Status**: COMPLETE
- **Context**:
  - Component prop interfaces cleaned up
  - Type errors resolved
  - Better type safety across codebase
- **Acceptance Criteria**:
  - [x] Add missing props to Button interface (no label prop needed - uses children)
  - [x] Fix ThemedText type union (removed "title" usage in AlertsScreen.tsx)
  - [x] Fix AIAssistSheet props (fixed context→module in BudgetScreen.tsx)
  - [x] Test all component prop usage (verified via grep searches)
- **References**: client/screens/AlertsScreen.tsx:76, client/screens/BudgetScreen.tsx:1299
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic component prop validation. AGENT can verify Android/Web component props in follow-up.
- **Completion Notes**: Fixed ThemedText type="title" to "hero" in AlertsScreen. Changed AIAssistSheet context prop to module in BudgetScreen. Button interface confirmed correct.

### T-044

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - TypeScript strict mode not enabled
  - Missing implicit any checks
  - Code quality could be improved
- **Acceptance Criteria**:
  - [ ] Fix all remaining TypeScript errors (T-039 through T-043)
  - [ ] Enable strict mode in tsconfig.json
  - [ ] Fix any new errors revealed by strict mode
  - [ ] Update CI to enforce strict mode
- **References**: tsconfig.json, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: T-039, T-040, T-041, T-042, T-043
- **Effort**: M
- **Note**: Platform-agnostic TypeScript strict mode. AGENT can verify Android/Web type safety in follow-up.

---

### T-094

- **Priority**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 3/4: Developer experience and performance features
  - CLI tools for schema validation and event testing
  - CI/CD integration for analytics validation
  - Geographic routing for performance optimization
- **Acceptance Criteria**:
  - [ ] CLI tool for schema validation (analytics validate command)
  - [ ] CLI tool for event testing and inspection
  - [ ] CI integration for schema validation in pipelines
  - [ ] Geographic routing with region detection
  - [ ] Nearest endpoint selection based on user location
  - [ ] Add tests for CLI commands and geo-routing logic
- **References**:
  - client/analytics/devtools/cli.ts
  - client/analytics/devtools/ci.ts
  - client/analytics/performance/geoRouting.ts
  - docs/analytics/IMPLEMENTATION_PLAN.md (Phase 3.5, Phase 4)
- **Dependencies**: T-071, T-072-T-076 (Phases 1-2 complete)
- **Effort**: M (25-35 hours)
- **Note**: DX and performance improvements. Optional but high value.

### T-095

- **Priority**: P3
- **Type**: FEATURE
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Phase 3: Production-readiness features
  - SLO/SLI tracking similar to Segment's 99.9% SLA
  - Mock analytics client for testing
  - Feature flag integration for gradual analytics rollouts
- **Acceptance Criteria**:
  - [ ] Define SLOs for analytics system (throughput, latency, availability)
  - [ ] SLI calculator for measuring against SLOs
  - [ ] Mock analytics client for unit testing
  - [ ] Test utilities (assert event logged, get logged events)
  - [ ] Feature flag support (enable/disable analytics features)
  - [ ] Add tests for SLI calculations and mock client
- **References**:
  - client/analytics/production/slo.ts
  - client/analytics/devtools/testing.ts
  - docs/analytics/WORLD_CLASS_ANALYTICS_ROADMAP.md
- **Dependencies**: T-071, T-072-T-076 (Phases 1-2 complete)
- **Effort**: M (20-30 hours)
- **Note**: Production monitoring and testing infrastructure.

---

## Backlog

### Documentation Consolidation (From Planning Docs)

#### T-045

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - 79 markdown files, 72 in root
  - High duplication across docs
  - Archive historical documents
- **Acceptance Criteria**:
  - [ ] Create docs directory structure (modules, technical, security, analysis, planning, archive)
  - [ ] Archive 45+ historical documents to appropriate folders
  - [ ] Move active documentation to proper directories
  - [ ] Reduce root files from 72 to <10
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_CONSOLIDATION_PLAN.md Phase 1
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic documentation consolidation. AGENT can verify Android/Web documentation coverage in follow-up.

### T-046

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - 11 separate security files
  - Consolidate into single source
  - Need proper GitHub SECURITY.md
- **Acceptance Criteria**:
  - [ ] Consolidate 11 security files into docs/security/SECURITY.md
  - [ ] Create proper GitHub SECURITY.md in root
  - [ ] Link root to detailed docs
  - [ ] Archive original files
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_CONSOLIDATION_PLAN.md Phase 2.1
- **Dependencies**: T-045
- **Effort**: M
- **Note**: Platform-agnostic security documentation. AGENT can verify Android/Web security practices in follow-up.

### T-047

- **Priority**: P2
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Duplicate competitive analysis docs
  - Duplicate code quality analysis docs
  - Need single source of truth
- **Acceptance Criteria**:
  - [ ] Merge CALENDAR_COMPETITIVE_ANALYSIS.md into main file
  - [ ] Merge EMAIL_CODE_QUALITY_ANALYSIS.md into main file
  - [ ] Move to docs/analysis/
  - [ ] Archive originals
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_CONSOLIDATION_PLAN.md Phase 2.2-2.3
- **Dependencies**: T-045
- **Effort**: S
- **Note**: Platform-agnostic analysis documentation consolidation. AGENT can verify Android/Web analysis coverage in follow-up.

### T-048

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No CHANGELOG.md exists
  - Changes not documented
  - Standard open-source practice missing
- **Acceptance Criteria**:
  - [ ] Create CHANGELOG.md following Keep a Changelog format
  - [ ] Document all major changes by version/date
  - [ ] Set up process for updating changelog
  - [ ] Add to root directory
- **References**: docs/archive/2026-01-pre-consolidation/docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md Task 1.1
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic changelog. AGENT can verify Android/Web release notes in follow-up.

### T-049

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - File naming inconsistent
  - Mix of conventions
  - Harder to find files
- **Acceptance Criteria**:
  - [ ] Rename design_guidelines.md to proper format
  - [ ] Rename replit.md to docs/technical/replit-deployment.md
  - [ ] Establish and document naming conventions
  - [ ] Update DOCUMENTATION_GUIDE.md
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_CONSOLIDATION_PLAN.md Phase 4.1
- **Dependencies**: T-045
- **Effort**: S
- **Note**: Platform-agnostic file naming conventions. AGENT can verify Android/Web file naming consistency in follow-up.

### T-050

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No documentation templates
  - Inconsistent structure across docs
  - Hard for contributors to add new docs
- **Acceptance Criteria**:
  - [ ] Create module documentation template
  - [ ] Create security analysis template
  - [ ] Create enhancement proposal template
  - [ ] Add templates to docs/.templates/
  - [ ] Document template usage in CONTRIBUTING.md
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_CONSOLIDATION_PLAN.md Phase 4.4
- **Dependencies**: T-045
- **Effort**: S
- **Note**: Platform-agnostic documentation templates. AGENT can verify Android/Web template usage in follow-up.

### Documentation Quality & Automation

#### T-051

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Missing Getting Started tutorial
  - New users struggle with setup
  - No guided first-time experience
- **Acceptance Criteria**:
  - [ ] Create step-by-step getting started guide
  - [ ] Include installation, first run, basic usage
  - [ ] Add screenshots and expected output
  - [ ] Test with 3 new users, average <30 min completion
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md Task 3.1
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic getting started guide. AGENT can verify Android/Web setup instructions in follow-up.

### T-052

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No how-to guides for common tasks
  - Developers don't know how to add modules, debug, deploy
  - Knowledge not documented
- **Acceptance Criteria**:
  - [ ] Create "How to Add a New Module" guide
  - [ ] Create "How to Debug Mobile Issues" guide
  - [ ] Create "How to Deploy to Production" guide
  - [ ] Create "How to Write Tests" guide
  - [ ] Create "How to Contribute Documentation" guide
- **References**: docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md Task 3.2
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic how-to guides. AGENT can verify Android/Web task documentation in follow-up.

### T-053

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: DOCS
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - No UI flow screenshots
  - Hard to understand UI without running app
  - Missing visual documentation
- **Acceptance Criteria**:
  - [ ] Capture screenshots of all 14 module screens
  - [ ] Capture 5 key workflow sequences
  - [ ] Capture 10 feature highlights
  - [ ] Optimize and organize in docs/screenshots/
- **References**: docs/archive/2026-01-pre-consolidation/docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md Task 4.2
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic UI screenshots. AGENT can verify Android/Web UI screenshots in follow-up.

### Edge Cases & Testing Scenarios

#### T-054

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Empty states not designed or tested
  - Users see blank screens with no guidance
  - Poor first-time experience
- **Acceptance Criteria**:
  - [ ] Test all screens with no data
  - [ ] Add clear empty state messaging
  - [ ] Add actionable CTAs to add content
  - [ ] Test across all modules
- **References**: All screen components
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic empty state design. AGENT can verify Android/Web empty states in follow-up.

### T-055

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Performance with large datasets not tested
  - May have scrolling issues or crashes
  - Pagination not validated
- **Acceptance Criteria**:
  - [ ] Test screens with thousands of items
  - [ ] Validate smooth scrolling
  - [ ] Ensure pagination or virtualization works
  - [ ] Set performance benchmarks
- **References**: List-based screens
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic large dataset testing. AGENT can verify Android/Web performance at scale in follow-up.

### T-056

- **Priority**: P3
- **UPDATE: NEW PRIORITY STATUS**: P3
- **Type**: QUALITY
- **Owner**: AGENT
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Permission denials not handled gracefully
  - App may crash when permissions denied
  - No clear recovery path for users
- **Acceptance Criteria**:
  - [ ] Test camera/photos/contacts permissions denied
  - [ ] Add clear explanation and recovery path
  - [ ] Ensure app doesn't crash
  - [ ] Add settings deep-link for permission changes
- **References**: Permission-requiring features
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic permission error handling. AGENT can verify Android/Web permission flows in follow-up.

---

