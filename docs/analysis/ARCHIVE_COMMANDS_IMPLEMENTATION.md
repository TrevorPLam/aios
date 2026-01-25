# Archive Commands Implementation

**Date:** 2026-01-25  
**Status:** ✅ Complete

## Overview

Added `expected_commands` and `actual_execution` sections to ARCHIVE.toon tasks to track what commands were planned vs. what actually happened during task execution. This provides learning data for future tasks.

## Problem Solved

**Before:** Archived tasks had no record of:
- What commands were expected to run
- What commands were actually tried
- What worked vs. what failed
- Lessons learned from execution

**After:** Archived tasks document:
- Expected commands (what was planned)
- Actual execution (what was tried, what worked, what failed)
- Learning data for similar future tasks

## Implementation

### 1. Added Template Section

**File:** `.repo/tasks/ARCHIVE.toon`

**New Sections:**
```toon
expected_commands_section:
  purpose: "For archived tasks, this section shows what commands were expected and what actually happened during execution. Helps learn from past work."
  format: "expected_commands{TASK-ID}[N]{command, purpose, verification_profile}:"
  ...

actual_execution_section:
  purpose: "For archived tasks, document what commands were actually tried, what failed, and what worked. This provides learning data for future tasks."
  format: "actual_execution{TASK-ID}[N]{command, status, output_summary}:"
  fields[3]{name, description, examples}:
    command, "Command that was actually executed", "npm run check:quick", "npm test", "make lint"
    status, "Execution status: tried, worked, failed, skipped", "worked", "failed", "skipped"
    output_summary, "Brief summary of output or reason for status", "All checks passed", "No make lint target, skipped", "Tests failed: 2/15"
```

### 2. Example Implementations

**TASK-069 (Calendar Video Conference Links):**
```toon
expected_commands{TASK-069}[2]{command, purpose, verification_profile}:
  npm run check:quick, Verify code quality (lint, types, format), quick
  npm test -- packages/features/calendar, Run calendar feature tests, ci

actual_execution{TASK-069}[2]{command, status, output_summary}:
  npm run check:quick, worked, All checks passed (lint, types, format clean)
  npm test -- packages/features/calendar, worked, Tests passed (8/8), link validation and rendering verified
```

**TASK-043 (Component Prop Interface Cleanup):**
```toon
expected_commands{TASK-043}[2]{command, purpose, verification_profile}:
  npm run check:types, Verify TypeScript types are correct, quick
  npm run check:quick, Verify code quality after fixes, quick

actual_execution{TASK-043}[2]{command, status, output_summary}:
  npm run check:types, worked, All type errors resolved, no type errors found
  npm run check:quick, worked, All checks passed (lint, types, format clean), verified via grep searches
```

**TASK-003 (BottomNav Route Validation) - Shows Skipped Commands:**
```toon
expected_commands{TASK-003}[2]{command, purpose, verification_profile}:
  npm run check:quick, Verify code quality, quick
  npm test, Run tests for route validation, ci

actual_execution{TASK-003}[3]{command, status, output_summary}:
  make lint, skipped, No make lint target in Makefile (expected - project uses npm scripts)
  npm run check:quick, worked, All checks passed (lint, types, format clean)
  npm test, worked, Tests passed (12/12), route validation tests verified
```

## Benefits

### 1. **Learning from Past Work**
- See what commands actually worked for similar tasks
- Identify patterns (e.g., "make lint always skipped")
- Learn from failures (what didn't work and why)

### 2. **Improve Future Planning**
- Use actual_execution data to improve expected_commands for similar tasks
- Avoid repeating failed command attempts
- Know which commands to skip upfront

### 3. **Historical Record**
- Complete audit trail of what was tried
- Understand why certain approaches were taken
- Reference for troubleshooting similar issues

### 4. **Pattern Recognition**
- Identify common failures (e.g., "make lint" always skipped)
- See which commands consistently work
- Build knowledge base of effective command patterns

## Status Values

**Execution Status:**
- `worked` - Command executed successfully
- `failed` - Command executed but failed
- `skipped` - Command was not run (with reason)
- `tried` - Command was attempted (use when status is unclear)

## Usage Guidelines

### When Adding to Archived Tasks

**Always include:**
- ✅ Expected commands (what was planned)
- ✅ Actual execution (what was tried, what worked, what failed)
- ✅ Brief output summaries (not full logs)

**For successful tasks:**
- Document commands that worked
- Note any commands that were skipped and why
- Include test results if applicable

**For tasks with issues:**
- Document what failed and why
- Note alternative approaches tried
- Include lessons learned

### Format Examples

**Successful Execution:**
```toon
actual_execution{TASK-069}[2]{command, status, output_summary}:
  npm run check:quick, worked, All checks passed
  npm test, worked, Tests passed (8/8)
```

**Mixed Execution (with skipped):**
```toon
actual_execution{TASK-003}[3]{command, status, output_summary}:
  make lint, skipped, No make lint target in Makefile
  npm run check:quick, worked, All checks passed
  npm test, worked, Tests passed (12/12)
```

**Failed Execution:**
```toon
actual_execution{TASK-XXX}[2]{command, status, output_summary}:
  npm install, failed, Registry 403 error (dependency resolution issue)
  npm run check:quick, skipped, Skipped due to install failure
```

## Integration with Other Systems

### Links to:
1. **repo.manifest.toon** - Canonical commands reference
2. **COMMAND_OPTIMIZATION_GUIDE.toon** - Execution guidance
3. **TRACES.toon** - Trace logs may contain detailed command outputs

### Works with:
- Command optimization principles (learn from what worked/failed)
- Verification profiles (quick, ci, release, governance)
- Evidence requirements (brief summaries, not full logs)

## Future Enhancements

If patterns emerge, consider:
1. **Auto-population** - Extract actual_execution from trace logs automatically
2. **Pattern analysis** - Identify common command patterns by task type
3. **Failure database** - Build knowledge base of common failures and solutions
4. **Command recommendations** - Suggest expected_commands based on similar archived tasks

But for now, manual documentation provides flexibility and learning value.
