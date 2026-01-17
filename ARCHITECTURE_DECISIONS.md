# Architecture Decision Records (ADR)

## ADR-001: Incremental Type Safety Over Big Bang Refactor

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** Repository had 364 TypeScript compilation errors blocking all development.

**Decision:**
Fix foundation issues (87 errors) and document remaining 277 errors with prioritized remediation plan, rather than attempting to fix all errors in one massive refactor.

**Rationale:**
1. **Risk Reduction:** Smaller changes are easier to test and rollback
2. **Determinism:** Can verify each category of fixes independently
3. **Non-Blocking:** Allows development to continue while type safety improves
4. **Bisectable:** Each commit fixes one category, easy to identify regressions

**Consequences:**
- ✅ Development unblocked immediately
- ✅ Clear path to zero errors (4-week plan)
- ✅ Each fix independently testable
- ⚠️ Temporary type assertions needed (documented)
- ⚠️ 277 errors remain (but documented and planned)

**Alternatives Considered:**
1. Fix all 364 errors at once - **Rejected:** Too risky, untestable
2. Disable type checking - **Rejected:** Defeats purpose of TypeScript
3. Use `any` everywhere - **Rejected:** Loses all type safety

---

## ADR-002: Discriminated Unions for Event Payloads

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** EventBus used generic `Record<string, unknown>` losing all type safety.

**Decision:**
Create discriminated union types for all event payloads:
```typescript
export type AllEventPayloads = 
  | NoteEventPayload
  | TaskEventPayload
  | CalendarEventPayload
  | ...;
```

**Rationale:**
1. **Compile-Time Safety:** TypeScript can narrow types based on eventType
2. **Maintainability:** Adding new events requires updating the union
3. **Documentation:** Types serve as documentation of event contracts
4. **Refactorability:** Can safely rename properties, TypeScript shows all usages

**Consequences:**
- ✅ Event handling now type-safe
- ✅ Compile errors if event shape changes
- ✅ Better IDE autocomplete
- ⚠️ Requires updating union when adding events (intentional)

**Alternatives Considered:**
1. Keep generic types - **Rejected:** No type safety
2. Use classes for events - **Rejected:** Too heavyweight
3. Separate EventBus per event type - **Rejected:** Too complex

---

## ADR-003: Theme Access Via Hook, Not Direct Import

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** 150+ files import Colors/Typography/Shadows directly, breaking theme changes.

**Decision:**
Mandate use of `useTheme()` hook for all theme access:
```typescript
// ❌ Old way
import { Colors } from '@/constants/theme';
<Text style={{ color: Colors.textPrimary }} />

// ✅ New way
const { theme } = useTheme();
<Text style={{ color: theme.textPrimary }} />
```

**Rationale:**
1. **Reactive:** Components re-render when theme changes
2. **Type-Safe:** `theme` object is properly typed
3. **Centralized:** One source of truth for current theme
4. **Testable:** Can mock useTheme in tests

**Consequences:**
- ✅ Dark mode support works correctly
- ✅ Theme changes apply immediately
- ✅ Type-safe theme access
- ⚠️ Requires migrating 150+ files (planned)
- ⚠️ Temporarily added missing properties to theme constants for backward compatibility

**Alternatives Considered:**
1. Keep direct imports - **Rejected:** Breaks theme switching
2. Use Context directly - **Rejected:** More boilerplate
3. Global theme variable - **Rejected:** Not reactive

---

## ADR-004: Comprehensive CI/CD Before Code Fixes

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** No CI existed, any broken code could be merged.

**Decision:**
Implement comprehensive CI/CD pipeline BEFORE fixing remaining type errors:
- Type checking, linting, formatting, tests, security scanning, builds
- Pre-commit hooks for local enforcement
- Fail-fast on any quality gate violation

**Rationale:**
1. **Guardrails First:** Prevent new errors while fixing old ones
2. **Fast Feedback:** Catch issues in seconds (pre-commit) or minutes (CI)
3. **Automation:** No reliance on developer memory
4. **Observability:** See what's breaking immediately

**Consequences:**
- ✅ Cannot merge broken code
- ✅ Quality improves over time, cannot regress
- ✅ Security vulnerabilities caught automatically
- ⚠️ Slightly slower commit process (intentional)
- ⚠️ Requires maintaining CI configuration

**Alternatives Considered:**
1. Fix types first, then add CI - **Rejected:** New errors could be introduced
2. Only add CI for main branch - **Rejected:** Catches issues too late
3. Make CI optional - **Rejected:** Defeats the purpose

---

## ADR-005: Document Technical Debt, Don't Hide It

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** 277 TypeScript errors remain after foundation fixes.

**Decision:**
Create comprehensive TYPESCRIPT_TECHNICAL_DEBT.md documenting:
- All remaining errors categorized by type
- Effort estimates for each category
- Prioritization by impact
- Detailed remediation plan

**Rationale:**
1. **Transparency:** Everyone knows what's broken and why
2. **Plannable:** Can schedule fixes appropriately
3. **Trackable:** Can measure progress over time
4. **Preventable:** Document patterns to avoid

**Consequences:**
- ✅ Technical debt is visible and tracked
- ✅ Can prioritize fixes by business value
- ✅ New team members understand the state
- ⚠️ Requires keeping document updated (worth it)

**Alternatives Considered:**
1. Fix everything before documenting - **Rejected:** Too slow
2. Use code comments only - **Rejected:** Not discoverable
3. Track in issue tracker - **Rejected:** Too fragmented

---

## ADR-006: Strict Mode Deferred Until Zero Errors

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** TypeScript strict mode would add hundreds more errors.

**Decision:**
Enable strict mode only after reaching zero errors in regular mode.
Timeline: Week 4 of TYPESCRIPT_REMEDIATION_PLAN.md

**Rationale:**
1. **Incremental:** Fix foundation first, then add stricter checks
2. **Manageable:** Don't overwhelm with errors
3. **Motivating:** Each phase has clear success criteria
4. **Logical:** Build confidence before adding more constraints

**Consequences:**
- ✅ Incremental path to full type safety
- ✅ Each phase is achievable
- ⚠️ Some strict mode errors exist but hidden (temporary)

**Alternatives Considered:**
1. Enable strict mode immediately - **Rejected:** Too many errors
2. Never enable strict mode - **Rejected:** Misses strict checks
3. Enable strict mode per file - **Rejected:** Too complex to manage

---

## ADR-007: Model Property Names Must Match Usage

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** Code expects `Note.body` but model has `Note.content`.

**Decision:**
Audit all model interfaces and either:
1. Rename properties to match usage (if heavily used)
2. Add aliases for backward compatibility (if moderately used)
3. Fix callers (if rarely used)

Decision matrix:
- <5 usages: Fix callers
- 5-20 usages: Add alias
- >20 usages: Rename property

**Rationale:**
1. **Principle of Least Surprise:** Properties should be named what code expects
2. **Type Safety:** Prevents accessing non-existent properties
3. **Maintainability:** Clear property names reduce cognitive load

**Consequences:**
- ✅ Model interfaces match actual usage
- ✅ No runtime undefined errors from wrong property names
- ⚠️ May require data migration (documented)

**Alternatives Considered:**
1. Keep current names, fix all callers - **Rejected:** Too much churn
2. Use getters/setters for aliases - **Rejected:** Runtime overhead
3. Ignore the issue - **Rejected:** Defeats TypeScript purpose

---

## ADR-008: Pre-Commit Hooks Cannot Be Bypassed

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** Need to prevent broken code from being committed.

**Decision:**
Implement Husky pre-commit hook that:
1. Runs type checking
2. Runs linting
3. Runs format checking
4. Fails the commit if any check fails
5. Cannot be bypassed with `--no-verify` (policy)

**Rationale:**
1. **Shift-Left:** Catch issues before they reach CI
2. **Fast Feedback:** Seconds instead of minutes
3. **Developer Experience:** Know immediately if commit will fail CI
4. **Enforcement:** Make quality non-negotiable

**Consequences:**
- ✅ No broken commits
- ✅ Fast local feedback
- ✅ CI runs faster (fewer failures)
- ⚠️ Slightly slower commits (intentional)
- ⚠️ Must fix issues before committing (feature, not bug)

**Alternatives Considered:**
1. Only check in CI - **Rejected:** Feedback too slow
2. Make pre-commit optional - **Rejected:** Will be bypassed
3. Only check changed files - **Considered:** May implement later

---

## ADR-009: Separate CI Jobs for Fast Feedback

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** Need to know quickly which quality gate failed.

**Decision:**
Create separate CI jobs for each quality check:
- Type check
- Lint
- Format
- Test
- Audit
- Build (client)
- Build (server)

All run in parallel, fail independently.

**Rationale:**
1. **Fast Feedback:** See which specific check failed immediately
2. **Parallel Execution:** Faster overall CI time
3. **Independent Failures:** One failure doesn't block seeing others
4. **Clear Metrics:** Track pass/fail rate per check

**Consequences:**
- ✅ Know exactly what's broken
- ✅ Faster CI through parallelization
- ✅ Better observability
- ⚠️ More GitHub Actions minutes used (acceptable)

**Alternatives Considered:**
1. Single CI job for everything - **Rejected:** Slower feedback
2. Sequential jobs - **Rejected:** Much slower
3. Only run failing jobs - **Rejected:** Too complex

---

## ADR-010: CodeQL Security Scanning Mandatory

**Date:** 2026-01-17  
**Status:** Accepted  
**Context:** Need to catch security vulnerabilities automatically.

**Decision:**
Run CodeQL security scanning:
- On every push
- On every PR
- Daily scheduled scan
- With security-and-quality query suite

Failures block merge.

**Rationale:**
1. **Proactive:** Catch vulnerabilities before production
2. **Automated:** No manual security reviews needed
3. **Comprehensive:** Covers many vulnerability classes
4. **Continuous:** Daily scans catch new CVEs

**Consequences:**
- ✅ Security vulnerabilities caught early
- ✅ No manual security reviews needed
- ✅ Compliance-friendly (audit trail)
- ⚠️ May produce false positives (acceptable)

**Alternatives Considered:**
1. Manual security reviews - **Rejected:** Too slow, incomplete
2. Only scan on release - **Rejected:** Too late
3. Optional security scanning - **Rejected:** Will be ignored

---

## Summary of Architectural Decisions

These decisions establish a **production-grade foundation**:

1. **Incremental improvement** over big bang
2. **Type safety** through discriminated unions
3. **Reactive theming** through hooks
4. **Automation** over manual processes
5. **Transparency** through documentation
6. **Enforcement** through CI and pre-commit
7. **Fast feedback** through parallelization
8. **Security** through automated scanning

All decisions follow the principle: **Determinism over cleverness**.
