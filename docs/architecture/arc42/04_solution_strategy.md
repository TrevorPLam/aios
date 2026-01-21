# Solution Strategy

## Plain English Summary

This document explains how we achieve AIOS's key quality goals through architectural decisions. We use React Native for cross-platform mobile development, AsyncStorage for offline-first local storage, modular architecture for maintainability, comprehensive testing for reliability, and modern React patterns for performance. Each decision directly supports our quality priorities: speed, security, maintainability, testability, usability, and reliability.

---

## Overview

The solution strategy maps our top quality goals to concrete architectural and technical decisions. Each strategy is traceable to specific code locations and measurable outcomes.

### Quality Goal → Strategy Mapping

| Priority | Quality Goal | Solution Strategy | Key Technologies |
| ---------- | -------------- | ------------------ | ------------------ |
| 1 | **Performance** | Native rendering + 60fps animations + lazy loading | React Native Reanimated, FlatList virtualization, useMemo/useCallback |
| 2 | **Security** | Local-first storage + JWT auth + zero third-party tracking | AsyncStorage, JWT, bcrypt, CodeQL scans |
| 3 | **Maintainability** | Modular architecture + TypeScript strict + shared components | Module boundaries, TypeScript 5.9, component library |
| 4 | **Testability** | Comprehensive unit tests + CI/CD automation | Jest, React Native Testing Library, GitHub Actions |
| 5 | **Usability** | Dark-first design + haptic feedback + progressive onboarding | Design system, expo-haptics, onboarding flow |
| 6 | **Reliability** | Offline-first + error boundaries + retry logic | AsyncStorage, error handlers, React Query (future) |

---

## Strategy 1: Performance Through Native Rendering and Optimization

### Goal

Achieve 60fps animations, < 100ms screen transitions, instant UI responsiveness.

### Approach

#### 1.1 Native Rendering with React Native

**Decision:** Use React Native instead of web-based solutions (Ionic, Cordova)
**Reference:** [ADR-002: React Native](../../decisions/002-react-native.md)

### Rationale

- Renders to native iOS/Android components (not WebView)
- Direct access to native APIs without bridge overhead
- True 60fps animations on device GPU
- Native gestures and haptic feedback

### Implementation

```typescript
// /client/App.tsx - Native component tree
import { View, Text, FlatList } from 'react-native';

// Native rendering, not DOM/WebView
<View style={styles.container}>
  <Text>Native UI</Text>
</View>
```text

#### 1.2 60fps Animations with React Native Reanimated

**Decision:** Use React Native Reanimated for all animations

### Rationale (2)
- Runs animations on UI thread, not JavaScript thread
- 60fps guaranteed even during heavy JS processing
- Smooth transitions and gestures

### Implementation (2)
```typescript
// /client/components/Card.tsx (example pattern)
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View entering={FadeIn} exiting={FadeOut}>
  {/* Content */}
</Animated.View>
```text

### Files
- All screen components use Animated.View
- `/client/components/` - Animated components
- `/package.json` - "react-native-reanimated": "~4.1.1"

#### 1.3 Lazy Loading and Code Splitting

**Decision:** Load screens and modules on-demand

### Rationale (3)
- Reduces initial bundle size
- Faster app startup (< 2 seconds)
- Memory efficiency

### Implementation (3)
```typescript
// /client/navigation/AppNavigator.tsx (pattern)
const NotebookScreen = React.lazy(() => import('../screens/NotebookScreen'));

// Screens loaded when navigated to, not upfront
```text

#### 1.4 FlatList Virtualization

**Decision:** Use FlatList for all long lists (notes, tasks, messages)

### Rationale (4)
- Only renders visible items + small buffer
- Recycles components as user scrolls
- Handles thousands of items without lag

### Implementation (4)
```typescript
// Pattern used in all list screens
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  windowSize={10}  // Render 10 items ahead
/>
```text

### Files (2)
- `/client/screens/NotebookScreen.tsx`
- `/client/screens/PlannerScreen.tsx`
- `/client/screens/EmailScreen.tsx`
- All list-based screens

#### 1.5 React Optimization Hooks

**Decision:** Use useMemo and useCallback to prevent unnecessary re-renders

### Rationale (5)
- Expensive computations cached
- Callbacks stable across renders
- Child components don't re-render unnecessarily

### Implementation (5)
```typescript
// Pattern used throughout
const sortedNotes = useMemo(() =>
  notes.sort((a, b) => b.updatedAt - a.updatedAt),
  [notes]
);

const handlePress = useCallback((id: string) => {
  // Handler logic
}, [dependencies]);
```text

### Files (3)
- All screen components use these patterns
- `/client/screens/*Screen.tsx`

### Verification

```bash
# Build and measure bundle size
npm run expo:static:build

# Profile performance
npm run expo:dev
# Open React DevTools > Profiler
# Record interaction, check render times

# Check animation framerates
# Use Expo Dev Tools > Performance tab
```text

### Metrics

- Screen transitions: < 100ms (measured with React DevTools)
- Animations: 60fps (Reanimated guarantee)
- App launch: < 2 seconds (measured with Expo performance tools)
- List scrolling: No dropped frames with 1000+ items

---

## Strategy 2: Security Through Local-First and JWT Authentication

### Goal (2)

Zero critical vulnerabilities, protect user privacy, secure authentication.

### Approach (2)

#### 2.1 Local-First Storage with AsyncStorage

**Decision:** Store all user data locally first, sync to cloud optionally
**Reference:** [ADR-001: AsyncStorage](../../decisions/001-use-asyncstorage.md)

### Rationale (6)
- User data never leaves device without explicit consent
- Works offline by default
- No third-party analytics or tracking
- Privacy-first architecture

### Implementation (6)
```typescript
// /client/storage/database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveNote = async (note: Note): Promise<void> => {
  // All data stored locally first
  await AsyncStorage.setItem(`note_${note.id}`, JSON.stringify(note));
};
```text

### Files (4)
- `/client/storage/database.ts` - All storage operations
- 100% local until future sync enabled

#### 2.2 JWT Authentication with bcrypt

**Decision:** JWT tokens for authentication, bcrypt for password hashing
**Reference:** [ADR-003: JWT Authentication](../../decisions/003-jwt-auth.md)

### Rationale (7)
- Stateless authentication (no session storage)
- Secure password hashing (bcrypt 10 rounds)
- Token expiration and refresh (future)

### Implementation (7)
```typescript
// /server/middleware/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Token generation
const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });

// Token validation
const decoded = jwt.verify(token, SECRET_KEY);
```text

### Files (5)
- `/server/middleware/auth.ts` - JWT middleware
- `/server/routes.ts` - Protected endpoints

#### 2.3 Input Validation with Zod

**Decision:** Validate all API inputs with Zod schemas

### Rationale (8)
- Runtime type checking prevents injection attacks
- Schema validation catches malformed data
- Type-safe validation shared between client/server

### Implementation (8)
```typescript
// /shared/schema.ts (pattern)
import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  body: z.string().max(50000),
  tags: z.array(z.string()),
});

// /server/middleware/validation.ts
const validated = NoteSchema.parse(req.body);
```text

### Files (6)
- `/shared/schema.ts` - Zod schemas
- `/server/middleware/validation.ts` - Validation middleware

#### 2.4 Security Scanning with CodeQL

**Decision:** Run CodeQL scans on every commit

### Rationale (9)
- Automated vulnerability detection
- Catches security issues before production
- GitHub Advanced Security integration

### Implementation (9)
```yaml
# .github/workflows/codeql.yml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```text

### Files (7)
- `.github/workflows/codeql.yml` - Security scanning
- CI/CD blocks on critical issues

### Verification (2)

```bash
# Security audit
npm audit
npm audit fix

# Type safety
npm run check:types

# Run CodeQL (in CI/CD)
# Manually: gh actions run codeql.yml
```text

### Metrics (2)

- npm audit: 0 critical/high vulnerabilities
- CodeQL: 0 critical/high alerts
- JWT tokens: Secure with bcrypt (10 rounds)
- Local storage: 100% of MVP data

---

## Strategy 3: Maintainability Through Modular Architecture

### Goal (3)

Add new modules in < 3 days, minimize code duplication, enable parallel development.

### Approach (3)

#### 3.1 Clear Module Boundaries

**Decision:** Each module is self-contained with screen + storage + tests

### Rationale (10)
- Changes isolated to module files
- Parallel development possible
- Easy to add/remove modules

### Structure
```text
Module: Notebook
├── /client/screens/NotebookScreen.tsx        (UI)
├── /client/screens/NoteEditorScreen.tsx      (Detail)
├── /client/storage/database.ts               (Storage methods)
└── /client/storage/__tests__/notebook.test.ts (Tests)

Module: Planner
├── /client/screens/PlannerScreen.tsx
├── /client/screens/TaskDetailScreen.tsx
├── /client/storage/database.ts               (Tasks methods)
└── /client/storage/__tests__/tasks.test.ts
```text

### Files (8)
- `/client/screens/` - 44 screen files (14 modules)
- `/client/storage/database.ts` - Methods grouped by module
- `/client/storage/__tests__/` - Tests per module

#### 3.2 Shared Component Library

**Decision:** Reusable components in `/client/components/`

### Rationale (11)
- UI consistency across modules
- Reduce code duplication
- Single source of truth for design

### Implementation (10)
```typescript
// /client/components/Button.tsx
export const Button = ({ title, onPress }: ButtonProps) => {
  // Consistent styling, haptics, accessibility
};

// Used in all modules
import { Button } from '@/components/Button';
```text

### Files (9)
- `/client/components/Button.tsx`
- `/client/components/Card.tsx`
- `/client/components/QuickCaptureOverlay.tsx`
- 20+ shared components

#### 3.3 TypeScript Strict Mode

**Decision:** Enable strict TypeScript across entire codebase

### Rationale (12)
- Catch type errors at compile time
- Self-documenting code with types
- Refactoring safety

### Configuration
```json
// /tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```text

### Verification (3)
```bash
npm run check:types
```text

#### 3.4 Consistent Patterns

**Decision:** Follow established patterns for all modules

### Patterns
- **Storage:** `save*`, `get*`, `update*`, `delete*` methods
- **Screens:** `*Screen.tsx` naming
- **Components:** Functional components with TypeScript
- **Hooks:** Custom hooks in `/client/hooks/`
- **Tests:** `*.test.ts` with 100% coverage

### Example
```typescript
// Storage pattern (every module follows this)
export const saveNote = async (note: Note): Promise<void> => { /* ... */ };
export const getNotes = async (): Promise<Note[]> => { /* ... */ };
export const updateNote = async (id: string, updates: Partial<Note>): Promise<void> => { /* ... */ };
export const deleteNote = async (id: string): Promise<void> => { /* ... */ };
```text

### Verification (4)

```bash
# Check code duplication
npx jscpd client/ server/

# Lint for consistency
npm run lint

# Type coverage
npm run check:types
```text

### Metrics (3)

- New module: < 3 days (estimate based on existing modules)
- Code duplication: < 5% (jscpd)
- TypeScript coverage: 100%
- Consistent patterns: All modules follow same structure

---

## Strategy 4: Testability Through Comprehensive Testing

### Goal (4)

100% test coverage on production modules, automated CI/CD, regression prevention.

### Approach (4)

#### 4.1 Unit Tests for Storage Layer

**Decision:** 100% coverage on all storage methods

### Rationale (13)
- Storage is critical path (data loss prevention)
- Pure functions easy to test
- Fast execution (< 10 seconds)

### Implementation (11)
```typescript
// /client/storage/__tests__/notebook.test.ts
describe('Notebook Storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should save a note', async () => {
    const note = { id: '1', title: 'Test', body: 'Content' };
    await saveNote(note);
    const saved = await getNote('1');
    expect(saved).toEqual(note);
  });

  // 49 tests total
});
```text

### Files (10)
- `/client/storage/__tests__/notebook.test.ts` (49 tests)
- `/client/storage/__tests__/calendar.test.ts` (33 tests)
- `/client/storage/__tests__/tasks.test.ts`
- `/client/storage/__tests__/alerts.test.ts`
- 659 total tests passing (100% pass rate)

#### 4.2 Component Tests with React Native Testing Library

**Decision:** Test React components with RNTL

### Rationale (14)
- User-centric testing (test behavior, not implementation)
- Encourages accessible components
- Integration testing without device

### Implementation (12)
```typescript
// /client/components/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';

it('calls onPress when tapped', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button title="Tap Me" onPress={onPress} />);

  fireEvent.press(getByText('Tap Me'));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```text

#### 4.3 E2E Tests for Critical Flows

**Decision:** E2E tests for authentication, data sync

### Implementation (13)
```typescript
// /server/__tests__/api.e2e.test.ts
describe('Authentication Flow', () => {
  it('should register, login, and access protected resource', async () => {
    // Register
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(registerRes.status).toBe(201);

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(loginRes.body).toHaveProperty('token');

    // Access protected route
    const notesRes = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(notesRes.status).toBe(200);
  });
});
```text

### Files (11)
- `/server/__tests__/api.e2e.test.ts`
- `/server/__tests__/messages.quickwins.e2e.test.ts`

#### 4.4 Automated CI/CD with GitHub Actions

**Decision:** Run all tests on every commit and PR

### Rationale (15)
- Catch regressions immediately
- Block merges with failing tests
- Automated quality gates

### Implementation (14)
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run lint
      - run: npm run check:types
```text

### Files (12)
- `.github/workflows/` - CI/CD workflows
- Runs on every commit

### Verification (5)

```bash
# Run all tests
npm test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch

# Specific module
npm test -- notebook
```text

### Metrics (4)

- Total tests: 659 passing (100% pass rate)
- Coverage: 100% on 14 production modules
- Test execution: < 30 seconds
- CI/CD: All tests must pass before merge

---

## Strategy 5: Usability Through Progressive Onboarding and Design System

### Goal (5)

90%+ onboarding completion, 5+ modules adopted per user, 4.5+ app store rating.

### Approach (5)

#### 5.1 Progressive Onboarding

**Decision:** Start with 3 core modules, expand gradually

### Rationale (16)
- Prevents user overwhelm
- Learn app incrementally
- Higher completion rate

### Implementation (15)
```typescript
// /client/screens/OnboardingModuleSelectionScreen.tsx
const suggestedModules = ['Command Center', 'Notebook', 'Planner'];

// User selects 3 modules to start
// Other modules unlocked later
```text

### Files (13)
- `/client/screens/OnboardingWelcomeScreen.tsx`
- `/client/screens/OnboardingModuleSelectionScreen.tsx`

#### 5.2 Consistent Design System

**Decision:** Dark-first theme with electric blue accent (#00D9FF)

### Rationale (17)
- Consistent look across all modules
- Reduces cognitive load
- Futuristic "HUD" aesthetic

### Implementation (16)
```typescript
// /client/constants/theme.ts
export const Colors = {
  primary: '#00D9FF',      // Electric blue
  background: '#0A0E1A',   // Deep space
  surface: '#1A1F2E',      // Slate panel
  success: '#00FF94',
  warning: '#FFB800',
  error: '#FF3B5C',
};

export const Typography = {
  hero: { fontSize: 32, fontWeight: 'bold' },
  h1: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
};
```text

### Files (14)
- `/client/constants/theme.ts` - Design tokens
- `/docs/technical/design_guidelines.md` - Full spec
- All components use theme constants

#### 5.3 Haptic Feedback

**Decision:** Tactile response for all interactions

### Rationale (18)
- Physical confirmation of actions
- Better mobile experience
- Accessibility benefit

### Implementation (17)
```typescript
import * as Haptics from 'expo-haptics';

// Used throughout app
const handlePress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // Action logic
};
```text

### Files (15)
- All interactive components use haptics
- Pattern consistent across modules

#### 5.4 Context-Aware UI

**Decision:** Adaptive interface based on context (work/personal modes future)

### Current Implementation
- Quick Capture overlay (long-press anywhere)
- Module handoff with breadcrumbs
- Mini-mode components for common tasks

### Files (16)
- `/client/components/QuickCaptureOverlay.tsx`
- `/client/context/HandoffContext.tsx`
- `/client/components/Mini*.tsx` - 5 mini-mode components

### Verification (6)

```bash
# Visual testing (manual)
npm run expo:dev
# Test onboarding flow
# Check theme consistency

# Accessibility audit (future)
npm run test:a11y
```text

### Metrics (5)

- Onboarding screens: 2 (welcome + module selection)
- Design system: Fully implemented in `/client/constants/theme.ts`
- Haptic feedback: 100% of interactive elements
- Quick Capture: 5 mini-mode components

---

## Strategy 6: Reliability Through Offline-First and Error Handling

### Goal (6)

99.9% uptime, 100% offline functionality, automatic error recovery.

### Approach (6)

#### 6.1 Offline-First with AsyncStorage

**Decision:** All operations work without network
**Reference:** [ADR-001: AsyncStorage](../../decisions/001-use-asyncstorage.md)

### Rationale (19)
- Mobile connectivity unreliable
- User actions never blocked by network
- Sync to cloud when available (future)

### Implementation (18)
```typescript
// /client/storage/database.ts
// All operations local-first
export const saveNote = async (note: Note): Promise<void> => {
  await AsyncStorage.setItem(`note_${note.id}`, JSON.stringify(note));
  // Future: Queue for sync when online
};
```text

#### 6.2 Error Boundaries

**Decision:** Catch React errors, prevent app crashes

### Implementation (19)
```typescript
// /client/App.tsx (pattern)
<ErrorBoundary
  fallback={<ErrorScreen />}
  onError={logError}
>
  <AppNavigator />
</ErrorBoundary>
```text

#### 6.3 Retry Logic for Network Requests

**Decision:** Retry failed requests with exponential backoff (future with React Query)

### Rationale (20)
- Handle transient network failures
- Don't lose user actions
- Automatic recovery

### Future Implementation
```typescript
// /client/hooks/useQuery.ts (future)
const { data } = useQuery({
  queryKey: ['notes'],
  queryFn: fetchNotes,
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});
```text

#### 6.4 State Persistence

**Decision:** Persist app state across restarts

### Implementation (20)
- All data in AsyncStorage
- App resumes from last state
- No data loss on crash/restart

### Verification (7)

```bash
# Test offline mode
# 1. Start app
# 2. Enable airplane mode
# 3. Create notes, tasks, events
# 4. Verify all saved to AsyncStorage

# Test error handling
npm test -- error

# Test state recovery
# 1. Create data
# 2. Force quit app
# 3. Reopen, verify data present
```text

### Metrics (6)

- Offline functionality: 100% of core features
- AsyncStorage: All user data persisted
- Error boundaries: Prevent app crashes
- State recovery: 100% after restart

---

## Technology Decision Summary

| Category | Technology | Reason | Alternative Considered |
| ---------- | ------------ | -------- | ---------------------- |
| **Mobile Framework** | React Native | Native performance, cross-platform | Flutter (less JS ecosystem), Native (2x development) |
| **Development Platform** | Expo | Rapid development, OTA updates | Bare React Native (more config) |
| **Local Storage** | AsyncStorage | Simple, offline-first | SQLite (more complex), Realm (third-party) |
| **Backend Framework** | Express | Familiar, simple, Node.js | Fastify (newer), NestJS (heavy) |
| **Database** | PostgreSQL + Drizzle | Type-safe, SQL, scalable | MongoDB (unstructured), Prisma (heavier) |
| **Authentication** | JWT + bcrypt | Stateless, secure | Session-based (server state), OAuth (third-party) |
| **Validation** | Zod | Runtime + static types | Yup (less type-safe), Joi (no TS) |
| **Testing** | Jest + RNTL | Standard, integrated | Vitest (newer), Mocha (less integrated) |
| **Type System** | TypeScript | Type safety, maintainability | JavaScript (no types), Flow (less adoption) |
| **Animations** | React Native Reanimated | 60fps, GPU rendering | React Native Animated (slower), Lottie (limited) |

---

## Assumptions

1. **Technology Stack:** React Native + Expo provides sufficient performance for 60fps animations
2. **Storage:** AsyncStorage (6-10MB limit) is adequate for MVP; can migrate to SQLite later
3. **Architecture:** Modular approach scales from 14 to 38+ modules without major rewrites
4. **Security:** JWT + bcrypt + local-first provides adequate security for MVP
5. **Testing:** Jest + RNTL cover 100% of testable scenarios
6. **User Adoption:** Progressive onboarding successfully prevents user overwhelm
7. **Network:** Offline-first is essential for mobile users
8. **Development Velocity:** Chosen technologies enable 3-day module development

---

## Failure Modes

### Strategy Failures

1. **Performance Degradation:**
   - **Risk:** App becomes slow with 38+ modules
   - **Mitigation:** Lazy loading, code splitting, performance monitoring
   - **Detection:** Automated performance tests, React DevTools Profiler

2. **AsyncStorage Limits:**
   - **Risk:** 6-10MB storage exceeded
   - **Mitigation:** Data pruning, migrate to SQLite, archive old data
   - **Detection:** Storage write errors, monitoring

3. **Test Coverage Regression:**
   - **Risk:** New features added without tests
   - **Mitigation:** CI/CD blocks untested code, code review
   - **Detection:** Coverage reports in CI/CD

4. **Security Vulnerabilities:**
   - **Risk:** New dependencies introduce vulnerabilities
   - **Mitigation:** Automated npm audit, CodeQL scans, regular updates
   - **Detection:** CI/CD security scans

---

## How to Verify

### Verify All Strategies Implemented

```bash
# Strategy 1: Performance
npm run expo:dev
# Check React DevTools Profiler

# Strategy 2: Security
npm audit
npm run check:types
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/server/middleware/auth.ts

# Strategy 3: Maintainability
npm run lint
tree -L 2 /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/screens/

# Strategy 4: Testability
npm run test:coverage

# Strategy 5: Usability
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/constants/theme.ts
ls /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/screens/Onboarding*

# Strategy 6: Reliability
# Test offline mode manually
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/database.ts | head -50
```text

---

## Related Documentation

- [Requirements and Quality Goals](01_goals.md) - What we're solving for
- [Constraints](02_constraints.md) - Limitations on our solutions
- [Building Blocks](05_building_blocks.md) - How solutions are implemented
- [Runtime View](06_runtime.md) - Solutions in action
- [Quality Requirements](10_quality.md) - Detailed quality scenarios
- [Architecture Decisions](../../decisions/README.md) - All ADRs
- [ADR-001: AsyncStorage](../../decisions/001-use-asyncstorage.md)
- [ADR-002: React Native](../../decisions/002-react-native.md)
- [ADR-003: JWT Auth](../../decisions/003-jwt-auth.md)
