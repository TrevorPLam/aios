# Test Pyramid

## Plain English Summary

The test pyramid shows we should have many fast unit tests, fewer integration tests, and even fewer slow E2E tests. This keeps test suites fast while maintaining confidence.

## Pyramid Visualization

```text
     /\
    /  \    E2E Tests (5%)
   /    \   - Slow, expensive
  /------\  - Full user journeys
 /        \
/  Integration Tests (15%)
\  - Medium speed
 \  - API endpoints
  \----------\
   \          \
    \ Unit Tests (80%)
     \  - Fast, cheap
      \  - Individual functions
       \________________\
```text

## Why This Balance?

1. **Speed** - Unit tests run in milliseconds, E2E in minutes
2. **Reliability** - Unit tests are deterministic, E2E can be flaky
3. **Debugging** - Unit test failures pinpoint exact issue
4. **Maintenance** - Unit tests easier to maintain than E2E

## Anti-Patterns

### Ice Cream Cone (Bad)

```text
Mostly E2E tests - slow, flaky, expensive
Few integration tests
Almost no unit tests
```text

### Hourglass (Bad)

```text
Many E2E tests
Few integration tests (gap!)
Many unit tests
```text

## Related

- [Testing Strategy](./strategy.md)
- [Quality Gates](./quality_gates.md)
