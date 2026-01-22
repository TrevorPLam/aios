# C4 Model - Level 1: System Context

## Plain English Summary

This diagram shows AIOS from a bird's-eye view. It illustrates who uses the system (mobile users on iOS and Android) and what external services it might connect to (email servers, calendar services, cloud storage). Think of it as a map showing AIOS as a single box, with users and external systems around it. This view helps stakeholders understand the system's purpose and its place in the broader ecosystem without worrying about technical implementation details.

## Technical Detail

### System Context Diagram

```mermaid
graph TB
    User[Mobile User<br/>iOS & Android]

    AIOS[AIOS<br/>AI Operating System<br/>Personal productivity & organization platform<br/>React Native + Node.js + PostgreSQL]

    EmailServices[External Email Services<br/>SMTP/IMAP<br/>Gmail, Outlook, etc.]
    CalendarServices[External Calendar Services<br/>CalDAV/iCal<br/>Google Calendar, iCloud, etc.]
    ContactServices[Contact Providers<br/>Device contacts, CardDAV]
    CloudStorage[Cloud Storage<br/>Photos & file storage<br/>Local + potential cloud sync]

 User --> | Uses mobile app for<br/>notes, tasks, calendar,<br/>messages, planning | AIOS

 AIOS --> | Sends/receives email<br/>SMTP/IMAP | EmailServices
 AIOS --> | Syncs calendar events<br/>CalDAV | CalendarServices
 AIOS --> | Imports/syncs contacts<br/>vCard | ContactServices
 AIOS --> | Stores photos<br/>Local file system | CloudStorage

    style AIOS fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
    style User fill:#50E3C2,stroke:#2E8B7A,stroke-width:2px
    style EmailServices fill:#E8E8E8,stroke:#999,stroke-width:2px
    style CalendarServices fill:#E8E8E8,stroke:#999,stroke-width:2px
    style ContactServices fill:#E8E8E8,stroke:#999,stroke-width:2px
    style CloudStorage fill:#E8E8E8,stroke:#999,stroke-width:2px
```text

### System Overview

**AIOS (AI Operating System)** is a personal productivity and organization platform delivered as a mobile-first application. It provides an integrated suite of 14 modules for managing various aspects of daily life and work.

### Core Value Proposition
- Unified interface for notes, tasks, calendar, email, messages, and more
- AI-powered recommendations and insights
- Offline-first with server synchronization
- Cross-module context awareness and handoffs

### Technology Stack
- **Frontend**: React Native (v0.81.5), Expo (v54)
- **Backend**: Node.js, Express (v4.21)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens
- **Language**: TypeScript throughout

### System Boundary

#### What's Inside AIOS
- Mobile application (iOS/Android)
- Backend API server
- PostgreSQL database
- Authentication system
- File storage (photos, attachments)

### What's Outside AIOS
- User devices (smartphones, tablets)
- External email servers
- External calendar services
- External contact providers
- Cloud storage providers (future integration)

### User Types

1. **Primary Users**: Individual mobile users seeking integrated productivity tools
   - Create and manage notes, tasks, projects
   - Schedule and track calendar events
   - Communicate via email and messages
   - Organize photos and contacts
   - Receive AI recommendations

2. **System Administrators** (implicit, not shown in diagram):
   - Deploy and maintain the backend infrastructure
   - Manage database and backups
   - Monitor system health

### External Systems

#### Email Services (Future Integration)

- **Purpose**: Send and receive email through user's existing accounts
- **Protocol**: SMTP (sending), IMAP/POP3 (receiving)
- **Examples**: Gmail, Outlook, custom mail servers
- **Status**: Placeholder for future implementation

#### Calendar Services (Future Integration)

- **Purpose**: Sync events with external calendar providers
- **Protocol**: CalDAV, iCal
- **Examples**: Google Calendar, iCloud Calendar, Office 365
- **Status**: Placeholder for future implementation

#### Contact Services

- **Purpose**: Import and sync contact information
- **Protocol**: Device contacts API, vCard format
- **Examples**: iOS Contacts, Android Contacts, CardDAV servers
- **Integration**: Via `expo-contacts` package
- **Code**: `client/screens/ContactsScreen.tsx`

#### Cloud Storage (Future Integration)

- **Purpose**: Store and sync photos and file attachments
- **Protocol**: RESTful APIs, WebDAV
- **Examples**: iCloud, Google Drive, Dropbox
- **Current**: Local file system via Expo FileSystem
- **Status**: Local storage active, cloud sync planned

### Key Interactions

1. **User ↔ AIOS**: Primary interaction via mobile app
   - Authentication (username/password → JWT)
   - CRUD operations on all data entities
   - Real-time UI updates with React Query
   - Offline capability with AsyncStorage cache

2. **AIOS ↔ External Services**: Outbound integrations (mostly planned)
   - Email: Fetch and send messages
   - Calendar: Bi-directional event sync
   - Contacts: Import and update
   - Storage: Upload and retrieve files

### Trust Boundaries

- **User Device ↔ AIOS Backend**: HTTPS (production), JWT authentication
- **AIOS ↔ External Services**: Service-specific auth (OAuth2, API keys, SMTP auth)
- **Data Privacy**: User data isolated per account, no cross-user access

## Assumptions

1. **Single-user focus**: Each AIOS instance serves one user; no shared workspaces or collaboration features
2. **Internet connectivity**: Full functionality requires network access; offline mode provides read-only cached data
3. **External service credentials**: Users provide their own credentials for email, calendar, etc. (when implemented)
4. **Mobile-only deployment**: No web interface or desktop application (though React Native Web could enable this)
5. **Self-hosted or cloud-hosted**: Backend can run on any server infrastructure (Replit, AWS, self-hosted)
6. **English language**: UI and documentation assume English; internationalization not yet implemented
7. **Modern devices**: Requires iOS 13+ or Android 10+ for Expo SDK 54 compatibility

## Failure Modes

### External Service Unavailability

**Problem**: External email, calendar, or contact services become unavailable.

### Impact
- Email module cannot fetch new messages or send
- Calendar sync fails, events may be stale
- Contact import fails

### Symptoms
- Timeout errors in integration screens
- Stale data displayed
- Sync indicators show errors

### Mitigation
- Cache last successful sync data locally
- Display user-friendly error messages with retry options
- Implement exponential backoff for retries
- Allow offline operation with cached data

### Recovery
- System automatically retries when service becomes available
- User can manually trigger sync
- No data loss due to offline-first architecture

### Authentication Failure

**Problem**: User cannot authenticate (wrong credentials, expired token, server unavailable).

### Impact (2)
- User locked out of app
- Cannot access any data (if token expired)
- Sync operations fail

### Symptoms (2)
- Login screen shows error
- Token refresh fails
- API calls return 401 Unauthorized

### Mitigation (2)
- Store encrypted credentials for automatic retry
- Graceful token refresh before expiration
- Offline mode allows access to cached data
- Clear error messages guide user to re-authenticate

### Recovery (2)
- User re-enters credentials
- Token refresh succeeds
- System resumes normal operation

### Network Connectivity Loss

**Problem**: Mobile device loses internet connection.

### Impact (3)
- Cannot sync with backend
- Cannot access non-cached data
- Integration features unavailable

### Symptoms (3)
- Sync indicators show offline status
- Some screens show stale data warnings
- Write operations queued locally

### Mitigation (3)
- AsyncStorage provides offline data cache
- UI clearly indicates offline status
- Read-only access to cached data
- Queue write operations for later sync

### Recovery (3)
- Automatic sync when connectivity restored
- Queued operations processed in order
- Conflict resolution for concurrent edits (simple last-write-wins)

### System Boundary Confusion

**Problem**: Users misunderstand what AIOS can and cannot do regarding external services.

### Impact (4)
- Frustration when expected integrations don't work
- Support burden explaining system limitations
- Poor user experience

### Symptoms (4)
- Users expect automatic email/calendar sync that doesn't exist
- Confusion about what data lives where
- Requests for features that are out of scope

### Mitigation (4)
- Clear documentation of current capabilities
- Integration screens show "Coming Soon" for planned features
- Onboarding explains AIOS scope
- Feature discovery guides users to available functionality

### Recovery (4)
- Documentation updates
- UI improvements to clarify boundaries
- Roadmap visibility for planned features

## How to Verify

### System Existence and Accessibility

```bash
# 1. Verify mobile app exists and can be started
ls client/index.js                    # Entry point
ls client/App.tsx                     # Main app component
npm run start                         # Should start Expo dev server

# 2. Verify backend API exists and can be started
ls server/index.ts                    # Entry point
ls server/routes.ts                   # API routes
npm run server:dev                    # Should start Express server

# 3. Check database schema is defined
ls shared/schema.ts                   # Schema definitions
grep "pgTable" shared/schema.ts       # Should list all tables

# 4. Verify authentication system
ls server/middleware/auth.ts          # JWT auth middleware
grep "generateToken" server/middleware/auth.ts
grep "authenticate" server/middleware/auth.ts
```text

### User Interactions

```bash
# 1. Check all module screens exist (14 production modules)
 ls client/screens/ | grep -E "(CommandCenter | Notebook | Planner | Calendar | Email | Messages | Lists | Alerts | Contacts | Translator | Photos | History | Budget | Integrations)Screen.tsx"

# 2. Verify navigation structure
cat client/navigation/AppNavigator.tsx    # Bottom tabs, drawer
cat client/navigation/RootStackNavigator.tsx  # Stack navigation

# 3. Check authentication flow
grep -r "login" client/screens/            # Login UI
grep -r "/api/auth" client/                # Auth API calls
```text

### External System Integrations

```bash
# 1. Check contacts integration (active)
grep "expo-contacts" package.json
grep "Contacts\." client/screens/ContactsScreen.tsx

# 2. Check file system usage (photos)
grep "expo-file-system" package.json
grep "FileSystem\." client/screens/PhotosScreen.tsx

# 3. Verify email/calendar screens exist (placeholder)
ls client/screens/EmailScreen.tsx
ls client/screens/CalendarScreen.tsx

# 4. Check for external API integrations in code
grep -r "fetch.*http" server/              # Outbound HTTP calls
grep -r "axios" server/                     # HTTP client library (if used)
```text

### Trust Boundaries (2)

```bash
# 1. Verify JWT authentication middleware
cat server/middleware/auth.ts | grep -A5 "export.*authenticate"

# 2. Check routes use authentication
grep "authenticate" server/routes.ts | wc -l  # Should be many routes

# 3. Verify HTTPS configuration (production)
grep -r "https" server/                   # HTTPS setup
grep "ssl" server/                        # SSL certificate handling

# 4. Check user data isolation
grep "userId" server/routes.ts | head -10  # Should filter by user
grep "req.user" server/routes.ts | head -10  # Should use authenticated user
```text

### System Boundary Validation

```bash
# 1. Verify no cross-user data access
grep -A10 "WHERE.*userId" server/storage.ts  # Should filter by user

# 2. Check offline capabilities
grep "AsyncStorage" client/lib/storage.ts
grep "@react-native-async-storage/async-storage" package.json

# 3. Verify React Native/Expo setup
cat app.json                              # Expo configuration
grep "react-native" package.json          # RN version

# 4. Check for external service configurations
 grep -i "smtp\ | imap\ | caldav" server/      # Email/calendar config
grep "integration" shared/schema.ts       # Integration data model
```text

### Smoke Test

Run a basic end-to-end test:

```bash
# 1. Start backend
npm run server:dev &
SERVER_PID=$!
sleep 5

# 2. Test health check
curl http://localhost:5000/status

# 3. Test authentication
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 4. Verify database connection
# (Check server logs for database connection success)

# 5. Cleanup
kill $SERVER_PID
```text

## Related Documentation

- [Container Diagram](./container.md) - Zoom in to see major technical components
- [Component Diagram](./component.md) - Detailed internal architecture
- [Deployment Diagram](./deployment.md) - How the system is deployed
- [C4 Overview](./README.md) - Guide to reading C4 diagrams
- [Module Details](/MODULE_DETAILS.md) - Detailed module specifications
- [Architecture Decisions](../../decisions/README.md) - ADRs for key choices

## References

- C4 Model: <https://c4model.com/>
- AIOS Repository: `/home/runner/work/Mobile-Scaffold/Mobile-Scaffold`
- React Native: <https://reactnative.dev/>
- Expo: <https://expo.dev/>
- Express: <https://expressjs.com/>
- PostgreSQL: <https://www.postgresql.org/>
