# Building Blocks View

## Plain English Summary

This document shows the internal structure of AIOS - how it's organized into components and how they work together. The app has three main layers: UI (screens and components), Business Logic (hooks and utilities), and Storage (database layer). The mobile client is separated from the backend server, with shared code for types and schemas. Each of the 14 modules follows the same structure for consistency.

---

## Level 1: System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        AIOS System                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────┐   ┌────────────────────────┐   │
│  │                        │   │                        │   │
│  │   Mobile Client        │   │   Backend Server       │   │
│  │   (React Native)       │◄─►│   (Node.js/Express)    │   │
│  │                        │   │                        │   │
│  │ • UI Layer             │   │ • API Layer            │   │
│  │ • Business Logic       │   │ • Authentication       │   │
│  │ • Local Storage        │   │ • Business Logic       │   │
│  │ • 14 Modules           │   │ • Database (future)    │   │
│  │                        │   │                        │   │
│  └────────────┬───────────┘   └────────────┬───────────┘   │
│               │                            │               │
│               └─────────────┬──────────────┘               │
│                             │                               │
│                  ┌──────────▼──────────┐                   │
│                  │   Shared Code       │                   │
│                  │   (TypeScript)      │                   │
│                  │                     │                   │
│                  │ • Types             │                   │
│                  │ • Schemas           │                   │
│                  │ • Constants         │                   │
│                  └─────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Building Block: Mobile Client

**Purpose:** Provide native iOS/Android user interface and local data management

**Responsibilities:**
- Render 43 screens across 14 modules
- Manage local state with React hooks
- Store data in AsyncStorage (offline-first)
- Handle user interactions (taps, swipes, gestures)
- Provide haptic feedback
- Integrate with native device APIs (contacts, gallery, audio)

**Location:** `/client/`

**Key Components:**
- Screens (UI)
- Components (Reusable UI)
- Storage (AsyncStorage wrapper)
- Navigation (React Navigation)
- Hooks (Business logic)

### Building Block: Backend Server

**Purpose:** Provide REST API, authentication, and future database integration

**Responsibilities:**
- REST API endpoints for all modules
- JWT-based authentication
- Request validation with Zod
- Error handling
- Future: Database operations with Drizzle ORM
- Future: WebSocket for real-time messaging

**Location:** `/server/`

**Key Components:**
- Routes (API endpoints)
- Middleware (Auth, validation, errors)
- Storage (In-memory, future: PostgreSQL)

### Building Block: Shared Code

**Purpose:** Share types, schemas, and constants between client and server

**Responsibilities:**
- TypeScript types/interfaces
- Zod validation schemas
- Shared constants

**Location:** `/shared/`

**Key Components:**
- `schema.ts` - Drizzle ORM schema (future)
- `constants.ts` - Shared constants

---

## Level 2: Mobile Client Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Client                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    UI Layer                           │  │
│  │  /client/screens/ (43 screens)                       │  │
│  │  /client/components/ (25 reusable components)        │  │
│  │  /client/navigation/ (React Navigation config)       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │ Calls                               │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │              Business Logic Layer                     │  │
│  │  /client/hooks/ (Custom hooks)                       │  │
│  │  /client/context/ (React Context providers)          │  │
│  │  /client/utils/ (Helper functions, seed data)        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │ Calls                               │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │                Storage Layer                          │  │
│  │  /client/storage/database.ts                         │  │
│  │  - 200+ methods for CRUD operations                  │  │
│  │  - Organized by module (notes, tasks, events, etc.)  │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │ Calls                               │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │              AsyncStorage                             │  │
│  │  @react-native-async-storage/async-storage           │  │
│  │  Key-value storage (6-10MB limit)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### UI Layer Components

#### Screens (43 files)

**Purpose:** Full-screen views for each feature

**Structure:**
```
/client/screens/
├── CommandCenterScreen.tsx        # AI recommendations
├── NotebookScreen.tsx              # Notes list
├── NoteEditorScreen.tsx            # Note detail
├── PlannerScreen.tsx               # Tasks list
├── TaskDetailScreen.tsx            # Task detail
├── ProjectDetailScreen.tsx         # Project detail
├── CalendarScreen.tsx              # Calendar views
├── EventDetailScreen.tsx           # Event detail
├── EmailScreen.tsx                 # Email threads
├── ThreadDetailScreen.tsx          # Thread detail
├── MessagesScreen.tsx              # Conversations list
├── ConversationDetailScreen.tsx    # Chat detail
├── ListsScreen.tsx                 # Checklists
├── ListEditorScreen.tsx            # List detail
├── AlertsScreen.tsx                # Reminders
├── AlertDetailScreen.tsx           # Alert detail
├── ContactsScreen.tsx              # Contacts list
├── ContactDetailScreen.tsx         # Contact detail
├── TranslatorScreen.tsx            # Translation
├── PhotosScreen.tsx                # Gallery
├── AlbumsScreen.tsx                # Albums
├── PhotoDetailScreen.tsx           # Photo detail
├── PhotoEditorScreen.tsx           # Photo editing
├── HistoryScreen.tsx               # Activity log
├── BudgetScreen.tsx                # Finance tracking
├── IntegrationsScreen.tsx          # Third-party services
├── IntegrationDetailScreen.tsx     # Integration detail
├── SettingsMenuScreen.tsx          # Settings hub
├── GeneralSettingsScreen.tsx       # General settings
├── AIPreferencesScreen.tsx         # AI settings
├── NotebookSettingsScreen.tsx      # Notebook settings
├── PlannerSettingsScreen.tsx       # Planner settings
├── CalendarSettingsScreen.tsx      # Calendar settings
├── EmailSettingsScreen.tsx         # Email settings
├── ContactsSettingsScreen.tsx      # Contacts settings
├── PersonalizationScreen.tsx       # Theme/appearance
├── SystemScreen.tsx                # System diagnostics
├── AttentionCenterScreen.tsx       # Notifications
├── ModuleGridScreen.tsx            # Module selector
├── OnboardingWelcomeScreen.tsx     # Onboarding 1
├── OnboardingModuleSelectionScreen.tsx # Onboarding 2
├── RecommendationDetailScreen.tsx  # Recommendation detail
└── RecommendationHistoryScreen.tsx # Past recommendations
```

**Responsibilities:**
- Render UI with React Native components
- Handle user interactions
- Call storage methods
- Navigate between screens
- Provide haptic feedback
- Show loading/error states

**Example Pattern:**
```typescript
// Pattern used in all screens
export const NotebookScreen = ({ navigation }: Props) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await getNotes();
    setNotes(data);
    setLoading(false);
  };

  const handlePress = (note: Note) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('NoteEditor', { note });
  };

  return (
    <FlatList
      data={notes}
      renderItem={({ item }) => <NoteCard note={item} onPress={handlePress} />}
    />
  );
};
```

#### Components (25+ files)

**Purpose:** Reusable UI elements shared across screens

**Structure:**
```
/client/components/
├── Button.tsx                  # Primary button
├── Card.tsx                    # Container card
├── QuickCaptureOverlay.tsx     # Global capture menu
├── MiniCalendar.tsx            # Calendar mini-mode
├── MiniTask.tsx                # Task mini-mode
├── MiniNote.tsx                # Note mini-mode
├── MiniBudget.tsx              # Budget mini-mode
├── MiniContacts.tsx            # Contacts mini-mode
└── ... (17 more components)
```

**Responsibilities:**
- Consistent UI across app
- Reduce code duplication
- Encapsulate common patterns
- Apply design system (theme, colors, typography)

**Example:**
```typescript
// /client/components/Button.tsx
export const Button = ({ title, onPress, variant = 'primary' }: ButtonProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, styles[variant]]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};
```

#### Navigation

**Purpose:** Manage screen routing and transitions

**Structure:**
```
/client/navigation/
└── AppNavigator.tsx       # React Navigation setup
```

**Responsibilities:**
- Define navigation structure (tabs, stacks)
- Configure screen transitions
- Handle deep linking
- Manage navigation state

**Implementation:**
```typescript
// Tab navigator for main modules
const Tab = createBottomTabNavigator();

// Stack navigator for details
const Stack = createNativeStackNavigator();

// Main navigation structure
<NavigationContainer>
  <Tab.Navigator>
    <Tab.Screen name="CommandCenter" component={CommandCenterScreen} />
    <Tab.Screen name="Notebook" component={NotebookStack} />
    <Tab.Screen name="Planner" component={PlannerStack} />
    {/* ... other modules */}
  </Tab.Navigator>
</NavigationContainer>
```

### Business Logic Layer

#### Custom Hooks

**Purpose:** Encapsulate reusable logic and state management

**Structure:**
```
/client/hooks/
├── useDebounce.ts         # Debounce inputs
├── useSearch.ts           # Search logic
├── useFilter.ts           # Filtering logic
└── ... (more hooks)
```

**Example:**
```typescript
// /client/hooks/useDebounce.ts
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

#### React Context

**Purpose:** Share state across components without prop drilling

**Structure:**
```
/client/context/
└── HandoffContext.tsx     # Module handoff state
```

**Responsibilities:**
- Module handoff breadcrumbs
- User preferences (future)
- Theme state (future)

#### Utilities

**Purpose:** Helper functions and seed data

**Structure:**
```
/client/utils/
├── helpers.ts             # General utilities
├── seedData.ts            # Demo data for development
├── contactHelpers.ts      # Contact operations
└── errorReporting.ts      # Error handling
```

### Storage Layer

#### Database Abstraction

**Purpose:** Provide CRUD operations for all modules, abstracting AsyncStorage

**File:** `/client/storage/database.ts` (5,000+ lines, 200+ methods)

**Structure:**
```typescript
// Organized by module
export const database = {
  // Recommendations (Command Center)
  saveRecommendation,
  getRecommendations,
  updateRecommendation,
  deleteRecommendation,

  // Notes (Notebook) - 29 methods
  saveNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  searchNotes,
  sortNotes,
  filterNotes,
  getNotesStatistics,
  bulkArchiveNotes,
  bulkPinNotes,
  bulkDeleteNotes,
  bulkAddTags,
  bulkRemoveTags,
  findSimilarNotes,
  // ... 15 more note methods

  // Tasks (Planner)
  saveTask,
  getTasks,
  updateTask,
  deleteTask,
  // ... task methods

  // Events (Calendar) - 18 methods
  saveEvent,
  getEvents,
  getEventsForDate,
  getEventsForWeek,
  getEventsForMonth,
  getEventsInRange,
  detectConflicts,
  getEventsStatistics,
  // ... 10 more event methods

  // Email - 28 methods
  saveEmailThread,
  getEmailThreads,
  searchEmailThreads,
  filterEmailThreads,
  bulkMarkRead,
  bulkArchive,
  getEmailStatistics,
  // ... 21 more email methods

  // Messages, Lists, Alerts, Contacts, etc.
  // ... 100+ more methods
};
```

**Responsibilities:**
- All database operations (CRUD)
- Data validation before storage
- Complex queries (search, filter, sort)
- Statistics calculations
- Bulk operations
- Error handling

**Example Method:**
```typescript
export const saveNote = async (note: Note): Promise<void> => {
  try {
    const notes = await getNotes();
    const index = notes.findIndex(n => n.id === note.id);
    
    if (index >= 0) {
      notes[index] = { ...note, updatedAt: Date.now() };
    } else {
      notes.push({ ...note, createdAt: Date.now(), updatedAt: Date.now() });
    }
    
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save note:', error);
    throw error;
  }
};
```

**Test Coverage:**
- 659 unit tests total
- 100% coverage on 14 production modules
- Tests in `/client/storage/__tests__/`

---

## Level 3: Module Decomposition

Each of the 14 modules follows the same structure:

### Module Pattern

```
Module Name (e.g., Notebook)
│
├── UI Layer
│   ├── ListScreen.tsx              (View all items)
│   └── DetailScreen.tsx            (View/edit one item)
│
├── Storage Layer
│   ├── database.ts                 (CRUD methods for this module)
│   └── __tests__/module.test.ts    (Unit tests, 100% coverage)
│
└── Settings (optional)
    └── ModuleSettingsScreen.tsx    (Module-specific settings)
```

### Example: Notebook Module

**Files:**
- `/client/screens/NotebookScreen.tsx` - List all notes
- `/client/screens/NoteEditorScreen.tsx` - Create/edit note
- `/client/screens/NotebookSettingsScreen.tsx` - Notebook preferences
- `/client/storage/database.ts` - 29 note-related methods
- `/client/storage/__tests__/notebook.test.ts` - 49 unit tests

**Data Flow:**
1. User opens NotebookScreen
2. Screen calls `getNotes()` from storage layer
3. Storage layer retrieves from AsyncStorage
4. Screen renders notes in FlatList
5. User taps note
6. Navigate to NoteEditorScreen
7. User edits and saves
8. Screen calls `updateNote()` from storage layer
9. Storage layer updates AsyncStorage
10. Navigate back to NotebookScreen
11. List refreshes with updated note

---

## Backend Server Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                   Backend Server                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   API Layer                           │  │
│  │  /server/routes.ts                                    │  │
│  │  - REST endpoints for all modules                    │  │
│  │  - Authentication endpoints                           │  │
│  │  - Translation proxy                                  │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │ Passes through                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  /server/middleware/                                  │  │
│  │  - auth.ts (JWT validation)                          │  │
│  │  - validation.ts (Zod schemas)                       │  │
│  │  - errorHandler.ts (Error responses)                 │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │ Calls                               │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │               Storage Layer                           │  │
│  │  /server/storage.ts                                   │  │
│  │  - In-memory storage (MVP)                           │  │
│  │  - Future: Drizzle ORM + PostgreSQL                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### API Layer

**File:** `/server/routes.ts`

**Structure:**
```typescript
// Authentication
router.post('/api/auth/register', registerHandler);
router.post('/api/auth/login', loginHandler);
router.get('/api/auth/me', authMiddleware, meHandler);

// Recommendations
router.get('/api/recommendations', authMiddleware, getRecommendationsHandler);
router.post('/api/recommendations', authMiddleware, validateRecommendation, createRecommendationHandler);

// Notes, Tasks, Events, Messages, etc.
// ... 50+ endpoints
```

**Responsibilities:**
- Define API routes
- Call middleware
- Call business logic
- Return responses

### Middleware Layer

**Files:**
- `/server/middleware/auth.ts` - JWT validation
- `/server/middleware/validation.ts` - Zod validation
- `/server/middleware/errorHandler.ts` - Error responses

**Responsibilities:**
- Authenticate requests
- Validate request bodies
- Handle errors
- Add security headers

**Example:**
```typescript
// /server/middleware/auth.ts
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Storage Layer

**File:** `/server/storage.ts`

**Current:** In-memory storage (Maps/Arrays)  
**Future:** Drizzle ORM + PostgreSQL

**Structure:**
```typescript
// In-memory storage for MVP
const users = new Map<string, User>();
const notes = new Map<string, Note[]>();
const tasks = new Map<string, Task[]>();

// Future: Database operations
import { db } from './db';
import { notes, tasks } from '@shared/schema';

export const getUserNotes = async (userId: string) => {
  return await db.select().from(notes).where(eq(notes.userId, userId));
};
```

---

## Interfaces Between Building Blocks

### Client ↔ Storage

**Interface:** TypeScript function calls

```typescript
// Client calls storage
const notes = await getNotes();
await saveNote(note);

// Storage returns data or throws error
return Promise<Note[]>
throw Error
```

### Client ↔ Backend (Future)

**Interface:** REST API (HTTPS + JSON)

**Request:**
```http
GET /api/notes
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "notes": [
    { "id": "1", "title": "Note 1", "body": "Content" }
  ]
}
```

### Backend → Database (Future)

**Interface:** SQL via Drizzle ORM

```typescript
// Drizzle ORM query
const notes = await db
  .select()
  .from(notesTable)
  .where(eq(notesTable.userId, userId));
```

---

## Assumptions

1. **Module Structure:** 14 modules follow consistent pattern (screen + storage + tests)
2. **Storage Layer:** Single `database.ts` file scales to 200+ methods without performance issues
3. **Component Reuse:** 25 shared components cover 80%+ of UI needs
4. **Navigation:** React Navigation handles all routing needs
5. **Backend Migration:** In-memory storage easily migrates to PostgreSQL + Drizzle
6. **Testing:** Jest + RNTL adequately test all building blocks
7. **Scalability:** Architecture scales from 14 to 38+ modules without major refactoring

---

## Failure Modes

1. **Storage Layer Bottleneck:**
   - **Risk:** Single `database.ts` file becomes too large
   - **Mitigation:** Split into separate files per module
   - **Detection:** File size > 10,000 lines

2. **Component Coupling:**
   - **Risk:** Shared components become tightly coupled
   - **Mitigation:** Clear component interfaces, prop types
   - **Detection:** Components depend on specific screens

3. **Navigation Complexity:**
   - **Risk:** Navigation becomes hard to maintain with 38+ modules
   - **Mitigation:** Hierarchical navigation, deep linking
   - **Detection:** Navigation bugs, slow transitions

4. **Backend Storage Migration:**
   - **Risk:** Moving from in-memory to PostgreSQL is complex
   - **Mitigation:** Use Drizzle ORM for type-safe migrations
   - **Detection:** Data loss during migration

---

## How to Verify

### Verify Structure

```bash
# Check screens
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/screens/

# Check components
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/components/

# Check storage layer
wc -l /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/database.ts

# Check tests
find /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/__tests__ -name "*.test.ts"

# Check backend
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/server/
```

### Verify Module Pattern

```bash
# Example: Notebook module
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/screens/Notebook*
ls -la /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/screens/NoteEditor*

# Check storage methods
grep -A 5 "export const saveNote" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/database.ts

# Check tests
npm test -- notebook
```

### Run Tests

```bash
# Test all building blocks
npm test

# Coverage
npm run test:coverage

# Specific module
npm test -- calendar
```

---

## Related Documentation

- [System Context](03_context.md) - External interfaces
- [Runtime View](06_runtime.md) - How building blocks interact
- [Deployment View](07_deployment.md) - How building blocks are deployed
- [Solution Strategy](04_solution_strategy.md) - Why this structure
- [Code Repository](../../../) - Browse actual code
