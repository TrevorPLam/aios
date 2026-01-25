# Test Architecture: Three-Tier Testing Strategy

## Plain English Summary

This document defines our three-tier test architecture: **API tests** (server-side), **Client tests** (React Native), and **Integration tests** (client + server together). This separation clarifies what to test where and prevents confusion about test boundaries.

**Related Tasks:** TASK-091, TASK-086, TASK-087, TASK-088, TASK-089

**Last Updated:** 2026-01-25

## Problem Statement

Previously, our tests mixed concerns:
- API tests tried to test client-side features (offline queueing, retry logic)
- Unit tests and integration tests were in the same files
- It was unclear what should be tested at which layer

This led to confusion (see TASK-085) and tests that couldn't properly validate functionality.

## Three-Tier Architecture

### Tier 1: API Tests (Server-Side)

**Location:** `apps/api/__tests__/`

**Purpose:** Test server-side logic, endpoints, middleware, and database operations.

**What to Test:**
- HTTP endpoint behavior (request/response)
- Authentication and authorization
- Input validation
- Database operations via MemStorage
- Error handling and status codes
- Rate limiting
- Security patterns

**What NOT to Test:**
- Client-side queueing or retry logic
- React Native specific features
- UI components
- Network failure simulation (that's integration test territory)

**Technology:**
- Express server
- MemStorage (in-memory database)
- Jest
- Supertest or fetch for HTTP calls

**Example Tests:**
- `apps/api/__tests__/analytics.test.ts` - Analytics storage and API endpoints
- `apps/api/__tests__/auth.security.test.ts` - Auth security patterns
- `apps/api/__tests__/validation.middleware.test.ts` - Input validation

### Tier 2: Client Tests (React Native)

**Location:** `packages/platform/**/__tests__/`, `apps/mobile/**/__tests__/`

**Purpose:** Test client-side logic, React Native features, and mobile-specific functionality.

**What to Test:**
- Offline queueing logic
- Retry mechanisms
- AsyncStorage operations
- React hooks and components
- Analytics client logic
- Event batching
- State management

**What NOT to Test:**
- Server API endpoints
- Database persistence (use mocks)
- Full E2E flows (that's integration test territory)

**Technology:**
- React Native Testing Library
- Jest
- AsyncStorage mocks
- React hooks testing

**Example Tests:**
- `packages/platform/analytics/__tests__/client.test.ts` - Analytics client with queueing
- `packages/platform/analytics/__tests__/queue.test.ts` - Event queue logic
- `packages/platform/storage/__tests__/database.test.ts` - Storage layer

### Tier 3: Integration Tests (Client + Server)

**Location:** `apps/api/__tests__/*.e2e.test.ts` or dedicated `integration/` directory (future)

**Purpose:** Test complete flows from client to server to database, including error scenarios.

**What to Test:**
- Full event flow: client sends → server receives → database persists
- Network failure scenarios
- Retry behavior across client and server
- Authentication flows
- End-to-end user journeys
- GDPR deletion across layers

**Technology:**
- Real Express server (or test server)
- Real or mock client
- Jest
- Both client and server code

**Example Tests:**
- `apps/api/__tests__/api.e2e.test.ts` - Full auth and notes workflow
- `apps/api/__tests__/messages.quickwins.e2e.test.ts` - Quick wins E2E
- Future: Analytics E2E test for offline queueing + retry + persistence

## Test Organization Principles

### 1. One Concern Per Test File

**Good:**
```
analytics.storage.test.ts      // Unit: Just storage operations
analytics.api.test.ts          // Integration: API endpoints
analytics.client.test.ts       // Unit: Client-side logic
analytics.e2e.test.ts          // E2E: Full flow
```

**Bad:**
```
analytics.test.ts              // Mixed: Storage + API + client in one file
```

### 2. Clear Test Names

Use naming conventions that indicate the test type:
- `*.test.ts` - Unit tests
- `*.integration.test.ts` - Integration tests (API level)
- `*.e2e.test.ts` - End-to-end tests
- `*.security.test.ts` - Security-focused tests

### 3. Test Independence

Each test should:
- Set up its own data
- Clean up after itself
- Not depend on other tests
- Be runnable in isolation

### 4. Appropriate Mocking

**API Tests:**
- Mock external services (if any)
- Use real MemStorage (it's fast)
- Don't mock the code you're testing

**Client Tests:**
- Mock network/transport layer
- Mock AsyncStorage if needed
- Mock React Native platform APIs

**Integration Tests:**
- Minimal mocking
- Use real server and client
- Mock only external dependencies

## Directory Structure

```
apps/api/__tests__/
├── unit/                          # Pure unit tests (future)
├── integration/                   # Integration tests (future)
│   ├── analytics.api.test.ts
│   ├── auth.api.test.ts
│   └── ...
├── e2e/                          # E2E tests (future)
│   ├── analytics.e2e.test.ts
│   ├── api.e2e.test.ts
│   └── ...
└── security/                     # Security tests (future)
    ├── auth.security.test.ts
    ├── jwt.security.test.ts
    └── ...

packages/platform/
├── analytics/__tests__/
│   ├── client.test.ts           # Client unit tests
│   ├── queue.test.ts
│   └── transport.test.ts
├── storage/__tests__/
│   ├── database.test.ts
│   └── ...
└── lib/__tests__/
    └── ...
```

## Decision: Why Three Tiers?

**Alternatives Considered:**
1. Two-tier (unit + integration only) - Too broad, still mixes concerns
2. Four-tier (add component tests) - Too complex for our current scale
3. No separation - Current problematic state

**Chosen:** Three-tier architecture

**Rationale:**
- Clear boundaries for what to test where
- Aligns with our tech stack (React Native client + Express API)
- Prevents confusion (TASK-085 showed we needed this)
- Enables different test configurations (fast unit vs slow E2E)
- Industry standard approach

## Testing Anti-Patterns to Avoid

### ❌ Testing Client Features in API Tests

**Bad:**
```typescript
// In apps/api/__tests__/analytics.test.ts
test("should queue events offline", () => {
  // This is CLIENT-SIDE logic, not API logic!
});
```

**Good:**
```typescript
// In packages/platform/analytics/__tests__/client.test.ts
test("should queue events offline", () => {
  // Test client queueing logic here
});
```

### ❌ Testing Server Features in Client Tests

**Bad:**
```typescript
// In packages/platform/analytics/__tests__/client.test.ts
test("should persist to database", () => {
  // This is SERVER-SIDE logic, not client logic!
});
```

**Good:**
```typescript
// In apps/api/__tests__/analytics.integration.test.ts
test("should persist events to database", () => {
  // Test server persistence here
});
```

### ❌ Mixing Unit and Integration in Same File

**Bad:**
```typescript
// In analytics.test.ts
describe("Unit", () => { ... });
describe("Integration", () => { ... });
```

**Good:**
```typescript
// analytics.unit.test.ts
describe("Analytics Storage", () => { ... });

// analytics.integration.test.ts  
describe("Analytics API", () => { ... });
```

## Test Coverage Guidelines

Based on the test pyramid:

- **Unit Tests:** 80% of test count
  - Fast (milliseconds)
  - Test individual functions/classes
  - High code coverage expected
  
- **Integration Tests:** 15% of test count
  - Medium speed (seconds)
  - Test API endpoints and workflows
  - Focus on critical paths
  
- **E2E Tests:** 5% of test count
  - Slow (seconds to minutes)
  - Test complete user journeys
  - Cover critical business flows only

## Implementation Checklist

- [x] Create test architecture documentation (this file)
- [ ] Add test helpers for common setup (TASK-089)
- [ ] Add mocking infrastructure (TASK-088)
- [ ] Create test index/map (TASK-087)
- [ ] Reorganize tests by type (TASK-086)
- [ ] Update jest configs for different test suites

## Related Documentation

- [Test Pyramid](./test_pyramid.md) - Why we use this distribution
- [Testing Strategy](./strategy.md) - Overall testing approach
- [Quality Gates](./quality_gates.md) - Quality requirements

## References

- TASK-091: Test Architecture Split
- TASK-085: Integration Testing (showed need for clear architecture)
- TASK-086: Test Organization
- `.repo/tasks/TODO.toon` - Active tasks
