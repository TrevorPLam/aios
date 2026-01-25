# Expected Commands Section Implementation

**Date:** 2026-01-25  
**Status:** ✅ Complete

## Overview

Added an optional `expected_commands` section to task files (TODO.toon, BACKLOG.toon, ARCHIVE.toon) that helps agents pick optimal verification commands ahead of time.

## Problem Solved

**Before:** Agents had to guess which commands to run for each task, leading to:
- Command spamming (running 11 commands when 2-3 would suffice)
- Wrong command selection (running irrelevant commands)
- Inefficient verification (not using batched commands)

**After:** Tasks specify expected commands upfront, enabling:
- Optimal command selection (agents know what to run)
- Better planning (verification strategy defined in task)
- Efficiency (use batched commands, skip irrelevant ones)

## Implementation

### 1. Added to Task Template

**File:** `.repo/tasks/TODO.toon`, `.repo/tasks/BACKLOG.toon`

**New Section:**
```toon
expected_commands_section:
  purpose: "Optional section that specifies which commands to run for verification. Helps agents pick optimal commands ahead of time."
  format: "expected_commands{TASK-ID}[N]{command, purpose, verification_profile}:"
  fields[3]{name, description, examples}:
    command, "Canonical command from .repo/repo.manifest.toon", "npm run check:quick", "npm test", "npm run check:governance"
    purpose, "Why this command is needed for this task", "Verify code quality", "Run tests", "Check compliance"
    verification_profile, "Profile from repo.manifest.toon (quick, ci, release, governance)", "quick", "ci", "release"
  note: "Reference .repo/repo.manifest.toon for canonical commands. Use batched commands (check:quick, check:ci) when possible. See .repo/logs/COMMAND_OPTIMIZATION_GUIDE.toon for execution guidance. Can be empty for doc-only changes."
```

### 2. Example Implementation

**File:** `.repo/tasks/TODO.toon` (TASK-085)

```toon
expected_commands{TASK-085}[3]{command, purpose, verification_profile}:
  npm run check:quick, Verify code quality (lint, types, format), quick
  npm test -- apps/api/__tests__/analytics.test.ts, Run integration tests for analytics, ci
  npm run test:coverage -- apps/api/__tests__/analytics.test.ts, Verify test coverage >80%, ci
expected_commands_note{TASK-085}: "Testing task - requires test execution. Use batched check:quick for code quality. Run specific test file for integration tests. Check coverage separately. Reference: .repo/repo.manifest.toon for canonical commands, .repo/logs/COMMAND_OPTIMIZATION_GUIDE.toon for execution guidance."
```

## Benefits

### 1. **Pre-Planning**
- Agents know verification strategy before starting
- Can plan command execution order
- Identify prerequisites upfront

### 2. **Optimal Selection**
- Use batched commands (check:quick, check:ci)
- Skip irrelevant commands
- Run task-specific commands only

### 3. **Better Evidence**
- Clear verification plan
- Honest reporting (know what should be run)
- Easier to assess completeness

### 4. **Efficiency**
- Reduce command attempts (11 → 2-3)
- Faster verification cycles
- Less wasted time

## Integration with Existing Systems

### Links to:
1. **repo.manifest.toon** - Source of truth for canonical commands
2. **COMMAND_OPTIMIZATION_GUIDE.toon** - Execution guidance
3. **TRACES.toon** - Evidence format requirements

### Works with:
- Command optimization principles (batching, conditional execution)
- Verification profiles (quick, ci, release, governance)
- Evidence requirements (brief summaries, verification_status)

## Usage Guidelines

### When to Add Expected Commands

**Add for:**
- ✅ Testing tasks (need test execution)
- ✅ Feature tasks (need code quality + tests)
- ✅ Security tasks (need security checks)
- ✅ API changes (need compliance checks)

**Skip for:**
- ❌ Documentation-only tasks (empty commands array)
- ❌ Simple refactoring (use default check:quick)
- ❌ Tasks with unclear verification needs (leave empty, agent will plan)

### Format Examples

**Testing Task:**
```toon
expected_commands{TASK-085}[2]{command, purpose, verification_profile}:
  npm run check:quick, Verify code quality, quick
  npm test -- apps/api/__tests__/analytics.test.ts, Run integration tests, ci
```

**Feature Task:**
```toon
expected_commands{TASK-071}[2]{command, purpose, verification_profile}:
  npm run check:quick, Verify code quality, quick
  npm test, Run tests, ci
```

**Doc-Only Task:**
```toon
expected_commands{TASK-XXX}[0]: (empty - no commands needed)
```

## Backward Compatibility

- ✅ Optional section (existing tasks work without it)
- ✅ Agents can still plan commands if section missing
- ✅ No breaking changes to task format
- ✅ Existing tasks remain valid

## Future Enhancements

If patterns emerge, consider:
1. **Command templates** - Reusable command sets by task type
2. **Auto-generation** - Generate expected_commands from task type
3. **Validation** - Verify expected_commands match actual commands in traces

But for now, manual specification provides flexibility.
