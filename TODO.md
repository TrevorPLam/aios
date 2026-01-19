# TODO.md 

Document Type: Workflow
Last Updated: 2026-01-19
Task Truth Source: **TODO.md**

This file is the single source of truth for actionable work.
If another document disagrees, the task record in this file wins (unless the Constitution overrides).

## Task schema (required)
- **ID**: `T-###` (unique)
- **Priority**: `P0 | P1 | P2 | P3`
- **Type**: `SECURITY | RELEASE | DEPENDENCY | DOCS | QUALITY | BUG | FEATURE | CHORE`
- **Owner**: `GitHub Agent (Primary) | Codex Agent (Secondary) | Trevor`
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
- **Owner: GitHub Agent (Primary)** = Builds all original features, screens, components. iOS-only development. Owns architectural decisions.
- **Owner: Codex Agent (Secondary)** = Adapts Copilot's completed iOS implementations for Android/Web compatibility only. Must reference Copilot's work. Cannot perform original development.
- **Owner: Trevor** = Requires external actions (provider dashboards, DNS, billing, approvals).

### Task Pattern for Features
For new features requiring multi-platform support, use sequential tasks:
- **Part A**: GitHub Agent (Primary) builds iOS implementation
- **Part B**: Codex Agent (Secondary) adapts for Android/Web (depends on Part A)

---

## Active tasks

### 🔴 Critical Bugs

**T-001A**
- **Priority**: P0
- **Type**: BUG
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - AlertDetailScreen uses placeholder for time picker
  - Poor UX for setting alert times
  - Component referenced but not implemented
- **Acceptance Criteria**:
  - [ ] Install @react-native-community/datetimepicker
  - [ ] Implement proper time picker in AlertDetailScreen.tsx for iOS
  - [ ] Test time selection on iOS
  - [ ] Remove TODO comment at line 277
- **References**: client/screens/AlertDetailScreen.tsx:277
- **Dependencies**: None
- **Effort**: S

**T-001B**
- **Priority**: P0
- **Type**: BUG
- **Owner**: Codex Agent (Secondary)
- **Platform**: Android, Web
- **Status**: BLOCKED
- **Context**:
  - Adapt T-001A iOS time picker implementation for Android/Web compatibility
  - Note: Existing Android-specific code at line ~285 can remain as-is
- **Acceptance Criteria**:
  - [ ] Verify time picker works on Android
  - [ ] Add web-compatible time picker if needed
  - [ ] Preserve iOS functionality
  - [ ] Test on Android and Web platforms
- **References**: client/screens/AlertDetailScreen.tsx:277, T-001A PR/commit
- **Dependencies**: T-001A
- **Effort**: S

**T-002A**
- **Priority**: P0
- **Type**: BUG
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - PersistentSidebar missing edge swipe gesture
  - Only button alternative exists
  - Native mobile navigation pattern expected by users
- **Acceptance Criteria**:
  - [ ] Implement PanResponder for left edge swipe detection (iOS)
  - [ ] Handle swipe-to-open sidebar gesture
  - [ ] Test gesture on iOS
  - [ ] Maintain button alternative for accessibility
  - [ ] Remove TODO comment at line 63
- **References**: client/components/PersistentSidebar.tsx:63
- **Dependencies**: None
- **Effort**: M

**T-002B**
- **Priority**: P0
- **Type**: BUG
- **Owner**: Codex Agent (Secondary)
- **Platform**: Android, Web
- **Status**: BLOCKED
- **Context**:
  - Adapt T-002A iOS swipe gesture for Android/Web compatibility
  - Ensure gesture works across all platforms
- **Acceptance Criteria**:
  - [ ] Test swipe gesture on Android
  - [ ] Add web-compatible swipe gesture if needed
  - [ ] Preserve iOS functionality
  - [ ] Verify button alternative works on all platforms
- **References**: client/components/PersistentSidebar.tsx:63, T-002A PR/commit
- **Dependencies**: T-002A
- **Effort**: S

**T-003**
- **Priority**: P0
- **Type**: BUG
- **Owner**: GitHub Agent (Primary)
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - BottomNav assumes all module routes exist
  - No error handling when navigating to unregistered screens
  - Can cause silent failures or crashes
- **Acceptance Criteria**:
  - [ ] Add route validation before navigation in BottomNav
  - [ ] Show error message if route doesn't exist
  - [ ] Log navigation errors for debugging
  - [ ] Test with disabled modules on iOS
- **References**: client/components/BottomNav.tsx
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic navigation logic. Codex Agent can verify Android/Web compatibility in follow-up if needed.

---

### 🟡 Hidden Features (High Value)

**T-004**
- **Priority**: P1
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Omnisearch component exists but not accessible
  - Universal search across all modules implemented
  - Major feature completely hidden from users
- **Acceptance Criteria**:
  - [ ] Add Omnisearch to navigation stack with modal presentation
  - [ ] Add search icon to header or CommandCenter
  - [ ] Implement keyboard shortcut (Cmd+K / Ctrl+K) for iOS
  - [ ] Test search across all modules on iOS
- **References**: client/components/OmnisearchScreen.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Codex Agent can add Android/Web keyboard shortcuts in follow-up if needed.

**T-005**
- **Priority**: P1
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - AttentionCenter screen exists but not accessible
  - Smart notification bundling and priority classification implemented
  - Users can't view attention items or use focus mode
- **Acceptance Criteria**:
  - [ ] Add AttentionCenter to navigation stack
  - [ ] Add attention icon to header with badge count
  - [ ] Show attention indicators on BottomNav module buttons
  - [ ] Test attention item display and dismissal on iOS
- **References**: client/lib/attentionManager.ts, client/screens/AttentionCenterScreen.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic implementation. Codex Agent can verify Android/Web compatibility in follow-up.

**T-006**
- **Priority**: P1
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Context engine has Work/Personal/Focus/Social/Wellness modes
  - Only used internally by PersistentSidebar
  - No user control over context switching
- **Acceptance Criteria**:
  - [ ] Add context zone selector in Settings or CommandCenter
  - [ ] Add manual context override UI
  - [ ] Show current context indicator in UI
  - [ ] Test automatic context switching based on time/location on iOS
  - [ ] Address TODOs at contextEngine.ts:165, 172, 331
- **References**: client/lib/contextEngine.ts
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic logic. Codex Agent can verify Android/Web compatibility in follow-up.

**T-007**
- **Priority**: P1
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Recommendation engine exists with cross-module analysis
  - Only CommandCenter shows recommendations
  - No manual refresh, history, or preference settings
- **Acceptance Criteria**:
  - [ ] Add "Refresh Recommendations" button in CommandCenter
  - [ ] Add recommendation settings in AIPreferences screen
  - [ ] Show evidence/reasoning in recommendation cards
  - [ ] Wire up RecommendationHistoryScreen to navigation on iOS
- **References**: client/lib/recommendationEngine.ts, client/screens/RecommendationHistoryScreen.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic logic. Codex Agent can verify Android/Web compatibility in follow-up.

**T-008**
- **Priority**: P1
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - ModuleGridScreen shows all 38+ modules
  - Registered in navigation but no UI button to access it
  - Users can't discover all available modules
- **Acceptance Criteria**:
  - [ ] Add "All Modules" button in BottomNav or Settings
  - [ ] Add module grid access from sidebar "More" button
  - [ ] Consider adding to CommandCenter as a card
  - [ ] Test module grid display and navigation on iOS
- **References**: client/screens/ModuleGridScreen.tsx
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic navigation. Codex Agent can verify Android/Web compatibility in follow-up.

**T-009**
- **Priority**: P1
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Onboarding screens exist but are skipped
  - Navigation starts at CommandCenter
  - New users don't understand app structure or features
- **Acceptance Criteria**:
  - [ ] Add first-launch detection
  - [ ] Set initialRouteName to "OnboardingWelcome" for new users
  - [ ] Add "skip onboarding" option with explanation
  - [ ] Test complete onboarding flow on iOS
- **References**: client/screens/OnboardingWelcomeScreen.tsx, client/screens/OnboardingModuleSelectionScreen.tsx
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic logic. Codex Agent can verify Android/Web compatibility in follow-up.

**T-010**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic optimization. Codex Agent can verify Android/Web compatibility in follow-up.

**T-011**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic optimization. Codex Agent can verify Android/Web compatibility in follow-up.

**T-012**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic memory management. Codex Agent can verify Android/Web compatibility in follow-up.

**T-013**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic navigation. Codex Agent can verify Android/Web compatibility in follow-up.

---

### 🔧 UX & Workflow Improvements

**T-014**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - Settings screens exist for modules but no clear path
  - NotebookSettings, PlannerSettings, etc. registered but not accessible
  - Users can't configure module preferences
- **Acceptance Criteria**:
  - [ ] Add settings icon to module headers
  - [ ] Ensure all module settings screens have meaningful content
  - [ ] Add "Module Settings" section in main Settings
  - [ ] Test settings navigation flow on iOS
- **References**: client/screens/*Settings.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic navigation. Codex Agent can verify Android/Web compatibility in follow-up.

**T-015**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: iOS
- **Status**: READY
- **Context**:
  - HistoryScreen exists but no navigation path
  - Users can't view app history or debug issues
- **Acceptance Criteria**:
  - [ ] Add History to System screen or Settings menu
  - [ ] Consider adding history access from CommandCenter
  - [ ] Test history display and filtering on iOS
- **References**: client/screens/HistoryScreen.tsx
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic navigation. Codex Agent can verify Android/Web compatibility in follow-up.

**T-016**
- **Priority**: P2
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **References**: client/components/ErrorBoundary.tsx
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic error handling. Codex Agent can verify Android/Web compatibility in follow-up.

**T-017**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
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
- **References**: client/screens/*.tsx
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic UI patterns. Codex Agent can verify Android/Web compatibility in follow-up.

**T-018**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic network handling. Codex Agent can verify Android/Web compatibility in follow-up.

**T-019**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **References**: client/screens/NoteEditor.tsx, client/screens/TaskDetail.tsx, etc.
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic validation logic. Codex Agent can verify Android/Web compatibility in follow-up.

---

### 🎨 Design & Polish

**T-020**
- **Priority**: P3
- **Type**: CHORE
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Theme refactoring. Codex Agent can verify Android/Web theme compatibility in follow-up.

**T-021**
- **Priority**: P3
- **Type**: CHORE
- **Owner**: GitHub Agent (Primary)
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

**T-022**
- **Priority**: P3
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Only h1, h2, h3 defined in Typography
  - Limited text hierarchy options
  - Some components need smaller headings
- **Acceptance Criteria**:
  - [ ] Add h4, h5, h6 to Typography constants
  - [ ] Document typography scale usage
  - [ ] Update components using hardcoded heading sizes
- **References**: client/constants/theme.ts
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic design system enhancement. Codex Agent can verify Android/Web compatibility in follow-up.

**T-023**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic theme refinement. Codex Agent can verify Android/Web contrast compatibility in follow-up.

**T-024**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic accessibility audit. Codex Agent can verify Android/Web accessibility features in follow-up.

**T-025**
- **Priority**: P3
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic keyboard support. Codex Agent can verify Android/Web keyboard navigation in follow-up.

**T-026**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic animation optimization. Codex Agent can verify Android/Web animation performance in follow-up.

**T-027**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic image optimization. Codex Agent can verify Android/Web image caching in follow-up.

---

### 📊 Analytics Decision (Critical Business Decision)

**T-028**
- **Priority**: P1
- **Type**: CHORE
- **Owner**: Trevor
- **Status**: BLOCKED
- **Context**:
  - 40 analytics files with 86 TODO comments
  - Stub implementation exists but incomplete
  - Significant technical debt if left incomplete
  - Decision needed: complete or remove
- **Acceptance Criteria**:
  - [ ] Make decision: complete implementation OR remove stub code
  - [ ] If keeping: create detailed implementation plan (T-029)
  - [ ] If removing: execute cleanup (T-030)
  - [ ] Document decision in ARCHITECTURE_DECISIONS.md
- **References**: client/analytics/**/*, docs/analytics/*
- **Dependencies**: Blocks T-029, T-030
- **Effort**: S (decision only)

**T-029**
- **Priority**: P1
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Execute if T-028 decides to complete analytics
  - 86 TODOs across 40 files to implement
  - Features: group analytics, A/B testing, screen tracking, feature flags, funnels, metrics, monitoring, validation, sampling, destinations, consent, data deletion, retention
- **Acceptance Criteria**:
  - [ ] Phase 1: Implement core analytics (event tracking, user identification)
  - [ ] Phase 2: Implement advanced features (groups, funnels, A/B tests)
  - [ ] Phase 3: Implement production features (feature flags, monitoring, SLOs)
  - [ ] Phase 4: Implement privacy features (consent, deletion, retention)
  - [ ] Phase 5: Add tests, documentation, and backend integration
- **References**: docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md, client/analytics/*
- **Dependencies**: T-028
- **Effort**: L (multiple weeks - requires phased approach)
- **Note**: Platform-agnostic analytics implementation. Codex Agent can verify Android/Web analytics in follow-up.

**T-030**
- **Priority**: P1
- **Type**: CHORE
- **Owner**: GitHub Agent (Primary)
- **Platform**: Platform-Agnostic
- **Status**: BLOCKED
- **Context**:
  - Execute if T-028 decides to remove analytics
  - Clean up 40 files with 86 TODO comments
  - Remove unused imports and references
- **Acceptance Criteria**:
  - [ ] Remove all analytics stub files
  - [ ] Remove analytics imports from other files
  - [ ] Remove analytics references from documentation
  - [ ] Update worldclass.ts or remove if empty
  - [ ] Ensure no broken imports remain
- **References**: client/analytics/*
- **Dependencies**: T-028
- **Effort**: M
- **Note**: Platform-agnostic analytics cleanup. Codex Agent can verify Android/Web dependencies in follow-up.

---

### 🔐 Backend Infrastructure

**T-031**
- **Priority**: P2
- **Type**: FEATURE
- **Owner**: GitHub Agent (Primary)
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Server uses console.error for logging
  - No structured logging for production
  - Difficult to debug and monitor server issues
- **Acceptance Criteria**:
  - [ ] Install Winston or Pino logging library
  - [ ] Replace console.error with proper logger
  - [ ] Add structured logging with context
  - [ ] Configure log levels for environments
  - [ ] Remove TODO at errorHandler.ts:28-30
- **References**: server/middleware/errorHandler.ts:28-30
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic server logging. Codex Agent can verify Android/Web client logging in follow-up.

---

### 🧪 Testing & Quality Assurance

**T-032**
- **Priority**: P2
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic testing infrastructure. Codex Agent can verify Android/Web test compatibility in follow-up.

**T-033**
- **Priority**: P2
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic end-to-end testing. Codex Agent can verify Android/Web workflow testing in follow-up.

**T-034**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic visual regression testing. Codex Agent can verify Android/Web screenshot comparison in follow-up.

**T-035**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic performance monitoring. Codex Agent can verify Android/Web performance metrics in follow-up.

---

### 📚 Documentation Tasks

**T-036**
- **Priority**: P2
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic library documentation. Codex Agent can verify Android/Web integration examples in follow-up.

**T-037**
- **Priority**: P2
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic component documentation. Codex Agent can verify Android/Web component compatibility in follow-up.

**T-038**
- **Priority**: P2
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic workflow diagrams. Codex Agent can verify Android/Web workflow coverage in follow-up.

---

### 🔁 TypeScript Type System Improvements

**T-039**
- **Priority**: P1
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **References**: client/lib/eventBus.ts, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic event type system. Codex Agent can verify Android/Web event handling in follow-up.

**T-040**
- **Priority**: P1
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **References**: client/hooks/useTheme.ts, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: M (broken down from L)
- **Note**: Platform-agnostic theme hook migration. Codex Agent can verify Android/Web theme consistency in follow-up.

**T-041**
- **Priority**: P2
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **References**: client/models/types.ts, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: M
- **Note**: Platform-agnostic model interface audit. Codex Agent can verify Android/Web data model compatibility in follow-up.

**T-042**
- **Priority**: P2
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic navigation patterns. Codex Agent can verify Android/Web navigation type safety in follow-up.

**T-043**
- **Priority**: P2
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
- **Platform**: Platform-Agnostic
- **Status**: READY
- **Context**:
  - Button missing `label` prop
  - ThemedText type union incomplete
  - AIAssistSheet props mismatch
- **Acceptance Criteria**:
  - [ ] Add missing props to Button interface
  - [ ] Fix ThemedText type union (add "title" or remove usage)
  - [ ] Fix AIAssistSheet props (add `context` or remove)
  - [ ] Test all component prop usage
- **References**: client/components/*.tsx, docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md
- **Dependencies**: None
- **Effort**: S
- **Note**: Platform-agnostic component prop validation. Codex Agent can verify Android/Web component props in follow-up.

**T-044**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic TypeScript strict mode. Codex Agent can verify Android/Web type safety in follow-up.

---

## Backlog

### Documentation Consolidation (From Planning Docs)

**T-045**
- **Priority**: P2
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic documentation consolidation. Codex Agent can verify Android/Web documentation coverage in follow-up.

**T-046**
- **Priority**: P2
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic security documentation. Codex Agent can verify Android/Web security practices in follow-up.

**T-047**
- **Priority**: P2
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic analysis documentation consolidation. Codex Agent can verify Android/Web analysis coverage in follow-up.

**T-048**
- **Priority**: P3
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic changelog. Codex Agent can verify Android/Web release notes in follow-up.

**T-049**
- **Priority**: P3
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic file naming conventions. Codex Agent can verify Android/Web file naming consistency in follow-up.

**T-050**
- **Priority**: P3
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic documentation templates. Codex Agent can verify Android/Web template usage in follow-up.

### Documentation Quality & Automation

**T-051**
- **Priority**: P3
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic getting started guide. Codex Agent can verify Android/Web setup instructions in follow-up.

**T-052**
- **Priority**: P3
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic how-to guides. Codex Agent can verify Android/Web task documentation in follow-up.

**T-053**
- **Priority**: P3
- **Type**: DOCS
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic UI screenshots. Codex Agent can verify Android/Web UI screenshots in follow-up.

### Edge Cases & Testing Scenarios

**T-054**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic empty state design. Codex Agent can verify Android/Web empty states in follow-up.

**T-055**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic large dataset testing. Codex Agent can verify Android/Web performance at scale in follow-up.

**T-056**
- **Priority**: P3
- **Type**: QUALITY
- **Owner**: GitHub Agent (Primary)
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
- **Note**: Platform-agnostic permission error handling. Codex Agent can verify Android/Web permission flows in follow-up.

---

## Notes
- No automation is allowed to rewrite this file.
- Optional scripts may generate `TODO.generated.md` for convenience; it is never authoritative.
- This file was reorganized on 2025-01-18 to consolidate all tasks from:
  - Previous TODO.md (lines 43-564)
  - Code TODO comments (AlertDetailScreen, PersistentSidebar, lib files, analytics, errorHandler)
  - Planning documents (docs/archive/2026-01-pre-consolidation/TYPESCRIPT_REMEDIATION_PLAN.md, docs/archive/2026-01-pre-consolidation/DOCUMENTATION_IMPLEMENTATION_PLAN.md, docs/archive/2026-01-pre-consolidation/DOCUMENTATION_CONSOLIDATION_PLAN.md)
- Updated 2026-01-18: Broke down 8 large tasks (T-017, T-019, T-024, T-032, T-033, T-037, T-040, T-052) into phased subtasks for better execution. Only T-029 (Analytics) remains large due to its multi-week nature requiring phased approach.

---

## Summary

**Total Tasks**: 56
**By Priority**:
- P0 (Critical): 3 tasks
- P1 (High): 12 tasks
- P2 (Medium): 26 tasks
- P3 (Low): 15 tasks

**By Type**:
- BUG: 3
- FEATURE: 18
- QUALITY: 15
- DOCS: 12
- CHORE: 7
- SECURITY: 0
- RELEASE: 0
- DEPENDENCY: 1

**By Owner**:
- AGENT: 55 tasks
- Trevor: 1 task (T-028 - Analytics decision)

**By Status**:
- READY: 53 tasks
- BLOCKED: 3 tasks (T-028, T-029, T-030 - analytics decision chain)

**By Effort**:
- Small (S): 14 tasks
- Medium (M): 41 tasks
- Large (L): 1 task (T-029 - Analytics, requires phased multi-week approach)

**Critical Path**:
1. Fix critical bugs (T-001, T-002, T-003)
2. Expose hidden features (T-004 through T-013)
3. Make analytics decision (T-028) → Execute (T-029 or T-030)
4. Fix TypeScript errors (T-039 through T-044)
5. Improve UX and testing (T-014 through T-027, T-032 through T-035)
6. Documentation improvements (T-036 through T-053)
7. Edge cases and polish (T-054 through T-056)

## 🔴 Critical Priority - Bugs & Broken Functionality

### Fixed ✅
- [x] Card component using undefined `type="h4"` in ThemedText
- [x] AIAssistSheet duplicate object properties causing data corruption
- [x] Undefined color constants (electric, electricBlue, deepSpace, slatePanel, textPrimary)
- [x] Typography property access error (`Typography.sizes.*` pattern)
- [x] Non-functional light mode (colors were identical)
- [x] Hardcoded dark mode only (ignored system preference)

### Remaining Bugs
- [x] **Attention Center Info Theme Property Missing** - FIXED (commit b832e21)
  - Files: AttentionCenterScreen.tsx, OnboardingWelcomeScreen.tsx
  - Code referenced `theme.info` which didn't exist in Colors
  - Fix: Added `info: "#3B82F6"` color to both light and dark themes

- [ ] **Time Picker Component Missing** (AlertDetailScreen.tsx:277)
  - Current: Placeholder TODO comment
  - Impact: Poor UX for setting alert times
  - Fix: Implement proper time picker using @react-native-community/datetimepicker

- [ ] **Edge Swipe Gesture Not Implemented** (PersistentSidebar.tsx:63)
  - Current: TODO comment, only button alternative exists
  - Impact: Missing native mobile navigation pattern
  - Fix: Implement PanResponder for left edge swipe detection

- [ ] **Module Navigation Silent Failures**
  - BottomNav component assumes all module routes exist
  - No error handling when navigating to unregistered screens
  - Fix: Add route validation before navigation

---

## 🟡 High Priority - Features Exist But Not Exposed in UI

### Core Engine Features Not Surfaced

- [ ] **Context Engine Not Accessible to Users**
  - Location: `client/lib/contextEngine.ts`
  - Features: Work/Personal/Focus/Social/Wellness/Evening/Weekend modes
  - Current: Only used internally by PersistentSidebar
  - Missing UI: No user control over context switching
  - **Action**: Add context zone selector in Settings or CommandCenter
  - **Action**: Add manual context override UI
  - **Action**: Show current context indicator in UI

- [ ] **Recommendation Engine Not Fully Exposed**
  - Location: `client/lib/recommendationEngine.ts`
  - Features: Cross-module analysis, evidence-based reasoning
  - Current: Only CommandCenter shows recommendations
  - Missing UI: No way to manually trigger recommendation refresh
  - Missing UI: No way to view recommendation generation history
  - Missing UI: No settings for recommendation preferences
  - **Action**: Add "Refresh Recommendations" button in CommandCenter
  - **Action**: Add recommendation settings in AIPreferences screen
  - **Action**: Show evidence/reasoning in recommendation cards

- [ ] **Omnisearch Not Accessible**
  - Location: `client/components/OmnisearchScreen.tsx`
  - Feature: Universal search across all modules
  - Current: Component exists but NOT added to navigation stack
  - Impact: Major feature completely hidden from users
  - **Action**: Add Omnisearch to navigation (modal presentation)
  - **Action**: Add search icon to header or CommandCenter
  - **Action**: Add keyboard shortcut (Cmd+K / Ctrl+K)

- [ ] **Attention Manager Not Fully Integrated**
  - Location: `client/lib/attentionManager.ts`
  - Features: Smart notification bundling, focus mode, priority classification
  - Current: AttentionCenter screen exists but not in navigation
  - Missing UI: No notification badges on modules
  - Missing UI: No focus mode toggle accessible to users
  - Missing UI: No attention preferences in settings
  - **Action**: Add AttentionCenter to navigation stack
  - **Action**: Add attention icon to header with badge count
  - **Action**: Add focus mode toggle to Settings or quick access
  - **Action**: Show attention indicators on BottomNav module buttons

- [ ] **Module Handoff System Not Visible**
  - Location: `client/lib/moduleHandoff.ts`
  - Features: Contextual module transitions with breadcrumbs
  - Current: HandoffBreadcrumb component exists but connection unclear
  - Missing UI: No visual indicators for handoff-enabled modules
  - Missing UI: No handoff history or back navigation
  - **Action**: Clarify handoff system documentation
  - **Action**: Add visual indicators for handoff availability
  - **Action**: Test handoff workflows (e.g., Calendar → Maps)

- [ ] **Lazy Loading System Not Utilized**
  - Location: `client/lib/lazyLoader.ts`
  - Features: Component lazy loading, code splitting
  - Current: Exists but no screens/components use it
  - Impact: Larger bundle size, slower initial load
  - **Action**: Implement lazy loading for heavy screens (Photos, PhotoEditor)
  - **Action**: Lazy load mini-mode components
  - **Action**: Add loading indicators for lazy-loaded content

- [ ] **Prefetch Engine Not Active**
  - Location: `client/lib/prefetchEngine.ts`
  - Features: Predictive data loading, memory management
  - Current: Engine exists but no integration with navigation
  - Impact: Slower screen transitions, wasted opportunity
  - **Action**: Wire prefetch engine to navigation events
  - **Action**: Add prefetch configuration to Settings
  - **Action**: Monitor and optimize prefetch patterns

- [ ] **Memory Manager Not Connected**
  - Location: `client/lib/memoryManager.ts`
  - Features: Smart memory cleanup, cache management
  - Current: Manager exists but no cleanup triggers
  - Impact: Potential memory leaks, degraded performance
  - **Action**: Connect memory manager to app lifecycle events
  - **Action**: Add memory usage monitoring
  - **Action**: Implement automatic cleanup on low memory warnings

---

### Analytics & Monitoring (80+ TODOs)

- [ ] **Complete Stub Analytics Implementation**
  - Files: `client/analytics/**/*` (35 files, 80+ TODO comments)
  - Missing: Group analytics, A/B testing, screen tracking, feature flags, funnels
  - Missing: Metrics, monitoring, validation, sampling, destinations
  - Missing: Consent management, data deletion, retention policies
  - **Decision Required**: Complete implementation OR remove stub code
  - **Action**: If keeping, create implementation plan and timeline
  - **Action**: If removing, clean up unused imports and references

---

## 🟠 Medium Priority - UX Improvements

### Workflow Issues

- [ ] **No Onboarding Flow Activated**
  - Screens exist: OnboardingWelcomeScreen, OnboardingModuleSelectionScreen
  - Current: Navigation starts at CommandCenter, skips onboarding
  - Impact: New users don't understand app structure or features
  - **Action**: Add first-launch detection
  - **Action**: Set initialRouteName to "OnboardingWelcome" for new users
  - **Action**: Add "skip onboarding" option with explanation

- [ ] **Attention Center Not Easily Accessible**
  - Screen: AttentionCenterScreen (registered in navigation at line 407)
  - Issue: No clear navigation path for users to access it
  - Missing: Header icon with badge count, settings link, or CommandCenter card
  - Fix: Add AttentionCenter button/icon to header or add to Settings menu
  - Fix: Show notification badge count when attention items exist
  - **Action**: Add "Attention" icon to header with badge count
  - **Action**: Add link from Settings or CommandCenter

- [ ] **No Way to Access Module Grid**
  - Screen: ModuleGridScreen (shows all 38+ modules)
  - Current: Registered in navigation but no UI button to access it
  - Impact: Users can't discover all available modules
  - **Action**: Add "All Modules" button in BottomNav or Settings
  - **Action**: Add module grid access from sidebar "More" button
  - **Action**: Consider adding to CommandCenter as a card

- [ ] **Settings Screens Not Fully Wired**
  - Exist: NotebookSettings, PlannerSettings, CalendarSettings, EmailSettings, ContactsSettings
  - Current: Registered in navigation but no clear path to access
  - Missing: Settings icon/button in each module's header
  - **Action**: Add settings icon to module headers
  - **Action**: Ensure all module settings screens have meaningful content
  - **Action**: Add "Module Settings" section in main Settings

- [ ] **History Screen Not Accessible**
  - Screen: HistoryScreen (shows system history log)
  - Current: Registered but no navigation path
  - Impact: Users can't view app history or debug issues
  - **Action**: Add History to System screen or Settings menu
  - **Action**: Consider adding history access from CommandCenter

- [ ] **Recommendation History Not Accessible**
  - Screen: RecommendationHistoryScreen
  - Current: Registered but no button to access
  - Impact: Users can't review past AI suggestions or decisions
  - **Action**: Add "View History" button in CommandCenter
  - **Action**: Link from AIPreferences screen

- [ ] **Integration Details Not Linked**
  - Screens: IntegrationsScreen, IntegrationDetailScreen
  - Current: Settings path exists but integration cards may not navigate properly
  - **Action**: Test integration navigation flow
  - **Action**: Ensure proper navigation to detail screen

### Silent Failures & Error Handling

- [ ] **No Error Boundaries at Route Level**
  - Current: Only app-level ErrorBoundary exists
  - Impact: Screen crashes affect entire app instead of just that screen
  - **Action**: Wrap each Stack.Screen with ErrorBoundary
  - **Action**: Add recovery options (reload screen, go back, go home)

- [ ] **No Loading States for Data Fetching**
  - Issue: Screens don't show loading indicators during data load
  - Impact: Users see blank screens or stale data
  - **Action**: Add loading states to all data-dependent screens
  - **Action**: Use skeleton screens for better UX
  - **Action**: Add pull-to-refresh where appropriate

- [ ] **No Offline Mode Indicators**
  - Issue: App doesn't show offline status or handle network errors
  - Impact: Silent failures when network unavailable
  - **Action**: Add network status indicator
  - **Action**: Show offline mode banner
  - **Action**: Cache data for offline viewing

- [ ] **Form Validation Not Comprehensive**
  - Issue: Input validation may be missing in editor screens
  - Screens: NoteEditor, TaskDetail, EventDetail, ContactDetail, ListEditor
  - **Action**: Add comprehensive input validation
  - **Action**: Show clear error messages
  - **Action**: Prevent submission of invalid data

---

## 🟢 Low Priority - Polish & Refinements

### Design System Improvements

- [ ] **Replace Hardcoded Colors with Theme Constants** (11 occurrences)
  - Files: Multiple components use rgba() and hex values directly
  - Examples:
    - `rgba(0, 0, 0, 0.7)` in QuickCaptureOverlay
    - `rgba(10, 14, 26, 0.95)` in HandoffBreadcrumb
    - `rgba(255, 255, 255, 0.2)` in AIAssistSheet
    - `#9B59B6` in QuickCaptureOverlay
  - **Action**: Replace with theme.overlay, theme.border, etc.
  - **Action**: Add any missing color constants to theme.ts
  - **Action**: Document color usage guidelines

- [ ] **Standardize Import Paths**
  - Issue: Mix of relative (`../`, `./`) and alias (`@/`) imports
  - Impact: Inconsistent code style, harder to refactor
  - **Action**: Convert all to alias imports for consistency
  - **Action**: Update import path guidelines in documentation

- [ ] **Add Missing Typography Variants**
  - Current: Only h1, h2, h3 defined (no h4, h5, h6)
  - Impact: Limited text hierarchy options
  - **Action**: Add h4, h5, h6 to Typography constants
  - **Action**: Document typography scale usage

- [ ] **Enhance Color Palette for Light Mode**
  - Current: Basic light mode implemented but could be refined
  - **Action**: Test all screens in light mode
  - **Action**: Adjust colors for better contrast/readability
  - **Action**: Add light mode screenshots to documentation

### Accessibility Improvements

- [ ] **Complete Accessibility Coverage** (90% → 100%)
  - Missing: Some Pressable components lack accessibilityRole
  - Missing: Some elements lack accessibilityHint
  - Missing: Some images lack accessibilityLabel
  - **Action**: Audit all interactive elements
  - **Action**: Add missing accessibility attributes
  - **Action**: Test with screen readers (VoiceOver, TalkBack)
  - **Action**: Add accessibility documentation

- [ ] **Keyboard Navigation Support**
  - Current: Touch-first interface, limited keyboard support
  - **Action**: Add keyboard shortcuts documentation
  - **Action**: Ensure tab navigation works properly
  - **Action**: Add keyboard focus indicators

- [ ] **Color Contrast Validation**
  - **Action**: Run WCAG contrast checker on all text/background combinations
  - **Action**: Fix any failing contrast ratios (minimum 4.5:1 for normal text)
  - **Action**: Document color contrast guidelines

### Performance Optimizations

- [ ] **Optimize Animation Performance**
  - Files: MiniModeContainer, QuickCaptureOverlay, CommandCenter
  - Current: Complex animations may drop frames on older devices
  - **Action**: Profile animation performance
  - **Action**: Consider using LayoutAnimation for simple transitions
  - **Action**: Add reduced motion preference support

- [ ] **Implement Code Splitting**
  - Current: All components loaded at app start
  - **Action**: Split by route/module
  - **Action**: Lazy load heavy components (PhotoEditor, etc.)
  - **Action**: Measure and optimize bundle size

- [ ] **Optimize Image Loading**
  - Files: PhotosScreen, AlbumsScreen, PhotoDetailScreen
  - **Action**: Implement progressive image loading
  - **Action**: Add image caching strategy
  - **Action**: Optimize image sizes for mobile

- [ ] **Add Performance Monitoring**
  - **Action**: Track screen load times
  - **Action**: Monitor animation FPS
  - **Action**: Track memory usage over time
  - **Action**: Set performance budgets

---

## 📱 User Experience Testing Needed

### Workflow Validation

- [ ] **Test Complete Onboarding Flow**
  - Start: Fresh install → OnboardingWelcome
  - Steps: Module selection → First use tutorial
  - End: CommandCenter with initial setup complete
  - **Validate**: All steps work, data persists, can skip/go back

- [ ] **Test Recommendation Accept/Decline Flow**
  - Start: CommandCenter with recommendations
  - Actions: Swipe right (accept), swipe left (decline)
  - Validate: Haptic feedback works, action executes, history logged
  - Edge cases: What if no recommendations? What if API fails?

- [ ] **Test Mini-Mode Workflows**
  - Test each mini-mode: Task, Note, Calendar, Contacts, Budget
  - Validate: Opens, accepts input, saves data, closes properly
  - Edge cases: Dismiss without saving, validation errors

- [ ] **Test Module Navigation Flow**
  - Start: CommandCenter
  - Navigate: Use BottomNav arrows to switch modules
  - Validate: Module order adapts to usage, haptics work
  - Edge cases: Disabled modules, no modules enabled

- [ ] **Test Search Flow** (once implemented)
  - Open: Omnisearch modal
  - Search: Type query, see results grouped by module
  - Navigate: Tap result, opens correct detail screen
  - Validate: Fast (<500ms), accurate, no crashes

- [ ] **Test Context Switching** (once exposed)
  - Switch contexts: Work → Personal → Focus
  - Validate: Modules shown/hidden correctly
  - Validate: User can override automatic context
  - Validate: Context persists across app restarts

- [ ] **Test Attention Center Flow** (once accessible)
  - View: All attention items grouped by priority
  - Dismiss: Individual items and bundles
  - Navigate: Tap action button, goes to correct screen
  - Toggle: Focus mode on/off

- [ ] **Test Light/Dark Mode Switching**
  - Switch: System settings light/dark
  - Validate: App updates immediately
  - Validate: All screens readable in both modes
  - Take screenshots of key screens in each mode

### Edge Cases to Test

- [ ] **Empty States**
  - Test all screens with no data
  - Validate: Clear empty state messaging
  - Validate: Actionable CTAs to add content

- [ ] **Data Limits**
  - Test screens with thousands of items
  - Validate: Smooth scrolling, no performance issues
  - Validate: Pagination or virtualization works

- [ ] **Network Failures**
  - Test with airplane mode on
  - Validate: Clear error messages
  - Validate: Offline mode works where applicable

- [ ] **Permission Denials**
  - Test when camera/photos/contacts permissions denied
  - Validate: Clear explanation and recovery path
  - Validate: App doesn't crash

- [ ] **Low Memory Conditions**
  - Test on older devices
  - Validate: Memory manager cleans up properly
  - Validate: No crashes from out-of-memory

---

## 🏗️ Architecture & Code Quality

### Documentation

- [ ] **Document All Lib Modules**
  - Each lib file needs usage examples
  - **Action**: Add "How to Use" section to each lib file header
  - **Action**: Show integration examples with UI components
  - **Action**: Document public APIs and expected usage patterns

- [ ] **Create UI Component Library Documentation**
  - **Action**: Document all components with props, usage, examples
  - **Action**: Add Storybook or similar for component showcase
  - **Action**: Include accessibility guidelines per component

- [ ] **Add Workflow Diagrams**
  - **Action**: Create user flow diagrams for key workflows
  - **Action**: Document state management patterns
  - **Action**: Map data flow between screens and lib modules

### Testing

- [ ] **Add Component Tests**
  - Current: Only Button component has tests
  - **Action**: Add tests for all atomic components (Card, ThemedText, etc.)
  - **Action**: Add tests for complex components (MiniModeContainer, etc.)
  - **Action**: Aim for 80%+ component test coverage

- [ ] **Add Integration Tests**
  - **Action**: Test critical user workflows end-to-end
  - **Action**: Test navigation between screens
  - **Action**: Test data persistence across app restarts

- [ ] **Add Visual Regression Tests**
  - **Action**: Screenshot test key screens
  - **Action**: Compare light vs dark mode
  - **Action**: Detect unintended visual changes

- [ ] **Add Accessibility Tests**
  - **Action**: Automated WCAG compliance checking
  - **Action**: Test with screen reader enabled
  - **Action**: Validate keyboard navigation

### Code Cleanup

- [ ] **Remove or Complete Analytics Stubs**
  - Decision needed: Complete implementation or remove
  - 80+ TODO comments across 35 files
  - Significant technical debt if left incomplete

- [ ] **Remove Dead Code**
  - Search for unused imports
  - Remove commented-out code blocks
  - Clean up deprecated patterns

- [ ] **Improve Error Messages**
  - Add user-friendly error messages throughout
  - Replace generic errors with specific, actionable ones
  - Add error tracking/logging for debugging

---

## 📋 Status Summary

### ✅ Completed (6 items)
- Critical bugs fixed
- Light mode implemented
- System color scheme detection added
- Missing color constants added
- Typography issues resolved
- Comprehensive analysis report created

### 🔄 In Progress (0 items)
- *Ready to start work on TODO items*

### ⏳ To Do (60+ items)
- 2 remaining critical bugs
- 8 major features hidden/not exposed
- 80+ analytics TODOs
- 15 workflow issues
- 10 silent failure risks
- 15 polish items
- 12 testing scenarios
- 8 documentation tasks

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Fixes (1-2 days)
1. Fix Attention Center theme.info property
2. Add info color to theme or replace with accent
3. Fix module navigation error handling
4. Test and fix any broken navigation flows

### Phase 2: Expose Hidden Features (3-5 days)
1. Add Omnisearch to navigation (high user value)
2. Add AttentionCenter to navigation
3. Expose context switching in UI
4. Add Module Grid access button
5. Connect Onboarding flow for new users

### Phase 3: Complete Workflows (5-7 days)
1. Wire up all settings screens
2. Add History and RecommendationHistory access
3. Implement error boundaries at route level
4. Add loading states to all screens
5. Test all user workflows end-to-end

### Phase 4: Polish & Performance (3-5 days)
1. Replace hardcoded colors with theme
2. Complete accessibility coverage
3. Optimize animations and loading
4. Add comprehensive testing

### Phase 5: Analytics Decision (1-2 days OR remove)
1. Decide: Complete analytics or remove stubs
2. If completing: Create detailed implementation plan
3. If removing: Clean up all analytics code and references

---

## 📞 Questions for Product/Design Team

1. **Analytics**: Should we complete the stub implementation or remove it?
2. **Onboarding**: Should we activate the onboarding flow for all users or only first-launch?
3. **Context Engine**: Should users have manual control over context switching?
4. **Omnisearch**: Should this be always-accessible (e.g., Cmd+K) or just via button?
5. **Module Grid**: Should this be a modal or full screen? Always accessible?
6. **Performance**: What are acceptable performance budgets (load time, FPS, bundle size)?
7. **Accessibility**: Do we need WCAG AA or AAA compliance?
8. **Testing**: What's the target test coverage percentage?

---

**Last Updated**: 2026-01-17
**Total Items**: 72
**Priority Breakdown**: 2 Critical, 18 High, 30 Medium, 22 Low
