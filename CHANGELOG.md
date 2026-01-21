# Changelog

All notable changes to AIOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Secondary navigation bars across all major modules (T-003A) - 2026-01-20
  - NotebookScreen: AI Assist, Backup, Templates quick actions
  - ListsScreen: Share List, Templates, Statistics quick actions
  - PlannerScreen: AI Assist, Time Block, Dependencies quick actions
  - CalendarScreen: Sync, Export, Quick Add quick actions
  - Scroll-based hide/show animation for all secondary navigation bars
  - Consistent oval, transparent design with haptic feedback
  - 19 automated tests validating navigation consistency and behavior
- Recommendation preferences in AI Preferences for Command Center visibility, auto-refresh, and card evidence (T-007)
- Manual "Refresh Recommendations" button in Command Center with disabled state handling (T-007)
- Recommendation tools in AI Preferences for refreshing suggestions and opening recommendation history
- Web-friendly alert time input with validation for AlertDetailScreen (T-001B)
- Web keyboard shortcut (Cmd/Ctrl+K) to open Omnisearch from anywhere
- Focus indicators on Omnisearch interactive controls for keyboard navigation
- Loading/error state messaging for Integrations and Integration Detail screens with retry actions
- Reusable ScreenStateMessage component for consistent loading/error messaging
- ListEditor validation utilities covering title, item length, duplicates, and list size warnings
- ThemedText typography variant coverage tests for h4-h6 rendering
- Screen-level error recovery actions (try again, go back, go home) for route error boundaries
- Navigation performance hooks that connect prefetching and memory tracking to module transitions

### Changed

- Updated module header documentation for Notebook, Lists, Planner, and Calendar screens
- Enhanced UX consistency across modules with unified navigation pattern
- Recommendation cards now surface reasoning and evidence previews for faster decision-making (T-007)
- Standardized overlay colors and quick-capture action accents through theme tokens
- Disabled sidebar edge-swipe gesture on web while preserving the button entry point (T-002B)
- Added navigation coverage tests for module grid, history, and integration detail access
- ListEditor save flow now blocks invalid list data and surfaces warning confirmations

### Technical

- Implemented scroll-aware animations using React Native Reanimated shared values
- Added constants for animation timing, thresholds, and scroll behavior
- Used `translateY` transforms for smooth 60fps animations
- Centralized route-to-module mapping for analytics and performance integrations

### Documentation

- Comprehensive documentation consolidation and reorganization
- Added documentation best practices guide
- Created implementation plan for world-class documentation standards
- Documented theme token usage for overlay and semantic colors

## [2.0.0] - 2026-01-16

### Added (2)

- Organized /docs structure with technical/, security/, analysis/, planning/, analytics/ subdirectories
- Comprehensive SECURITY.md with module-specific security status
- docs/INDEX.md for comprehensive navigation
- docs/security/SECURITY.md consolidating 11 security summaries
- DOCUMENTATION_ANALYSIS.md with complete inventory and quality assessment
- DOCUMENTATION_CONSOLIDATION_PLAN.md with 6-phase reorganization strategy
- DOCUMENTATION_BEST_PRACTICES.md with industry research and standards
- DOCUMENTATION_IMPLEMENTATION_PLAN.md with 90-day roadmap (archived to docs/archive/2026-01-pre-consolidation/)
- DOCUMENTATION_QUALITY_CONTROL.md with session analysis

### Changed (2)

- Reorganized 72 root files → 10 root files (86% reduction)
- Consolidated competitive analysis (2 files → 1)
- Consolidated code quality analysis (2 files → 1)
- Updated all internal links to new paths
- Fixed broken links in F&F.md and MODULE_DETAILS.md
- Established single source of truth for all documentation types

### Archived

- 55+ historical documents organized by category in docs/archive/
- Module completion summaries (10 files)
- Enhancement summaries (11 files)
- Analysis reports (18 files)
- Security summaries (9 files)
- Project management documents (5 files)
- Pre-consolidation backups (F&F-BACKUP.md, etc.)

### Documentation (2)

- Updated README.md with new documentation structure
- Rewrote DOCUMENTATION_GUIDE.md to reflect reorganization
- Added comprehensive cross-references across all documentation

## [1.0.0] - 2025-12-01

### Added (3)

- Initial AIOS mobile application scaffold
- 14 core modules (Command Center, Notebook, Planner, Calendar, Lists, Budget, Integrations, History, Email, Photos, Messaging, Translator, Alerts, Contacts)
- AsyncStorage local persistence layer
- JWT-based authentication system
- Complete test suite with 100% coverage on critical paths
- React Native mobile-first architecture
- Expo development environment
- Express.js backend API structure
- TypeScript type safety across entire codebase

### Features by Module

- **Command Center:** AI recommendations engine with 6 rule-based suggestions
- **Notebook:** 29 database methods, Jaccard similarity algorithm, 49 unit tests
- **Planner:** Hierarchical task management, 18 database methods, 31 tests
- **Calendar:** 18 database methods, conflict detection, 33 tests
- **Lists:** 28 database methods, 7 categories, 46 tests
- **Budget:** 15 database methods, templates, 38 tests
- **Integrations:** 22 database methods, health monitoring, 39 tests
- **History:** Activity logging across all modules, 40+ tests
- **Email:** Thread-based UI, multi-account support (UI only)
- **Photos:** Grid layout, cloud backup tracking
- **Messaging:** P2P messaging UI, AI assist framework
- **Translator:** 12+ languages, LibreTranslate integration
- **Alerts:** Digital clock, recurrence support, snooze
- **Contacts:** Device integration via expo-contacts

### Technical (2)

- React Native 0.73+ with Expo SDK
- TypeScript for type safety
- AsyncStorage for local data persistence
- JWT authentication with bcrypt password hashing
- Comprehensive test coverage (46-49 tests per major module)
- Zero security vulnerabilities (CodeQL validated)

### Documentation (3)

- Initial README with setup instructions
- API documentation structure
- Design guidelines
- Module-specific documentation

---

## Version History Notes

### Semantic Versioning

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New functionality, backwards compatible
- **PATCH** version (0.0.X): Backwards compatible bug fixes

### Documentation Versions

- **v2.0.0**: Major documentation reorganization (2026-01-16)
- **v1.0.0**: Initial release with basic documentation (2025-12-01)

---

**Maintained By:** Documentation Team
**Last Updated:** January 16, 2026
**Next Review:** February 16, 2026
