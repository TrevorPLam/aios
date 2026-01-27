# Test Index and Coverage Map

## Plain English Summary

This document maps functionality to test files, making it easy to find which tests cover which features. When you need to test or verify something, use this map to locate the relevant tests.

**Related Tasks:** TASK-087 (Test Index and Location Mapping), TASK-090 (Testing Documentation)

**Last Updated:** 2026-01-26

## Related Documentation

- **[Test Requirements and Patterns](./test_requirements_and_patterns.md)** - Clarifies what's testable at each layer, common patterns, and anti-patterns
- **[Test Architecture](./test_architecture.md)** - Three-tier testing strategy (API, Client, Integration)
- **[Test Organization](./test_organization.md)** - How tests are organized in the codebase

## API Tests (Server-Side)

### Authentication & Authorization
- **File:** `apps/api/__tests__/auth.security.test.ts`
- **Coverage:**
  - User registration validation
  - Password security requirements
  - JWT token generation
  - Token verification

- **File:** `apps/api/__tests__/jwt.security.test.ts`
- **Coverage:**
  - JWT token expiration
  - Invalid token handling
  - Token payload validation

### Analytics
- **File:** `apps/api/__tests__/analytics.test.ts`
- **Coverage:**
  - Analytics storage operations (save, get, delete)
  - Event idempotency
  - Batch event handling
  - GDPR user data deletion
  - Event filtering and querying

- **File:** `apps/api/__tests__/analytics.enhanced.test.ts`
- **Coverage:**
  - Advanced analytics scenarios
  - Performance testing
  - Edge cases

### Validation
- **File:** `apps/api/__tests__/validation.middleware.test.ts`
- **Coverage:**
  - Request validation middleware
  - Input sanitization
  - Error messages

- **File:** `apps/api/__tests__/validation.security.test.ts`
- **Coverage:**
  - Security-focused validation
  - XSS prevention
  - SQL injection prevention
  - Input length limits

### Rate Limiting
- **File:** `apps/api/__tests__/rateLimiter.security.test.ts`
- **Coverage:**
  - Rate limit enforcement
  - Request throttling
  - Security against abuse

### End-to-End Workflows
- **File:** `apps/api/__tests__/api.e2e.test.ts`
- **Coverage:**
  - Full auth → notes workflow
  - User registration → login → CRUD operations

- **File:** `apps/api/__tests__/messages.quickwins.e2e.test.ts`
- **Coverage:**
  - Messages quick wins E2E flow

### Property-Based Testing
- **File:** `apps/api/__tests__/property-based.example.test.ts`
- **Coverage:**
  - Property-based testing examples
  - Generative testing patterns

## Client Tests (React Native)

### Analytics Client
- **File:** `packages/platform/analytics/__tests__/client.test.ts`
- **Coverage:**
  - Offline event queueing
  - Retry logic on failure
  - Successful event flushing
  - Queue statistics

- **File:** `packages/platform/analytics/__tests__/queue.test.ts`
- **Coverage:**
  - Event queue operations
  - Queue persistence
  - Queue management

- **File:** `packages/platform/analytics/__tests__/buckets.test.ts`
- **Coverage:**
  - Time bucketing logic
  - Install age bucketing

### Storage Layer
- **File:** `packages/platform/storage/__tests__/database.test.ts`
- **Coverage:**
  - Recommendation storage
  - Note storage
  - Task storage
  - AsyncStorage operations

- **File:** `packages/platform/storage/__tests__/tasks.test.ts`
- **Coverage:**
  - Task CRUD operations
  - Task status updates
  - Task filtering

- **File:** `packages/platform/storage/__tests__/notes.test.ts`
- **Coverage:**
  - Note CRUD operations
  - Note tagging
  - Note linking

- **File:** `packages/platform/storage/__tests__/calendar.test.ts`
- **Coverage:**
  - Calendar event storage
  - Event recurrence
  - Event querying

- **File:** `packages/platform/storage/__tests__/contacts.test.ts`
- **Coverage:**
  - Contact storage
  - Contact search
  - Contact grouping

- **File:** `packages/platform/storage/__tests__/lists.test.ts`
- **Coverage:**
  - List storage
  - List items
  - List sharing

- **File:** `packages/platform/storage/__tests__/alerts.test.ts`
- **Coverage:**
  - Alert storage
  - Alert notifications
  - Alert scheduling

- **File:** `packages/platform/storage/__tests__/photos.test.ts`
- **Coverage:**
  - Photo storage
  - Photo metadata
  - Photo albums

- **File:** `packages/platform/storage/__tests__/budgets.test.ts`
- **Coverage:**
  - Budget storage
  - Budget calculations
  - Budget tracking

- **File:** `packages/platform/storage/__tests__/emailThreads.test.ts`
- **Coverage:**
  - Email thread storage
  - Thread management

- **File:** `packages/platform/storage/__tests__/messages.test.ts`
- **Coverage:**
  - Message storage
  - Message threading

- **File:** `packages/platform/storage/__tests__/integrations.test.ts`
- **Coverage:**
  - Integration configurations
  - External service connections

- **File:** `packages/platform/storage/__tests__/history.test.ts`
- **Coverage:**
  - History tracking
  - Activity logs

- **File:** `packages/platform/storage/__tests__/settings.test.ts`
- **Coverage:**
  - User settings
  - Preferences

- **File:** `packages/platform/storage/__tests__/translations.test.ts`
- **Coverage:**
  - Translation storage
  - Language support

- **File:** `packages/platform/storage/__tests__/quickWins.e2e.test.ts`
- **Coverage:**
  - Quick wins E2E tests

### Platform Libraries
- **File:** `packages/platform/lib/__tests__/navigationPerformance.test.ts`
- **Coverage:**
  - Navigation performance monitoring
  - Screen transition metrics

- **File:** `packages/platform/lib/__tests__/lazyLoader.test.ts`
- **Coverage:**
  - Lazy loading utilities
  - Code splitting

- **File:** `packages/platform/lib/__tests__/lazyFallback.test.ts`
- **Coverage:**
  - Lazy loading fallback UI
  - Loading states

- **File:** `packages/platform/lib/__tests__/memoryManager.test.ts`
- **Coverage:**
  - Memory management
  - Cache eviction

- **File:** `packages/platform/lib/__tests__/prefetchEngine.test.ts`
- **Coverage:**
  - Data prefetching
  - Predictive loading

- **File:** `packages/platform/lib/__tests__/eventBus.test.ts`
- **Coverage:**
  - Event bus implementation
  - Event subscription/publishing

- **File:** `packages/platform/lib/__tests__/keyboardShortcuts.test.ts`
- **Coverage:**
  - Keyboard shortcut handling
  - Shortcut registration

- **File:** `packages/platform/lib/__tests__/navigationValidation.test.ts`
- **Coverage:**
  - Navigation parameter validation
  - Route validation

- **File:** `packages/platform/lib/__tests__/platformSupport.test.ts`
- **Coverage:**
  - Platform detection
  - Feature support checks

### Design System
- **File:** `packages/design-system/utils/__tests__/themeColors.test.ts`
- **Coverage:**
  - Theme color calculations
  - Color utilities

- **File:** `packages/design-system/utils/__tests__/timeInput.test.ts`
- **Coverage:**
  - Time input formatting
  - Time validation

## Test Coverage by Module

### Analytics Module
**Coverage:** 90%+
- Client-side: `packages/platform/analytics/__tests__/`
- Server-side: `apps/api/__tests__/analytics*.test.ts`
- Integration: Covered in E2E tests

### Authentication Module
**Coverage:** 85%+
- Server-side: `apps/api/__tests__/auth.security.test.ts`, `jwt.security.test.ts`
- Integration: Covered in E2E tests

### Storage Module
**Coverage:** 75%+
- Client-side: `packages/platform/storage/__tests__/`
- Server-side: Tested via API endpoints

### Platform Libraries
**Coverage:** 70%+
- Client-side: `packages/platform/lib/__tests__/`

### Design System
**Coverage:** 60%+
- Client-side: `packages/design-system/utils/__tests__/`

## Finding Tests for a Feature

### "Where do I test offline event queueing?"
→ `packages/platform/analytics/__tests__/client.test.ts`

### "Where do I test API authentication?"
→ `apps/api/__tests__/auth.security.test.ts`

### "Where do I test database operations?"
→ `packages/platform/storage/__tests__/database.test.ts` (client)
→ `apps/api/__tests__/*.test.ts` (server via API)

### "Where do I test GDPR deletion?"
→ `apps/api/__tests__/analytics.test.ts` (storage)
→ Integration test needed for full E2E flow

### "Where do I test full user workflows?"
→ `apps/api/__tests__/api.e2e.test.ts`
→ `apps/api/__tests__/messages.quickwins.e2e.test.ts`

## Test Coverage Gaps

### Known Gaps (Need Tests)
1. **Integration:** Full analytics E2E (client → server → database)
2. **Client:** React Native component tests
3. **Client:** Hook tests for custom hooks
4. **API:** More comprehensive E2E scenarios
5. **API:** Performance/load testing

### Planned Tests
- See BACKLOG.toon for future test tasks
- TASK-085: Integration testing for analytics Phase 0

## Test Organization

### Current Structure
```
apps/api/__tests__/
├── helpers/           # Test helper utilities (TASK-089)
├── mocks/            # Test mocks (TASK-088)
├── *.test.ts         # Mixed unit/integration tests
├── *.e2e.test.ts     # E2E tests
└── *.security.test.ts # Security tests

packages/platform/
├── analytics/__tests__/  # Analytics client tests
├── storage/__tests__/    # Storage layer tests
├── lib/__tests__/        # Library tests
└── ...
```

### Future Structure (TASK-086)
```
apps/api/__tests__/
├── unit/             # Pure unit tests
├── integration/      # API integration tests
├── e2e/             # E2E tests
├── security/        # Security tests
├── helpers/         # Test utilities
└── mocks/           # Test mocks
```

## Related Documentation

- [Test Architecture](./test_architecture.md) - Three-tier testing strategy
- [Test Pyramid](./test_pyramid.md) - Test distribution
- [Testing Strategy](./strategy.md) - Overall approach
- [Quality Gates](./quality_gates.md) - Quality requirements

## References

- TASK-087: Test Index and Location Mapping
- TASK-091: Test Architecture
- `.repo/tasks/TODO.toon` - Active tasks
