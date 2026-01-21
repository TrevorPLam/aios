# TypeScript Technical Debt

## Overview

This document tracks known TypeScript type safety issues that require systematic refactoring.
These issues do not prevent compilation (via type assertions) but represent technical debt
that should be addressed in a planned refactor to ensure long-term maintainability and type safety.

## Priority 1: Event System Type Safety (43 files affected)

**Issue:** EventBus uses generic `Record<string, unknown>` for event payloads instead of discriminated unions.

### Impact

- Loss of type safety when handling events
- Cannot leverage TypeScript's narrowing
- Runtime errors if event shape changes

### Files Affected

- client/lib/searchIndex.ts (43 errors)
- client/lib/memoryManager.ts (2 errors)
- Other event listeners across codebase

### Solution

1. Create discriminated union type for all event payloads
2. Use type guards in eventBus.on() to narrow payload types
3. Remove all `as` type assertions after proper typing

**Effort:** 3-5 days
**Risk:** Medium (affects event contract between modules)

## Priority 2: Theme System Misuse (150+ files affected)

**Issue:** Components import `Colors`, `Typography`, `Shadows` directly instead of using `useTheme()` hook.

### Impact (2)

- Hard-coded theme doesn't respond to theme changes
- Breaks dark mode support
- Type errors when accessing non-existent properties

### Files Affected (2)

- client/components/miniModes/* (all files)
- client/screens/* (multiple screens)
- Any component using Colors/Typography/Shadows directly

### Solution (2)

1. Migrate all components to use `useTheme()` hook
2. Access theme properties via `theme.textPrimary` instead of `Colors.textPrimary`
3. Create ESLint rule to prevent direct imports of theme constants

**Effort:** 5-7 days
**Risk:** Low (can be done incrementally per component)

## Priority 3: Navigation Type Safety (5 files affected)

**Issue:** Navigation calls use `string` instead of properly typed route names.

### Impact (3)

- No compile-time validation of route names
- Typos cause runtime errors
- Missing/incorrect params not caught

### Files Affected (3)

- client/screens/AttentionCenterScreen.tsx
- client/screens/SettingsMenuScreen.tsx
- Other screens with navigation.navigate()

### Solution (3)

1. Use type-safe navigation patterns from React Navigation v7
2. Leverage `keyof AppStackParamList` properly
3. Add type guards for dynamic route selection

**Effort:** 1-2 days
**Risk:** Low (localized changes)

## Priority 4: Model Property Completeness (30+ files affected)

**Issue:** Model interfaces missing properties that code expects.

### Examples

- Note.body → Note.content
- Task.description → Task.notes
- Contact.email → Contact.emails (array)
- Contact.phone → Contact.phoneNumbers (array)

### Impact (4)

- Code accessing non-existent properties
- Database schema mismatched with TypeScript types
- Potential runtime undefined errors

### Solution (4)

1. Audit all model interfaces against actual usage
2. Add missing properties or fix property names
3. Update database layer to match
4. Migrate data if property names changed

**Effort:** 2-3 days
**Risk:** Medium (requires data migration)

## Priority 5: Component Prop Type Errors (15+ files affected)

**Issue:** Components passing props that don't match declared interfaces.

### Examples (2)

- Button component: `label` prop doesn't exist
- ThemedText: Using type="title" but not in union
- AIAssistSheet: Passing `context` prop that doesn't exist

### Impact (5)

- Props silently ignored
- Unexpected component behavior
- Missing required props

### Solution (5)

1. Add missing props to component interfaces
2. OR remove invalid prop usages
3. Ensure all components properly typed

**Effort:** 1-2 days
**Risk:** Low (component-level changes)

## Priority 6: Server-Side Type Errors (3 files affected)

**Issue:** Various type mismatches in server code.

### Examples (3)

- server/routes.ts: Settings object missing required fields ✅ FIXED
- server/routes.ts: Query parameter type assertions instead of proper validation
- server/storage.ts: Duplicate/malformed code ✅ FIXED
- server/index.ts: Implicit any types ✅ FIXED

### Impact (6)

- Server may crash on certain requests
- Data validation not enforced
- Harder to maintain server code

### Solution (6)

1. Fix Settings creation to include all required fields ✅ DONE
2. Remove duplicate code blocks ✅ DONE
3. Add explicit types to all function parameters ✅ DONE
4. Replace type assertions with Zod validators for query parameters

**Effort:** 1 day (0.5 days remaining)
**Risk:** Low (already partially fixed)

## Enforcement Strategy

### Short Term (Current)

- Use `// @ts-expect-error` with explanatory comments for known issues
- Use type assertions (`as`) only when type is correct but TS can't infer it
- Document all suppressions in this file
- **Note:** Code review flagged type assertions in server/routes.ts - plan to replace with Zod validation

### Long Term (Next Quarter)

1. Enable strict mode incrementally per directory
2. Add ESLint rules to catch anti-patterns
3. Pre-commit hooks enforce no new suppressions
4. CI fails on any new `@ts-expect-error` without this file being updated
5. Replace all type assertions with proper type guards or validation

## Metrics

### Current State

- Total TS errors: 277 (down from 364)
- Files with errors: 46
- Suppressions added: 0 (using type assertions instead)

### Target State

- Total TS errors: 0
- Files with errors: 0
- Suppressions: 0 (all properly typed)

**Timeline:** Q2 2026

## Related Documentation

- FORENSIC_ANALYSIS_V2.md - Security and code quality audit
- .github/workflows/ci.yml - CI enforcement of type checking
- eslint.config.js - Linting rules

## Code Review Feedback (Nitpicks for Future)

1. **database export alias** - Document migration path in code comments
2. **server/routes.ts type assertions** - Replace with Zod validators
3. **textTertiary naming** - Consider renaming to textPlaceholder
4. **ESLint scope** - Verify .eslintignore covers build artifacts
