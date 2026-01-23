# Glossary

## Plain English Summary

This glossary defines key terms used in AIOS architecture documentation. For each term, we provide a plain English explanation followed by technical details. This ensures everyone - from new developers to experienced architects - can understand the documentation. Terms are linked to the main project glossary where applicable.

---

## Architecture-Specific Terms

### arc42

**Plain English:** A template for documenting software architecture
**Technical:** Comprehensive documentation framework with 12 standard sections covering all aspects of system architecture
**See:** This directory (`/docs/architecture/arc42/`)

### Architecture Decision Record (ADR)

**Plain English:** A document explaining why we made an important technical choice
**Technical:** Lightweight document format capturing context, decision, and consequences of architectural decisions
**Example:** Why we chose React Native over Flutter
**See:** [Architecture Decisions](09_decisions.md), `/docs/decisions/`

### Building Block

**Plain English:** A major component or piece of the system
**Technical:** Architectural element that encapsulates functionality, has clear interfaces, and can be developed/tested independently
**Examples:** Mobile Client, Backend Server, Storage Layer
**See:** [Building Blocks View](05_building_blocks.md)

### Cross-Cutting Concern

**Plain English:** A design pattern or rule that applies everywhere, not just one module
**Technical:** Aspect of architecture that affects multiple modules (e.g., security, logging, error handling)
**Examples:** Design system, error handling, security patterns
**See:** [Cross-Cutting Concepts](08_crosscutting.md)

### Quality Attribute

**Plain English:** A measurable characteristic of system quality
**Technical:** Non-functional requirement that defines how well the system performs (e.g., performance, security, maintainability)
**Examples:** 60fps animations, < 100ms screen transitions, 0 critical vulnerabilities
**See:** [Quality Requirements](10_quality.md)

### Runtime View

**Plain English:** How the system works in action - the flow of data and control
**Technical:** Dynamic view showing interactions between components during specific scenarios
**Example:** What happens when user creates a note
**See:** [Runtime View](06_runtime.md)

### Scenario

**Plain English:** A specific use case or test case for a quality requirement
**Technical:** Concrete example demonstrating how a quality attribute is measured, including stimulus, response, and metrics
**Example:** "User navigates from Notebook to Note Editor in < 100ms"
**See:** [Quality Requirements](10_quality.md)

### Solution Strategy

**Plain English:** The high-level approach to achieving quality goals
**Technical:** Key architectural decisions and patterns that address quality requirements
**Example:** Use React Native for cross-platform, AsyncStorage for offline-first
**See:** [Solution Strategy](04_solution_strategy.md)

### Stakeholder

**Plain English:** Anyone who cares about or is affected by the system
**Technical:** Person, group, or organization with interest in the system's success
**Examples:** End users, developers, product owners, security team
**See:** [Introduction and Goals](00_intro.md)

### Technical Debt

**Plain English:** Shortcuts taken during development that need to be fixed later
**Technical:** Code, architecture, or design decisions made for speed that reduce maintainability or quality
**Example:** In-memory backend storage instead of PostgreSQL
**See:** [Risks and Technical Debt](11_risks.md)

---

## AIOS Domain Terms

For comprehensive domain terms (AI, modules, features), see the main glossary: [/docs/glossary.md](../../glossary.md)

### Quick Links

- [AIOS (AI Operating System)](../../glossary.md#aios-ai-operating-system)
- [AsyncStorage](../../glossary.md#asyncstorage)
- [Command Center](../../glossary.md#command-center)
- [Module](../../glossary.md#module)
- [Quick Capture](../../glossary.md#quick-capture)
- [Module Handoff](../../glossary.md#module-handoff)

---

## Technology Terms

### Drizzle ORM

**Plain English:** A tool for talking to databases using TypeScript
**Technical:** Lightweight TypeScript ORM that generates type-safe SQL queries
**Usage:** Configured for PostgreSQL migration (future)
**File:** `/drizzle.config.ts`

### Expo

**Plain English:** A platform that makes React Native development easier
**Technical:** Suite of tools and services for React Native, including managed workflow, OTA updates, and build services
**Version:** 54.0.23
**See:** [Deployment View](07_deployment.md)

### JWT (JSON Web Token)

**Plain English:** A secure way to prove who you are to the backend
**Technical:** Compact, URL-safe token containing claims, signed with a secret key
**Usage:** Authentication for API endpoints
**See:** [ADR-003: JWT Auth](../../decisions/003-jwt-auth.md)

### React Native

**Plain English:** A framework for building native mobile apps with JavaScript
**Technical:** Open-source framework by Meta that renders JavaScript/React code to native iOS/Android components
**Version:** 0.81.5
**See:** [ADR-002: React Native](../../decisions/002-react-native.md)

### React Native Reanimated

**Plain English:** A library for smooth animations in React Native
**Technical:** Animation library that runs animations on the UI thread (not JavaScript thread) for 60fps performance
**Version:** 4.1.1
**Usage:** All screen transitions, swipeable cards, gestures

### TypeScript

**Plain English:** JavaScript with type checking to catch errors before running code
**Technical:** Superset of JavaScript that adds static type checking
**Version:** 5.9.2
**Config:** Strict mode enabled in `/tsconfig.json`

### Zod

**Plain English:** A library that validates data at runtime
**Technical:** TypeScript-first schema validation with static type inference
**Version:** 3.24.2
**Usage:** API request validation, data model validation
**File:** `/packages/contracts/schema.ts`

---

## Architecture Patterns

### Offline-First

**Plain English:** The app works without internet, syncing when online
**Technical:** Architecture pattern where all operations complete locally before syncing to server
**Implementation:** AsyncStorage for local data, future cloud sync
**See:** [Solution Strategy](04_solution_strategy.md)

### Local-First

**Plain English:** User data stays on their device unless they choose to sync
**Technical:** Architecture philosophy prioritizing local storage and user control over data
**Rationale:** Privacy, offline functionality, fast operations
**See:** [ADR-001: AsyncStorage](../../decisions/001-use-asyncstorage.md)

### Modular Architecture

**Plain English:** The system is organized into independent, swappable pieces
**Technical:** Architecture style where system is decomposed into loosely coupled, highly cohesive modules
**Example:** 14 independent modules (Notebook, Planner, Calendar, etc.)
**See:** [Building Blocks View](05_building_blocks.md)

### Progressive Onboarding

**Plain English:** Users start simple (3 modules) and gradually unlock more features
**Technical:** Onboarding pattern that reduces initial complexity, incrementally revealing functionality
**Goal:** 90%+ completion rate
**See:** [Solution Strategy](04_solution_strategy.md)

---

## Quality Terms

### 60fps

**Plain English:** Animations look smooth (60 frames per second)
**Technical:** 60 frames per second (16.67ms per frame) is the standard for smooth animations on mobile
**Implementation:** React Native Reanimated on UI thread
**See:** [Quality Requirements](10_quality.md)

### Bus Factor

**Plain English:** How many developers can leave before the project stalls
**Technical:** Number of team members who can be "hit by a bus" before critical knowledge is lost
**Target:** Bus factor ≥ 3
**See:** [Risks and Technical Debt](11_risks.md)

### Code Coverage

**Plain English:** Percentage of code tested by automated tests
**Technical:** Metric measuring lines of code executed during test runs
**Target:** 100% on production modules
**Current:** 100% on 14 production modules
**See:** [Quality Requirements](10_quality.md)

### Technical Debt (2)

**Plain English:** Code shortcuts that will cost more to fix later
**Technical:** Implied cost of rework caused by choosing easy solution now instead of better approach that would take longer
**Example:** In-memory storage instead of PostgreSQL
**See:** [Risks and Technical Debt](11_risks.md)

### Test Coverage

See "Code Coverage"

---

## Measurement Units

### FPS (Frames Per Second)

**Plain English:** How many animation frames shown per second
**Standard:** 60fps for smooth mobile animations
**Measurement:** React DevTools Profiler

### ms (milliseconds)

**Plain English:** One thousandth of a second
**Usage:** Screen transitions (< 100ms), API response times (< 1000ms)

### MB (Megabytes)

**Plain English:** Million bytes of data
**Context:** AsyncStorage limits (6MB Android, 10MB iOS), bundle size (< 10MB target)

---

## How to Use This Glossary

1. **New to AIOS?** Start with [main glossary](../../glossary.md), then read this
2. **Looking for a term?** Use Ctrl+F to search this page
3. **Term not here?** Check [main glossary](../../glossary.md) or open an issue
4. **Adding new terms?** Follow the format:

   ```markdown
   ### Term Name
   **Plain English:** [Explanation for non-technical readers]
   **Technical:** [Precise definition for developers]
   **Example/Usage:** [How it's used in AIOS]
   **See:** [Link to relevant documentation]
   ```text

---

## Related Documentation

- [Main Glossary](../../glossary.md) - Complete AIOS terminology
- [Introduction and Goals](00_intro.md) - Overview of AIOS
- [Architecture Decisions](../../decisions/README.md) - ADR index
- All arc42 sections use terms defined here

