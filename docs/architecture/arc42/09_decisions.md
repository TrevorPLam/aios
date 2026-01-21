# Architecture Decisions

## Plain English Summary

This document links to all Architecture Decision Records (ADRs) that capture key technical choices made for AIOS. ADRs explain why we chose specific technologies (React Native, AsyncStorage, JWT) and document the context, alternatives considered, and consequences of each decision. This creates a paper trail for future developers to understand why the system is built the way it is.

---

## Overview

Architecture Decision Records (ADRs) document significant architectural decisions made during the development of AIOS. Each ADR follows a standard format and is immutable once accepted (new decisions supersede old ones rather than modifying them).

**ADR Location:** `/docs/decisions/`

**Format:** Each ADR includes:

- **Title:** Brief, descriptive name
- **Status:** Proposed, Accepted, Deprecated, Superseded
- **Context:** Problem and constraints
- **Decision:** What we decided
- **Consequences:** Positive and negative outcomes

---

## Accepted Architecture Decisions

### ADR-001: Use AsyncStorage for Local Persistence

**File:** [/docs/decisions/001-use-asyncstorage.md](../../decisions/001-use-asyncstorage.md)

**Status:** Accepted

### Summary

- **Decision:** Use @react-native-async-storage/async-storage for local data persistence
- **Context:** Need offline-first storage for mobile app
- **Alternatives:** SQLite, Realm, MMKV
- **Rationale:** Simple key-value API, async/await, React Native standard, sufficient for MVP (6-10MB limit)
- **Consequences:**
  - ✅ Offline-first works out of the box
  - ✅ Simple API, easy to test
  - ✅ No native dependencies, works on iOS/Android
  - ❌ Limited storage (6MB Android, 10MB iOS)
  - ❌ No complex queries (must load all, filter in JS)
  - ❌ May need migration to SQLite for large datasets

### Impact

- All 14 modules use AsyncStorage
- Storage layer in `/client/storage/database.ts`
- 659 unit tests for storage operations
- Future migration path to SQLite/PostgreSQL if limits exceeded

### Verification

```bash
# Check AsyncStorage usage
grep -r "AsyncStorage" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/

# Verify in package.json
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/package.json | grep async-storage
```text

---

### ADR-002: Use React Native for Mobile Client

**File:** [/docs/decisions/002-react-native.md](../../decisions/002-react-native.md)

**Status:** Accepted

### Summary (2)
- **Decision:** Use React Native with Expo for mobile app development
- **Context:** Need cross-platform mobile app (iOS + Android)
- **Alternatives:** Flutter, Native iOS/Android, Ionic/Capacitor
- **Rationale:** JavaScript/TypeScript ecosystem, code reuse, native performance, large community
- **Consequences:**
  - ✅ Single codebase for iOS and Android
  - ✅ Native performance (not WebView)
  - ✅ Huge ecosystem (npm packages)
  - ✅ Hot reload, fast development
  - ✅ Expo managed workflow simplifies builds
  - ❌ Larger bundle size than native
  - ❌ Some native features require custom modules
  - ❌ Bridge overhead (mitigated by new architecture)

### Impact (2)
- 43 screens built with React Native
- 25 shared components
- Expo SDK 54 for managed services
- React Native Reanimated for 60fps animations

### Verification (2)
```bash
# Check React Native version
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/package.json | grep react-native

# Check Expo version
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/package.json | grep "\"expo\""

# List screens
ls /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/screens/
```text

---

### ADR-003: Use JWT for Authentication

**File:** [/docs/decisions/003-jwt-auth.md](../../decisions/003-jwt-auth.md)

**Status:** Accepted

### Summary (3)
- **Decision:** Use JSON Web Tokens (JWT) with bcrypt password hashing for authentication
- **Context:** Need secure authentication for API endpoints
- **Alternatives:** Session-based auth, OAuth, Firebase Auth
- **Rationale:** Stateless, scalable, standard, no session storage needed
- **Consequences:**
  - ✅ Stateless (no server-side session storage)
  - ✅ Scalable (works with load balancers)
  - ✅ Standard format, widely supported
  - ✅ bcrypt provides secure password hashing
  - ❌ Token revocation is harder (no server state)
  - ❌ Must implement refresh token logic
  - ❌ Token in localStorage vulnerable to XSS (mitigated by AsyncStorage on mobile)

### Impact (3)
- JWT middleware in `/server/middleware/auth.ts`
- bcrypt hashing (10 rounds) in auth routes
- Token stored in AsyncStorage on client
- 7-day token expiry (configurable)

### Verification (3)
```bash
# Check JWT implementation
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/server/middleware/auth.ts

# Check bcrypt usage
grep -r "bcrypt" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/server/
```text

---

### ADR-004: Documentation Structure and Governance

**File:** [/docs/decisions/004-docs-structure.md](../../decisions/004-docs-structure.md)

**Status:** Accepted

### Summary (4)
- **Decision:** Use structured documentation with Diátaxis framework (Tutorials, How-To Guides, Reference, Explanation)
- **Context:** Need organized, maintainable documentation
- **Alternatives:** Single README, Wiki, Unstructured docs
- **Rationale:** Diátaxis provides clear structure, separates learning modes, scales with project growth
- **Consequences:**
  - ✅ Clear documentation categories
  - ✅ Easy to find information
  - ✅ Scales as project grows
  - ✅ Consistent format across docs
  - ❌ Requires discipline to maintain structure
  - ❌ More upfront work than single README

### Impact (4)
- `/docs/` directory structured by Diátaxis
- `/docs/architecture/` for arc42 docs
- `/docs/decisions/` for ADRs
- `/docs/technical/` for technical reference
- `/docs/vision/` for product vision

### Verification (4)
```bash
# Check documentation structure
tree -L 2 /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/docs/
```text

---

## Proposed Decisions (Future)

### ADR-005: Database Migration Strategy (Proposed)

**Status:** Proposed

### Context
- AsyncStorage approaching limits (6-10MB)
- Need complex queries (joins, aggregations)
- Multi-device sync requires server database

### Options
1. **SQLite on mobile:** Local relational DB
   - ✅ No size limits, complex queries
   - ✅ Offline-first still works
   - ❌ Migration complexity from AsyncStorage
   - ❌ Sync logic more complex

2. **PostgreSQL on server:** Cloud database
   - ✅ Scalable, relational, proven
   - ✅ Drizzle ORM already configured
   - ❌ Requires network for all operations
   - ❌ Offline mode more complex

3. **Hybrid:** SQLite on mobile + PostgreSQL on server
   - ✅ Best of both worlds
   - ✅ Offline-first + cloud backup
   - ❌ Most complex
   - ❌ Conflict resolution needed

**Proposed Decision:** Hybrid approach (SQLite + PostgreSQL)

### Consequences
- Migrate AsyncStorage to SQLite (preserves offline-first)
- Add PostgreSQL for cloud sync (multi-device)
- Implement conflict resolution (last-write-wins initially, CRDT future)
- Update all 200+ storage methods

### ADR-006: AI Service Integration (Proposed)

**Status:** Proposed

### Context (2)
- Command Center needs AI recommendations
- Multiple AI providers available (OpenAI, Anthropic, Google)

### Options (2)
1. **OpenAI GPT-4:**
   - ✅ Most capable, well-documented
   - ❌ Expensive, vendor lock-in

2. **Anthropic Claude:**
   - ✅ Good reasoning, competitive pricing
   - ❌ Newer, less ecosystem

3. **Open-source (Llama, Mistral):**
   - ✅ Self-hosted, privacy, no cost
   - ❌ Requires infrastructure, less capable

4. **Multi-provider abstraction:**
   - ✅ Flexibility, no lock-in
   - ❌ More complex, must handle API differences

**Proposed Decision:** Multi-provider abstraction with OpenAI as default

### ADR-007: State Management Library (Proposed)

**Status:** Proposed

### Context (3)
- Complex state logic emerging (Quick Capture, Module Handoff)
- React Context + useState/useReducer used currently
- Need predictable state updates

### Options (3)
1. **Continue with React Context:**
   - ✅ Built-in, no dependencies
   - ❌ Verbose, re-render issues

2. **Zustand:**
   - ✅ Simple, small (< 1KB), TypeScript
   - ✅ No boilerplate, middleware support
   - ❌ Less mature than Redux

3. **Redux Toolkit:**
   - ✅ Battle-tested, devtools, large ecosystem
   - ❌ Boilerplate, learning curve, larger bundle

4. **Jotai/Recoil:**
   - ✅ Atomic state, React concurrent mode ready
   - ❌ Newer, smaller community

**Proposed Decision:** Zustand (simple, TypeScript-first, scalable)

---

## Superseded Decisions

None yet. When decisions are superseded, they will be listed here with links to the superseding decision.

---

## Decision Process

### When to Create an ADR

Create an ADR for decisions that:

1. **Impact multiple modules** (not just one feature)
2. **Are hard to reverse** (require significant refactoring to change)
3. **Have tradeoffs** (no clear "correct" answer)
4. **Affect architecture** (technology choices, patterns, constraints)

### Examples
- ✅ Choice of database (impacts all modules)
- ✅ Authentication method (affects security, scalability)
- ✅ State management library (affects all components)
- ❌ Button color (too granular)
- ❌ Variable naming (covered by style guide)

### ADR Template

```markdown
# ADR-XXX: [Brief Title]

## Status
 [Proposed | Accepted | Deprecated | Superseded by ADR-YYY]

## Context
[Describe the problem and constraints]

## Decision
[State the decision clearly]

## Alternatives Considered
1. **Option 1:**
   - Pros: ...
   - Cons: ...

2. **Option 2:**
   - Pros: ...
   - Cons: ...

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Cost 1]
- [Cost 2]

### Neutral
- [Other impact]

## Implementation
[How this will be implemented, what changes are needed]

## Verification
[How to verify this decision is implemented correctly]
```text

### Review Process

1. **Author:** Creates ADR in "Proposed" status
2. **Team Review:** Discuss alternatives, consequences
3. **Decision:** Accept, reject, or request changes
4. **Update Status:** Move to "Accepted" and document
5. **Implementation:** Follow through with code changes
6. **Verification:** Ensure implementation matches ADR

---

## Assumptions

1. **ADR Immutability:** Once accepted, ADRs are not modified (new ADRs supersede old ones)
2. **Decision Ownership:** Team collectively owns decisions
3. **Documentation:** All significant decisions have ADRs
4. **Review:** ADRs reviewed by at least 2 team members
5. **Format:** All ADRs follow the standard template
6. **Storage:** ADRs stored in `/docs/decisions/` directory
7. **Naming:** ADRs numbered sequentially (001, 002, 003, ...)

---

## Failure Modes

### Undocumented Decisions

- **Risk:** Important decisions made without ADRs
- **Impact:** Future developers don't understand why system is built this way
- **Mitigation:** Code review process requires ADR for architectural changes
- **Recovery:** Retroactively create ADR documenting historical decision

### Outdated Decisions

- **Risk:** ADRs become stale as system evolves
- **Impact:** Documentation doesn't match reality
- **Mitigation:** Supersede old ADRs with new ones (don't modify)
- **Recovery:** Create new ADR marking old one as superseded

### Inconsistent Implementation

- **Risk:** Code doesn't follow ADR
- **Impact:** Decisions not actually implemented
- **Mitigation:** Link ADRs in code comments, code review checks
- **Recovery:** Update code to match ADR, or create new ADR if decision changed

---

## How to Verify

### Verify All ADRs Exist

```bash
# List all ADRs
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/docs/decisions/

# Should see
# 001-use-asyncstorage.md
# 002-react-native.md
# 003-jwt-auth.md
# 004-docs-structure.md
# README.md
```text

### Verify ADR Implementation

```bash
# ADR-001: Check AsyncStorage usage
grep -r "AsyncStorage" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/

# ADR-002: Check React Native version
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/package.json | grep react-native

# ADR-003: Check JWT implementation
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/server/middleware/auth.ts | head -30

# ADR-004: Check docs structure
tree -L 2 /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/docs/
```text

### Verify ADR Format

```bash
# Each ADR should have required sections
for adr in /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/docs/decisions/*.md; do
  echo "Checking $adr"
 grep -q "## Status" "$adr" && echo "✓ Has Status section" |  | echo "✗ Missing Status"
 grep -q "## Context" "$adr" && echo "✓ Has Context section" |  | echo "✗ Missing Context"
 grep -q "## Decision" "$adr" && echo "✓ Has Decision section" |  | echo "✗ Missing Decision"
 grep -q "## Consequences" "$adr" && echo "✓ Has Consequences section" |  | echo "✗ Missing Consequences"
done
```text

---

## Related Documentation

- [ADR Index](../../decisions/README.md) - List of all ADRs
- [ADR-001: AsyncStorage](../../decisions/001-use-asyncstorage.md)
- [ADR-002: React Native](../../decisions/002-react-native.md)
- [ADR-003: JWT Auth](../../decisions/003-jwt-auth.md)
- [ADR-004: Documentation Structure](../../decisions/004-docs-structure.md)
- [Solution Strategy](04_solution_strategy.md) - How decisions support quality goals
- [Constraints](02_constraints.md) - Constraints that influenced decisions
- [Cross-Cutting Concepts](08_crosscutting.md) - Patterns resulting from decisions
