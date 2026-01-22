# AIOS - Life Operating System

**Vision:** The American WeChat - Global, Innovative, Revolutionary

An iOS-native super app with Android/Web compatibility, built with React Native and Expo, featuring a futuristic "HUD/control panel" aesthetic. AIOS is evolving from an AI-powered productivity hub into a comprehensive life operating system - **the one app to rule them all**.

**Development Model:** Unified AGENT Ownership - a single AGENT delivers features across iOS, Android, and Web compatibility.

## 🌟 What is AIOS?

AIOS (AI Operating System) is not just another productivity app. It's a **privacy-first super app** that aims to replace 38+ specialized applications with a single, intelligent, seamlessly integrated platform.

**Current State:** 14 production-ready modules (72% avg completion)
**Vision:** 38+ modules spanning productivity, commerce, health, entertainment, and innovation
**Philosophy:** Intelligence over complexity, privacy over profit, integration over isolation

## 🚀 Current Features (v1.0)

### Core Modules (14 Production-Ready)

1. **Command Center** - AI recommendation engine with swipeable cards and confidence meters
2. **Notebook** - Markdown editor with tag/link parsing, similarity detection, bulk operations
3. **Planner** - Task and project management with hierarchies, priorities, filtering
4. **Calendar** - Event scheduling with 4 view modes, conflict detection, statistics
5. **Email** - Professional thread management with advanced search, filters, bulk ops
6. **Messages** - P2P messaging with group chat, media sharing, AI assistance
7. **Lists** - Checklist management with 7 categories, templates, priorities
8. **Alerts** - Smart reminders with recurrence and effectiveness tracking
9. **Contacts** - Native device integration with sharing preferences
10. **Translator** - Real-time language translation with TTS/STT (12+ languages)
11. **Photos** - Gallery with organization and backup tracking
12. **History** - Activity tracking with advanced filtering and analytics
13. **Budget** - Personal finance management with templates and statistics
14. **Integrations** - Third-party service connections with health monitoring

### Key Highlights

- 🎨 **Dark-first design** with electric blue (#00D9FF) accent
- 🌊 **Smooth animations** using React Native Reanimated
- 📱 **Haptic feedback** for enhanced mobile experience
- 💾 **Local-first storage** using AsyncStorage (privacy-first)
- 🤖 **AI-powered recommendations** with cross-module intelligence
- 🧭 **AI Preferences tools** for refreshing recommendations and reviewing history
- 🔔 **Attention Center badge** in headers for quick access to notifications
- 🎨 **Theme-driven overlays** for consistent light/dark translucency
- 🔄 **Real-time updates** ready (WebSocket configured)
- ⌨️ **Web keyboard shortcut** - Use Cmd/Ctrl+K to open Omnisearch on web
- ⏱️ **Lazy-loaded heavy screens** (Photos, Photo Editor) for faster startup
- 📊 **100% test coverage** on production modules
- 🔒 **Zero security vulnerabilities** (CodeQL verified)

## 🔮 Future Vision: The Super App

### Tier 1: Super App Essentials (Next Phase)

- 💳 **Wallet & Payments** - Digital wallet, P2P transfers, bill splitting
- 🏪 **Marketplace & Commerce** - User marketplace + business directory
- 🗺️ **Maps & Navigation** - Context-aware location intelligence
- 🎫 **Events & Ticketing** - Discover, book, coordinate events
- 🍕 **Food & Delivery** - Unified restaurant ordering
- 🚗 **Ride & Transportation** - Multi-modal transport hub

### Tier 2: Life Management

- 🏥 **Health & Wellness** - Holistic health tracking beyond fitness
- 🎓 **Learning & Education** - Personalized learning system
- 💼 **Professional Services** - On-demand expert help (lawyers, accountants, therapists)
- 🏡 **Home Management** - Smart home operations hub
- 🎬 **Entertainment Hub** - Unified streaming discovery
- 📚 **Library & Reading** - Complete reading ecosystem

### Tier 3: Innovative Edge (No One Else Building These)

- 🧠 **Memory Bank** - AI-powered searchable life history
- 🤝 **Relationship Manager** - CRM for personal relationships
- 🎯 **Life Goals & Vision** - Long-term goal achievement system
- 🌊 **Context Zones** - Automatic interface adaptation (work/personal modes)
- 🔮 **Future Predictor** - Probabilistic life forecasting
- 💡 **Opportunity Scanner** - AI finds opportunities you're missing

**Complete Details:** See [docs/vision/SUPER_APP_MODULE_EXPANSION.md](docs/vision/SUPER_APP_MODULE_EXPANSION.md) for all 24 proposed modules.

## 🎯 Revolutionary UI/UX Approach

Building a super app requires breaking traditional UI/UX rules. AIOS introduces **10 new paradigms**:

1. **Intelligent Entry Point** - AI predicts which 3-5 modules you need now
2. **Flow State Highway** - Complete workflows without context switching
3. **Adaptive Interface** - App morphs based on time/location/context
4. **Persistent Sidebar** - Always-accessible navigation that learns
5. **Unified Search** - One search across all 38+ modules
6. **Universal Gestures** - Same gestures work everywhere
7. **Progressive Onboarding** - Start with 3 modules, grow organically
8. **Attention Management** - AI prioritizes notifications intelligently
9. **Quick Capture** - Capture anything without losing context
10. **Module Handoff** - Seamless transitions with state preservation

**Complete Strategy:** See [docs/vision/UI_UX_REVOLUTIONARY_STRATEGY.md](docs/vision/UI_UX_REVOLUTIONARY_STRATEGY.md)

### Phase 3: Advanced UI Patterns (Complete ✅)

AIOS has successfully completed **Phase 3** of the revolutionary UX system with iOS-first development:

**✅ Completed:**

- **Module Handoff System** - State-preserving navigation between modules
  - iOS-specific breadcrumb UI with blur backdrop
  - AsyncStorage persistence across app lifecycle
  - Depth limiting (max 5 levels) and circular prevention
  - 22 unit tests, 100% passing
- **Enhanced Mini-Mode System** - Fully operational composable UI patterns
  - Calendar mini-mode for quick event creation
  - Task mini-mode for quick task creation
  - Note mini-mode for quick note capture
  - Budget mini-mode for expense/income tracking (iOS-native)
  - Contacts mini-mode for contact selection with search
  - 5 mini-modes total, integrated with Quick Capture
- **Quick Capture Overlay** - Global menu for capturing anything, anywhere
  - Accessible via long-press or button
  - Returns to exact context after capture
  - Supports note, task, event, and expense capture
- **iOS-Specific Optimizations**
  - Native haptic feedback patterns
  - Safe area inset handling (notch, dynamic island)
  - iOS-native keyboards (numeric, search)
  - BlurView backdrops
  - Native animations and transitions

**📊 Testing Coverage:** 659 tests passing (100% pass rate)
**🔒 Security:** 0 vulnerabilities (CodeQL verified)
**✅ Status:** Phase 3 Complete, Ready for Phase 4

**Complete Details:** See [docs/PHASE_3_COMPLETION_SUMMARY.md](docs/PHASE_3_COMPLETION_SUMMARY.md) for implementation summary.

## 📋 Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TrevorPowellLam/Mobile-Scaffold.git
   cd Mobile-Scaffold
   ```text

1. **Install dependencies**

   ```bash
   npm install
   ```text

1. **Set up environment variables** (optional for Replit)

   ```bash
   # For Replit deployment
   export REPLIT_DEV_DOMAIN=your-domain.repl.co
   export EXPO_PUBLIC_DOMAIN=your-domain.repl.co:5000
   ```text

## 🤖 Development Model: Unified AGENT Ownership

AIOS uses a **Unified AGENT Model** for platform development:

### AGENT

- **Role:** Builds and adapts all features, screens, and components
- **Platform:** iOS, Android, and Web
- **Responsibilities:**
  - Owns all architectural decisions
  - Delivers platform-compatible implementations
  - Adds platform-specific adaptations when needed
  - Tests on relevant target platforms

### Workflow

1. AGENT receives the task from P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md
2. AGENT implements the feature with platform compatibility in mind
3. AGENT tests on the required platforms
4. AGENT updates documentation and marks the task complete

**See [docs/governance/constitution.md](docs/governance/constitution.md) and [docs/ai/ai_contribution_policy.md](docs/ai/ai_contribution_policy.md) for complete details.**

## 🚀 Running the Application

### Development Mode

#### Start the mobile app

```bash
npm run expo:dev
```text

> **Note:** This starts Expo in iOS mode for mobile development. The app is built iOS-first with Android compatibility via adaptation layer - web platform is disabled.

### Start the backend server
```bash
npm run server:dev
```text

**Run both concurrently:** Open two terminal windows and run each command in a separate window.

---

### 🚨 Urgent Issues?

**If you see this error:** `WorkletsError: Mismatch between JavaScript part and native part of Worklets`

### Quick Fix
```bash
npm run expo:clean:native && npm run expo:rebuild:ios
```text

**📖 See [URGENT_WORKLETS_FIX.md](./docs/archive/project-management/URGENT_WORKLETS_FIX.md) for detailed instructions**

This is common after Dependabot updates. The fix takes 5-10 minutes and rebuilds your native iOS app with matching dependency versions.

---

### Troubleshooting

#### Changes not appearing in Expo?
Clear the Metro bundler cache:

```bash
npm run expo:clean
```text

This removes all cache files and restarts Expo with a fresh bundle.

### Native dependency issues (e.g., WorkletsError version mismatch)?
Clean native module caches and reinstall:

```bash
npm run expo:clean:native
```text

For severe issues with native dependencies:

```bash
npm run expo:clean:full
```text

### If you see "Mismatch between JavaScript part and native part of Worklets"
~~This is a common issue after dependency updates (especially Dependabot PRs).~~
**✅ PERMANENT FIX APPLIED** - The root cause (missing `react-native-reanimated` plugin in `app.json`) has been fixed in the repository.

### ONE-TIME ACTION REQUIRED (if you see this error)
```bash
npm run expo:clean:native && npm run expo:rebuild:ios
```text

This rebuilds your app with the correct configuration. After this one-time rebuild, the issue should NOT reoccur.

**📖 Complete Fix Guide:** See **[URGENT_WORKLETS_FIX.md](docs/archive/project-management/URGENT_WORKLETS_FIX.md)** for:

- What was fixed and why it was happening
- One-time rebuild instructions
- Verification steps

**🛡️ Prevention Guide:** See **[WORKLETS_PREVENTION.md](docs/archive/project-management/WORKLETS_PREVENTION.md)** for:

- Automated prevention measures (post-install hooks, CI checks)
- Best practices to avoid future issues
- Monitoring and alert setup

Also see [Common Incidents Runbook](docs/operations/runbooks/common_incidents.md#react-native-worklets-version-mismatch) for detailed troubleshooting.

### Seeing a web version instead of native iOS?

- Ensure you're using `npm run expo:dev` (which forces iOS mode)
- Press `i` in the Expo CLI to explicitly open iOS simulator
- If using Expo Go, make sure you're on a physical iOS device or iOS Simulator

### Using the web build for alerts?

- Web builds rely on a manual 24-hour time input (HH:MM) on the Alert detail screen because native time pickers are not available on web.

### Building for Production

#### Build the mobile app
```bash
npm run expo:static:build
```text

### Build the server
```bash
npm run server:build
```text

### Run production server
```bash
npm run server:prod
```text

## 📱 Testing the App

### Running on Devices

1. **On iOS Simulator:**
   - Press `i` in the Expo CLI
   - Or scan QR code with Camera app

2. **On Android Emulator:**
   - Press `a` in the Expo CLI
   - Or scan QR code with Expo Go app

3. **On Physical Device:**
   - Install Expo Go from App Store / Play Store
   - Scan the QR code displayed in terminal

### Running Automated Tests

The project includes a comprehensive test suite powered by Jest and React Native Testing Library.

### Run all tests
```bash
npm test
```text

### Run tests in watch mode (for development)
```bash
npm run test:watch
```text

### Generate coverage report
```bash
npm run test:coverage
```text

### Test coverage includes
- Component tests (Button, etc.)
- Storage layer tests (database operations)
- Current coverage: ~48% for storage, growing as more tests are added

## 🏗️ Project Structure

```text
Mobile-Scaffold/
├── client/                 # React Native mobile app
│   ├── components/         # Reusable UI components
│   ├── constants/          # Theme, colors, spacing
│   ├── hooks/              # Custom React hooks
│   ├── models/             # TypeScript types and interfaces
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # Screen components
│   ├── storage/            # AsyncStorage database layer
│   ├── utils/              # Helper functions and seed data
│   └── App.tsx             # App entry point
├── server/                 # Express backend
│   ├── index.ts            # Server setup and middleware
│   ├── routes.ts           # API routes (scaffold)
│   └── storage.ts          # Database utilities
├── shared/                 # Shared types between client/server
│   └── schema.ts           # Database schema (Drizzle ORM)
├── assets/                 # Images and static files
├── scripts/                # Build and deployment scripts
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```text

## 🎨 Design System

### Color Palette

- **Electric Blue:** `#00D9FF` - Primary accent, interactive elements
- **Deep Space:** `#0A0E1A` - Background
- **Slate Panel:** `#1A1F2E` - Card/surface backgrounds
- **Success:** `#00FF94` - Positive actions
- **Warning:** `#FFB800` - Medium confidence
- **Error:** `#FF3B5C` - Declined actions

### Typography

Using system fonts with the following scale:

- Hero: 32px Bold
- H1: 24px Semibold
- H2: 20px Semibold
- H3: 18px Semibold
- Body: 16px Regular
- Caption: 14px Regular
- Small: 12px Medium

## 🔧 Available Scripts

### Development

- `npm run expo:dev` - Start Expo development server
- `npm run server:dev` - Start backend in development mode

### Building

- `npm run expo:static:build` - Build static Expo app
- `npm run server:build` - Bundle server with esbuild
- `npm run server:prod` - Run production server

### Database

- `npm run db:push` - Push schema changes to database

### Testing

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run check:types` - TypeScript type checking
- `npm run check:format` - Check code formatting
- `npm run format` - Format code with Prettier

### Maintenance & Cleanup

- `npm run expo:clean` - Clear Metro bundler cache
- `npm run expo:clean:native` - Clean native module caches and reinstall
- `npm run expo:clean:full` - Full clean (remove node_modules and reinstall)
- `npm run expo:rebuild:ios` - Rebuild iOS native app from scratch
- `npm run expo:rebuild:android` - Rebuild Android native app from scratch

### Diagnostics

- `npm run check:worklets` - Check react-native-worklets version consistency

## 🗄️ Data Models

The app uses AsyncStorage for local persistence with the following models:

- **Recommendations** - AI suggestion cards
- **Notes** - Markdown documents with tags/links
- **Tasks** - Todo items with priorities and dependencies
- **Projects** - Task groupings
- **Calendar Events** - Scheduled events with recurrence
- **Conversations** - P2P messaging threads (direct and group)
- **Messages** - Chat messages with attachments and replies
- **Lists** - Checklists
- **Alerts** - Alarms and reminders
- **Contacts** - Native contacts with sharing preferences
- **Settings** - User preferences and configuration
- **History Log** - Enhanced activity tracking with filtering, search, statistics, and export
- **AI Limits** - Usage tracking with refresh cadence

## 🔌 API Integration

The server now includes a complete REST API with authentication and CRUD endpoints for all modules:

### Authentication

- JWT-based authentication with bcrypt password hashing
- User registration and login
- Protected routes with Bearer token authentication

### Available Endpoints

- **Authentication:** `/api/auth/*` (register, login, logout, me)
- **Recommendations:** `/api/recommendations/*` (GET, POST, PUT, DELETE)
- **Notes:** `/api/notes/*` (GET, POST, PUT, DELETE)
- **Tasks:** `/api/tasks/*` (GET, POST, PUT, DELETE)
- **Projects:** `/api/projects/*` (GET, POST, PUT, DELETE)
- **Events:** `/api/events/*` (GET, POST, PUT, DELETE)
- **Conversations:** `/api/conversations/*` (GET, POST, PUT, DELETE)
- **Messages:** `/api/conversations/:id/messages/*` (GET, POST, PUT, DELETE)
- **Settings:** `/api/settings/*` (GET, PUT)

### Features

- Request validation using Zod schemas
- Error handling middleware
- User-specific data isolation
- In-memory storage (ready for PostgreSQL migration)

See [API_DOCUMENTATION.md](./docs/technical/API_DOCUMENTATION.md) for detailed API documentation.

## 💬 P2P Messaging Module

The messaging module provides internal app communication with advanced features:

### Core Features

- **Direct & Group Chat** - One-on-one or multi-participant conversations
- **Real-time Typing Indicators** - See when others are composing messages
- **Message Attachments** - Share photos, videos, audio clips, files, and GIFs
- **Read Receipts** - Track message delivery and read status
- **Message Threading** - Reply to specific messages
- **Auto-Archive** - Automatically archive conversations inactive for 14+ days
- **Pin & Mute** - Manage conversation priorities

### AI-Powered Features

The messaging module includes AI assistance capabilities:

- **Draft Messages** - AI helps compose messages
- **Suggest Responses** - Smart reply recommendations for incoming messages
- **Create Tasks** - Convert conversation items into actionable tasks
- **Schedule Events** - Add calendar events based on message content
- **Smart Archiving** - AI suggests archiving old conversations
- **Relationship Reminders** - AI may remind you to connect with contacts

### Data Models

- **Conversation** - Thread metadata with participants, status, and activity
- **Message** - Individual messages with content, attachments, and metadata
- **ConversationParticipant** - User info with online status and activity

### API Endpoints

```text
GET    /api/conversations              # List user's conversations
POST   /api/conversations              # Create new conversation
GET    /api/conversations/:id          # Get conversation details
PUT    /api/conversations/:id          # Update conversation
DELETE /api/conversations/:id          # Delete conversation

GET    /api/conversations/:id/messages # Get messages in conversation
POST   /api/conversations/:id/messages # Send new message
PUT    /api/messages/:id               # Edit message
DELETE /api/messages/:id               # Delete message
```text

### Future Enhancements

- 📹 Video chat with audio/video toggle
- 🌐 WebSocket for real-time message delivery
- 📤 Media upload/download endpoints
- 🖼️ Media viewer screens

## 🌐 Translator Module

The Translator module provides real-time language translation with voice input/output capabilities:

### Features (2)

- **Text Translation**: Translate between 12+ languages in real-time
- **Speech-to-Text**: Tap the microphone to speak in your source language
- **Text-to-Speech**: Tap the speaker icon to hear the translation
- **Language Swap**: Quickly swap source and target languages
- **Auto-Translation**: Translations appear automatically as you type (with debouncing)
- **Headphone Detection**: Optimized audio output when headphones are connected

### Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi

### Translation API

The module uses LibreTranslate (open-source) for translations. To use a different service:

1. Update the `/api/translate` endpoint in `server/routes.ts`
2. Configure your API key (Google Translate, DeepL, etc.)
3. Adjust the request/response format as needed

### Voice Features

- **Speech-to-Text**: Requires microphone permissions (placeholder implementation ready for full integration)
- **Text-to-Speech**: Uses expo-speech for natural voice output
- **Audio Setup**: Configures audio mode for optimal playback

## 🤖 AI Integration (Scaffold)

The app is designed to support AI-powered recommendations with:

- Confidence levels (low/medium/high)
- Expiry timestamps
- Evidence-based suggestions
- User acceptance/decline tracking
- Usage limits with tier system

To integrate AI:

1. Add your AI service (OpenAI, Anthropic, etc.) in `server/`
2. Implement recommendation generation logic
3. Connect via existing API endpoints (`/api/recommendations`)
4. Update `client/utils/seedData.ts` with real data

## 🎯 Current Status

**The app now includes a complete backend API with authentication!** Recent improvements:

- ✅ Backend API endpoints with JWT authentication
- ✅ CRUD operations for all data models
- ✅ Request validation and error handling
- ✅ Test coverage (Jest + React Native Testing Library configured)
- ✅ In-memory storage (ready for database migration)
- ✅ P2P Messaging module with group chat and media support
- ✅ AI messaging assistance (draft, suggest, create tasks/events)
- ✅ Translator module with real-time translation and TTS/STT
- ✅ Enhanced History module with advanced filtering, search, analytics, and export
- ❌ Database integration (PostgreSQL configured but not connected yet)
- ❌ AI recommendation generation (endpoints ready, logic needed)
- ❌ Video chat capability
- ❌ WebSocket for real-time messaging
- ❌ Multi-device sync
- ❌ AI Assist actions implementation (grammar check, summarization, etc.)

See [MISSING_FEATURES.md](./docs/planning/MISSING_FEATURES.md) for a complete analysis.

## 📧 Email Module (Enhanced)

The Email module has been transformed from a basic UI mockup into a professional email management system with advanced features:

### Features (3)

- **Real-Time Search** - Search across subjects, senders, message bodies, and labels with instant results
- **Advanced Filtering** - Filter by all, unread, starred, important, or archived threads
- **Multiple Sort Options** - Sort by date, sender, or subject with ascending/descending order
- **Bulk Operations** - Multi-select with bulk mark as read/unread, star, archive, and delete
- **Statistics Dashboard** - View total threads, unread count, starred, archived, important, drafts, and storage usage
- **Label/Tag System** - Organize threads with custom labels and filter by label
- **Important Marking** - Priority flag for urgent threads
- **Archive System** - Clean inbox by archiving old threads with dedicated archive view
- **Draft Management** - Track and manage draft emails
- **Attachment Indicators** - Visual indicators for threads with attachments
- **Smart Empty States** - Context-aware messages for different filter/search states
- **Haptic Feedback** - Tactile response throughout all interactions
- **Smooth Animations** - FadeInDown animations and modal transitions

### Technical Details

- 28 new database methods for comprehensive email operations
- 31 comprehensive unit tests covering all functionality
- Full backward compatibility with existing email data
- 0 security vulnerabilities (CodeQL verified)
- Performance optimized with useMemo and useCallback
- Platform-specific features (iOS-native development, Android compatibility adaptations)
- 1,050+ lines of production-ready code (3.3x increase from original)

See [EMAIL_MODULE_ENHANCEMENTS.md](./EMAIL_MODULE_ENHANCEMENTS.md) for complete documentation.

## 📅 Calendar Module (Production-Ready)

The Calendar module has been transformed into a production-ready calendar management system with comprehensive features and 100% test coverage:

### Features (4)

- **Multiple View Modes** - Day, Week, Month, and Agenda views for flexible event visualization
- **Advanced Date Queries** - Query events by date, week, month, date range, or upcoming period
- **Conflict Detection** - Automatically detect overlapping events with visual feedback ready
- **Statistics Dashboard** - Collapsible panel showing 6 key metrics (total, today, upcoming, recurring, all-day, in-view)
- **Real-Time Search** - Search across event titles, descriptions, and locations with instant results
- **Bulk Operations** - Delete multiple events at once for efficient management
- **Event Duplication** - Quick copy of events with automatic title modification
- **All-Day Event Support** - Special handling for all-day events
- **Recurrence Support** - Data model ready for recurring event implementation
- **Haptic Feedback** - Tactile response throughout all interactions
- **Empty States** - Context-aware messages for different view modes

### Technical Details (2)

- 18 comprehensive database methods for date-based queries and filtering
- 33 comprehensive unit tests with 100% method coverage
- 0 security vulnerabilities (CodeQL verified)
- Performance optimized with useMemo and pre-sorted queries
- Full TypeScript type safety with no `any` types
- Clean architecture following established patterns
- 1,016 lines of production-ready code (database + screen)

### Advanced Capabilities

- **Smart Filtering** - Filter by date range, location, recurrence, and all-day status
- **Conflict Detection** - Detect overlapping events for scheduling conflict prevention
- **Statistics Computation** - Real-time calculation of event metrics across multiple dimensions
- **Sorting & Organization** - All queries return chronologically sorted results
- **Edge Case Handling** - Comprehensive error handling and validation

See [CALENDAR_MODULE_COMPLETION_SUMMARY.md](./docs/archive/completion-summaries/CALENDAR_MODULE_COMPLETION_SUMMARY.md) and [CALENDAR_HIGH_LEVEL_ANALYSIS.md](./docs/archive/analysis/CALENDAR_HIGH_LEVEL_ANALYSIS.md) for complete documentation.

## 📊 History Module (Enhanced)

The History module has been significantly enhanced from a basic activity log into a comprehensive tracking and analysis tool:

### Features (5)

- **Advanced Filtering** - Filter by type (AI, archived, banked, deprecated, system) and date range (today, week, month)
- **Real-time Search** - Search across messages and types with instant results
- **Activity Statistics** - View total entries, breakdowns by type, and tracking duration
- **Entry Management** - View detailed information, bulk selection, and multi-delete operations
- **Export Functionality** - Export history to JSON for backup or analysis
- **Enhanced UI** - Type badges, relative timestamps, metadata indicators, smooth animations

### Technical Details (3)

- 8 new database methods for filtering, search, and statistics
- 40+ comprehensive unit tests
- Full backward compatibility
- 0 security vulnerabilities (CodeQL verified)
- Platform-specific features (haptic feedback, native sharing)

See [HISTORY_MODULE_ENHANCEMENTS.md](./HISTORY_MODULE_ENHANCEMENTS.md) for complete documentation.

## 📓 Notebook Module (Production-Ready)

The Notebook module has been completed with comprehensive database methods and full test coverage, achieving production-ready status:

### Features (6)

- **Advanced Search** - Search across note titles, body content, and tags with instant results
- **Flexible Sorting** - Sort by recent, alphabetical, tag count, or word count with bidirectional order
- **Comprehensive Statistics** - 10 metrics including total words, unique tags, notes with links
- **Smart Filtering** - Filter by active, archived, pinned, or by specific tags
- **Bulk Operations** - Multi-select with bulk archive, pin, delete, and tag operations
- **Tag Management** - Add/remove tags, bulk tag operations, filter by multiple tags
- **Similarity Detection** - Find related notes using Jaccard similarity algorithm
- **Word Count Analytics** - Track content length and average words per note
- **Pin/Archive System** - Organize notes with priority and lifecycle management
- **Multi-tag Support** - Filter by any combination of tags

### Technical Details (4)

- 29 comprehensive database methods (625% increase from baseline)
- 49 comprehensive unit tests with 100% coverage
- 0 security vulnerabilities (CodeQL verified)
- Performance optimized with efficient algorithms
- Full TypeScript type safety
- Extensive JSDoc documentation

### Advanced Capabilities (2)

- **Smart Filtering** - Combine search with tag filters for precise results
- **Pinned-First Sorting** - Pinned notes always appear first regardless of sort criteria
- **Bulk Tag Operations** - Add/remove tags across multiple notes efficiently
- **Duplicate Detection** - Find similar notes with configurable threshold
- **Real-time Statistics** - Live calculation of 10 different metrics
- **Flexible Organization** - Tags, links, pinning, archiving for maximum flexibility

See [NOTEBOOK_MODULE_COMPLETION_SUMMARY.md](./docs/archive/completion-summaries/NOTEBOOK_MODULE_COMPLETION_SUMMARY.md) and [NOTEBOOK_HIGH_LEVEL_ANALYSIS.md](./docs/archive/analysis/NOTEBOOK_HIGH_LEVEL_ANALYSIS.md) for complete documentation.

## 📚 Tech Stack

### Frontend

- **React Native** - Mobile framework
- **Expo SDK 54** - Development platform
- **React Navigation** - Navigation library
- **React Native Reanimated** - Animation library
- **TanStack React Query** - Server state management
- **AsyncStorage** - Local persistence
- **TypeScript** - Type safety

### Backend

- **Express** - HTTP server
- **PostgreSQL** - Database (configured)
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Schema validation

### Development (2)

- **TypeScript** - Full type safety
- **ESLint + Prettier** - Code quality
- **esbuild** - Fast bundling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Essential Reading
- [BESTPR.md](BESTPR.md) - Token-optimized best practices guide for AI agents
- [CONTRIBUTING.md](CONTRIBUTING.md) - Full contribution guidelines
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Constitution](docs/governance/constitution.md) - Repository governance

## 📚 Documentation

### Quick Start

- **[README.md](./README.md)** - This file! Installation and quick start
- **[BESTPR.md](./BESTPR.md)** - Token-optimized best practices guide for AI agents
- **[DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md)** - Navigation guide to all documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project

### Core Documentation

- **[F&F.md](./F&F.md)** - Features & Functionality overview (main reference)
- **[MODULE_DETAILS.md](./MODULE_DETAILS.md)** - Technical implementation details

### Technical Documentation

- **[docs/technical/API_DOCUMENTATION.md](./docs/technical/API_DOCUMENTATION.md)** - API endpoints and usage
- **[docs/technical/TESTING_INSTRUCTIONS.md](./docs/technical/TESTING_INSTRUCTIONS.md)** - How to test the application
- **[docs/technical/design_guidelines.md](./docs/technical/design_guidelines.md)** - UI/UX design specifications
- **[docs/technical/IMPLEMENTATION_ROADMAP.md](./docs/technical/IMPLEMENTATION_ROADMAP.md)** - Development roadmap

### Analysis & Planning

- **[docs/analysis/COMPETITIVE_ANALYSIS.md](./docs/analysis/COMPETITIVE_ANALYSIS.md)** - Market positioning & competitive landscape
- **[docs/planning/MISSING_FEATURES.md](./docs/planning/MISSING_FEATURES.md)** - Known limitations and roadmap

### Vision & Strategy

- **[docs/vision/SUPER_APP_MODULE_EXPANSION.md](./docs/vision/SUPER_APP_MODULE_EXPANSION.md)** - 24 proposed modules for super app transformation
- **[docs/vision/UI_UX_REVOLUTIONARY_STRATEGY.md](./docs/vision/UI_UX_REVOLUTIONARY_STRATEGY.md)** - New UI/UX paradigms for managing 38+ modules

### Security

- **[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting
- **[docs/security/SECURITY.md](./docs/security/SECURITY.md)** - Comprehensive security documentation

### Archive

- **[docs/archive/](./docs/archive/)** - Historical documentation and analysis reports

## 📄 License

This project is available as open source under the terms of your chosen license.

## 📞 Support

For questions or issues:

- Open an issue on GitHub
- Check [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) to find relevant documentation
- Review [F&F.md](./F&F.md) for feature status
- See [docs/planning/MISSING_FEATURES.md](./docs/planning/MISSING_FEATURES.md) for known limitations
- Read [docs/technical/design_guidelines.md](./docs/technical/design_guidelines.md) for design specifications

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspired by futuristic HUD designs
- Icons from [Feather Icons](https://feathericons.com/)

---

## 🎯 What Makes AIOS Different?

### 1. Privacy-First Super App

Unlike WeChat or other super apps, AIOS prioritizes user privacy:

- **Local-first storage** - Your data stays on your device
- **No data mining** - We don't sell or analyze your personal data
- **User control** - Choose what syncs to cloud
- **End-to-end encryption** - Secure by default

### 2. Cross-Module Intelligence

AI that understands your entire life, not just isolated tasks:

- Command Center analyzes data across ALL modules
- Actions in one module trigger smart suggestions in others
- True holistic view of productivity, finance, health, and relationships

### 3. Revolutionary UI/UX

Breaking traditional rules to manage complexity intelligently:

- **Start with 3 modules**, grow to 38+ organically
- **AI predicts** which modules you need now
- **Context-aware** interface (work mode vs personal mode)
- **Unified search** across everything
- **Zero overwhelm** despite infinite capabilities

### 4. Open Ecosystem

Built for developers and power users:

- Developer API for custom integrations
- Plugin marketplace (planned)
- Data export freedom
- Transparent and extensible

### 5. Zero Dark Patterns

User-first design philosophy:

- Transparent pricing (core features free)
- No manipulation tactics
- AI suggests, never forces
- Respect for user attention

---

**Note:** This is an evolving mobile app scaffold. Current focus is UI/UX excellence with 14 production-ready modules. Backend services, AI integration, and super app features (payments, commerce, etc.) require phased implementation. See [docs/vision/](./docs/vision/) for strategic roadmap.
