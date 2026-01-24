# Test Integrity Validation Guide

## Overview

This guide documents how to validate test suite trustworthiness using manual mutation testing and automated checks.

## Quick Start

```bash
# Run all tests including integrity tests
npm test

# Run only security tests
npm test -- apps/api/__tests__/auth.security.test.ts

# Run enhanced analytics tests
npm test -- apps/api/__tests__/analytics.enhanced.test.ts

# Run with coverage to identify gaps
npm test -- --coverage
```

## New Integrity Tests

### 1. Authentication Security Tests
**Location:** `apps/api/__tests__/auth.security.test.ts`

**Purpose:** Verifies that critical security measures cannot be accidentally removed.

**Tests:**
- ✅ Passwords are hashed before storage (prevents plaintext storage)
- ✅ Plaintext passwords are never stored
- ✅ Bcrypt cost factor is sufficient (10+ rounds)

**How to validate:**
```bash
# Run security tests
npm test -- apps/api/__tests__/auth.security.test.ts

# If these tests pass, you're protected against:
# - Accidentally removing bcrypt.hash() calls
# - Reducing bcrypt rounds below security threshold
# - Storing passwords in plaintext
```

### 2. Enhanced Analytics Tests
**Location:** `apps/api/__tests__/analytics.enhanced.test.ts`

**Purpose:** Verifies idempotency and duplicate prevention actually work.

**Tests:**
- ✅ Duplicate events trigger skip behavior (not just overwrite)
- ✅ Creation timestamp vs event timestamp are separate
- ✅ Batch operations handle mixed duplicates correctly
- ✅ Rapid duplicates are handled
- ✅ Original data preserved on duplicate attempts

**How to validate:**
```bash
# Run enhanced tests
npm test -- apps/api/__tests__/analytics.enhanced.test.ts

# These tests verify actual behavior, not just side effects
```

## Manual Mutation Testing (Canary Validation)

To verify a test can actually fail when behavior breaks, follow these steps:

### Step 1: Identify Critical Behavior
Choose a test that protects important behavior (security, data integrity, user-facing features).

### Step 2: Introduce Controlled Mutation
Temporarily break the production code in a specific, minimal way:
- Remove a validation check
- Skip a critical operation
- Return wrong value
- Remove error handling

### Step 3: Run Test
```bash
npm test -- path/to/test-file.test.ts
```

### Step 4: Verify Test Fails
- ✅ **GOOD:** Test fails with clear error message
- ❌ **BAD:** Test passes (false negative - test is not trustworthy)

### Step 5: Revert Mutation
```bash
git checkout -- path/to/production-file.ts
```

### Example Canary Tests

#### Test 1: Password Hashing
```typescript
// In apps/api/routes.ts
// BEFORE (correct):
const hashedPassword = await bcrypt.hash(password, 10);

// AFTER (broken):
const hashedPassword = password; // ← Stores plaintext!

// Run test:
npm test -- apps/api/__tests__/auth.security.test.ts

// Expected: FAIL ✅
// If PASS: Test doesn't verify hashing ❌
```

#### Test 2: Idempotency
```typescript
// In apps/api/storage.ts
// BEFORE (correct):
if (this.analyticsEvents.has(event.eventId)) {
  console.log('Skipping duplicate event');
  continue;
}

// AFTER (broken):
// [commented out the check]

// Run test:
npm test -- apps/api/__tests__/analytics.enhanced.test.ts

// Expected: FAIL ✅
// If PASS: Test uses weak assertion ❌
```

## Weak Assertion Patterns to Avoid

### ❌ Weak Patterns
```typescript
// Don't use imprecise assertions
expect(count).toBeGreaterThan(0);           // Weak: 1, 1000, 9999 all pass
expect(value).toBeTruthy();                 // Weak: "false", 1, {} all pass
expect(items).toHaveLength(expect.any(Number)); // Weak: any length passes

// Don't rely on side effects only
expect(await getAll()).toHaveLength(1);     // Might pass for wrong reason
```

### ✅ Strong Patterns
```typescript
// Use exact assertions
expect(count).toBe(3);                      // Strong: only 3 passes
expect(value).toBe(true);                   // Strong: only boolean true passes
expect(items).toHaveLength(2);              // Strong: exact length

// Verify actual behavior
expect(consoleSpy).toHaveBeenCalledWith(    // Verifies action taken
  expect.stringContaining('Skipping')
);
expect(password).not.toBe(plaintext);       // Verifies transformation
expect(password).toMatch(/^\$2[aby]\$/);    // Verifies format
```

## Continuous Integrity Monitoring

### In Pull Requests
```bash
# Before approving PR, ask:
# 1. Do new tests use precise assertions?
npm test -- path/to/new-test.test.ts

# 2. Can I manually break the code and see test fail?
# (Use canary validation above)

# 3. Are mocks minimal and necessary?
# Look for excessive jest.mock() usage
```

### In CI Pipeline
```yaml
# .github/workflows/ci.yml already runs:
- npm test -- --coverage
- npm run check:types
- npx eslint . --max-warnings 0

# Recommended additions:
- name: Check test quality
  run: |
    # Count weak assertions
    WEAK=$(grep -r "toBeGreaterThan\|toBeTruthy" --include="*.test.*" | wc -l)
    if [ $WEAK -gt 100 ]; then
      echo "Too many weak assertions: $WEAK (limit: 100)"
      exit 1
    fi
```

### Monthly Health Check
```bash
# Review test trustworthiness quarterly
# 1. Pick 5-10 random tests
# 2. Run canary validation on each
# 3. Fix any that can't fail properly
# 4. Update TEST_TRUST_REPORT.md

# Example:
npm test -- --listTests | sort -R | head -5
# Run canary validation on those 5 tests
```

## Metrics to Track

| Metric | Command | Target |
|--------|---------|--------|
| Total tests | `npm test \| grep "Tests:"` | Increasing |
| Test coverage | `npm test -- --coverage` | >20% (current), >50% (goal) |
| Weak assertions | `grep -r "toBeGreaterThan\|toBeTruthy" --include="*.test.*" \| wc -l` | <50 |
| Skipped tests | `grep -r "\.skip\|xit\|xdescribe" --include="*.test.*" \| wc -l` | 0 |
| Test execution time | `npm test \| grep "Time:"` | <10s |

## Tools for Advanced Validation

### Mutation Testing (Optional)
```bash
# Install Stryker Mutator
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner

# Create stryker.conf.json
cat > stryker.conf.json << EOF
{
  "testRunner": "jest",
  "coverageAnalysis": "perTest",
  "mutate": [
    "apps/api/**/*.ts",
    "apps/mobile/**/*.ts",
    "!**/*.test.ts"
  ],
  "thresholds": { "high": 80, "low": 60, "break": 50 }
}
EOF

# Run mutation testing on critical modules
npx stryker run --mutate "apps/api/middleware/auth.ts"
```

### Test Smell Detection
```bash
# Find potential test smells
# 1. Tests with no assertions
grep -r "test\|it" --include="*.test.*" -A 10 | grep -v "expect" | head -20

# 2. Tests with many mocks
grep -r "jest.mock" --include="*.test.*" -c | sort -nr | head -10

# 3. Async tests without await
grep -r "async.*=>" --include="*.test.*" | grep -v "await" | head -10
```

## Troubleshooting

### Problem: Test passes when code is broken
**Solution:** Add more specific assertions. Use canary validation to find gaps.

### Problem: Test is flaky (sometimes passes, sometimes fails)
**Solution:** 
- Check for time-dependent logic (use fixed dates)
- Check for race conditions (await all promises)
- Check for shared state between tests (use beforeEach to reset)

### Problem: Coverage is low but tests exist
**Solution:**
- Run `npm test -- --coverage` to see uncovered lines
- Add tests for error cases, edge cases, and branches

### Problem: Don't know what to test
**Solution:**
- Start with critical paths (auth, payment, data loss)
- Use canary validation to verify tests are effective
- Follow this priority:
  1. Security vulnerabilities
  2. Data integrity issues
  3. User-facing bugs
  4. Edge cases

## Resources

- **Test Trustworthiness Report:** `TEST_TRUST_REPORT.md`
- **Security Tests:** `apps/api/__tests__/auth.security.test.ts`
- **Enhanced Analytics Tests:** `apps/api/__tests__/analytics.enhanced.test.ts`
- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **Testing Library Best Practices:** https://testing-library.com/docs/queries/about

## Questions?

Review the TEST_TRUST_REPORT.md for detailed findings and recommendations.

For urgent security concerns, prioritize:
1. Password hashing verification
2. Token validation
3. Input sanitization
4. Authorization checks

