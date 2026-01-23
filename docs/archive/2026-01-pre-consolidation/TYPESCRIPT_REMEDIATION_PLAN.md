# TypeScript Error Remediation Plan

## Overview

Systematic plan to eliminate all 277 remaining TypeScript errors following the principle of "smallest possible changes" and "determinism over cleverness".

## Execution Strategy

### Rule #1: One Category at a Time

Fix errors by category (event system, theme, navigation, etc.) not by file.
**Why:** Prevents cascading changes, easier to test, easier to rollback.

### Rule #2: Test After Each Category

Run full test suite after fixing each category.
**Why:** Catch regressions immediately, not after 100 changes.

### Rule #3: Commit After Each Category

Separate commit for each category of fixes.
**Why:** Bisect-able history, reviewable changes, easy rollback.

### Rule #4: Update This Document

Mark categories complete as you finish them.
**Why:** Track progress, prevent duplicate work.

---

## Week 1: Event System (Priority 1)

### Day 1-2: Define Event Payload Types

**Files:** `apps/mobile/lib/eventBus.ts`

### Tasks

1. Create discriminated union for all event types:

   ```typescript
   export type AllEventPayloads =
     | NoteEventPayload
     | TaskEventPayload
     | CalendarEventPayload
     | MessageEventPayload
     | NavigationEventPayload
     | UserEventPayload
     | SystemEventPayload;
   ```text

1. Make EventBus.on() type-safe:

   ```typescript
   on<T extends EVENT_TYPES>(
     eventType: T,
     listener: (payload: Extract<AllEventPayloads, { eventType: T }>) => void
   ): void
   ```text

1. Update emit() to enforce payload types:

   ```typescript
   emit<T extends EVENT_TYPES>(
     eventType: T,
     payload: Extract<AllEventPayloads, { eventType: T }>['data']
   ): void
   ```text

### Testing

- Run: `npm run check:types`
- Expected: Event-related errors drop from 43 to 0

**Commit:** "feat: add type-safe event payloads and discriminated unions"

### Day 3: Fix Event Listeners

**Files:** All files using eventBus.on()

### Tasks (2)

1. Fix searchIndex.ts (already partially done)
2. Fix memoryManager.ts
3. Fix recommendationEngine.ts
4. Fix any other event listeners

### Pattern

```typescript
// Before
eventBus.on('NOTE_CREATED', (data) => {
  const title = data.note.title; // ❌ Error
});

// After
eventBus.on(EVENT_TYPES.NOTE_CREATED, (payload) => {
  if (payload.data.note) {
    const title = payload.data.note.title; // ✅ Safe
  }
});
```text

### Testing (2)
- Run: `npm run check:types`
- Run: `npm test -- eventBus`
- Expected: All event-related errors resolved

**Commit:** "fix: update all event listeners to use typed payloads"

### Day 4-5: Event Emitters

**Files:** All files using eventBus.emit()

### Tasks (3)
1. Find all `eventBus.emit()` calls: `grep -r "eventBus.emit" apps/mobile/`
2. Update to use EVENT_TYPES enum and correct payload shape
3. Ensure all emit calls match discriminated union

### Pattern (2)
```typescript
// Before
eventBus.emit('NOTE_CREATED', { note: newNote });

// After
eventBus.emit(EVENT_TYPES.NOTE_CREATED, { note: newNote });
```text

### Testing (3)
- Run: `npm run check:types`
- Run: `npm test`
- Expected: Zero event-related errors remaining

**Commit:** "fix: update all event emitters to use typed payloads"

---

## Week 2: Theme System (Priority 2)

### Day 1: Create useTheme Migration Utility

**Files:** `apps/mobile/hooks/useTheme.ts`

### Tasks (4)
1. Extend useTheme hook to return all required properties
2. Create migration guide in code comments
3. Add deprecation warnings to direct imports (if possible)

### Testing (4)
- Verify useTheme() returns all properties components need
- Check one component migration works

**Commit:** "feat: enhance useTheme hook for component migration"

### Day 2-3: Migrate Components (Batch 1)

**Files:** `apps/mobile/components/miniModes/*`

### Tasks (5)
1. Replace `import { Colors } from '@/constants/theme'`
   With: `const { theme } = useTheme()`
2. Replace `Colors.textPrimary` with `theme.textPrimary`
3. Same for Typography and Shadows

### Pattern (3)
```typescript
// Before
import { Colors, Typography } from '@/constants/theme';
<Text style={{ color: Colors.textPrimary, fontSize: Typography.sizes.body }}>

// After
const { theme } = useTheme();
<Text style={{ color: theme.textPrimary, fontSize: 16 }}>
```text

### Testing (5)
- Visual test each component in Expo
- Run: `npm run check:types`
- Expected: ~50 errors resolved

**Commit:** "refactor: migrate miniMode components to useTheme hook"

### Day 4-5: Migrate Screens (Batch 2)

**Files:** `apps/mobile/screens/*` (Priority screens first)

### Tasks (6)
1. Migrate high-traffic screens first:
   - CommandCenterScreen
   - NotebookScreen
   - PlannerScreen
   - CalendarScreen
2. Use same pattern as miniModes

### Testing (6)
- Test each screen manually
- Run: `npm run check:types`
- Expected: ~100 more errors resolved

**Commit:** "refactor: migrate screens to useTheme hook"

---

## Week 3: Models & Navigation (Priorities 3-4)

### Day 1-2: Fix Model Interfaces

**Files:** `apps/mobile/models/types.ts`, affected files

### Tasks (7)
1. Audit each interface against actual usage
2. Add missing properties or rename incorrect ones:
   - Note: Add `content` property (alias or replace `body`)
   - Task: Add `notes` property (alias or replace `description`)
   - Contact: Fix `email` → `emails`, `phone` → `phoneNumbers`
   - CalendarEvent: Ensure `description` and `location` are optional

### Decision Matrix
```text
If property used in <5 places: Fix callers
If property used in 5-20 places: Add alias
If property used in >20 places: Rename database field
```text

### Testing (7)
- Run: `npm run check:types`
- Run: `npm test -- storage`
- Expected: ~30 errors resolved

**Commit:** "fix: correct model interfaces to match actual usage"

### Day 3: Fix Navigation Types

**Files:** Files with navigation.navigate() errors

### Tasks (8)
1. Use proper type narrowing for dynamic routes:

   ```typescript
   const screenName: keyof AppStackParamList = "Calendar";
   navigation.navigate(screenName); // ✅ Safe
   ```text

1. Or use conditional logic:

   ```typescript
   if (module === "calendar") {
     navigation.navigate("Calendar");
   }
   ```text

### Testing (8)
- Test navigation flows manually
- Run: `npm run check:types`
- Expected: ~5 errors resolved

**Commit:** "fix: use type-safe navigation patterns"

### Day 4-5: Fix Component Props

**Files:** Components with prop mismatches

### Tasks (9)
1. Add missing props to Button interface (e.g., `label`)
2. Fix ThemedText type union (add "title" or remove usage)
3. Fix AIAssistSheet props (add `context` or remove)

### Testing (9)
- Test each component
- Run: `npm run check:types`
- Expected: ~15 errors resolved

**Commit:** "fix: correct component prop interfaces"

---

## Week 4: Server & Cleanup

### Day 1: Fix Server Types

**Files:** `apps/api/*`

### Tasks (10)
1. Verify all Settings creation includes required fields
2. Check all server routes have proper types
3. Ensure no implicit any types remain

### Testing (10)
- Run: `npm run check:types`
- Start server: `npm run server:dev`
- Test API endpoints
- Expected: ~3 errors resolved

**Commit:** "fix: resolve server-side type errors"

### Day 2-3: Final Cleanup

#### Tasks
1. Fix any remaining edge case errors
2. Remove all `// @ts-expect-error` comments
3. Remove all `as` type assertions where possible
4. Run full test suite

### Testing (11)
- Run: `npm run check:types` → Should be ZERO errors
- Run: `npm test -- --coverage`
- Run: `npm run lint`
- Expected: Clean bill of health

**Commit:** "fix: resolve final TypeScript errors"

### Day 4: Enable Strict Mode

**Files:** `tsconfig.json`

### Tasks (11)
1. Enable strict mode gradually:

   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "strictFunctionTypes": true
     }
   }
   ```text

1. Fix any new errors revealed by strict mode
2. Update CI to enforce strict mode

### Testing (12)
- Run: `npm run check:types` with strict mode
- Ensure CI passes
- Expected: Zero errors in strict mode

**Commit:** "feat: enable TypeScript strict mode"

### Day 5: Documentation & Review

#### Tasks (2)
1. Update TYPESCRIPT_TECHNICAL_DEBT.md (mark all as resolved)
2. Update PRODUCTION_REFACTORING_SUMMARY.md
3. Create PR with all changes
4. Code review

### Deliverables
- Zero TypeScript errors
- All tests passing
- CI green
- Documentation updated

---

## Progress Tracking

### Week 1: Event System

- [ ] Day 1-2: Define event payload types
- [ ] Day 3: Fix event listeners
- [ ] Day 4-5: Fix event emitters

### Week 2: Theme System

- [ ] Day 1: Create migration utility
- [ ] Day 2-3: Migrate components
- [ ] Day 4-5: Migrate screens

### Week 3: Models & Navigation

- [ ] Day 1-2: Fix model interfaces
- [ ] Day 3: Fix navigation types
- [ ] Day 4-5: Fix component props

### Week 4: Server & Cleanup

- [ ] Day 1: Fix server types
- [ ] Day 2-3: Final cleanup
- [ ] Day 4: Enable strict mode
- [ ] Day 5: Documentation & review

---

## Rollback Plan

If any category causes major issues:

1. **Stop immediately** - Don't continue to next category
2. **Revert the commit** - `git revert <commit-sha>`
3. **Document the issue** - Add to TYPESCRIPT_TECHNICAL_DEBT.md
4. **Re-plan** - Adjust approach for that category
5. **Try again** - With lessons learned

---

## Success Criteria

- ✅ TypeScript error count: 0
- ✅ All tests passing
- ✅ CI/CD green
- ✅ No functionality broken
- ✅ No performance regression
- ✅ Code review approved
- ✅ Documentation updated

---

## Notes

- This plan assumes 1 person full-time for 4 weeks
- Can be parallelized if multiple people available
- Each commit should be under 500 lines for reviewability
- Take breaks - type refactoring is mentally taxing
- Ask for help if stuck on any category

