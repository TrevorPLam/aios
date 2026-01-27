# Test Requirements and Patterns

## Plain English Summary

This document clarifies **what needs to be tested**, **where tests should live**, and **common patterns for writing tests**. It reduces confusion about test boundaries and improves test quality by providing clear guidance on testability at different layers.

**Related Tasks:** TASK-090 (Testing Documentation)

**Last Updated:** 2026-01-26

---

## Test Requirements by Layer

### API Layer (Server-Side)

**What's Testable:**
- ✅ HTTP endpoint behavior (request/response)
- ✅ Request validation (Zod schemas)
- ✅ Authentication and authorization
- ✅ Database operations (using MemStorage)
- ✅ Business logic
- ✅ Error handling and status codes
- ✅ Rate limiting
- ✅ Security patterns (XSS, SQL injection prevention)
- ✅ GDPR compliance (data deletion)

**What's NOT Testable (Belongs in Client/Integration Tests):**
- ❌ Client-side retry logic
- ❌ Offline queueing
- ❌ React Native components
- ❌ AsyncStorage behavior
- ❌ Network failure simulation (belongs in integration tests)

**Testing Patterns:**

```typescript
// Pattern 1: Basic endpoint test
describe("POST /api/analytics/events", () => {
  it("should accept valid event and return 200", async () => {
    const response = await request(app)
      .post("/api/analytics/events")
      .send(validEvent);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

// Pattern 2: Validation test
describe("Request Validation", () => {
  it("should reject invalid event schema", async () => {
    const response = await request(app)
      .post("/api/analytics/events")
      .send({ invalid: "data" });
    
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});

// Pattern 3: Database persistence test
describe("Event Storage", () => {
  it("should persist event to database", async () => {
    await storage.events.save(event);
    const retrieved = await storage.events.getById(event.id);
    
    expect(retrieved).toMatchObject(event);
  });
});
```

**Test Files Should Be Located:**
- `apps/api/__tests__/` - All API tests
- `apps/api/__tests__/e2e/` - End-to-end API flows
- `apps/api/__tests__/security/` - Security-focused tests
- `apps/api/__tests__/integration/` - Integration tests

---

### Client Layer (React Native)

**What's Testable:**
- ✅ Offline queueing logic
- ✅ Retry mechanisms
- ✅ AsyncStorage operations
- ✅ React components and hooks
- ✅ Analytics client logic
- ✅ Event batching
- ✅ State management
- ✅ UI component behavior
- ✅ Navigation logic

**What's NOT Testable (Belongs in API/Integration Tests):**
- ❌ Server endpoint implementation
- ❌ Database persistence (should be mocked)
- ❌ Full E2E flows with real server (belongs in integration tests)

**Testing Patterns:**

```typescript
// Pattern 1: React component test
import { render, screen, fireEvent } from "@testing-library/react-native";

describe("ContactsMiniMode", () => {
  it("should show loading indicator while fetching contacts", async () => {
    render(<ContactsMiniMode {...props} />);
    
    expect(screen.getByText("Loading contacts...")).toBeTruthy();
    
    await waitFor(() => {
      expect(screen.queryByText("Loading contacts...")).toBeNull();
    });
  });
});

// Pattern 2: Offline queueing test
describe("Analytics Client - Offline Queueing", () => {
  it("should queue events when network is unavailable", async () => {
    // Mock failed network call
    mockTransport.send.mockRejectedValue(new Error("Network error"));
    
    await client.track("event_name", { data: "test" });
    
    const queue = await client.getQueuedEvents();
    expect(queue).toHaveLength(1);
  });
});

// Pattern 3: Hook test
import { renderHook, act } from "@testing-library/react-hooks";

describe("useNetworkStatus", () => {
  it("should detect when app goes offline", () => {
    const { result } = renderHook(() => useNetworkStatus());
    
    act(() => {
      // Simulate network change
      NetInfo.fetch.mockResolvedValue({ isConnected: false });
    });
    
    expect(result.current.isOnline).toBe(false);
  });
});

// Pattern 4: AsyncStorage test
describe("Storage Layer", () => {
  it("should persist data to AsyncStorage", async () => {
    await storage.setItem("key", "value");
    const retrieved = await storage.getItem("key");
    
    expect(retrieved).toBe("value");
  });
});
```

**Test Files Should Be Located:**
- `packages/platform/**/__tests__/` - Platform utilities and hooks
- `packages/features/**/__tests__/` - Feature-specific tests
- `packages/design-system/**/__tests__/` - UI component tests
- `apps/mobile/__tests__/` - Mobile app-specific tests

---

### Integration Layer (Client + Server)

**What's Testable:**
- ✅ Complete flows from client → server → database
- ✅ Network failure scenarios and recovery
- ✅ Retry behavior across client and server
- ✅ Authentication flows
- ✅ End-to-end user journeys
- ✅ GDPR deletion across all layers
- ✅ Real network conditions

**What's NOT Testable:**
- ❌ Individual component behavior (belongs in client tests)
- ❌ Individual endpoint behavior (belongs in API tests)

**Testing Patterns:**

```typescript
// Pattern 1: Full E2E flow
describe("Analytics E2E", () => {
  it("should send event from client to server and persist to database", async () => {
    // 1. Client sends event
    await analyticsClient.track("module_opened", { module: "notes" });
    
    // 2. Wait for network call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    // 3. Verify server received and stored
    const events = await storage.events.getAll();
    expect(events).toContainEqual(
      expect.objectContaining({ event_name: "module_opened" })
    );
  });
});

// Pattern 2: Network failure and recovery
describe("Network Failure Recovery", () => {
  it("should queue events when server is down and retry when back online", async () => {
    // 1. Server is down
    mockServer.close();
    
    // 2. Client attempts to send
    await analyticsClient.track("event_name", { data: "test" });
    
    // 3. Event should be queued
    expect(await analyticsClient.getQueuedEvents()).toHaveLength(1);
    
    // 4. Server comes back online
    mockServer.listen();
    
    // 5. Client should retry and succeed
    await analyticsClient.flush();
    expect(await analyticsClient.getQueuedEvents()).toHaveLength(0);
  });
});

// Pattern 3: Authentication flow
describe("Auth Flow E2E", () => {
  it("should register, login, and access protected resource", async () => {
    // 1. Register
    const registerResponse = await client.register({
      email: "test@example.com",
      password: "SecurePass123!",
    });
    expect(registerResponse.success).toBe(true);
    
    // 2. Login
    const loginResponse = await client.login({
      email: "test@example.com",
      password: "SecurePass123!",
    });
    expect(loginResponse.token).toBeDefined();
    
    // 3. Access protected resource
    const dataResponse = await client.getUserData(loginResponse.token);
    expect(dataResponse.status).toBe(200);
  });
});
```

**Test Files Should Be Located:**
- `apps/api/__tests__/e2e/` - API-focused E2E tests
- `apps/api/__tests__/integration/` - Integration tests
- Future: Dedicated `integration-tests/` directory at repo root

---

## Common Testing Anti-Patterns

### ❌ Anti-Pattern 1: Testing Implementation Details

**Bad:**
```typescript
it("should call internal method", () => {
  const spy = jest.spyOn(component, "_internalMethod");
  component.doSomething();
  expect(spy).toHaveBeenCalled();
});
```

**Good:**
```typescript
it("should produce correct output", () => {
  const result = component.doSomething();
  expect(result).toBe(expectedOutput);
});
```

### ❌ Anti-Pattern 2: Testing Multiple Layers in One Test

**Bad (API test trying to test client logic):**
```typescript
it("should queue events when offline", async () => {
  // This belongs in client tests, not API tests
  mockNetworkDown();
  await client.track("event");
  expect(queue).toHaveLength(1);
});
```

**Good (Separate into appropriate layers):**
```typescript
// In client tests
it("should queue events when network call fails", async () => {
  mockTransport.send.mockRejectedValue(new Error("Network error"));
  await client.track("event");
  expect(await client.getQueuedEvents()).toHaveLength(1);
});

// In integration tests
it("should successfully send queued events when server is back online", async () => {
  // Full E2E flow testing both client and server
});
```

### ❌ Anti-Pattern 3: Over-Mocking

**Bad:**
```typescript
it("should do something", () => {
  jest.mock("./everything");
  // Test becomes meaningless - we're testing mocks, not real code
});
```

**Good:**
```typescript
it("should do something", () => {
  // Only mock external dependencies (network, database)
  // Test real logic
});
```

---

## Test Coverage Requirements

### Minimum Coverage Targets

- **API Layer:** 80%+ coverage
- **Client Layer:** 80%+ coverage
- **Integration Tests:** Cover critical user journeys

### What to Prioritize

**High Priority (Must have tests):**
1. Authentication and authorization
2. Data persistence (CRUD operations)
3. Input validation
4. Security patterns (XSS, SQL injection prevention)
5. GDPR compliance (data deletion)
6. Critical user journeys
7. Error handling

**Medium Priority (Should have tests):**
1. Edge cases
2. Performance scenarios
3. State management
4. UI component behavior

**Low Priority (Nice to have tests):**
1. Styling logic
2. Simple utility functions
3. Straightforward data transformations

---

## Test Maintenance Guidelines

### When to Update Tests

1. **Feature Change:** Update affected tests immediately
2. **Bug Fix:** Add regression test before fixing bug
3. **Refactoring:** Tests should still pass (if not, tests were too tightly coupled)
4. **API Change:** Update contract tests first, then implementation

### Test Code Quality

- ✅ Tests should be readable without comments
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ One assertion per test (when possible)
- ✅ Avoid test interdependencies
- ✅ Clean up after tests (reset mocks, clear database)

---

## Quick Reference: Where Should My Test Live?

| What You're Testing | Test Location | Test Type |
|---------------------|---------------|-----------|
| HTTP endpoint | `apps/api/__tests__/` | API |
| Request validation | `apps/api/__tests__/` | API |
| Database operations | `apps/api/__tests__/` | API |
| React component | `packages/features/**/__tests__/` | Client |
| React hook | `packages/platform/**/__tests__/` | Client |
| Offline queueing | `packages/platform/**/__tests__/` | Client |
| AsyncStorage | `packages/platform/**/__tests__/` | Client |
| Client → Server flow | `apps/api/__tests__/integration/` | Integration |
| Auth flow | `apps/api/__tests__/e2e/` | Integration |
| Network failure | `apps/api/__tests__/integration/` | Integration |

---

## Additional Resources

- **Test Architecture:** [test_architecture.md](./test_architecture.md) - Comprehensive three-tier testing strategy
- **Test Organization:** [test_organization.md](./test_organization.md) - How tests are organized in the codebase
- **Test Index:** [test_index.md](./test_index.md) - Map of all tests and what they cover
- **Test Helpers:** [test_helpers.md](./test_organization.md#test-helpers) - Reusable test utilities
- **Test Mocks:** [test_mocks.md](./test_organization.md#test-mocks) - Mock infrastructure

---

## Questions and Clarifications

### Q: Should I test UI styling?

**A:** Generally no, unless styling affects functionality (e.g., visibility, layout that breaks features).

### Q: How do I test network failures?

**A:** In client tests, mock the transport/fetch to reject. In integration tests, use a real test server that you can start/stop.

### Q: Should I test third-party libraries?

**A:** No, assume they work. Test your code that *uses* them.

### Q: What about E2E tests with real UI?

**A:** Not currently part of our test strategy. We focus on unit, component, and integration tests. Future consideration for critical flows.

### Q: How do I know if my test is at the right layer?

**A:** Ask: "Does this test require both client AND server to work?" If yes → Integration. "Does this test involve network calls or UI?" If UI → Client, if Network → API. If both → Integration.

---

**Need Help?** See [test_index.md](./test_index.md) to find examples of similar tests, or ask in #engineering.
