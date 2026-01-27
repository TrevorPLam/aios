# Test Organization Guide

## Plain English Summary

This guide explains how to organize tests by separating unit tests from integration tests. Clear separation makes tests easier to maintain, faster to run, and helps developers understand test purpose at a glance.

**Related Tasks:** TASK-086 (Test Organization), TASK-091 (Test Architecture)

**Last Updated:** 2026-01-25

## Problem Statement

Currently, test files mix unit tests (testing individual functions) with integration tests (testing multiple components together). This creates:
- **Confusion:** Hard to tell what a test file actually tests
- **Slow test runs:** Can't run just fast unit tests
- **Maintenance issues:** Changes affect unrelated tests
- **Poor organization:** Everything in one directory

## Solution: Separate by Test Type

### Principle: One Test Type Per Directory

Organize tests into clear directories based on their purpose:

```
apps/api/__tests__/
├── unit/                  # Fast, isolated tests (80% of tests)
│   ├── middleware/
│   │   ├── auth.test.ts
│   │   └── validation.test.ts
│   ├── utils/
│   │   └── formatting.test.ts
│   └── services/
│       └── analytics.test.ts
│
├── integration/           # API endpoint tests (15% of tests)
│   ├── auth.api.test.ts
│   ├── notes.api.test.ts
│   ├── analytics.api.test.ts
│   └── tasks.api.test.ts
│
├── e2e/                   # Full workflow tests (5% of tests)
│   ├── user-journey.e2e.test.ts
│   ├── analytics.e2e.test.ts
│   └── notes-workflow.e2e.test.ts
│
├── security/              # Security-focused tests
│   ├── auth.security.test.ts
│   ├── jwt.security.test.ts
│   ├── validation.security.test.ts
│   └── rateLimiter.security.test.ts
│
├── helpers/               # Test utilities (TASK-089)
│   ├── auth.helper.ts
│   ├── server.helper.ts
│   ├── data.helper.ts
│   └── index.ts
│
└── mocks/                 # Test mocks (TASK-088)
    ├── rateLimiter.mock.ts
    ├── transport.mock.ts
    ├── asyncStorage.mock.ts
    └── index.ts
```

## Test Type Definitions

### Unit Tests (`unit/`)

**Purpose:** Test individual functions, classes, or modules in isolation.

**Characteristics:**
- Very fast (milliseconds per test)
- No external dependencies
- Mock all dependencies
- Test one thing at a time
- 80% of your test suite

**Example:**
```typescript
// unit/utils/formatting.test.ts
import { formatDate } from "../../utils/formatting";

describe("formatDate", () => {
  it("formats ISO date to readable string", () => {
    const result = formatDate("2026-01-25T00:00:00Z");
    expect(result).toBe("January 25, 2026");
  });
});
```

### Integration Tests (`integration/`)

**Purpose:** Test how multiple components work together, especially API endpoints.

**Characteristics:**
- Medium speed (seconds per test)
- May use real MemStorage
- Test request → response flow
- Validate API contracts
- 15% of your test suite

**Example:**
```typescript
// integration/notes.api.test.ts
import { createTestServer, createTestUser } from "../helpers";

describe("Notes API", () => {
  const { getBaseUrl } = useTestServer();

  it("creates and retrieves a note", async () => {
    const { token, headers } = createTestUserWithHeaders();
    const baseUrl = getBaseUrl();

    const createRes = await fetch(`${baseUrl}/api/notes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title: "Test", bodyMarkdown: "Content" }),
    });

    expect(createRes.ok).toBe(true);
    const created = await createRes.json();

    const getRes = await fetch(`${baseUrl}/api/notes/${created.id}`, {
      headers,
    });

    expect(getRes.ok).toBe(true);
    const retrieved = await getRes.json();
    expect(retrieved.title).toBe("Test");
  });
});
```

### E2E Tests (`e2e/`)

**Purpose:** Test complete user workflows from start to finish.

**Characteristics:**
- Slow (seconds to minutes per test)
- Minimal mocking
- Test real user scenarios
- Cover critical business flows
- 5% of your test suite

**Example:**
```typescript
// e2e/user-journey.e2e.test.ts
import { createTestServer } from "../helpers";

describe("User Journey", () => {
  const { getBaseUrl } = useTestServer();

  it("completes full user workflow", async () => {
    const baseUrl = getBaseUrl();

    // 1. Register
    const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "user", password: "pass123" }),
    });
    const { token } = await registerRes.json();

    // 2. Create note
    const createNoteRes = await fetch(`${baseUrl}/api/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "My Note", bodyMarkdown: "Content" }),
    });
    expect(createNoteRes.ok).toBe(true);

    // 3. Update note
    const { id } = await createNoteRes.json();
    const updateRes = await fetch(`${baseUrl}/api/notes/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Updated" }),
    });
    expect(updateRes.ok).toBe(true);

    // 4. Delete note
    const deleteRes = await fetch(`${baseUrl}/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(deleteRes.status).toBe(204);
  });
});
```

### Security Tests (`security/`)

**Purpose:** Test security-specific concerns like auth, validation, rate limiting.

**Characteristics:**
- Focus on security vulnerabilities
- Test edge cases and attack vectors
- Validate security controls
- Separate from functional tests

**Example:**
```typescript
// security/auth.security.test.ts
describe("Auth Security", () => {
  it("rejects weak passwords", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "user", password: "123" }),
    });

    expect(res.status).toBe(400);
    const error = await res.json();
    expect(error.message).toContain("password");
  });

  it("prevents SQL injection in username", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin' OR '1'='1",
        password: "validpass123",
      }),
    });

    expect(res.status).toBe(400);
  });
});
```

## Migration Strategy

### Current State
All tests in flat `__tests__/` directory, mixing unit and integration.

### Target State
Tests organized by type in subdirectories.

### Migration Steps

1. **Create directory structure** ✅
   ```bash
   mkdir -p apps/api/__tests__/{unit,integration,e2e,security,helpers,mocks}
   ```

2. **Move security tests** (DONE)
   - Files ending in `.security.test.ts` → `security/`

3. **Move E2E tests** (TODO)
   - Files ending in `.e2e.test.ts` → `e2e/`

4. **Split mixed test files** (TODO)
   - Analyze files like `analytics.test.ts`
   - Extract unit tests → `unit/`
   - Extract integration tests → `integration/`

5. **Update Jest config** (TODO)
   - Add separate test commands
   - Configure coverage per directory

6. **Update imports** (TODO)
   - Fix relative paths after moving files

### Priority Order
1. **P1:** Create helpers and mocks (TASK-089, TASK-088) ✅
2. **P2:** Move E2E tests to `e2e/` (TODO)
3. **P2:** Move security tests to `security/` (TODO)
4. **P3:** Split large mixed files
5. **P3:** Move pure unit tests to `unit/`

## Jest Configuration

### Current Config
```javascript
// jest.config.js
module.exports = {
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  // ... other config
};
```

### Future Config (After Migration)

```javascript
// jest.config.js
module.exports = {
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/apps/api/__tests__/unit/**/*.test.ts"],
      // Fast, isolated tests
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/apps/api/__tests__/integration/**/*.test.ts"],
      // API endpoint tests
    },
    {
      displayName: "e2e",
      testMatch: ["<rootDir>/apps/api/__tests__/e2e/**/*.test.ts"],
      // Full workflow tests
    },
    {
      displayName: "security",
      testMatch: ["<rootDir>/apps/api/__tests__/security/**/*.test.ts"],
      // Security tests
    },
    {
      displayName: "client",
      testMatch: ["<rootDir>/packages/**/__tests__/**/*.test.ts"],
      // Client-side tests
    },
  ],
};
```

### New Test Commands

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --selectProjects=unit",
    "test:integration": "jest --selectProjects=integration",
    "test:e2e": "jest --selectProjects=e2e",
    "test:security": "jest --selectProjects=security",
    "test:client": "jest --selectProjects=client",
    "test:api": "jest --selectProjects=unit,integration,e2e,security",
    "test:fast": "jest --selectProjects=unit,client",
    "test:ci": "jest --selectProjects=unit,integration,client"
  }
}
```

## Benefits of Organization

### 1. Faster Development
```bash
# Run only fast unit tests during development
npm run test:unit

# Full test suite for CI
npm run test:ci
```

### 2. Clear Test Purpose
```
✅ Good: integration/notes.api.test.ts
   → Obviously tests Notes API endpoints

❌ Bad: notes.test.ts
   → Could be unit, integration, or E2E
```

### 3. Better Maintenance
- Find related tests easily
- Update tests in one category
- Refactor without breaking unrelated tests

### 4. Selective CI
```yaml
# .github/workflows/ci.yml
- name: Fast tests
  run: npm run test:fast

- name: Integration tests
  run: npm run test:integration
  if: github.event_name == 'pull_request'

- name: E2E tests
  run: npm run test:e2e
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

## Anti-Patterns to Avoid

### ❌ Mixing Test Types in One File

**Bad:**
```typescript
// analytics.test.ts
describe("Unit: Analytics Utils", () => { ... });
describe("Integration: Analytics API", () => { ... });
describe("E2E: Analytics Flow", () => { ... });
```

**Good:**
```typescript
// unit/services/analytics.test.ts
describe("Analytics Utils", () => { ... });

// integration/analytics.api.test.ts
describe("Analytics API", () => { ... });

// e2e/analytics.e2e.test.ts
describe("Analytics Flow", () => { ... });
```

### ❌ Unclear Test File Names

**Bad:**
```typescript
test.ts
helpers.test.ts
stuff.test.ts
```

**Good:**
```typescript
unit/utils/formatting.test.ts
integration/notes.api.test.ts
e2e/user-journey.e2e.test.ts
```

### ❌ Deep Nesting

**Bad:**
```
unit/
  services/
    analytics/
      utils/
        helpers/
          formatting.test.ts  ← Too deep!
```

**Good:**
```
unit/
  services/
    analytics.test.ts  ← Flat is better
```

## Implementation Checklist

- [x] Create directory structure
- [x] Create helpers directory (TASK-089)
- [x] Create mocks directory (TASK-088)
- [ ] Move security tests to `security/`
- [ ] Move E2E tests to `e2e/`
- [ ] Split mixed test files
- [ ] Update Jest config for projects
- [ ] Add new test commands to package.json
- [ ] Update test documentation
- [ ] Update CI workflows

## Related Documentation

- [Test Architecture](./test_architecture.md) - Three-tier testing strategy
- [Test Index](./test_index.md) - Test location mapping
- [Test Pyramid](./test_pyramid.md) - Test distribution

## References

- TASK-086: Test Organization
- TASK-091: Test Architecture
- `.repo/tasks/TODO.toon` - Active tasks
