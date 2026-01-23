# Architecture Constraints

## Plain English Summary

This document lists the technical and organizational rules we must follow when building AIOS. These include decisions we've already made (like using React Native), limitations from external systems (like mobile platform requirements), and company standards (like security requirements). Some constraints are unchangeable (mobile platforms only support certain technologies), while others are strategic choices (TypeScript for type safety).

---

## Technical Constraints

### Platform Constraints

| Constraint | Description | Rationale | Impact |
| ------------ | ------------- | ----------- | -------- |
| **Mobile-First** | iOS and Android are primary platforms | Target users are mobile-first; web is secondary fallback | All features must work natively on mobile |
| **iOS 13+** | Minimum iOS version 13 | Covers 95%+ of iPhone users, enables modern APIs | Can use latest React Native features |
| **Android 10+** | Minimum Android SDK 29 | Covers 85%+ of Android users, modern APIs | Can use modern Android features |
| **No Web Platform** | Web is disabled in Expo config | Focus on native mobile experience | Simplified development, better performance |
| **ARM Architecture** | Must run on ARM processors (iOS/Android) | All mobile devices use ARM | No x86-specific optimizations |

### Verification

```bash
# Check Expo config
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/app.json | grep platforms

# Check minimum versions
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/package.json | grep -A 5 "expo"
```text

### Technology Stack Constraints

| Technology | Version | Constraint | Decision Reference |
| ------------ | --------- | ------------ | ------------------- |
| **React Native** | 0.81.5 | Mobile client framework | [ADR-002](../../decisions/002-react-native.md) |
| **Expo** | 54.0.23 | Development platform, OTA updates | Required for rapid development |
| **Node.js** | 18+ | Backend runtime | Server-side JavaScript |
| **TypeScript** | 5.9.2 | Type system | Strict mode enabled |
| **React** | 19.1.0 | UI framework | React 19 with concurrent features |
| **React Navigation** | 7.x | Navigation library | Standard for React Native |
| **AsyncStorage** | 2.2.0 | Local storage | [ADR-001](../../decisions/001-use-asyncstorage.md) |
| **Express** | 4.21.2 | Backend framework | REST API server |
| **Drizzle ORM** | 0.39.3 | Database ORM | Type-safe SQL queries |
| **PostgreSQL** | 8+ (pg driver) | Database (future) | Configured but not yet connected |
| **Zod** | 3.24.2 | Schema validation | Runtime type checking |
| **Jest** | 30.2.0 | Testing framework | Unit and integration tests |

### Rationale
- **React Native:** Cross-platform mobile development with native performance (see [ADR-002](../../decisions/002-react-native.md))
- **Expo:** Simplifies mobile development, provides managed services, enables OTA updates
- **TypeScript:** Type safety prevents runtime errors, improves maintainability
- **AsyncStorage:** Simple key-value storage for local-first approach (see [ADR-001](../../decisions/001-use-asyncstorage.md))
- **PostgreSQL + Drizzle:** Scalable relational database with type-safe ORM

### Files
- `/package.json` - Dependency versions
- `/tsconfig.json` - TypeScript configuration
- `/babel.config.js` - Babel transpilation config
- `/metro.config.js` - React Native bundler config

### Storage Constraints

| Constraint | Limit | Impact | Mitigation |
| ------------ | ------- | -------- | ----------- |
| **AsyncStorage Limit** | 6MB (Android), 10MB (iOS) | Local data must fit within limits | Data pruning, archive strategies, future SQLite migration |
| **SQLite Support** | Not yet implemented | No complex queries in local storage | Use PostgreSQL for backend, consider Expo SQLite for mobile |
| **No File System Access** | Sandboxed storage only | Can't write to arbitrary paths | Use Expo FileSystem API for documents |
| **Cloud Sync Not Implemented** | MVP is local-only | No multi-device sync yet | Planned for Phase 4+ |

### Verification (2)
```bash
# Check AsyncStorage usage
grep -r "AsyncStorage" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/storage/

# Check storage configuration
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/storage/database.ts | head -50
```text

### Development Environment Constraints

| Constraint | Description | Rationale |
| ------------ | ------------- | ----------- |
| **macOS for iOS** | iOS development requires macOS + Xcode | Apple requirement |
| **Android Studio** | Android development requires Android Studio + SDK | Google requirement |
| **Expo Go** | Testing on physical devices requires Expo Go app | Simplifies testing |
| **Node.js 18+** | Modern JavaScript features, ESM support | LTS version |
| **Git** | Version control required | Standard practice |

### Files (2)
- `/.github/` - GitHub Actions workflows
- `/scripts/` - Build and deployment scripts
- `/package.json` - npm scripts

---

## Organizational Constraints

### Development Process Constraints

| Constraint | Description | Rationale | Impact |
| ------------ | ------------- | ----------- | -------- |
| **Git Flow** | Feature branches, PRs, code review | Quality assurance | All changes reviewed before merge |
| **CI/CD Required** | All tests must pass in GitHub Actions | Automated quality gates | Broken tests block deployment |
| **Test Coverage** | 100% coverage on production modules | Quality standard | New features require tests |
| **Documentation Required** | All modules must be documented | Knowledge sharing | Features incomplete without docs |
| **Security Scans** | CodeQL must pass with 0 critical issues | Security standard | Vulnerabilities block release |

### Verification (3)
```bash
# Check CI/CD configuration
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/.github/workflows/

# Run CI checks locally
npm test
npm run lint
npm run check:types
npm audit
```text

### Documentation Constraints

| Constraint | Standard | Location | Purpose |
| ------------ | ---------- | ---------- | --------- |
| **Architecture Decisions** | ADR format | `/docs/decisions/` | Capture key technical decisions |
| **API Documentation** | OpenAPI/Swagger (future) | `/docs/technical/API_DOCUMENTATION.md` | API contract |
| **Code Comments** | JSDoc for public APIs | Inline in code | Code-level documentation |
| **Architecture Documentation** | arc42 template | `/docs/architecture/arc42/` | System architecture |
| **Glossary** | Standardized terms | `/docs/glossary.md` | Common vocabulary |

### Files (3)
- `/docs/decisions/README.md` - ADR index
- `/docs/architecture/README.md` - Architecture docs overview
- `/docs/glossary.md` - Terminology

### Security Constraints

| Constraint | Requirement | Verification | Impact |
| ------------ | ------------- | -------------- | -------- |
| **Authentication** | JWT with bcrypt hashing | [ADR-003](../../decisions/003-jwt-auth.md) | All protected endpoints require valid tokens |
| **Password Hashing** | bcrypt with 10+ rounds | Server code | No plaintext passwords |
| **HTTPS Only** | All API calls over HTTPS | Network config | HTTP blocked in production |
| **No Secrets in Code** | Secrets in environment variables | `.env` files, never committed | Security audit failure if violated |
| **Dependency Audits** | Regular npm audit checks | CI/CD | Vulnerable dependencies blocked |
| **CodeQL Scanning** | GitHub Advanced Security | CI/CD | Critical issues block release |

### Verification (4)
```bash
# Check authentication implementation
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/api/middleware/auth.ts

# Run security scans
npm audit
npm audit fix

# Check for secrets in code (should return nothing)
grep -r "password.*=" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/ | grep -v test
```text

---

## Code Quality Constraints

### TypeScript Constraints

| Constraint | Configuration | Rationale | Impact |
| ------------ | -------------- | ----------- | -------- |
| **Strict Mode** | `"strict": true` | Maximum type safety | No implicit `any`, null checks required |
| **ES Module Interop** | `"esModuleInterop": true` | Import compatibility | Can import CommonJS modules |
| **Path Aliases** | `@/*` for client, `@packages/contracts/*` for shared | Clean imports | Shorter import paths |
| **No `any` Types** | Lint rule | Type safety | All types must be explicit |

### Configuration
```json
// /tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": ["./apps/mobile/*"],
      "@packages/contracts/*": ["./packages/contracts/*"]
    }
  }
}
```text

### Verification (5)
```bash
# Type checking
npm run check:types

# Show TypeScript config
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/tsconfig.json
```text

### Linting and Formatting Constraints

| Tool | Configuration | Purpose | Enforcement |
| ------ | -------------- | --------- | ------------- |
| **ESLint** | `eslint.config.js` | Code quality | CI/CD blocks on errors |
| **Prettier** | `prettier.config.js` | Code formatting | Pre-commit hook |
| **Expo Lint** | Built-in rules | React Native best practices | `npm run lint` |

### Configuration (2)
- `/eslint.config.js` - ESLint rules
- `/.prettierrc` - Prettier configuration (if exists)
- `/package.json` - Scripts for linting

### Verification (6)
```bash
# Run linting
npm run lint

# Check formatting
npm run check:format

# Auto-fix
npm run lint:fix
npm run format
```text

---

## Performance Constraints

### Mobile Performance Requirements

| Constraint | Target | Rationale | Measurement |
| ------------ | -------- | ----------- | ------------- |
| **60 FPS Animations** | 16ms frame time | Smooth user experience | React DevTools Profiler |
| **Screen Transition** | < 100ms | Perceived instant response | Performance monitoring |
| **App Launch Time** | < 2 seconds | User retention | Expo performance monitor |
| **Search Response** | < 200ms | Real-time feel | Performance tests |
| **Bundle Size** | < 10MB (optimized) | Fast downloads, storage | Build analysis |

### Implementation
- React Native Reanimated for 60fps animations
- Lazy loading of screens
- FlatList virtualization
- useMemo/useCallback optimization
- Image optimization with Expo Image

### Files (4)
- `/metro.config.js` - Bundling optimization
- `/apps/mobile/components/` - Optimized components
- `/apps/mobile/screens/` - Performance best practices

### Verification (7)
```bash
# Check bundle size
npm run expo:static:build

# Profile performance
npm run expo:dev
# Use React DevTools > Profiler tab
```text

### Network Constraints

| Constraint | Requirement | Rationale | Impact |
| ------------ | ------------- | ----------- | -------- |
| **Offline-First** | Core features work without network | Mobile connectivity unreliable | AsyncStorage for local data |
| **Request Timeout** | 10 seconds | Prevent hanging requests | User experience |
| **Retry Logic** | 3 attempts with exponential backoff | Handle transient failures | Reliability |
| **Optimistic Updates** | UI updates before server confirmation | Perceived performance | Better UX |

### Implementation (2)
- AsyncStorage for offline data
- TanStack React Query for caching and retries
- Optimistic updates in UI
- Network state monitoring

### Files (5)
- `/apps/mobile/storage/database.ts` - Offline storage
- `/apps/mobile/hooks/` - Network-aware hooks

---

## Assumptions

1. **Platform Stability:** React Native and Expo will remain stable and supported
2. **AsyncStorage Limits:** 6-10MB is sufficient for MVP; can migrate to SQLite later
3. **Mobile Device Specs:** Target devices have 2GB+ RAM, quad-core CPU
4. **Network Availability:** Users have intermittent but not always-on connectivity
5. **Development Team:** Team is familiar with React, TypeScript, and mobile development
6. **Tool Chain:** Node.js, npm, Git, and CI/CD tools remain available
7. **Security Standards:** Current security practices (JWT, bcrypt) are sufficient for MVP
8. **Performance:** React Native provides adequate performance for 60fps animations

---

## Failure Modes

### Technology Constraint Violations

1. **AsyncStorage Overflow:**
   - **Risk:** Data exceeds 6-10MB limit
   - **Detection:** Storage write errors, user reports
   - **Mitigation:** Implement data pruning, migrate to SQLite

2. **Platform Incompatibility:**
   - **Risk:** New iOS/Android versions break features
   - **Detection:** Automated testing on new OS versions
   - **Mitigation:** Stay updated with Expo SDK releases

3. **Dependency Vulnerabilities:**
   - **Risk:** npm packages introduce security issues
   - **Detection:** npm audit, CodeQL scans
   - **Mitigation:** Regular updates, security reviews

4. **Performance Degradation:**
   - **Risk:** App becomes slow as modules increase
   - **Detection:** Performance monitoring, user feedback
   - **Mitigation:** Lazy loading, code splitting, profiling

### Organizational Constraint Violations

1. **CI/CD Failures:**
   - **Risk:** Tests fail, blocking deployment
   - **Detection:** GitHub Actions notifications
   - **Mitigation:** Fix tests before merging, comprehensive test coverage

2. **Documentation Gaps:**
   - **Risk:** Features undocumented, knowledge loss
   - **Detection:** Documentation audits, code reviews
   - **Mitigation:** Enforce documentation requirements in PRs

3. **Security Policy Violations:**
   - **Risk:** Secrets committed, vulnerabilities ignored
   - **Detection:** CodeQL, npm audit, code review
   - **Mitigation:** Pre-commit hooks, security training

---

## How to Verify

### Verify Technology Constraints

```bash
# Check platform configuration
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/app.json | grep -A 10 "platforms"

# Check dependency versions
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/package.json | grep -A 50 "dependencies"

# Verify TypeScript configuration
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/tsconfig.json

# Check storage implementation
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/storage/

# Verify build configuration
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/metro.config.js
```text

### Verify Organizational Constraints

```bash
# Check CI/CD workflows
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/.github/workflows/

# Verify ADRs exist
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/docs/decisions/

# Check documentation structure
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/docs/

# Verify security implementation
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/api/middleware/auth.ts
```text

### Verify Code Quality Constraints

```bash
# Type checking (2)
npm run check:types

# Linting
npm run lint

# Formatting check
npm run check:format

# Security audit
npm audit

# Run tests
npm test
```text

### Verify Performance Constraints

```bash
# Build and check size
npm run expo:static:build

# Start with performance monitoring
npm run expo:dev
# Open React DevTools > Profiler

# Check bundle analysis (if configured)
npx expo export --dev
```text

---

## Related Documentation

- [Introduction and Goals](00_intro.md) - Overview and stakeholders
- [Requirements and Quality Goals](01_goals.md) - What the system must do
- [Solution Strategy](04_solution_strategy.md) - How constraints are addressed
- [ADR-001: Use AsyncStorage](../../decisions/001-use-asyncstorage.md) - Storage decision
- [ADR-002: React Native](../../decisions/002-react-native.md) - Platform decision
- [ADR-003: JWT Authentication](../../decisions/003-jwt-auth.md) - Auth decision
- [Architecture Decisions](../../decisions/README.md) - All ADRs

