# Testing Strategy

## Plain English Summary
Testing ensures code works correctly and prevents bugs from reaching users. Our strategy uses multiple test types: unit tests for individual functions, integration tests for APIs, and E2E tests for complete user flows.

## Test Types

### Unit Tests (80% of tests)
**What:** Test individual functions in isolation  
**When:** Every function with business logic  
**Tool:** Jest  
**Location:** `*.test.ts` next to source files

```typescript
// Example
describe('slugify', () => {
  it('converts string to URL-friendly slug', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });
});
```

### Integration Tests (15% of tests)
**What:** Test API endpoints and database operations  
**When:** Every API endpoint  
**Tool:** Jest + Supertest  
**Location:** `tests/integration/`

```typescript
// Example
describe('POST /api/users', () => {
  it('creates a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
  });
});
```

### E2E Tests (5% of tests)
**What:** Test complete user journeys  
**When:** Critical user flows  
**Tool:** Detox (React Native)  
**Location:** `e2e/`

```typescript
// Example
describe('User registration flow', () => {
  it('should register new user and show home screen', async () => {
    await element(by.id('register-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    // ... complete flow
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

## Test Coverage Goals

| Type | Coverage Target |
|------|-----------------|
| Unit Tests | 80%+ |
| Integration Tests | All API endpoints |
| E2E Tests | Critical user flows |

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.ts

# Watch mode
npm test -- --watch
```

## CI/CD Integration

Tests run on every:
- Pull request
- Merge to main
- Deployment

## Related
- [Test Pyramid](./test_pyramid.md)
- [Quality Gates](./quality_gates.md)
