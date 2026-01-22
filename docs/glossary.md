# AIOS Glossary

## Plain English Summary

This glossary defines technical terms, acronyms, and project-specific concepts used throughout AIOS documentation. When you encounter unfamiliar terms, look them up here. Terms are explained in plain English first, then with technical detail.

---

## A

### ADR (Architecture Decision Record)

**Plain English:** A document that explains why we made important design choices
**Technical:** Lightweight document format for capturing architectural decisions, including context, decision, consequences, and alternatives considered
**See:** [docs/decisions/README.md](./decisions/README.md)

### AIOS (AI Operating System)

**Plain English:** The name of this project - a mobile super app that combines many apps into one
**Technical:** React Native/Expo-based mobile application with Node/Express backend, designed as a super app platform with 14+ integrated modules
**See:** [README.md](../README.md)

### API (Application Programming Interface)

**Plain English:** The way different parts of software talk to each other using defined rules
**Technical:** Set of endpoints, methods, and data formats that enable client-server communication
**See:** [docs/apis/README.md](./apis/README.md)

### AsyncStorage

**Plain English:** Where the mobile app saves data locally on your phone
**Technical:** React Native's key-value storage system for persisting data on the device
**See:** [decisions/001-use-asyncstorage.md](./decisions/001-use-asyncstorage.md)

## B

### Backend

**Plain English:** The server part of the app that runs in the cloud, not on your phone
**Technical:** Node.js/Express server handling API requests, authentication, database operations
**Location:** `/server` directory

## C

### C4 Model

**Plain English:** A visual way to show how software systems are organized at different zoom levels
**Technical:** Context, Container, Component, Code - four levels of architecture diagrams
**See:** [docs/architecture/c4/README.md](./architecture/c4/README.md)

### CI/CD (Continuous Integration / Continuous Deployment)

**Plain English:** Automated system that tests and deploys code changes automatically
**Technical:** GitHub Actions workflows that run tests, linting, security checks, and deployments on every commit/PR
**See:** [.github/workflows/](../.github/workflows/)

### CodeQL

**Plain English:** A security scanner that finds vulnerabilities in code automatically
**Technical:** GitHub's semantic code analysis engine for security vulnerability detection
**See:** [.github/workflows/codeql.yml](../.github/workflows/codeql.yml)

### Command Center

**Plain English:** The main dashboard screen with AI-powered recommendations
**Technical:** Primary module displaying swipeable recommendation cards with confidence metrics
**Location:** `client/screens/CommandCenter.tsx`

### Component

**Plain English:** A reusable piece of UI, like a button or form
**Technical:** React/React Native functional or class-based UI element
**Location:** `client/components/`

## D

### Dependabot

**Plain English:** A bot that automatically updates our code dependencies to keep them secure
**Technical:** GitHub's automated dependency update system
**See:** [.github/dependabot.yml](../.github/dependabot.yml)

### Diátaxis

**Plain English:** A framework for organizing documentation into four types: tutorials, how-tos, reference, and explanation
**Technical:** Systematic approach to documentation architecture ensuring clarity and findability
**See:** [docs/diataxis/rules.md](./diataxis/rules.md)

### Drizzle ORM

**Plain English:** A library that makes talking to databases easier with TypeScript
**Technical:** TypeScript-first ORM for SQL databases with type safety and migrations
**Config:** [drizzle.config.ts](../drizzle.config.ts)

## E

### Expo

**Plain English:** The platform we use to build the mobile app for both iOS and Android
**Technical:** React Native framework with managed workflow, native modules, and development tools
**See:** [decisions/002-react-native.md](./decisions/002-react-native.md)

## F

### Frontend

**Plain English:** The mobile app part that runs on your phone
**Technical:** React Native application running on iOS/Android devices
**Location:** `/client` directory

## H

### Haptics

**Plain English:** The vibration feedback you feel when tapping buttons in the app
**Technical:** Expo Haptics API for tactile feedback on user interactions
**Usage:** Throughout UI for button presses, gestures

### HUD (Heads-Up Display)

**Plain English:** The futuristic visual style used throughout the app
**Technical:** Design aesthetic inspired by sci-fi interfaces with transparency effects, glows, and layered overlays
**See:** [docs/technical/design_guidelines.md](./technical/design_guidelines.md)

## J

### Jest

**Plain English:** The tool we use to test our code automatically
**Technical:** JavaScript testing framework with mocking, assertions, and coverage reporting
**Config:** [jest.config.js](../jest.config.js)

### JWT (JSON Web Token)

**Plain English:** A secure way to prove who you are when using the app
**Technical:** Compact, URL-safe token format for authentication and authorization
**See:** [decisions/003-jwt-auth.md](./decisions/003-jwt-auth.md)

## M

### MkDocs

**Plain English:** The tool that turns our markdown docs into a searchable website
**Technical:** Static site generator for project documentation with Material theme
**Config:** [mkdocs.yml](../mkdocs.yml)

### Module

**Plain English:** A major feature area of AIOS, like Notebook, Calendar, or Budget
**Technical:** Self-contained feature with screens, logic, storage, and navigation
**See:** [MODULE_DETAILS.md](../MODULE_DETAILS.md)

### Module Handoff

**Plain English:** Seamlessly switching between modules while preserving what you were doing
**Technical:** State-preserving navigation system that maintains context and data when transitioning between modules
**Example:** Switching from Calendar to Messages while composing an event invitation
**See:** [Architecture](./architecture.md), README.md

## Q

### Quick Capture

**Plain English:** Instantly save an idea, task, note, photo, or reminder from anywhere in the app
**Technical:** Global overlay system accessible via long-press or quick action that provides 5 mini-modes for fast data capture
**Features:** Quick Note, Quick Task, Quick Photo, Quick Reminder, Quick Voice Note
**See:** [Architecture](./architecture.md), README.md

## O

### OpenAPI

**Plain English:** A standard way to describe what our API can do
**Technical:** Specification for RESTful API contracts with endpoints, schemas, and examples
**See:** [docs/apis/openapi/README.md](./apis/openapi/README.md)

## P

### PR (Pull Request)

**Plain English:** A proposed change to the codebase that gets reviewed before merging
**Technical:** GitHub workflow for code review, CI checks, and collaborative development
**See:** [CONTRIBUTING.md](../CONTRIBUTING.md)

## R

### React Native

**Plain English:** The technology that lets us write one app that works on both iPhone and Android
**Technical:** Cross-platform mobile framework using React and native components
**See:** [decisions/002-react-native.md](./decisions/002-react-native.md)

### Reanimated

**Plain English:** Library for smooth, 60fps animations in the app
**Technical:** React Native Reanimated v3 for high-performance animations on UI thread
**Usage:** Gesture handling, transitions, micro-interactions

### RFC (Request for Comments)

**Plain English:** A proposal for major changes that the community discusses before we implement
**Technical:** Formal process for gathering feedback on significant architectural changes
**See:** [GOVERNANCE.md](../GOVERNANCE.md)

## S

### SBOM (Software Bill of Materials)

**Plain English:** A list of all the software components and libraries we use
**Technical:** Comprehensive inventory of dependencies for security and compliance
**See:** [.github/workflows/sbom.yml](../.github/workflows/sbom.yml)

### Semantic Versioning (SemVer)

**Plain English:** A numbering system for releases: MAJOR.MINOR.PATCH (e.g., 1.2.3)
**Technical:** Versioning scheme where MAJOR = breaking changes, MINOR = features, PATCH = bug fixes
**See:** [CHANGELOG.md](../CHANGELOG.md)

### Super App

**Plain English:** An app that combines many different features (like WeChat) instead of needing separate apps
**Technical:** Platform application integrating multiple services and use cases in unified UX
**Vision:** [README.md](../README.md)

## T

### TypeScript

**Plain English:** JavaScript with type checking to catch errors before running code
**Technical:** Statically-typed superset of JavaScript providing compile-time type safety
**Config:** [tsconfig.json](../tsconfig.json)

## V

### Vale

**Plain English:** A tool that checks documentation writing quality and consistency
**Technical:** Prose linter with configurable rules for style, grammar, and terminology
**Config:** [.vale.ini](../.vale.ini)

## W

### WebSocket

**Plain English:** A way for the app and server to send messages back and forth in real-time
**Technical:** Bidirectional communication protocol for real-time features
**Implementation:** Server configured, client-side integration pending

## Z

### Zod

**Plain English:** A library for validating that data has the right shape and types
**Technical:** TypeScript-first schema validation with static type inference
**Usage:** API validation, form validation, data parsing

---

## Project-Specific Terms

### Module Completion Percentage

**Definition:** Metric tracking how complete a module is based on required features, tests, documentation
**Range:** 0-100%
**Calculation:** (Implemented features / Required features) × 100
**See:** [MODULE_DETAILS.md](../MODULE_DETAILS.md)

### Cross-Module Intelligence

**Definition:** AI recommendations that use data from multiple modules to provide insights
**Example:** Command Center suggesting calendar events based on notebook mentions
**Implementation:** Planned feature

### HUD Aesthetic

**Definition:** Futuristic, transparent, glowing UI style inspired by sci-fi interfaces
**Colors:** Dark backgrounds (#0A0A0A), electric blue accents (#00D9FF)
**Components:** Glass morphism, subtle animations, information density

---

## Acronyms Quick Reference

| Acronym | Full Name | Category |
| --------- | ----------- | ---------- |
| ADR | Architecture Decision Record | Documentation |
| API | Application Programming Interface | Technical |
| AIOS | AI Operating System | Project |
| CI/CD | Continuous Integration/Deployment | DevOps |
| JWT | JSON Web Token | Security |
| ORM | Object-Relational Mapping | Database |
| PR | Pull Request | Development |
| RFC | Request for Comments | Process |
| SBOM | Software Bill of Materials | Security |
| SemVer | Semantic Versioning | Releases |
| TTS | Text-to-Speech | Features |
| STT | Speech-to-Text | Features |
| UX | User Experience | Design |
| UI | User Interface | Design |

---

## How to Use This Glossary

1. **Ctrl+F / Cmd+F** to search for a term
2. Terms are alphabetical by first letter
3. Click "See:" links to learn more
4. "Location:" shows where to find code
5. "Config:" points to configuration files

## Contributing to This Glossary

When adding a term:

1. Include plain English definition first
2. Add technical definition
3. Link to relevant docs or code
4. Keep definitions under 2 sentences
5. Alphabetize properly
6. Add to acronyms table if applicable

---

**Last Updated:** January 2026
**Maintainer:** Documentation team
**Found a missing term?** [Open an issue](https://github.com/TrevorPLam/aios/issues/new?title=Glossary:%20Add%20term)
