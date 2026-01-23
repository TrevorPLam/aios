# C4 Model - Level 2: Container Diagram

## Plain English Summary

This diagram zooms into AIOS to show its three main technical pieces: the mobile app (what users see and interact with), the backend API (the server that processes requests and manages data), and the database (where all information is stored). These three pieces work together: the app sends requests to the API, the API reads and writes data to the database, and responds back to the app. Understanding these containers helps developers know where different code lives and how data flows through the system.

## Technical Detail

### Container Diagram

```mermaid
graph TB
    User[Mobile User<br/>iOS & Android]

    subgraph AIOS[AIOS System]
        MobileApp[Mobile Application<br/>React Native + Expo<br/>TypeScript<br/>----<br/>14 production modules<br/>Offline-first with AsyncStorage<br/>React Query for state<br/>----<br/>apps/mobile/]

        BackendAPI[Backend API<br/>Node.js + Express<br/>TypeScript<br/>----<br/>RESTful JSON API<br/>JWT authentication<br/>----<br/>apps/api/]

        Database[(PostgreSQL Database<br/>----<br/>Drizzle ORM<br/>----<br/>Users, Notes, Tasks,<br/>Projects, Events, Messages,<br/>Settings, Recommendations)]

        SharedCode[Shared Code<br/>TypeScript<br/>----<br/>Schema definitions<br/>Type definitions<br/>Constants<br/>----<br/>packages/contracts/]

        LocalStorage[(AsyncStorage<br/>----<br/>Mobile device<br/>local storage<br/>----<br/>Offline cache<br/>JWT tokens)]
    end

    ExternalSystems[External Systems<br/>Email, Calendar,<br/>Contacts, Storage]

 User --> | Uses<br/>Touch UI | MobileApp

 MobileApp --> | HTTP/HTTPS<br/>JSON<br/>JWT Bearer token | BackendAPI
 MobileApp --> | Reads/Writes | LocalStorage
 MobileApp -.-> | Uses types & schemas | SharedCode

 BackendAPI --> | SQL queries<br/>Drizzle ORM | Database
 BackendAPI -.-> | Uses types & schemas | SharedCode
 BackendAPI -.-> | Future: HTTP APIs<br/>SMTP, CalDAV | ExternalSystems

    style MobileApp fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style BackendAPI fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style Database fill:#7ED321,stroke:#5FA319,stroke-width:3px,color:#fff
    style SharedCode fill:#F5A623,stroke:#C77E0A,stroke-width:2px
    style LocalStorage fill:#7ED321,stroke:#5FA319,stroke-width:2px,color:#fff
    style User fill:#50E3C2,stroke:#2E8B7A,stroke-width:2px
    style ExternalSystems fill:#E8E8E8,stroke:#999,stroke-width:2px
```text

### Container Descriptions

#### Mobile Application (`apps/mobile/`)

### Technology
- React Native 0.81.5
- Expo SDK 54
- TypeScript
- React Navigation 7
- React Query (TanStack Query)
- AsyncStorage for offline data

### Responsibilities
- Render UI for 14 production modules
- Handle user input and gestures
- Manage local state and navigation
- Cache data offline in AsyncStorage
- Authenticate users (store JWT)
- Make HTTP requests to Backend API
- Provide offline-first experience

### Key Files
```text
apps/mobile/
├── index.js                 # Entry point (Expo)
├── App.tsx                  # Root component
├── navigation/              # Navigation configuration
│   ├── AppNavigator.tsx     # Bottom tabs, drawer
│   └── RootStackNavigator.tsx
├── screens/                 # 40+ screen components
│   ├── CommandCenterScreen.tsx
│   ├── NotebookScreen.tsx
│   ├── PlannerScreen.tsx
│   └── ...
├── components/              # Reusable UI components
├── lib/                     # Core client libraries
│   ├── storage.ts           # AsyncStorage wrapper
│   ├── query-client.ts      # React Query config
│   ├── recommendationEngine.ts
│   ├── contextEngine.ts
│   └── ...
├── hooks/                   # Custom React hooks
├── context/                 # React context providers
└── models/                  # Local data models
```text

### External Dependencies
- `@react-navigation/*` - Navigation
- `@tanstack/react-query` - Server state management
- `@react-native-async-storage/async-storage` - Local storage
- `expo-*` - Native modules (contacts, camera, file system, etc.)

### Data Flow
1. User interacts with UI
2. Component calls React Query hook
3. Hook makes HTTP request to Backend API
4. Response cached locally via React Query + AsyncStorage
5. UI updates with new data

#### Backend API (`apps/api/`)

### Technology (2)
- Node.js (runtime)
- Express 4.21 (web framework)
- TypeScript
- Drizzle ORM 0.39 (database)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)

### Responsibilities (2)
- Expose RESTful JSON API endpoints
- Authenticate users (JWT generation/validation)
- Validate incoming requests (Zod schemas)
- Execute business logic
- Query PostgreSQL database
- Return JSON responses
- Handle errors consistently

### Key Files (2)
```text
apps/api/
├── index.ts                 # Entry point, Express setup
├── routes.ts                # API route definitions
├── storage.ts               # Data access layer (in-memory + DB)
├── middleware/
│   ├── auth.ts              # JWT authentication
│   ├── validation.ts        # Request validation (Zod)
│   └── errorHandler.ts      # Error handling
└── __tests__/               # Server unit tests
```text

### API Endpoints (examples)
```text
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login
GET    /api/notes            # List user's notes
POST   /api/notes            # Create note
GET    /api/notes/:id        # Get note by ID
PUT    /api/notes/:id        # Update note
DELETE /api/notes/:id        # Delete note
GET    /api/tasks            # List user's tasks
...                          # Similar patterns for all entities
```text

### Authentication Flow
1. POST /api/auth/login with username/password
2. Server validates credentials
3. Server generates JWT with userId payload
4. Client stores JWT in AsyncStorage
5. Client sends JWT in `Authorization: Bearer <token>` header
6. Server validates JWT and extracts userId
7. Server filters data by userId

### Data Access Pattern
- Routes call `storage.*` functions
- Storage layer uses Drizzle ORM to query PostgreSQL
- All queries filtered by authenticated user's ID
- Results returned as JSON

#### PostgreSQL Database

### Technology (3)
- PostgreSQL 14+ (any compatible version)
- Drizzle ORM for schema management
- UUID primary keys
- JSONB for complex types

### Responsibilities (3)
- Persist all user data
- Enforce data integrity constraints
- Support concurrent access
- Provide transaction support
- Enable efficient queries

### Schema (major tables)
```sql
-- Core tables (defined in packages/contracts/schema.ts)
users                    # User accounts
notes                    # Notebook entries
tasks                    # Planner tasks
projects                 # Project groupings
events                   # Calendar events
conversations            # Message threads
messages                 # Individual messages
settings                 # User preferences
recommendations          # AI suggestions
contacts                 # (future) Contact data
budget_entries           # (future) Budget tracking
integrations             # (future) External service configs
```text

### Key Schema File
```text
packages/contracts/schema.ts         # Drizzle schema definitions
drizzle.config.ts        # Drizzle configuration
```text

### Data Model Highlights
- UUIDs for all primary keys
- `userId` foreign key on all user data tables
- JSONB columns for arrays (tags, links, taskIds, etc.)
- Timestamps: `createdAt`, `updatedAt`
- Soft deletes not implemented (hard deletes)

#### Shared Code (`packages/contracts/`)

### Technology (4)
- TypeScript
- Zod (schema validation)
- Drizzle ORM (schema definitions)

### Responsibilities (4)
- Define database schema (single source of truth)
- Export TypeScript types derived from schema
- Provide validation schemas (Zod)
- Share constants between client and server
- Ensure type safety across boundaries

### Key Files (3)
```text
packages/contracts/
├── schema.ts            # Database schema + TypeScript types
└── constants.ts         # Shared constants
```text

### Type Safety Flow
1. Define schema with Drizzle in `packages/contracts/schema.ts`
2. Export inferred TypeScript types (User, Note, Task, etc.)
3. Generate Zod schemas for validation
4. Client and server import same types
5. Compile-time type checking ensures consistency

### Example
```typescript
// packages/contracts/schema.ts
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  bodyMarkdown: text("body_markdown").notNull(),
  // ...
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
export const insertNoteSchema = createInsertSchema(notes).omit({...});
```text

#### AsyncStorage (Local Storage)

### Technology (5)
- `@react-native-async-storage/async-storage`
- Key-value store
- Persistent across app restarts
- Async API

### Responsibilities (5)
- Cache API responses for offline access
- Store JWT authentication token
- Persist user preferences
- Enable offline-first UX

### Storage Keys (examples)
```text
@aios/auth/token          # JWT token
@aios/notes/all           # Cached notes list
@aios/tasks/all           # Cached tasks list
@aios/user/settings       # User settings
```text

### Code Location
```text
apps/mobile/lib/storage.ts     # AsyncStorage wrapper functions
```text

### Container Interactions

#### Mobile App ↔ Backend API

**Protocol**: HTTP/HTTPS
**Format**: JSON
**Authentication**: JWT Bearer token in `Authorization` header

### Request Flow
1. User action in Mobile App
2. React Query hook triggered
3. HTTP request sent to Backend API
4. JWT included in Authorization header
5. Backend validates JWT
6. Backend processes request
7. Backend queries Database
8. Backend returns JSON response
9. Mobile App updates UI
10. Response cached in AsyncStorage

### Example Request
```http
GET /api/notes HTTP/1.1
Host: api.aios.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```text

### Example Response
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Meeting Notes",
    "bodyMarkdown": "# Meeting with...",
    "tags": ["work", "meetings"],
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
]
```text

#### Backend API ↔ Database

**Protocol**: PostgreSQL wire protocol
**Library**: Drizzle ORM
**Connection**: Connection pool

### Query Flow
1. API route handler receives request
2. Calls storage layer function
3. Storage builds Drizzle query
4. Drizzle generates SQL
5. SQL executed against PostgreSQL
6. Results returned as JavaScript objects
7. Storage returns to route handler
8. Handler serializes to JSON

### Example (conceptual)
```typescript
// apps/api/storage.ts
export async function getUserNotes(userId: string): Promise<Note[]> {
  return await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt));
}
```text

#### Mobile App ↔ AsyncStorage

**API**: Async key-value operations
**Usage**: Cache and offline data

### Operations
- `AsyncStorage.getItem(key)` - Read cached data
- `AsyncStorage.setItem(key, value)` - Write cache
- `AsyncStorage.removeItem(key)` - Clear cache
- `AsyncStorage.multiGet([keys])` - Batch read

### Caching Strategy
- React Query handles cache invalidation
- Background sync when online
- Stale-while-revalidate pattern
- Optimistic updates for writes

#### Shared Code Usage

Both Mobile App and Backend API import from `packages/contracts/`:

```typescript
// apps/mobile/screens/NoteEditorScreen.tsx
import type { Note, InsertNote } from '@packages/contracts/schema';

// apps/api/routes.ts
import { insertNoteSchema } from '@packages/contracts/schema';
import { validate } from './middleware/validation';

app.post('/api/notes', validate(insertNoteSchema), async (req, res) => {
  // ...
});
```text

This ensures:

- No type mismatches between client and server
- Consistent validation logic
- Single source of truth for data structures

## Assumptions

1. **Monorepo structure**: Client, server, and shared code in single repository
2. **Stateless API**: Express server doesn't maintain session state; all auth via JWT
3. **Single database**: One PostgreSQL instance for all data (no sharding or read replicas)
4. **HTTP-only**: No WebSocket or real-time communication (yet)
5. **JWT in memory**: Mobile app stores JWT in AsyncStorage, refreshes on expiration
6. **No API gateway**: Direct communication between mobile app and backend API
7. **Same network**: Development assumes localhost; production uses HTTPS
8. **Schema-driven development**: Shared schema is authoritative, client and server follow it

## Failure Modes

### Mobile App Crashes

**Problem**: React Native app crashes or becomes unresponsive.

### Impact
- User loses current work (unsaved changes)
- Cached data may be corrupted
- App requires restart

### Symptoms
- White screen of death
- "App has stopped" dialog
- Frozen UI

### Mitigation
- Autosave drafts to AsyncStorage every N seconds
- Error boundaries catch React errors gracefully
- Log errors to help diagnose issues
- Frequent state persistence

### Recovery
- User restarts app
- AsyncStorage data survives restart
- Unsaved work may be recovered from autosave

### Backend API Downtime

**Problem**: Express server crashes, deploys, or becomes unreachable.

### Impact (2)
- Mobile app cannot sync data
- Login attempts fail
- Users restricted to offline mode

### Symptoms (2)
- Network errors in app
- "Cannot connect to server" messages
- Stale data displayed

### Mitigation (2)
- AsyncStorage provides offline read access
- Queue write operations for later sync
- Display clear offline indicator
- Graceful degradation

### Recovery (2)
- Backend comes back online
- App automatically retries requests
- Queued operations sync
- User notified when back online

### Database Corruption or Loss

**Problem**: PostgreSQL data corruption, disk failure, or accidental deletion.

### Impact (3)
- Permanent data loss (if no backups)
- API errors on database queries
- System unusable until database restored

### Symptoms (3)
- 500 errors from API
- Database connection errors in logs
- SQL errors

### Mitigation (3)
- Regular database backups (daily/hourly)
- Database replication (production)
- Transaction logs for point-in-time recovery
- Validation before writes

### Recovery (3)
- Restore from latest backup
- Replay transaction logs if available
- Users may lose recent changes
- Notify users of data loss window

### AsyncStorage Quota Exceeded

**Problem**: Mobile device runs out of storage space or AsyncStorage hits quota limits.

### Impact (4)
- Cannot cache new data
- App may fail to save settings
- Performance degradation

### Symptoms (4)
- Write operations fail silently
- "Storage full" errors
- App doesn't remember settings

### Mitigation (4)
- Monitor cache size
- Implement LRU cache eviction
- Compress cached data
- Prompt user to clear cache

### Recovery (4)
- User clears app cache
- User deletes old data
- Re-sync from server

### JWT Expiration

**Problem**: User's JWT token expires while using the app.

### Impact (5)
- API requests start returning 401 Unauthorized
- User kicked out to login screen

### Symptoms (5)
- Sudden authentication errors
- "Session expired" messages
- Forced logout

### Mitigation (5)
- Long token expiration (7-30 days)
- Token refresh endpoint
- Refresh token before expiration
- Detect 401 and prompt re-login

### Recovery (5)
- User re-enters credentials
- New JWT issued
- App resumes normal operation

### Version Mismatch (Client/Server)

**Problem**: Mobile app and backend API versions incompatible (breaking schema changes).

### Impact (6)
- API requests fail validation
- UI displays incorrect data
- Corrupted data possible

### Symptoms (6)
- Zod validation errors
- Type mismatches
- Unexpected null values

### Mitigation (6)
- API versioning (/api/v1/, /api/v2/)
- Backward-compatible schema changes
- Client checks server version
- Force update prompt if needed

### Recovery (6)
- User updates mobile app
- Server maintains backward compatibility during transition
- Gradual rollout of breaking changes

## How to Verify

### Container Existence

```bash
# 1. Verify Mobile App container
ls apps/mobile/index.js apps/mobile/App.tsx
ls apps/mobile/package.json  # (uses root package.json)
npm run start           # Should start Expo

# 2. Verify Backend API container
ls apps/api/index.ts apps/api/routes.ts
npm run server:dev      # Should start Express on port 5000

# 3. Verify Database container
ls drizzle.config.ts
ls packages/contracts/schema.ts
# Check connection (requires database running)
# npm run db:push

# 4. Verify Shared Code
ls packages/contracts/schema.ts packages/contracts/constants.ts

# 5. Verify AsyncStorage usage
grep -r "AsyncStorage" apps/mobile/lib/storage.ts
```text

### Container Interactions (2)

```bash
# 1. Mobile App → Backend API
grep -r "fetch.*api" apps/mobile/
grep -r "useQuery\|useMutation" apps/mobile/screens/

# 2. Backend API → Database
grep "db\." apps/api/storage.ts | head -10
grep "import.*drizzle" apps/api/storage.ts

# 3. Mobile App ↔ AsyncStorage
grep "AsyncStorage" apps/mobile/lib/storage.ts
grep "getItem\|setItem" apps/mobile/lib/storage.ts

# 4. Shared Code imports
grep "from '@shared" apps/mobile/screens/*.tsx | head -5
grep "from '@shared" apps/api/routes.ts
```text

### API Endpoints

```bash
# 1. List all defined routes
 grep "app\.\(get\ | post\ | put\ | delete\)" apps/api/routes.ts

# 2. Check authentication middleware usage
grep "authenticate" apps/api/routes.ts | wc -l

# 3. Verify validation middleware
grep "validate" apps/api/routes.ts | head -10

# 4. Test API health check
npm run server:dev &
sleep 5
curl http://localhost:5000/status
# Expected: {"status":"ok","timestamp":"..."}
```text

### Database Schema

```bash
# 1. List all tables
grep "export const.*= pgTable" packages/contracts/schema.ts

# 2. Count tables
grep "pgTable" packages/contracts/schema.ts | wc -l

# 3. Verify user_id foreign keys (ensures isolation)
grep "userId.*varchar" packages/contracts/schema.ts

# 4. Check for JSONB columns
grep "jsonb" packages/contracts/schema.ts
```text

### Type Safety

```bash
# 1. Verify TypeScript compilation (all containers)
npm run check:types

# 2. Check shared types are exported
grep "export type" packages/contracts/schema.ts | head -10

# 3. Verify Zod schemas exist
grep "export const.*Schema.*=" packages/contracts/schema.ts | head -10

# 4. Check client imports shared types
grep "import.*from '@packages/contracts/schema'" apps/mobile/screens/*.tsx | wc -l

# 5. Check server imports shared types
grep "import.*from '@packages/contracts/schema'" apps/api/routes.ts
```text

### Authentication Flow (2)

```bash
# 1. Check JWT generation
cat apps/api/middleware/auth.ts | grep -A5 "generateToken"

# 2. Check JWT validation
cat apps/api/middleware/auth.ts | grep -A10 "authenticate"

# 3. Verify client stores token
grep "AsyncStorage.*token" apps/mobile/lib/storage.ts

# 4. Check client sends token in headers
grep "Authorization.*Bearer" apps/mobile/lib/query-client.ts
# (or wherever fetch is configured)
```text

### Offline Capabilities

```bash
# 1. Check AsyncStorage wrapper exists
cat apps/mobile/lib/storage.ts | head -20

# 2. Verify React Query cache configuration
cat apps/mobile/lib/query-client.ts

# 3. Check offline indicators in UI
grep -r "offline\|isOnline" apps/mobile/components/

# 4. Test offline mode (manual)
# - Start app
# - Enable airplane mode on device
# - Verify cached data still accessible
```text

### Integration Test

```bash
# Full stack test (requires database running)

# 1. Start backend
npm run server:dev &
SERVER_PID=$!
sleep 5

# 2. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}' \
  | jq .

# 3. Login and get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# 4. Create a note
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Note","bodyMarkdown":"# Hello","tags":[],"links":[]}' \
  | jq .

# 5. List notes
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  | jq .

# 6. Cleanup
kill $SERVER_PID
```text

## Related Documentation

- [System Context Diagram](./system_context.md) - Higher-level system overview
- [Component Diagram](./component.md) - Detailed view of container internals
- [Deployment Diagram](./deployment.md) - Runtime infrastructure
- [C4 Overview](./README.md) - How to read these diagrams
- [../README.md](../README.md) - Architecture documentation hub
- [packages/contracts/schema.ts](/packages/contracts/schema.ts) - Database schema source code
- [apps/api/routes.ts](/apps/api/routes.ts) - API routes source code
- [apps/mobile/lib/query-client.ts](/apps/mobile/lib/query-client.ts) - React Query configuration

## References

- React Native Architecture: <https://reactnative.dev/architecture/overview>
- Express.js: <https://expressjs.com/>
- Drizzle ORM: <https://orm.drizzle.team/>
- React Query: <https://tanstack.com/query/>
- AsyncStorage: <https://react-native-async-storage.github.io/async-storage/>

