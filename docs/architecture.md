# AIOS Architecture Documentation

## Overview

This document describes the technical architecture of the AIOS Super App UI/UX system. AIOS breaks traditional mobile UI rules to manage 38+ modules through intelligent, adaptive interfaces.

**Last Updated:** January 16, 2026  
**Version:** 1.0

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Architecture](#core-architecture)
3. [Key Components](#key-components)
4. [Data Flow](#data-flow)
5. [Module Shell](#module-shell)
6. [Event Bus](#event-bus)
7. [Context Engine](#context-engine)
8. [Omnisearch](#omnisearch)
9. [Module Registry](#module-registry)
10. [Performance Strategy](#performance-strategy)
11. [Extension Points](#extension-points)

---

## System Overview

### Plain English

AIOS is a "super app" that replaces 38+ specialized applications with one intelligent, integrated platform. Instead of overwhelming users with options, it uses AI and context awareness to show the right tools at the right time.

### Technical Summary

React Native (Expo SDK 54) mobile app with event-driven architecture, lazy module loading, predictive prefetch, and context-aware UI adaptation. Uses singleton pattern for core services, pub/sub for cross-module communication, and rule-based + ML approaches for intelligence.

### Design Philosophy

1. **Intelligence over Simplicity** - Let AI handle complexity
2. **Context over Convention** - Adapt to user's life
3. **Connection over Isolation** - Modules enhance each other
4. **Progressive over Comprehensive** - Grow with user
5. **Respect over Attention** - Only show what matters

---

## Core Architecture

### Architectural Pattern

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Screens, Components, Navigation)      │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│        Intelligence Layer               │
│  • Context Engine (work/personal)       │
│  • Recommendation Engine (AI)           │
│  • Attention Manager (notifications)    │
│  • Omnisearch (unified search)          │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       Integration Layer                 │
│  • Event Bus (pub/sub)                  │
│  • Module Registry (catalog)            │
│  • Navigation Service                   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Data Layer                      │
│  • AsyncStorage (local-first)           │
│  • Module Databases (notes, tasks, etc)│
│  • Usage Analytics                      │
└─────────────────────────────────────────┘
```

### Key Principles

1. **Lazy Loading**: Only load what's needed, when needed
2. **Predictive Prefetch**: Anticipate next 2-3 modules
3. **Event-Driven**: Modules communicate via events, not direct calls
4. **Context-Aware**: UI adapts based on time, location, usage patterns
5. **Single Source of Truth**: Module registry defines all modules

---

## Key Components

### 1. Event Bus (`client/lib/eventBus.ts`)

**Purpose:** Enables modules to communicate without tight coupling.

**Plain English:**  
When something important happens (e.g., calendar event created), any interested module can be notified and react. Calendar doesn't need to know Maps exists - Maps just listens for calendar events.

**Technical:**
- Singleton observer pattern
- Synchronous event delivery
- Error isolation (one listener failure doesn't break others)
- Event history for debugging (last 100 events)
- Typed event system with `EVENT_TYPES` enum

**Event Types:**
```typescript
- CALENDAR_EVENT_CREATED / UPDATED / DELETED
- TASK_CREATED / COMPLETED / UPDATED / DELETED
- NOTE_CREATED / UPDATED / DELETED
- MESSAGE_SENT / RECEIVED
- MODULE_OPENED / CLOSED
- CONTEXT_CHANGED
- USER_ACTION
- SEARCH_PERFORMED
```

**Usage Example:**
```typescript
// Module A emits event
eventBus.emit(EVENT_TYPES.CALENDAR_EVENT_CREATED, {
  eventId: '123',
  title: 'Dinner with Sarah',
  location: 'Downtown Restaurant'
}, 'calendar');

// Module B listens
const unsubscribe = eventBus.on(
  EVENT_TYPES.CALENDAR_EVENT_CREATED,
  (payload) => {
    // Suggest directions to event location
    suggestDirections(payload.data.location);
  }
);
```

**Failure Modes:**
- Listeners must be fast (synchronous) - no long-running operations
- Memory leaks if listeners not unsubscribed
- Event payload must match expected structure

---

### 2. Context Engine (`client/lib/contextEngine.ts`)

**Purpose:** Automatically adapts UI based on user's current life context.

**Plain English:**  
During work hours (9am-5pm weekdays), shows work-related modules (Email, Calendar, Planner). In evening, shows personal modules (Messages, Photos, Budget). User can override anytime.

**Technical:**
- Rule-based context detection (time-of-day, day-of-week)
- Priority-ordered rules (higher priority wins)
- User override support
- Module visibility filtering
- Smooth transitions with event notifications

**Context Zones:**
```typescript
enum ContextZone {
  WORK       // Mon-Fri 9am-5pm: Email, Calendar, Planner, Notebook
  PERSONAL   // Default: Messages, Photos, Lists, Budget
  FOCUS      // User-enabled: Minimal distractions, Notebook, Planner
  SOCIAL     // Lunch/evening: Messages, Contacts, Photos
  EVENING    // After 6pm: Messages, Photos, Lists, Entertainment
  WEEKEND    // Sat-Sun: Leisure, Personal projects
  AUTO       // Let AI decide
}
```

**Context Detection Rules:**
1. **Focus Mode** (priority 100) - User manual toggle
2. **Weekend** (priority 50) - Saturday or Sunday
3. **Work Hours** (priority 40) - Mon-Fri 9am-5pm
4. **Evening** (priority 30) - After 6pm or before 6am
5. **Social Hours** (priority 25) - Lunch (12-1pm) or after work (5-6pm)
6. **Personal** (priority 0) - Default fallback

**Usage Example:**
```typescript
// Get current context
const detection = contextEngine.detectContext();
// { zone: 'work', confidence: 0.8, reason: 'Work hours (Mon-Fri, 9am-5pm)' }

// Check if module should be visible
const isVisible = contextEngine.shouldModuleBeVisible('email');
// true during work hours, false in evening

// Listen to context changes
contextEngine.onChange((detection) => {
  updateUI(detection.suggestedModules);
});

// User override
contextEngine.setUserOverride(ContextZone.FOCUS);
```

**Extension Points:**
- Add new context zones (e.g., COMMUTE, GYM, TRAVEL)
- Add location-based rules (home, office, gym)
- Add calendar-based rules (during meeting, before deadline)
- Machine learning to improve predictions

---

### 3. Omnisearch (`client/lib/omnisearch.ts`)

**Purpose:** Search everything in the app from one place.

**Plain English:**  
Type "doctor" once and see results from Calendar (appointments), Contacts (doctors you know), Notes (medical notes), Budget (medical expenses). No need to remember which module has what.

**Technical:**
- Parallel search across all registered modules
- Relevance scoring algorithm
- Recency boosting
- Grouped results by module
- Recent searches tracking

**Search Algorithm:**
```
Relevance Score (0-100) calculated as:
1. Text Matching:
   - Exact match: 100 points
   - Starts with query: 80 points
   - Contains query: 60 points
   - Contains all query words: (matched/total) * 40 points

2. Field Boosting:
   - Title matches: 1.5x multiplier
   - Content matches: 1.0x multiplier
   - Metadata matches: 0.8x multiplier

3. Recency Boost:
   - Today: +10 points
   - This week: +7 points
   - This month: +4 points
   - Older: +0 points

Final Score = (Text Score * Field Multiplier) + Recency Boost
```

**Searchable Modules:**
- **Notebook**: Title, body, tags
- **Planner**: Task title, description
- **Calendar**: Event title, description, location
- **Contacts**: Name, email, phone
- **Lists**: List title, item text
- **Budget**: Transaction description, category
- **Email**: Subject, sender, body (future)
- **Messages**: Conversation name, message content (future)

**Usage Example:**
```typescript
const results = await omnisearch.search('doctor', {
  maxResultsPerModule: 5,
  minRelevanceScore: 30
});

// Results structure:
{
  query: 'doctor',
  totalResults: 8,
  searchTime: 45, // milliseconds
  groups: [
    {
      moduleType: 'calendar',
      moduleName: 'Calendar',
      results: [
        {
          id: '123',
          title: 'Dr. Smith Appointment',
          subtitle: 'Jan 20, 2026 2:00 PM',
          relevanceScore: 95,
          ...
        }
      ],
      totalCount: 2
    },
    {
      moduleType: 'contacts',
      moduleName: 'Contacts',
      results: [ ... ],
      totalCount: 3
    },
    ...
  ]
}
```

**Performance Considerations:**
- Target: <500ms for typical searches
- Parallel module queries
- Debounced input (300ms)
- Result limiting (5 per module default)
- Minimum relevance threshold to filter noise

**Extension Points:**
- Add fuzzy matching (typo tolerance)
- Add synonym support ("physician" → "doctor")
- Add search filters (date range, module type)
- Add search suggestions (autocomplete)
- Add voice search
- Add AI-powered semantic search

---

### 4. Module Registry (`client/lib/moduleRegistry.ts`)

**Purpose:** Single source of truth for all modules in the app.

**Plain English:**  
Central catalog defining what modules exist, their icons, colors, and metadata. When you add a new module, add it here and everything else (sidebar, command center, search) automatically knows about it.

**Technical:**
- Singleton pattern
- Module metadata storage
- Usage tracking (open count, last opened)
- Favorites management
- Smart module sorting for sidebar

**Module Definition:**
```typescript
interface ModuleDefinition {
  id: ModuleType;
  name: string;                    // Display name
  description: string;             // Short description
  icon: string;                    // Feather icon name
  color: string;                   // Hex color
  routeName: keyof AppStackParamList;  // Navigation route
  tier: ModuleTier;                // core | tier1 | tier2 | tier3
  category: ModuleCategory;        // productivity | communication | etc.
  isCore: boolean;                 // Part of 14 production modules
  requiresOnboarding: boolean;     // Show in initial selection
  tags: string[];                  // For search and categorization
}
```

**Module Tiers:**
- **Core**: 14 production-ready modules (Command, Notebook, Planner, etc.)
- **Tier 1**: Super app essentials (Wallet, Maps, Food, Ride)
- **Tier 2**: Life management (Health, Education, Professional Services)
- **Tier 3**: Innovation edge (Memory Bank, Future Predictor)

**Usage Tracking:**
```typescript
interface ModuleUsage {
  moduleId: ModuleType;
  openCount: number;
  lastOpened: string; // ISO 8601
  totalTimeSpent: number; // seconds
  favorited: boolean;
}
```

**Usage Example:**
```typescript
// Get all core modules
const coreModules = moduleRegistry.getCoreModules();

// Get modules for onboarding (3 to start)
const onboardingModules = moduleRegistry.getOnboardingModules();

// Record module open
moduleRegistry.recordModuleOpen('notebook');

// Get most used modules for sidebar
const sidebarModules = moduleRegistry.getModulesForSidebar();
// Returns: [command, ...favorites, ...most_used] up to 10

// Search modules
const results = moduleRegistry.searchModules('notes');
// Returns: [{ id: 'notebook', name: 'Notebook', ... }]
```

**Sidebar Logic:**
```
Sidebar shows up to 10 modules:
1. Command Center (always first)
2. Favorited modules
3. Most-used modules
4. Recently-used modules
5. Fill with core modules if space remains
```

**Extension Points:**
- Add module dependencies (e.g., Wallet requires Contacts)
- Add module permissions
- Add module onboarding tutorials
- Add module health checks
- Add module analytics dashboards

---

## Data Flow

### Module Interaction Example

**Scenario:** User creates a dinner calendar event

```
1. User creates event in Calendar module
   ↓
2. Calendar saves event to database
   ↓
3. Calendar emits CALENDAR_EVENT_CREATED event
   ↓
4. Event Bus notifies all listeners:
   ├─→ Maps module: "Want directions to restaurant?"
   ├─→ Food module: "Make a reservation?"
   ├─→ Wallet module: "Set up bill splitting?"
   ├─→ Messages module: "Invite contacts?"
   └─→ Analytics: Track event creation
   ↓
5. User sees optional suggestions (not forced)
   ↓
6. Selecting suggestion navigates to that module
   ↓
7. Module handoff preserves context
```

### Search Flow

```
1. User types in omnisearch
   ↓
2. Input debounced (300ms delay)
   ↓
3. Search query sent to omnisearch engine
   ↓
4. Engine queries all modules in parallel:
   ├─→ Notes database
   ├─→ Tasks database
   ├─→ Events database
   ├─→ Contacts database
   └─→ Lists database
   ↓
5. Results scored and ranked
   ↓
6. Results grouped by module
   ↓
7. UI displays grouped results
   ↓
8. User taps result → navigates to item
```

### Context Switch Flow

```
1. Time changes (e.g., 5pm arrives)
   ↓
2. Context Engine detects new context
   ↓
3. Rules evaluated (Evening mode wins)
   ↓
4. CONTEXT_CHANGED event emitted
   ↓
5. Sidebar updates visible modules
   ↓
6. Command Center adjusts recommendations
   ↓
7. Smooth transition animation
   ↓
8. User sees evening-appropriate modules
```

---

## Module Shell

### Lazy Loading Strategy

**Plain English:**  
Don't load everything at startup. Load Command Center and core services immediately. Load other modules only when user opens them. Pre-load likely next modules in background.

**Technical Implementation:**

```
App Start (< 2 seconds):
┌────────────────────────────────────┐
│ ALWAYS LOADED                      │
│ • App shell & navigation           │
│ • Command Center screen            │
│ • Sidebar component                │
│ • Event Bus                        │
│ • Context Engine                   │
│ • Module Registry                  │
│ • Omnisearch index (lightweight)   │
│ • User settings                    │
│ • Analytics                        │
└────────────────────────────────────┘
        ↓
On Module Open (lazy):
┌────────────────────────────────────┐
│ LAZY LOADED                        │
│ • Module screen component          │
│ • Module data from database        │
│ • Module-specific UI assets        │
└────────────────────────────────────┘
        ↓
Predictive Prefetch (background):
┌────────────────────────────────────┐
│ PREFETCHED (if bandwidth allows)   │
│ • Next 2-3 likely modules          │
│ • Based on usage patterns          │
│ • Based on time of day             │
│ • Based on current module          │
└────────────────────────────────────┘
```

**Prefetch Strategy:**

```typescript
// Pseudo-code for predictive prefetch
function getPrefetchModules(currentModule, timeOfDay) {
  const rules = [
    // If in Calendar, likely to open:
    { from: 'calendar', predict: ['planner', 'notebook', 'contacts'] },
    
    // If in Messages, likely to open:
    { from: 'messages', predict: ['contacts', 'calendar', 'photos'] },
    
    // Morning (6am-9am), likely to open:
    { time: 'morning', predict: ['calendar', 'email', 'planner'] },
    
    // Evening (6pm-9pm), likely to open:
    { time: 'evening', predict: ['messages', 'photos', 'lists'] },
  ];
  
  // Combine rule-based + usage-based predictions
  return selectTop3(rules, userUsageHistory);
}
```

**Memory Management:**

```
Max Memory Budget: 200 MB
├─ App Shell: 20 MB
├─ Core Services: 30 MB
├─ Current Module: 50 MB
├─ Prefetched Modules: 60 MB (3 modules × 20 MB)
└─ Overhead: 40 MB
```

**Module Lifecycle:**

```
UNLOADED → PREFETCHING → LOADED → ACTIVE → BACKGROUND → UNLOADED
   ↑_______________________________________________|
```

---

## Performance Strategy

### Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| App Launch | < 2 seconds | Time to interactive |
| Module Switch | < 500ms | Perceived latency |
| Search Response | < 500ms | Query to results |
| Memory Footprint | < 200 MB | Peak usage |
| Battery Impact | < 5% per hour | Background + foreground |

### Optimization Techniques

1. **Lazy Loading**: Load modules on demand
2. **Predictive Prefetch**: Pre-load likely next modules
3. **Native Driver**: Use Animated.native for 60fps animations
4. **Memoization**: Cache expensive computations (useMemo, useCallback)
5. **Debouncing**: Delay search until user stops typing (300ms)
6. **Virtualization**: FlatList for long scrollable lists
7. **Image Optimization**: Lazy load images, use appropriate sizes
8. **Database Indexing**: Index frequently queried fields
9. **Event Throttling**: Limit high-frequency events (scroll, drag)
10. **Code Splitting**: Split modules into separate bundles

### Monitoring

Track these metrics in production:

```typescript
interface PerformanceMetrics {
  appLaunchTime: number;
  moduleOpenTimes: Map<ModuleType, number>;
  searchLatencies: number[];
  memorySnapshots: MemorySnapshot[];
  batteryDrainRate: number;
  frameDrops: number;
  errorRate: number;
}
```

---

## Extension Points

### Adding a New Module

1. **Add to Module Registry** (`client/lib/moduleRegistry.ts`):
```typescript
{
  id: 'wallet',
  name: 'Wallet',
  description: 'Digital wallet and payments',
  icon: 'credit-card',
  color: '#00D9FF',
  routeName: 'Wallet',
  tier: 'tier1',
  category: 'finance',
  isCore: false,
  requiresOnboarding: true,
  tags: ['payments', 'money', 'transactions'],
}
```

2. **Create Module Screen** (`client/screens/WalletScreen.tsx`)

3. **Add Route to Navigator** (`client/navigation/AppNavigator.tsx`)

4. **Implement Search** (add to omnisearch):
```typescript
private async searchWallet(query: string, maxResults: number) {
  // Search wallet transactions
}
```

5. **Emit Events** (in module code):
```typescript
eventBus.emit(EVENT_TYPES.PAYMENT_COMPLETED, {
  amount: 50,
  recipient: 'John',
});
```

6. **Done!** Module automatically appears in:
   - Sidebar (if used frequently)
   - Omnisearch results
   - Module grid
   - Context-filtered lists

### Adding a New Context Zone

1. **Add to ContextEngine** (`client/lib/contextEngine.ts`):
```typescript
enum ContextZone {
  // ... existing
  COMMUTE = 'commute',
}

// Add to MODULE_CONTEXT_MAP
[ContextZone.COMMUTE]: [
  'command',
  'maps',
  'messages',
  'podcasts',
  'music',
]

// Add detection rule
{
  zone: ContextZone.COMMUTE,
  priority: 35,
  condition: () => {
    // Detect if user is commuting
    // Could use: time of day, location, velocity
    return isCommuting();
  },
  reason: 'Commute detected',
}
```

2. **Done!** Context automatically affects:
   - Sidebar module visibility
   - Command Center recommendations
   - Notification priorities

---

## Security Considerations

See [docs/security.md](./security.md) for detailed security documentation.

**Key Security Principles:**
1. **Local-First Storage**: Sensitive data stays on device
2. **Minimal Permissions**: Request only what's needed
3. **No Secrets in Client**: API keys, tokens server-side only
4. **Output Encoding**: Prevent XSS in all user-generated content
5. **Input Validation**: Validate at boundaries
6. **Fail-Safe Defaults**: Deny access if uncertain

---

## Accessibility

See [docs/accessibility.md](./accessibility.md) for detailed accessibility documentation.

**Key Accessibility Features:**
1. **Keyboard Navigation**: All features accessible via keyboard
2. **Screen Reader**: Proper labels, roles, states
3. **Focus Management**: Correct focus for overlays, modals
4. **Reduced Motion**: Respect user's motion preferences
5. **Color Contrast**: WCAG 2.2 AA compliant
6. **Gesture Alternatives**: Buttons for all gesture actions

---

## Testing Strategy

### Unit Tests
- Event Bus (✅ Complete)
- Context Engine (In Progress)
- Omnisearch (In Progress)
- Module Registry (In Progress)

### Integration Tests
- Command Center with Event Bus
- Sidebar with Context Engine
- Omnisearch with all modules

### End-to-End Tests
- Complete user flows
- Module handoffs
- Context switches
- Search → navigate → action

### Accessibility Tests
- Automated: axe, lighthouse
- Manual: keyboard navigation, screen reader
- Focus management tests

### Performance Tests
- Load time benchmarks
- Module switch latency
- Search response time
- Memory profiling

---

## Module Handoff System (Phase 3)

### Overview

**Purpose:** Enable seamless transitions between modules while preserving state and providing clear navigation paths.

**Plain English:**  
When you need to jump from Calendar to Maps for directions, then to Food for restaurant booking, the handoff system keeps track of where you came from and lets you return with one tap. Your scroll position, filters, and selections are preserved in both modules.

**Technical:**  
State-preserving navigation manager with breadcrumb UI, iOS-specific storage via AsyncStorage, and event-driven updates. Supports deep chains (up to 5 levels) with circular reference prevention.

### Components

#### 1. Module Handoff Manager (`client/lib/moduleHandoff.ts`)

**Responsibilities:**
- Track handoff chain (module → module → module)
- Serialize/deserialize module state
- Persist state across iOS app lifecycle
- Emit events for UI updates
- Enforce depth limits to prevent infinite chains

**Key Features:**
- **State Preservation**: Saves scroll positions, filters, selections per module
- **iOS Lifecycle Handling**: Persists to AsyncStorage (survives backgrounding)
- **Depth Limiting**: Max 5 handoffs prevents memory issues
- **Circular Prevention**: Cannot handoff from module A → A
- **Breadcrumb Trail**: Generates UI-friendly navigation path

**API:**
```typescript
// Start handoff from Calendar to Maps
handoffManager.startHandoff(
  {
    moduleId: 'calendar',
    displayName: 'Calendar',
    state: { scrollY: 500, selectedDate: '2026-01-16' }
  },
  {
    moduleId: 'maps',
    displayName: 'Maps'
  },
  {
    presentationStyle: 'push', // iOS-specific
    useNativeAnimation: true
  }
);

// Return from Maps back to Calendar
const result = handoffManager.returnFromHandoff(
  { selectedLocation: 'Restaurant X' },
  'complete'
);
// result.moduleState contains Calendar's saved state

// Cancel entire chain (return to root)
handoffManager.cancelHandoff();
```

**State Structure:**
```typescript
{
  id: 'handoff_1234567890_abc123',
  modules: [
    {
      moduleId: 'calendar',
      displayName: 'Calendar',
      state: { scrollY: 500, filter: 'week' },
      timestamp: 1705449600000
    },
    {
      moduleId: 'maps',
      displayName: 'Maps',
      state: { zoom: 15, center: { lat: 37.7, lng: -122.4 } },
      timestamp: 1705449700000
    }
  ],
  metadata: {
    useNativeAnimation: true,
    presentationStyle: 'push'
  }
}
```

#### 2. Handoff Breadcrumb UI (`client/components/HandoffBreadcrumb.tsx`)

**Purpose:** Visual breadcrumb bar showing navigation path with back button.

**iOS Features:**
- BlurView backdrop (iOS 13+ style)
- Safe area inset handling (notch, dynamic island)
- Native haptic feedback on interactions
- SF Symbols-inspired icon design
- 44pt height (iOS standard navigation bar)

**Variants:**
- **Full Breadcrumb**: Shows back button + full path
- **Compact Breadcrumb**: Path only (embeddable in headers)

**Usage:**
```tsx
// Automatic mode (shows/hides based on handoff state)
<HandoffBreadcrumb />

// Custom back handler
<HandoffBreadcrumb onBack={() => customNavigate()} />

// Compact variant
<CompactBreadcrumb />
```

**Visual Appearance (iOS):**
```
┌────────────────────────────────────────┐
│ ← Calendar    Calendar › Maps › Food   │ ← Blur backdrop
└────────────────────────────────────────┘
  ↑ Back button  ↑ Breadcrumb trail
```

#### 3. React Hook (`useModuleHandoff`)

**Purpose:** React-friendly API for handoff operations.

**Usage:**
```tsx
const {
  startHandoff,
  returnFromHandoff,
  cancelHandoff,
  updateCurrentModuleState,
  currentChain,
  breadcrumbs,
  isInHandoff
} = useModuleHandoff();

// Start handoff
startHandoff(fromModule, toModule, options);

// Update current module's state (e.g., on scroll)
updateCurrentModuleState({ scrollY: 500 });

// Return to previous module
const result = returnFromHandoff({ data: 'xyz' }, 'complete');

// Check if in handoff
if (isInHandoff) {
  // Show breadcrumb UI
}
```

### Integration Examples

#### Calendar → Maps Handoff

**Scenario:** User has event "Dinner at 7pm" → Taps "Directions" → Maps opens

```tsx
// In CalendarScreen.tsx
const { startHandoff } = useModuleHandoff();

const handleGetDirections = (event) => {
  startHandoff(
    {
      moduleId: 'calendar',
      displayName: 'Calendar',
      state: {
        scrollY: scrollRef.current?.contentOffset.y,
        selectedDate: currentDate,
        viewMode: 'week'
      }
    },
    {
      moduleId: 'maps',
      displayName: 'Maps',
      state: {
        destination: event.location,
        prefilledFromEvent: true
      }
    },
    { presentationStyle: 'push' }
  );
  
  navigation.navigate('Maps', {
    destination: event.location,
    fromHandoff: true
  });
};
```

**In MapsScreen.tsx:**
```tsx
const { returnFromHandoff, isInHandoff } = useModuleHandoff();

const handleBackToCalendar = () => {
  const result = returnFromHandoff(
    { selectedRoute: currentRoute },
    'complete'
  );
  
  // Navigate back with restored state
  navigation.goBack();
  
  // CalendarScreen will receive result.moduleState
  // and restore its scrollY, selectedDate, viewMode
};

// Show breadcrumb if in handoff
return (
  <View>
    {isInHandoff && <HandoffBreadcrumb />}
    {/* Maps content */}
  </View>
);
```

### iOS-Specific Considerations

1. **State Persistence**
   - Uses AsyncStorage for iOS app lifecycle
   - Survives app backgrounding/foregrounding
   - Automatic cleanup on logout

2. **Animations**
   - Native iOS push/pop animations
   - Modal presentations (iOS 13+ card style)
   - Smooth transitions with UIKit integration

3. **Safe Areas**
   - Breadcrumb respects notch/dynamic island
   - Proper padding for home indicator
   - Landscape orientation handling

4. **Haptic Feedback**
   - Light impact on back button press
   - Success notification on handoff complete
   - Error notification on invalid handoff

### Performance

**Metrics:**
- State serialization: <10ms per module
- AsyncStorage write: <50ms
- Handoff initiation: <100ms
- Memory per chain: <5KB

**Optimizations:**
- Depth limit prevents unbounded growth
- State is JSON-serialized (compact)
- Old chains auto-cleared after 24h
- Lazy loading of handoff UI components

### Testing

**Unit Tests:** 22 tests covering:
- Handoff start/return/cancel
- State preservation
- Depth limits
- Circular prevention
- Event notifications
- AsyncStorage persistence

**Test Coverage:** 100% of handoff manager logic

**Example Tests:**
```typescript
it('should preserve state when returning from handoff', () => {
  handoffManager.startHandoff(
    { moduleId: 'calendar', state: { scrollY: 100 } },
    { moduleId: 'maps' }
  );
  
  const result = handoffManager.returnFromHandoff();
  
  expect(result.moduleState.scrollY).toBe(100);
});

it('should enforce max depth limit', () => {
  // Create 5-level chain
  // ...
  
  // Attempt 6th level should fail
  const success = handoffManager.startHandoff(module5, module6);
  expect(success).toBe(false);
});
```

### Security Considerations

1. **State Validation**
   - Module state is developer-controlled (trusted)
   - No user input in handoff chain
   - State size limited (max 100KB per module)

2. **Storage Security**
   - AsyncStorage is iOS sandbox-protected
   - No sensitive data in handoff state
   - State cleared on logout

3. **Injection Prevention**
   - Module IDs validated against registry
   - Display names sanitized for UI
   - No eval() or dynamic code execution

### Accessibility

1. **Breadcrumb Navigation**
   - Back button has accessible label
   - Breadcrumb trail readable by VoiceOver
   - Focus management on handoff transitions

2. **Keyboard Support**
   - Breadcrumb back button keyboard-accessible
   - Tab order preserved through handoffs

3. **Screen Reader**
   - Announces module transitions
   - Reads breadcrumb path on focus

### Future Enhancements

1. **Handoff Animations**
   - Custom transition animations per module pair
   - Shared element transitions (iOS 16+)

2. **Deep Linking**
   - URL scheme for handoff chains
   - Universal Links support

3. **AI Predictions**
   - Suggest next handoff destination
   - Pre-warm likely next module

4. **Multi-Device**
   - Continue handoff on different device (iOS Handoff API)
   - iCloud sync of handoff state

---

## Next Steps

1. Complete sidebar gesture detection
2. Implement attention management system
3. Add progressive onboarding flow
4. Create mini-mode UI pattern
5. Build quick capture overlay
6. Add predictive prefetch logic
7. Create comprehensive E2E tests
8. Performance profiling and optimization

---

## Glossary

**Module**: A feature area of the app (Notebook, Calendar, etc.)

**Context Zone**: A user's current life context (work, personal, focus, etc.)

**Event Bus**: Pub/sub system for cross-module communication

**Omnisearch**: Universal search across all modules

**Module Registry**: Catalog of all available modules

**Lazy Loading**: Loading code only when needed

**Predictive Prefetch**: Loading likely-next modules in advance

**Module Handoff**: Transitioning from one module to another with context preservation

**Mini-mode**: Inline compact version of a module

**Command Center**: AI-powered entry point showing relevant modules

---

## References

- [UI/UX Revolutionary Strategy](../vision/UI_UX_REVOLUTIONARY_STRATEGY.md)
- [Super App Module Expansion](../vision/SUPER_APP_MODULE_EXPANSION.md)
- [API Documentation](../technical/API_DOCUMENTATION.md)
- [Testing Instructions](../technical/TESTING_INSTRUCTIONS.md)
