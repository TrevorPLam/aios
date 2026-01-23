# System Context and Scope

## Plain English Summary

This document shows how AIOS fits into the bigger picture - what external systems it connects to, who uses it, and what data flows in and out. AIOS is a mobile app that runs on iOS/Android phones, talks to a Node.js backend server, can integrate with third-party services (like translation APIs), and eventually will sync data to a PostgreSQL database. Users interact through the mobile UI, and developers can extend it through APIs.

---

## Business Context

### System Overview

AIOS (AI Operating System) is a mobile super app that consolidates 14+ productivity modules into a single unified platform. It operates as a mobile-first system with local storage and optional cloud sync.

```text
┌─────────────────────────────────────────────────────────────┐
│                      External World                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐          │
│  │   iOS    │    │ Android  │    │  Third-Party │          │
│  │  Users   │    │  Users   │    │   Services   │          │
│  └─────┬────┘    └─────┬────┘    └──────┬───────┘          │
│        │               │                 │                   │
│        └───────────────┴─────────────────┘                   │
│                        │                                     │
│                        ▼                                     │
│         ┌─────────────────────────────┐                     │
│         │       AIOS Mobile App       │                     │
│         │   (React Native + Expo)     │                     │
│         │                             │                     │
│         │  • Command Center           │                     │
│         │  • Notebook, Planner        │                     │
│         │  • Calendar, Email          │                     │
│         │  • Messages, Lists          │                     │
│         │  • Alerts, Contacts         │                     │
│         │  • Translator, Photos       │                     │
│         │  • History, Budget          │                     │
│         │  • Integrations             │                     │
│         └──────────┬──────────────────┘                     │
│                    │                                         │
│                    ▼                                         │
│         ┌─────────────────────────────┐                     │
│         │    AIOS Backend Server      │                     │
│         │   (Node.js + Express)       │                     │
│         │                             │                     │
│         │  • REST API                 │                     │
│         │  • Authentication (JWT)     │                     │
│         │  • Business Logic           │                     │
│         │  • Future: WebSocket        │                     │
│         └──────────┬──────────────────┘                     │
│                    │                                         │
│                    ▼                                         │
│         ┌─────────────────────────────┐                     │
│         │   PostgreSQL Database       │                     │
│         │  (Future: Cloud Sync)       │                     │
│         │                             │                     │
│         │  • User data                │                     │
│         │  • Cross-device sync        │                     │
│         │  • Backup/restore           │                     │
│         └─────────────────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```text

### External Entities

| Entity | Type | Description | Interface | Data Flow |
| -------- | ------ | ------------- | ----------- | ----------- |
| **iOS Users** | Human | Users on iPhone/iPad devices | Touch UI, gestures, haptics | Input: taps, swipes, text<br>Output: visual feedback, haptics |
| **Android Users** | Human | Users on Android phones/tablets | Touch UI, gestures, haptics | Input: taps, swipes, text<br>Output: visual feedback, haptics |
| **Backend Server** | System | Node.js/Express API server | REST API (HTTPS) | JSON payloads via HTTP |
| **Translation API** | External Service | LibreTranslate or similar | HTTP API | Text in/out for translation |
| **Device Contacts** | System | Native contact list (iOS/Android) | Expo Contacts API | Import contact data |
| **Device Gallery** | System | Native photo library | Expo Media Library API | Import photos/videos |
| **Device Microphone** | System | Audio input for speech-to-text | Expo AV API | Audio streams |
| **Device Speaker** | System | Audio output for text-to-speech | Expo Speech API | Audio playback |
| **Push Notification Service** | System | APNs (iOS) / FCM (Android) | Push notification APIs | Notification delivery |
| **Cloud Storage** | System (Future) | S3 or similar for media backup | HTTP API | Upload/download media |
| **AI Service** | External Service (Future) | OpenAI, Anthropic, etc. | HTTP API | Prompts and responses |

### Use Cases

#### Primary Use Cases

1. **Manage Personal Tasks**
   - **Actor:** Mobile user
   - **Flow:** User creates tasks in Planner, sets priorities, organizes into projects
   - **Systems:** AIOS Mobile → AsyncStorage → (Future) Backend API → PostgreSQL

2. **Schedule Events**
   - **Actor:** Mobile user
   - **Flow:** User creates calendar events, checks for conflicts, receives reminders
   - **Systems:** AIOS Mobile → AsyncStorage → Alerts system

3. **Communicate with Contacts**
   - **Actor:** Mobile user
   - **Flow:** User sends messages, shares media, receives notifications
   - **Systems:** AIOS Mobile → Backend API → WebSocket (future) → Other users

4. **Translate Languages**
   - **Actor:** Mobile user
   - **Flow:** User inputs text/speech, receives translation, plays audio
   - **Systems:** AIOS Mobile → Backend API → Translation API → TTS

5. **Track Financial Budget**
   - **Actor:** Mobile user
   - **Flow:** User records expenses/income, views statistics, exports data
   - **Systems:** AIOS Mobile → AsyncStorage → Export to device files

6. **Receive AI Recommendations**
   - **Actor:** Mobile user
   - **Flow:** User views Command Center, swipes on recommendations, takes action
   - **Systems:** AIOS Mobile → (Future) AI Service → Backend API → Mobile

#### Supporting Use Cases

1. **Authentication**
   - **Actor:** Mobile user
   - **Flow:** User logs in/registers, receives JWT token
   - **Systems:** AIOS Mobile → Backend API (JWT auth)

2. **Data Synchronization**
   - **Actor:** System (automated)
   - **Flow:** Local data syncs to backend when online
   - **Systems:** AIOS Mobile → Backend API → PostgreSQL

3. **Offline Operation**
   - **Actor:** Mobile user
   - **Flow:** User performs actions while offline, syncs when reconnected
   - **Systems:** AIOS Mobile → AsyncStorage → (queued for sync)

4. **Quick Capture**
    - **Actor:** Mobile user
    - **Flow:** User long-presses, captures note/task/event, returns to context
    - **Systems:** AIOS Mobile → AsyncStorage → Return to previous screen

---

## Technical Context

### System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                   Mobile Device (iOS/Android)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Native Runtime                    │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │          AIOS Client Application            │   │   │
│  │  │        (TypeScript + React Native)          │   │   │
│  │  │                                             │   │   │
│  │  │  ┌────────────────────────────────────┐   │   │   │
│  │  │  │     UI Layer (Screens)             │   │   │   │
│  │  │  │  /apps/mobile/screens/*.tsx             │   │   │   │
│  │  │  └────────────┬───────────────────────┘   │   │   │
│  │  │               │                            │   │   │
│  │  │  ┌────────────▼───────────────────────┐   │   │   │
│  │  │  │  Components & Navigation           │   │   │   │
│  │  │  │  /apps/mobile/components/               │   │   │   │
│  │  │  │  /apps/mobile/navigation/               │   │   │   │
│  │  │  └────────────┬───────────────────────┘   │   │   │
│  │  │               │                            │   │   │
│  │  │  ┌────────────▼───────────────────────┐   │   │   │
│  │  │  │    Business Logic (Hooks)          │   │   │   │
│  │  │  │  /apps/mobile/hooks/                    │   │   │   │
│  │  │  └────────────┬───────────────────────┘   │   │   │
│  │  │               │                            │   │   │
│  │  │  ┌────────────▼───────────────────────┐   │   │   │
│  │  │  │    Storage Layer                   │   │   │   │
│  │  │  │  /apps/mobile/storage/database.ts       │   │   │   │
│  │  │  └────────────┬───────────────────────┘   │   │   │
│  │  │               │                            │   │   │
│  │  │  ┌────────────▼───────────────────────┐   │   │   │
│  │  │  │    AsyncStorage (Local)            │   │   │   │
│  │  │  │  @react-native-async-storage       │   │   │   │
│  │  │  └────────────────────────────────────┘   │   │   │
│  │  │                                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Native Device APIs                          │   │
│  │  • Contacts (expo-contacts)                         │   │
│  │  • Media Library (expo-media-library)               │   │
│  │  • Audio (expo-av, expo-speech)                     │   │
│  │  • Haptics (expo-haptics)                           │   │
│  │  • File System (expo-file-system)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        │ HTTPS (REST API)
                        │ JSON Payloads
                        │
┌───────────────────────▼───────────────────────────────────────┐
│                   Backend Server                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Node.js + Express Server                  │   │
│  │              (TypeScript)                           │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │        API Routes (/apps/api/routes.ts)      │    │   │
│  │  │  • /api/auth/*                             │    │   │
│  │  │  • /api/recommendations/*                  │    │   │
│  │  │  • /api/notes/*                            │    │   │
│  │  │  • /api/tasks/*                            │    │   │
│  │  │  • /api/events/*                           │    │   │
│  │  │  • /api/conversations/*                    │    │   │
│  │  │  • /api/translate (external API proxy)    │    │   │
│  │  └────────────┬───────────────────────────────┘    │   │
│  │               │                                     │   │
│  │  ┌────────────▼───────────────────────────────┐   │   │
│  │  │        Middleware                           │   │   │
│  │  │  • /apps/api/middleware/auth.ts (JWT)        │   │   │
│  │  │  • /apps/api/middleware/validation.ts (Zod)  │   │   │
│  │  │  • /apps/api/middleware/errorHandler.ts      │   │   │
│  │  └────────────┬───────────────────────────────┘   │   │
│  │               │                                     │   │
│  │  ┌────────────▼───────────────────────────────┐   │   │
│  │  │    Storage Layer (/apps/api/storage.ts)      │   │   │
│  │  │  • In-memory storage (MVP)                 │   │   │
│  │  │  • Future: Drizzle ORM → PostgreSQL        │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        │ SQL Queries (Future)
                        │
┌───────────────────────▼───────────────────────────────────────┐
│                 PostgreSQL Database (Future)                  │
│  • User accounts                                              │
│  • Synced data (notes, tasks, events, etc.)                  │
│  • Integrations and settings                                 │
└─────────────────────────────────────────────────────────────┘
```text

### Technology Stack Details

#### Client-Side Technologies

| Layer | Technology | Purpose | Location |
| ------- | ------------ | --------- | ---------- |
| **UI Framework** | React Native 0.81.5 | Mobile rendering | `/apps/mobile/screens/`, `/apps/mobile/components/` |
| **Development Platform** | Expo 54.0.23 | Build tools, managed services | Root, `app.json` |
| **Navigation** | React Navigation 7.x | Screen routing | `/apps/mobile/navigation/AppNavigator.tsx` |
| **State Management** | React Context + Hooks | Local state | `/apps/mobile/context/` |
| **Server State** | TanStack React Query 5.90.7 | API caching, retries | `/apps/mobile/hooks/` (future) |
| **Local Storage** | AsyncStorage 2.2.0 | Key-value persistence | `/apps/mobile/storage/database.ts` |
| **Animations** | React Native Reanimated 4.1.1 | 60fps animations | Throughout components |
| **Type System** | TypeScript 5.9.2 | Static typing | All `.ts/.tsx` files |
| **Validation** | Zod 3.24.2 | Runtime validation | `/packages/contracts/schema.ts` |

#### Server-Side Technologies

| Layer | Technology | Purpose | Location |
| ------- | ------------ | --------- | ---------- |
| **Runtime** | Node.js 18+ | JavaScript runtime | Server process |
| **Web Framework** | Express 4.21.2 | HTTP server | `/apps/api/index.ts` |
| **Authentication** | JWT (jsonwebtoken 9.0.3) | Token-based auth | `/apps/api/middleware/auth.ts` |
| **Password Hashing** | bcryptjs 3.0.3 | Secure passwords | `/apps/api/middleware/auth.ts` |
| **ORM** | Drizzle ORM 0.39.3 | Type-safe SQL | `/packages/contracts/schema.ts` (future) |
| **Database Driver** | pg 8.16.3 | PostgreSQL client | `/apps/api/storage.ts` (future) |
| **Validation** | Zod 3.24.2 | Request validation | `/apps/api/middleware/validation.ts` |
| **Type System** | TypeScript 5.9.2 | Static typing | All `.ts` files |

#### External Integrations

| Service | Purpose | Integration Point | Status |
| --------- | --------- | ------------------ | -------- |
| **LibreTranslate** | Language translation | `/apps/api/routes.ts` → External API | Configured |
| **Expo Contacts API** | Native contact access | `/apps/mobile/screens/ContactsScreen.tsx` | Implemented |
| **Expo Media Library** | Photo/video access | `/apps/mobile/screens/PhotosScreen.tsx` | Implemented |
| **Expo Speech** | Text-to-speech | `/apps/mobile/screens/TranslatorScreen.tsx` | Implemented |
| **Expo AV** | Audio recording | `/apps/mobile/screens/TranslatorScreen.tsx` | Placeholder |
| **PostgreSQL** | Cloud database | `/apps/api/storage.ts` | Configured, not connected |
| **WebSocket** | Real-time messaging | `/apps/api/index.ts` | Scaffold ready |
| **AI Service (Future)** | Recommendations | Backend API | Planned |

### Data Flow Patterns

#### Pattern 1: Local-First Operations (Current MVP)

```text
User Action → UI Component → Storage Method → AsyncStorage → UI Update
                                    ↓
                        (Future: Queue for sync)
```text

**Example:** Creating a note

1. User taps "New Note" in NotebookScreen
2. NoteEditorScreen renders
3. User types content, taps Save
4. `saveNote()` called in `/apps/mobile/storage/database.ts`
5. Data written to AsyncStorage
6. NotebookScreen updates with new note

#### Pattern 2: API-Driven Operations (Authentication)

```text
User Action → UI Component → API Client → Backend API → Middleware → Storage → Response
                                                              ↓
                                                        JWT Validation
```text

**Example:** User login

1. User enters credentials
2. POST /api/auth/login
3. JWT middleware validates (future: checks password)
4. Server returns JWT token
5. Token stored in AsyncStorage
6. Future API calls include token

#### Pattern 3: External Service Integration

```text
User Action → UI Component → Backend API → External Service → Backend → Response → UI
```text

**Example:** Translation

1. User types text in TranslatorScreen
2. POST /api/translate with text and target language
3. Backend proxies to LibreTranslate API
4. Translation returned
5. UI displays translated text
6. User can play TTS audio

#### Pattern 4: Device Integration

```text
User Action → UI Component → Expo API → Native Module → Device → Response → UI
```text

**Example:** Import contacts

1. User taps "Import Contacts" in ContactsScreen
2. Request permission via expo-contacts
3. Native contact picker opens
4. User selects contacts
5. Contact data returned to app
6. Contacts saved to AsyncStorage

### File Organization

```text
/home/runner/work/Mobile-Scaffold/Mobile-Scaffold/
├── apps/mobile/                    # Mobile application
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── QuickCaptureOverlay.tsx
│   │   └── Mini*.tsx          # Mini-mode components
│   ├── constants/             # Theme, colors, spacing
│   │   └── theme.ts
│   ├── context/               # React Context providers
│   │   └── HandoffContext.tsx
│   ├── hooks/                 # Custom React hooks
│   ├── models/                # TypeScript types
│   │   └── types.ts
│   ├── navigation/            # React Navigation config
│   │   └── AppNavigator.tsx
│   ├── screens/               # Screen components (44 screens)
│   │   ├── CommandCenterScreen.tsx
│   │   ├── NotebookScreen.tsx
│   │   ├── PlannerScreen.tsx
│   │   └── ...
│   ├── storage/               # AsyncStorage layer
│   │   ├── database.ts        # All CRUD operations
│   │   └── __tests__/         # Storage tests
│   ├── utils/                 # Helper functions
│   │   └── seedData.ts
│   └── App.tsx                # Root component
├── apps/api/                    # Backend API
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts            # JWT authentication
│   │   ├── validation.ts      # Zod validation
│   │   └── errorHandler.ts    # Error handling
│   ├── __tests__/             # Server tests
│   ├── index.ts               # Express app setup
│   ├── routes.ts              # API endpoints
│   └── storage.ts             # In-memory storage (future: DB)
├── packages/contracts/                    # Code shared by apps/mobile/server
│   ├── constants.ts           # Shared constants
│   └── schema.ts              # Drizzle schema (future)
├── docs/                      # Documentation
│   ├── architecture/          # Architecture docs
│   │   ├── arc42/             # This documentation
│   │   └── c4/                # C4 diagrams (future)
│   ├── decisions/             # Architecture Decision Records
│   ├── technical/             # Technical documentation
│   └── vision/                # Product vision
├── app.json                   # Expo configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── drizzle.config.ts          # Database configuration
```text

---

## Assumptions

1. **Network Connectivity:** Users have intermittent internet access; offline-first is essential
2. **Device Capabilities:** Target devices support AsyncStorage, native APIs (contacts, media)
3. **Backend Availability:** Backend API will eventually replace in-memory storage with PostgreSQL
4. **Third-Party Services:** External APIs (translation, AI) remain available and reliable
5. **Security:** HTTPS and JWT provide sufficient security for MVP
6. **Scalability:** Current architecture scales to 38+ modules without major rewrites
7. **Platform Support:** iOS and Android are primary; web is optional fallback
8. **User Behavior:** Users accept local storage initially, cloud sync can be added later

---

## Failure Modes

### External System Failures

1. **Backend API Unavailable:**
   - **Impact:** Authentication fails, sync disabled
   - **Mitigation:** Offline-first design, local authentication cache
   - **Detection:** Network error handling, user notification

2. **Translation API Down:**
   - **Impact:** Translation feature unavailable
   - **Mitigation:** Show error message, cache recent translations
   - **Detection:** API response timeout, error codes

3. **Device API Permission Denied:**
   - **Impact:** Cannot access contacts, gallery, microphone
   - **Mitigation:** Graceful degradation, prompt for permissions
   - **Detection:** Permission API responses

4. **AsyncStorage Full:**
   - **Impact:** Cannot save new data
   - **Mitigation:** Data pruning, archive old data, migrate to SQLite
   - **Detection:** Storage write errors

### Integration Failures

1. **Network Timeout:**
   - **Impact:** API requests hang
   - **Mitigation:** 10-second timeout, retry logic
   - **Detection:** Request timeout

2. **Authentication Token Expired:**
   - **Impact:** API requests fail with 401
   - **Mitigation:** Refresh token flow, prompt re-login
   - **Detection:** 401 response codes

3. **Data Sync Conflicts:**
   - **Impact:** Local and remote data differ
   - **Mitigation:** Conflict resolution strategy (last-write-wins)
   - **Detection:** Timestamp comparison

---

## How to Verify

### Verify Business Context

```bash
# Check all modules are implemented
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/screens/

# Verify storage layer exists
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/storage/database.ts | head -50

# Check backend API routes
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/api/routes.ts | grep "router\."
```text

### Verify Technical Context

```bash
# Check client dependencies
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/package.json | grep -A 30 "dependencies"

# Check server setup
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/api/index.ts | head -50

# Verify file structure
tree -L 2 /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/
tree -L 2 /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/api/
```text

### Verify External Integrations

```bash
# Check translation endpoint
curl -X POST http://localhost:5000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "target": "es"}'

# Check device API usage
grep -r "expo-contacts" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/
grep -r "expo-media-library" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/apps/mobile/
```text

### Test Data Flows

```bash
# Run end-to-end tests
npm test apps/api/__tests__/api.e2e.test.ts

# Test local storage
npm test apps/mobile/storage/__tests__/

# Test authentication flow
npm test apps/api/__tests__/ -- -t "auth"
```text

---

## Related Documentation

- [Introduction and Goals](00_intro.md) - System overview
- [Constraints](02_constraints.md) - Technical limitations
- [Building Blocks](05_building_blocks.md) - Internal structure
- [Runtime View](06_runtime.md) - Key scenarios in detail
- [Deployment View](07_deployment.md) - Infrastructure and deployment
- [ADR-001: AsyncStorage](../../decisions/001-use-asyncstorage.md) - Storage decision
- [ADR-002: React Native](../../decisions/002-react-native.md) - Platform decision

