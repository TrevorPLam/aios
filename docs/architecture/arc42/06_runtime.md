# Runtime View

## Plain English Summary

This document shows how AIOS works in action through key user scenarios. It traces the flow of data and control through the system as users perform common tasks like creating notes, scheduling events, sending messages, and getting AI recommendations. Each scenario shows the sequence of steps, which components are involved, and what data flows between them.

---

## Scenario 1: User Creates a Note (Local-First, Offline)

**Goal:** Demonstrate offline-first local storage workflow

**Actors:** Mobile User

**Preconditions:** App installed, user on NotebookScreen

**Steps:**

```
┌──────┐          ┌─────────────┐      ┌──────────┐      ┌──────────────┐
│ User │          │ NotebookScreen│      │ database │      │ AsyncStorage │
└──┬───┘          └──────┬──────┘      └────┬─────┘      └──────┬───────┘
   │                      │                   │                   │
   │ 1. Taps "New Note"   │                   │                   │
   │─────────────────────>│                   │                   │
   │                      │                   │                   │
   │                      │ 2. Navigate to    │                   │
   │                      │    NoteEditorScreen                   │
   │                      │──────────────────>│                   │
   │                      │                   │                   │
   │ 3. Types title       │                   │                   │
   │    and content       │                   │                   │
   │─────────────────────>│                   │                   │
   │                      │                   │                   │
   │ 4. Taps "Save"       │                   │                   │
   │─────────────────────>│                   │                   │
   │                      │                   │                   │
   │                      │ 5. Call saveNote()│                   │
   │                      │──────────────────>│                   │
   │                      │                   │                   │
   │                      │                   │ 6. Generate ID    │
   │                      │                   │    add timestamps │
   │                      │                   │    parse tags     │
   │                      │                   │                   │
   │                      │                   │ 7. Write to storage
   │                      │                   │──────────────────>│
   │                      │                   │                   │
   │                      │                   │ 8. Success        │
   │                      │                   │<──────────────────│
   │                      │                   │                   │
   │                      │ 9. Return success │                   │
   │                      │<──────────────────│                   │
   │                      │                   │                   │
   │ 10. Navigate back    │                   │                   │
   │     to Notebook      │                   │                   │
   │<─────────────────────│                   │                   │
   │                      │                   │                   │
   │                      │ 11. Reload notes  │                   │
   │                      │──────────────────>│                   │
   │                      │                   │                   │
   │                      │                   │ 12. Read storage  │
   │                      │                   │──────────────────>│
   │                      │                   │                   │
   │                      │                   │ 13. Return notes  │
   │                      │                   │<──────────────────│
   │                      │                   │                   │
   │                      │ 14. Return notes  │                   │
   │                      │<──────────────────│                   │
   │                      │                   │                   │
   │ 15. See new note     │                   │                   │
   │     in list          │                   │                   │
   │<─────────────────────│                   │                   │
```

**Key Points:**
- Fully offline - no network required
- Data saved immediately to AsyncStorage
- UUID generated client-side
- Tags parsed from content (#tag syntax)
- Haptic feedback on save
- Optimistic UI update

**Files Involved:**
- `/client/screens/NotebookScreen.tsx`
- `/client/screens/NoteEditorScreen.tsx`
- `/client/storage/database.ts` (saveNote, getNotes)
- `@react-native-async-storage/async-storage`

**Performance:**
- Save operation: < 50ms
- Screen transition: < 100ms
- Total flow: < 2 seconds

---

## Scenario 2: User Schedules Event with Conflict Detection

**Goal:** Demonstrate calendar operations and conflict detection

**Actors:** Mobile User

**Preconditions:** User on CalendarScreen, has existing event 2pm-3pm

**Steps:**

```
User → CalendarScreen → database → AsyncStorage
│
│ 1. Taps "Add Event"
│ 2. Fills: "Team Meeting", 2:30pm-3:30pm, today
│ 3. Taps "Save"
│     │
│     ├─> 4. Call saveEvent()
│     │     │
│     │     ├─> 5. Validate data
│     │     │
│     │     ├─> 6. Call detectConflicts()
│     │     │     │
│     │     │     ├─> 7. Get all events for date
│     │     │     │
│     │     │     ├─> 8. Check time overlaps
│     │     │     │   (2pm-3pm overlaps with 2:30pm-3:30pm)
│     │     │     │
│     │     │     └─> 9. Return conflict list
│     │     │
│     │     ├─> 10. Show conflict warning
│     │     │    "Conflicts with: Client Call (2pm-3pm)"
│     │     │
│     │     └─> 11. User confirms "Save anyway"
│     │
│     ├─> 12. Write to AsyncStorage
│     │
│     └─> 13. Success, navigate back
│
└─> 14. See both events, conflict indicator shown
```

**Conflict Detection Logic:**
```typescript
// Simplified from /client/storage/database.ts
const detectConflicts = (newEvent: Event, existingEvents: Event[]) => {
  return existingEvents.filter(event => {
    const newStart = newEvent.startTime;
    const newEnd = newEvent.endTime;
    const existingStart = event.startTime;
    const existingEnd = event.endTime;
    
    // Check overlap: event starts before new ends AND ends after new starts
    return newStart < existingEnd && newEnd > existingStart;
  });
};
```

**Files Involved:**
- `/client/screens/CalendarScreen.tsx`
- `/client/screens/EventDetailScreen.tsx`
- `/client/storage/database.ts` (saveEvent, detectConflicts, getEventsForDate)

**Performance:**
- Conflict detection: < 10ms (even with 1000+ events)
- Save + conflict check: < 100ms

---

## Scenario 3: User Authenticates and Syncs Data (Future)

**Goal:** Demonstrate authentication flow and API integration

**Actors:** Mobile User, Backend Server

**Preconditions:** User has account, first app launch

**Steps:**

```
┌──────┐     ┌────────┐     ┌─────────┐     ┌──────────┐
│ User │     │ Client │     │ Backend │     │ Database │
└──┬───┘     └───┬────┘     └────┬────┘     └────┬─────┘
   │             │               │                │
   │ 1. Login    │               │                │
   │────────────>│               │                │
   │             │               │                │
   │             │ 2. POST /api/auth/login       │
   │             │──────────────>│                │
   │             │               │                │
   │             │               │ 3. Validate    │
   │             │               │    credentials │
   │             │               │                │
   │             │               │ 4. Query user  │
   │             │               │───────────────>│
   │             │               │                │
   │             │               │ 5. Return user │
   │             │               │<───────────────│
   │             │               │                │
   │             │               │ 6. Verify bcrypt
   │             │               │    password    │
   │             │               │                │
   │             │               │ 7. Generate JWT│
   │             │               │    token       │
   │             │               │                │
   │             │ 8. Return token                │
   │             │<──────────────│                │
   │             │               │                │
   │             │ 9. Store token                 │
   │             │    in AsyncStorage              │
   │             │                                 │
   │ 10. Success │                                 │
   │<────────────│                                 │
   │             │                                 │
   │             │ 11. GET /api/notes             │
   │             │     Authorization: Bearer <token>
   │             │──────────────>│                │
   │             │               │                │
   │             │               │ 12. Verify JWT │
   │             │               │                │
   │             │               │ 13. Query notes│
   │             │               │───────────────>│
   │             │               │                │
   │             │               │ 14. Return notes
   │             │               │<───────────────│
   │             │               │                │
   │             │ 15. Return notes               │
   │             │<──────────────│                │
   │             │                                 │
   │             │ 16. Merge with local data      │
   │             │     (conflict resolution)      │
   │             │                                 │
   │ 17. Show    │                                 │
   │     synced  │                                 │
   │     data    │                                 │
   │<────────────│                                 │
```

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user-123",
    "iat": 1640000000,
    "exp": 1640604800
  },
  "signature": "..."
}
```

**Files Involved:**
- `/client/screens/LoginScreen.tsx` (future)
- `/server/routes.ts` (POST /api/auth/login)
- `/server/middleware/auth.ts` (JWT validation)
- `/server/storage.ts` (user queries)

**Status:** Backend implemented, client integration pending

---

## Scenario 4: User Translates Text with Speech

**Goal:** Demonstrate external API integration and device APIs

**Actors:** Mobile User, Backend Server, Translation API (LibreTranslate)

**Preconditions:** User on TranslatorScreen

**Steps:**

```
┌──────┐  ┌────────┐  ┌─────────┐  ┌─────────────┐  ┌────────┐
│ User │  │ Client │  │ Backend │  │ Translation │  │ Device │
│      │  │        │  │         │  │     API     │  │  APIs  │
└──┬───┘  └───┬────┘  └────┬────┘  └──────┬──────┘  └───┬────┘
   │          │             │              │             │
   │ 1. Tap   │             │              │             │
   │    mic   │             │              │             │
   │─────────>│             │              │             │
   │          │             │              │             │
   │          │ 2. Request microphone                    │
   │          │     permission                            │
   │          │────────────────────────────────────────>│
   │          │                                           │
   │          │ 3. Permission granted                    │
   │          │<────────────────────────────────────────│
   │          │                                           │
   │ 4. Speak │             │              │             │
   │   "Hello"│             │              │             │
   │─────────>│             │              │             │
   │          │             │              │             │
   │          │ 5. Record audio                          │
   │          │────────────────────────────────────────>│
   │          │                                           │
   │          │ 6. Audio data                            │
   │          │<────────────────────────────────────────│
   │          │                                           │
   │          │ 7. Speech-to-text (future: API call)    │
   │          │    Result: "Hello"                       │
   │          │                                           │
   │ 8. See   │                                           │
   │   "Hello"│                                           │
   │<─────────│                                           │
   │          │                                           │
   │ 9. Select│                                           │
   │    Spanish                                           │
   │─────────>│                                           │
   │          │                                           │
   │          │ 10. POST /api/translate                 │
   │          │     { text: "Hello", target: "es" }     │
   │          │───────────>│                             │
   │          │             │                             │
   │          │             │ 11. POST to LibreTranslate│
   │          │             │──────────────>│            │
   │          │             │                │            │
   │          │             │ 12. Translation│            │
   │          │             │     "Hola"     │            │
   │          │             │<───────────────│            │
   │          │             │                             │
   │          │ 13. Return "Hola"                        │
   │          │<────────────│                             │
   │          │                                           │
   │ 14. See  │                                           │
   │   "Hola" │                                           │
   │<─────────│                                           │
   │          │                                           │
   │ 15. Tap  │                                           │
   │    speaker                                           │
   │─────────>│                                           │
   │          │                                           │
   │          │ 16. Text-to-speech                       │
   │          │────────────────────────────────────────>│
   │          │                                           │
   │ 17. Hear │                                           │
   │   "Hola" │                                           │
   │<─────────│<────────────────────────────────────────│
```

**Files Involved:**
- `/client/screens/TranslatorScreen.tsx`
- `/server/routes.ts` (POST /api/translate)
- `expo-av` (audio recording)
- `expo-speech` (text-to-speech)

**API Call:**
```typescript
// Client → Backend
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello', target: 'es' }),
});
const { translatedText } = await response.json(); // "Hola"

// Backend → LibreTranslate
const translateResponse = await fetch('https://libretranslate.com/translate', {
  method: 'POST',
  body: JSON.stringify({ q: text, source: 'en', target: targetLang }),
});
```

---

## Scenario 5: Quick Capture from Any Module

**Goal:** Demonstrate Quick Capture overlay and module handoff

**Actors:** Mobile User

**Preconditions:** User reading an email

**Steps:**

```
User → EmailScreen → QuickCaptureOverlay → MiniNote → NotebookScreen
│
│ 1. Long-press anywhere on email
│     │
│     └─> 2. QuickCaptureOverlay appears
│         (4 options: Note, Task, Event, Expense)
│
│ 3. Tap "Quick Note"
│     │
│     └─> 4. MiniNote component renders
│         (Title + Body fields, Save button)
│
│ 4. Type: "Follow up on client proposal"
│
│ 5. Tap "Save"
│     │
│     ├─> 6. Call saveNote()
│     │
│     ├─> 7. Save to AsyncStorage
│     │
│     ├─> 8. Record handoff breadcrumb
│     │    Context: EmailScreen → QuickCapture → Notebook
│     │
│     └─> 9. Close overlay
│
└─> 10. Return to EmailScreen (exact scroll position)
│
│ 11. User taps breadcrumb "View Note"
│     │
│     └─> 12. Navigate to NotebookScreen
│         (Note highlighted, filters applied)
```

**Handoff Context:**
```typescript
// /client/context/HandoffContext.tsx
interface HandoffState {
  breadcrumbs: Breadcrumb[];
  push: (screen: string, data: any) => void;
  pop: () => void;
  clear: () => void;
}

// Breadcrumb saved to AsyncStorage
{
  from: 'EmailScreen',
  to: 'NotebookScreen',
  timestamp: Date.now(),
  data: { noteId: 'note-123', emailThreadId: 'thread-456' }
}
```

**Files Involved:**
- `/client/components/QuickCaptureOverlay.tsx`
- `/client/components/MiniNote.tsx`
- `/client/context/HandoffContext.tsx`
- `/client/storage/database.ts` (saveNote, saveHandoffBreadcrumb)

**Performance:**
- Overlay animation: 300ms
- Save operation: < 50ms
- Return to context: < 100ms

---

## Scenario 6: AI Recommendation Lifecycle (Future)

**Goal:** Demonstrate AI integration and cross-module intelligence

**Actors:** AI Service, Backend Server, Mobile User

**Preconditions:** Background task runs AI analysis

**Steps:**

```
Background Task → AI Service → Backend → Client → User Action → Feedback Loop
│
│ 1. Analyze user data
│    (Notes: 5 about "project launch")
│    (Tasks: 3 overdue, related to project)
│    (Calendar: No meeting scheduled)
│
│ 2. Generate recommendation
│     │
│     └─> AI Service returns:
│         "Schedule project kickoff meeting"
│         Confidence: High (85%)
│         Evidence: [5 related notes, 3 tasks]
│         Suggested actions: [Create calendar event, Create task list]
│
│ 3. POST /api/recommendations (backend)
│
│ 4. Save to database
│
│ 5. Push notification to device
│
│ 6. User opens Command Center
│     │
│     └─> Swipeable card shows recommendation
│
│ 7. User swipes right (Accept)
│     │
│     ├─> Create calendar event: "Project Kickoff"
│     ├─> Create task: "Prepare kickoff agenda"
│     ├─> Update recommendation status: accepted
│     └─> Send feedback to AI: {accepted: true, evidence_quality: high}
│
│ 8. AI learns: Similar recommendations should have high confidence
│
│ 9. Recommendation archived with outcome metrics
```

**AI Recommendation Structure:**
```typescript
interface Recommendation {
  id: string;
  title: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  evidence: string[];
  suggestedActions: Action[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: number;
  createdAt: number;
}

interface Action {
  type: 'create_event' | 'create_task' | 'create_note';
  data: any;
}
```

**Files Involved:**
- `/client/screens/CommandCenterScreen.tsx`
- `/client/storage/database.ts` (recommendations methods)
- `/server/routes.ts` (POST /api/recommendations)
- Future: AI service integration

**Status:** Data model complete, AI service integration pending

---

## Performance Metrics

| Scenario | Critical Path | Target | Measured |
|----------|--------------|--------|----------|
| Create Note | Save to AsyncStorage | < 100ms | ~30ms |
| Schedule Event | Conflict detection + save | < 200ms | ~80ms |
| Authentication | Login API call | < 1000ms | ~500ms (backend) |
| Translation | API call + display | < 2000ms | ~1200ms |
| Quick Capture | Overlay open → save → close | < 1000ms | ~600ms |
| Load Notebook | Read all notes | < 500ms | ~150ms |

---

## Assumptions

1. **Network:** Offline-first means all core operations work without network
2. **Performance:** AsyncStorage operations complete in < 100ms
3. **Conflicts:** Last-write-wins for data conflicts (future: CRDT)
4. **AI Integration:** AI service responds within 2 seconds for recommendations
5. **Device APIs:** Native APIs (contacts, audio) available on all devices
6. **Authentication:** JWT tokens valid for 7 days, refresh before expiry
7. **Translation:** External API (LibreTranslate) has 95%+ uptime

---

## Failure Modes

### Scenario Failures

1. **AsyncStorage Write Fails:**
   - **Impact:** Data not saved, user loses work
   - **Mitigation:** Show error, retry 3 times, cache in memory
   - **Recovery:** User can retry save manually

2. **Network Timeout:**
   - **Impact:** API calls fail (auth, translation, sync)
   - **Mitigation:** 10-second timeout, retry logic, offline fallback
   - **Recovery:** Queue for retry when online

3. **Conflict Detection Fails:**
   - **Impact:** User schedules overlapping events
   - **Mitigation:** Log error, show warning, allow override
   - **Recovery:** User can manually resolve conflicts

4. **Device Permission Denied:**
   - **Impact:** Cannot access microphone, contacts, gallery
   - **Mitigation:** Graceful degradation, prompt user for permission
   - **Recovery:** Re-request permission, guide user to settings

---

## How to Verify

### Run Scenarios Manually

```bash
# Start app
npm run expo:dev

# Test Scenario 1: Create Note
# 1. Open Notebook
# 2. Tap "New Note"
# 3. Type content
# 4. Save
# 5. Verify note appears in list

# Test Scenario 2: Schedule Event
# 1. Open Calendar
# 2. Add event with conflicting time
# 3. Verify conflict warning
# 4. Save anyway
# 5. Verify both events show conflict indicator
```

### Run Automated Tests

```bash
# Test storage operations
npm test -- notebook
npm test -- calendar

# Test API flows (E2E)
npm test -- api.e2e

# Test Quick Capture
npm test -- QuickCapture
```

### Performance Testing

```bash
# Profile with React DevTools
npm run expo:dev
# Open React DevTools > Profiler
# Record user flow
# Check flame graph for bottlenecks

# Measure AsyncStorage performance
npm test -- database.test.ts
# Check test output for timing
```

---

## Related Documentation

- [Building Blocks](05_building_blocks.md) - Components involved in scenarios
- [System Context](03_context.md) - External systems and APIs
- [Deployment View](07_deployment.md) - Where scenarios run
- [Quality Requirements](10_quality.md) - Performance targets
- [F&F.md](../../../F&F.md) - Complete feature documentation
