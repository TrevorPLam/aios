# TODO.md 

Document Type: Workflow
Last Updated: 2026-01-05
Task Truth Source: **TODO.md**

This file is the single source of truth for actionable work.
If another document disagrees, the task record in this file wins (unless the Constitution overrides).

## Task schema (required)
- **ID**: `T-###` (unique)
- **Priority**: `P0 | P1 | P2 | P3`
- **Type**: `SECURITY | RELEASE | DEPENDENCY | DOCS | QUALITY | BUG | FEATURE | CHORE`
- **Owner**: `AGENT | Trevor`
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
- **Owner: AGENT** means the task can be executed by a coding agent in-repo.
- **Owner: Trevor** means it requires external actions (provider dashboards, DNS, billing, approvals).

## Active tasks (fill in)
> Keep tasks small and independently executable. Prefer ≤ 1 day per task.


## Backlog

## Notes
- No automation is allowed to rewrite this file.
- Optional scripts may generate `TODO.generated.md` for convenience; it is never authoritative.

------

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
