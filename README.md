# AIOS — Life Operating System

**Vision:** The American WeChat — Global, Innovative, Revolutionary

AIOS is an iOS-first super app with Android/Web compatibility. Built with React Native and Expo, it combines a futuristic HUD/control-panel aesthetic with a privacy-first, local‑first foundation. The goal: consolidate 38+ specialized apps into one intelligent operating system for life.

**Development Model:** Unified AGENT Ownership — a single AGENT delivers features across iOS, Android, and Web.

## Table of Contents

- [What is AIOS?](#what-is-aios)
- [Product Scope](#product-scope)
- [Current Capabilities (v1.0)](#current-capabilities-v10)
- [Design Principles](#design-principles)
- [Module Maturity Matrix](#module-maturity-matrix)
- [Platform Support](#platform-support)
- [Deep Analysis (New README Scope)](#deep-analysis-new-readme-scope)
- [Security & Privacy](#security--privacy)
- [Quick Start](#quick-start)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Available Scripts](#available-scripts)
- [Documentation](#documentation)
- [Contributing](#contributing)

## What is AIOS?

AIOS (AI Operating System) is not another productivity app. It is a **privacy-first super app** that aims to replace 38+ specialized applications with a single, intelligent, seamlessly integrated platform.

**Current State:** 14 production-ready modules (72% avg completion)
**Vision:** 38+ modules spanning productivity, commerce, health, entertainment, and innovation
**Philosophy:** Intelligence over complexity, privacy over profit, integration over isolation

## Product Scope

### Tier 1: Super App Essentials (Next Phase)

- 💳 **Wallet & Payments** — Digital wallet, P2P transfers, bill splitting
- 🏪 **Marketplace & Commerce** — User marketplace + business directory
- 🗺️ **Maps & Navigation** — Context-aware location intelligence
- 🎫 **Events & Ticketing** — Discover, book, coordinate events
- 🍕 **Food & Delivery** — Unified restaurant ordering
- 🚗 **Ride & Transportation** — Multi-modal transport hub

### Tier 2: Life Management

- 🏥 **Health & Wellness** — Holistic health tracking beyond fitness
- 🎓 **Learning & Education** — Personalized learning system
- 💼 **Professional Services** — On-demand expert help (lawyers, accountants, therapists)
- 🏡 **Home Management** — Smart home operations hub
- 🎬 **Entertainment Hub** — Unified streaming discovery
- 📚 **Library & Reading** — Complete reading ecosystem

### Tier 3: Innovative Edge (No One Else Building These)

- 🧠 **Memory Bank** — AI-powered searchable life history
- 🤝 **Relationship Manager** — CRM for personal relationships
- 🎯 **Life Goals & Vision** — Long-term goal achievement system
- 🌊 **Context Zones** — Automatic interface adaptation (work/personal modes)
- 🔮 **Future Predictor** — Probabilistic life forecasting
- 💡 **Opportunity Scanner** — AI finds opportunities you’re missing

**Complete details:** [docs/vision/SUPER_APP_MODULE_EXPANSION.md](docs/vision/SUPER_APP_MODULE_EXPANSION.md)

## Current Capabilities (v1.0)

### Core Modules (14 Production-Ready)

1. **Command Center** — AI recommendation engine with swipeable cards and confidence meters
2. **Notebook** — Markdown editor with tag/link parsing, similarity detection, bulk operations
3. **Planner** — Task and project management with hierarchies, priorities, filtering
4. **Calendar** — Event scheduling with 4 view modes, conflict detection, meeting links, statistics
5. **Email** — Professional thread management with advanced search, filters, bulk ops
6. **Messages** — P2P messaging with group chat, media sharing, AI assistance
7. **Lists** — Checklist management with 7 categories, templates, priorities
8. **Alerts** — Smart reminders with recurrence and effectiveness tracking
9. **Contacts** — Native device integration with sharing preferences
10. **Translator** — Real-time language translation with TTS/STT (12+ languages)
11. **Photos** — Gallery with organization and backup tracking
12. **History** — Activity tracking with advanced filtering and analytics
13. **Budget** — Personal finance management with templates and statistics
14. **Integrations** — Third-party service connections with health monitoring

### Key Highlights

- 🎨 **Dark-first design** with electric blue (`#00D9FF`) accent
- 🌊 **Smooth animations** using React Native Reanimated
- 📱 **Haptic feedback** for enhanced mobile experience
- 💾 **Local-first storage** using AsyncStorage (privacy-first)
- 🤖 **AI-powered recommendations** with cross-module intelligence
- 🧭 **AI Preferences tools** for refreshing recommendations and reviewing history
- 🔔 **Attention Center badge** in headers for quick access to notifications
- 🎨 **Theme-driven overlays** for consistent light/dark translucency
- 🔄 **Real-time updates** ready (WebSocket configured)
- 🔗 **Meeting link validation** on event sync for supported video providers
- ⌨️ **Web keyboard shortcut** — Use Cmd/Ctrl+K to open Omnisearch on web
- ⏱️ **Lazy-loaded heavy screens** (Photos, Photo Editor) for faster startup

## Design Principles

AIOS aligns product and engineering decisions against a small set of non-negotiable principles:

- **Local-first by default** — your data should live with you before it lives elsewhere.
- **Integrated workflows** — a task, note, or message should be linkable and actionable everywhere.
- **Signal over noise** — recommendations must be transparent and measurable.
- **Delightful ergonomics** — haptics, motion, and dark-first visuals keep focus high.
- **Progressive complexity** — start with core modules, grow into the super app over time.

## Module Maturity Matrix

Snapshot of depth across the 14 production-ready modules (UI, data model, and operations):

| Module | Data Model | CRUD | Search/Filters | Analytics/Stats | Notes |
| --- | --- | --- | --- | --- | --- |
| Command Center | ✅ | ✅ | ✅ | ✅ | Confidence meters + evidence |
| Notebook | ✅ | ✅ | ✅ | ✅ | Similarity detection + tags |
| Planner | ✅ | ✅ | ✅ | ✅ | Hierarchies + priorities |
| Calendar | ✅ | ✅ | ✅ | ✅ | 4 views + conflicts |
| Email | ✅ | ✅ | ✅ | ✅ | Bulk ops + labels |
| Messages | ✅ | ✅ | ✅ | ✅ | AI assist scaffolds |
| Lists | ✅ | ✅ | ✅ | ✅ | Templates + priorities |
| Alerts | ✅ | ✅ | ✅ | ✅ | Recurrence tracking |
| Contacts | ✅ | ✅ | ✅ | ⚠️ | Native sync dependent |
| Translator | ✅ | ✅ | ✅ | ⚠️ | External API dependent |
| Photos | ✅ | ✅ | ✅ | ✅ | Backup tracking |
| History | ✅ | ✅ | ✅ | ✅ | Export + analytics |
| Budget | ✅ | ✅ | ✅ | ✅ | Templates + stats |
| Integrations | ✅ | ✅ | ✅ | ✅ | Health monitoring |

## Platform Support

- **iOS:** Primary target, polished UX and haptics.
- **Android:** Compatibility via adaptation layer; parity improving.
- **Web:** Available for key flows, secondary focus with selective UI differences.

## Deep Analysis (New README Scope)

This section captures the current product + technical reality so teams can reason about capability depth, architectural constraints, and near‑term risks.

### 1) Product Maturity & Capability Depth

- **Breadth:** 14 production-ready modules spanning core productivity, communications, and media.
- **Depth:** Multiple modules have full CRUD, advanced filtering, analytics, and bulk actions (e.g., Calendar, Notebook, Email, History).
- **UX Parity:** iOS-first with deliberate Android/Web adaptations; web support exists but is secondary.
- **AI Readiness:** Recommendation and assistance flows are scaffolded with data models and endpoints, but generation logic remains a gap.

### 2) System Architecture (Client + Server + Shared)

- **Client (React Native + Expo):** iOS-first UI, shared components, theme system, haptics, and Reanimated for smooth motion.
- **Server (Express):** REST API with JWT auth, Zod validation, and in-memory storage ready for PostgreSQL migration.
- **Shared (TypeScript):** Shared schema for apps/mobile/server alignment.

Mermaid overview:

```mermaid
flowchart LR
  UI[React Native Client] -->|AsyncStorage| Local[(Local Storage)]
  UI -->|REST + JWT| API[Express API]
  API -->|In-memory (current)| Store[(Memory Store)]
  API -->|Planned| DB[(PostgreSQL + Drizzle ORM)]
  Shared[Shared Types] --- UI
  Shared --- API
```

### 3) Data & Persistence Strategy

- **Local-first:** AsyncStorage holds core objects (notes, tasks, events, conversations, alerts, etc.).
- **Server API:** Authenticated endpoints for all core modules with CRUD coverage.
- **Migration Path:** PostgreSQL configured, but the runtime storage layer is still in-memory.

### 4) UX System & Interaction Model

- **Phase 3 UX completed:** module handoff, enhanced mini-modes, quick capture overlay, iOS-optimized haptics and safe area behaviors.
- **Intent-first navigation:** intelligent entry point, adaptive interface, and unified search are driving UX tenets.

### 5) Quality Signals

- **Testing:** Jest + React Native Testing Library configured; multiple modules list 100% method coverage for their sub-systems.
- **Security:** Reported as 0 vulnerabilities per CodeQL (documented in module summaries).
- **Known gap:** Storage-level coverage is still growing (documented ~48% in legacy coverage notes).

### 6) Operational Constraints & Risks

- **Web parity:** Web support exists but is not the primary target; some UI flows (e.g., alerts time input) are web-specific.
- **Realtime:** WebSocket is configured but not fully used; real-time messaging is a planned enhancement.
- **AI value capture:** Recommendations, summarization, and assistant actions are scaffolded but not fully implemented.
- **Persistence:** In-memory storage is the current bottleneck for durability and multi-device sync.

### 7) Immediate Next Wins

- Wire PostgreSQL storage to unlock persistence + sync.
- Implement AI recommendation generation and assistant actions.
- Expand WebSocket usage for messaging and live updates.

## Security & Privacy

- **Local-first storage:** AsyncStorage is the default persistence layer.
- **API security:** JWT authentication with Zod-based request validation.
- **Data isolation:** User-specific data access enforced server-side.
- **Privacy posture:** No third-party analytics or ad SDKs embedded by default.
- **Known gap:** Durable persistence and multi-device sync require PostgreSQL wiring.

## Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (iOS development) or Android Studio (Android development)

### Installation

```bash
git clone https://github.com/TrevorPowellLam/Mobile-Scaffold.git
cd Mobile-Scaffold
npm install
```

### Optional Environment Variables (Replit)

```bash
export REPLIT_DEV_DOMAIN=your-domain.repl.co
export EXPO_PUBLIC_DOMAIN=your-domain.repl.co:5000
```

## Running the Application

### Development Mode

```bash
npm run expo:dev
```

> **Note:** This starts Expo in iOS mode for mobile development. The app is built iOS-first with Android compatibility via adaptation layer — web platform is disabled.

### Start the backend server

```bash
npm run server:dev
```

**Run both concurrently:** Open two terminal windows and run each command in a separate window.

## Troubleshooting

### Worklets error after dependency updates

If you see: `WorkletsError: Mismatch between JavaScript part and native part of Worklets`

```bash
npm run expo:clean:native && npm run expo:rebuild:ios
```

**Fix guides:**
- [docs/technical/URGENT_WORKLETS_FIX.md](./docs/technical/URGENT_WORKLETS_FIX.md)
- [docs/technical/WORKLETS_PREVENTION.md](./docs/technical/WORKLETS_PREVENTION.md)
- [Common Incidents Runbook](docs/operations/runbooks/common_incidents.md#react-native-worklets-version-mismatch)

### Changes not appearing in Expo?

```bash
npm run expo:clean
```

### Native dependency issues (version mismatches, install corruption)

```bash
npm run expo:clean:native
```

For severe issues:

```bash
npm run expo:clean:full
```
```

### Seeing a web version instead of native iOS?

- Ensure you're using `npm run expo:dev` (forces iOS mode)
- Press `i` in the Expo CLI to open the iOS simulator
- If using Expo Go, use a physical iOS device or iOS Simulator

### Using the web build for alerts?

- Web builds rely on a manual 24-hour time input (HH:MM) because native time pickers are not available on web.

## Testing

```bash
npm test
```

```bash
npm run test:watch
```

```bash
npm run test:coverage
```

## Project Structure

```text
Mobile-Scaffold/
├── apps/mobile/                 # React Native mobile app
│   ├── components/         # Reusable UI components
│   ├── constants/          # Theme, colors, spacing
│   ├── hooks/              # Custom React hooks
│   ├── models/             # TypeScript types and interfaces
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # Screen components
│   ├── storage/            # AsyncStorage database layer
│   ├── utils/              # Helper functions and seed data
│   └── App.tsx             # App entry point
├── apps/api/                 # Express backend
│   ├── index.ts            # Server setup and middleware
│   ├── routes.ts           # API routes (scaffold)
│   └── storage.ts          # Database utilities
├── packages/contracts/                 # Shared types between apps/mobile/server
│   └── schema.ts           # Database schema (Drizzle ORM)
├── assets/                 # Images and static files
├── scripts/                # Build and deployment scripts
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Design System

### Color Palette

- **Electric Blue:** `#00D9FF` — Primary accent, interactive elements
- **Deep Space:** `#0A0E1A` — Background
- **Slate Panel:** `#1A1F2E` — Card/surface backgrounds
- **Success:** `#00FF94` — Positive actions
- **Warning:** `#FFB800` — Medium confidence
- **Error:** `#FF3B5C` — Declined actions

### Typography

Using system fonts with the following scale:

- Hero: 32px Bold
- H1: 24px Semibold
- H2: 20px Semibold
- H3: 18px Semibold
- Body: 16px Regular
- Caption: 14px Regular
- Small: 12px Medium

## Available Scripts

### Development

- `npm run expo:dev` — Start Expo development server
- `npm run server:dev` — Start backend in development mode

### Building

- `npm run expo:static:build` — Build static Expo app
- `npm run server:build` — Bundle server with esbuild
- `npm run server:prod` — Run production server

### Database

- `npm run db:push` — Push schema changes to database

### Testing

- `npm test` — Run all tests
- `npm run test:watch` — Run tests in watch mode
- `npm run test:coverage` — Run tests with coverage report

### Code Quality

- `npm run lint` — Run ESLint
- `npm run lint:fix` — Fix ESLint issues
- `npm run check:types` — TypeScript type checking
- `npm run check:format` — Check code formatting
- `npm run format` — Format code with Prettier

### Maintenance & Cleanup

- `npm run expo:clean` — Clear Metro bundler cache
- `npm run expo:clean:native` — Clean native module caches and reinstall
- `npm run expo:clean:full` — Full clean (remove node_modules and reinstall)
- `npm run expo:rebuild:ios` — Rebuild iOS native app from scratch
- `npm run expo:rebuild:android` — Rebuild Android native app from scratch

### Diagnostics

- `npm run check:worklets` — Check react-native-worklets version consistency

## Documentation

### Quick Start

- **[README.md](./README.md)** — This file
- **[BESTPR.md](./BESTPR.md)** — Token-optimized best practices guide for AI agents
- **[DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md)** — Navigation guide to all documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to contribute to the project

### Core Documentation

- **[F&F.md](./F&F.md)** — Features & Functionality overview (main reference)
- **[MODULE_DETAILS.md](./MODULE_DETAILS.md)** — Technical implementation details

### Technical Documentation

- **[docs/technical/API_DOCUMENTATION.md](./docs/technical/API_DOCUMENTATION.md)** — API endpoints and usage
- **[docs/technical/TESTING_INSTRUCTIONS.md](./docs/technical/TESTING_INSTRUCTIONS.md)** — How to test the application
- **[docs/technical/design_guidelines.md](./docs/technical/design_guidelines.md)** — UI/UX design specifications
- **[docs/technical/IMPLEMENTATION_ROADMAP.md](./docs/technical/IMPLEMENTATION_ROADMAP.md)** — Development roadmap

### Analysis & Planning

- **[docs/analysis/COMPETITIVE_ANALYSIS.md](./docs/analysis/COMPETITIVE_ANALYSIS.md)** — Market positioning & competitive landscape
- **[docs/planning/MISSING_FEATURES.md](./docs/planning/MISSING_FEATURES.md)** — Known limitations and roadmap

### Vision & Strategy

- **[docs/vision/SUPER_APP_MODULE_EXPANSION.md](./docs/vision/SUPER_APP_MODULE_EXPANSION.md)** — 24 proposed modules for super app transformation
- **[docs/vision/UI_UX_REVOLUTIONARY_STRATEGY.md](./docs/vision/UI_UX_REVOLUTIONARY_STRATEGY.md)** — Ten new UX paradigms
- **[docs/PHASE_3_COMPLETION_SUMMARY.md](./docs/PHASE_3_COMPLETION_SUMMARY.md)** — Phase 3 UX system completion summary

## Contributing


1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Essential Reading

- [BESTPR.md](BESTPR.md) — Token-optimized best practices guide for AI agents
- [CONTRIBUTING.md](CONTRIBUTING.md) — Full contribution guidelines
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Constitution](/.repo/policy/CONSTITUTION.md) — Repository governance

