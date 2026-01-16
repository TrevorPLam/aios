# AIOS UX Flows Documentation

## Purpose
This document describes the user experience flows for the AIOS Super App UI/UX system. It translates the technical architecture into plain English user journeys, explaining how users interact with the intelligent entry point, attention management, and progressive onboarding systems.

---

## 1. First-Time User Experience (Progressive Onboarding)

### Plain English:
New users start with just 3 modules instead of being overwhelmed by 38. As they use the app, more modules automatically unlock based on their behavior. This makes the app feel simple at first but infinitely capable over time.

### Technical Flow:
```
User Opens App (Stage: not_started)
  ↓
Welcome Screen
  ↓
Module Selection Screen
  "Pick 3 things you do daily:"
  - [ ] Manage tasks (Planner)
  - [ ] Take notes (Notebook)
  - [ ] Schedule events (Calendar)
  - [ ] Track expenses (Budget)
  - [ ] Message friends (Messages)
  - [ ] Organize lists (Lists)
  ↓
User Selects: Planner, Notebook, Calendar
  ↓
Onboarding State: active
Unlocked Modules: [Command, Planner, Notebook, Calendar]
  ↓
User Opens Planner (usage_count: 1)
User Opens Notebook (usage_count: 2)
User Opens Calendar (usage_count: 3)
  ↓
Auto-Unlock Triggered!
New Module Unlocked: Messages (based on priority)
Contextual Tip Shown: "Messages unlocked! Chat with contacts."
  ↓
User Opens Messages (usage_count: 4)
User Opens Planner (usage_count: 5)
User Opens Notebook (usage_count: 6)
  ↓
Auto-Unlock Triggered!
New Module Unlocked: Lists
Tip Shown: "Lists unlocked! Create checklists."
  ↓
... continues until user has unlocked 10 modules ...
  ↓
Completion Tip: "You've unlocked 10 modules! Ready to see everything?"
[Unlock All] or [Continue Gradually]
  ↓
If "Continue Gradually": Keep auto-unlocking
If "Unlock All": Onboarding State: completed
```

### Key Rules:
- **Start Small**: Always 3 modules initially (plus Command Center)
- **Usage-Driven**: Unlock every 3 module uses
- **Daily Limit**: Max 2 auto-unlocks per day (prevents overwhelm)
- **Priority-Based**: High-utility modules unlock first (Planner, Messages, Email)
- **User Control**: Can always manually unlock or skip entirely
- **Welcome Tips**: Each unlock shows a contextual tip (expires in 24 hours)

### Skip Flow:
```
User Sees "Skip Onboarding" Button
  ↓
Confirmation: "This will unlock all 38 modules. Continue?"
  ↓
[Yes] → All modules unlocked, Onboarding State: completed
[No] → Return to guided onboarding
```

---

## 2. Attention Management (Notification Intelligence)

### Plain English:
Instead of showing 38 notification badges (one per module), the app intelligently groups notifications into three levels: urgent (needs action today), attention (needs action soon), and FYI (nice to know). Similar notifications bundle together to reduce clutter.

### Technical Flow:
```
Task Created: "Submit report by 5pm" (due in 2 hours)
  ↓
Attention Manager: Classify Priority
  - Module: planner
  - Metadata: {priority: "urgent", dueDate: "2026-01-16T17:00:00Z"}
  - Hours Until Due: 2
  ↓
Priority Classification: URGENT
  ↓
Create Attention Item:
  {
    id: "task-123",
    module: "planner",
    priority: "urgent",
    title: "New Task",
    summary: "Submit report by 5pm",
    actionLabel: "View Task",
    createdAt: "2026-01-16T15:00:00Z"
  }
  ↓
Check for Bundling:
  - Same module? No other planner items in past 10 minutes
  - Create new bundle: "bundle-planner-1234567890"
  ↓
User Gets Notification:
  Badge: 🔴 (urgent)
  Title: "New Task"
  Summary: "Submit report by 5pm"
  [View Task]
```

### Bundling Flow:
```
5 Messages Received (within 10 minutes):
  1. "Hey!" from Alice (3:00 PM)
  2. "Are you free?" from Alice (3:01 PM)
  3. "Meeting at 4?" from Bob (3:05 PM)
  4. "Got the docs" from Alice (3:07 PM)
  5. "Thanks!" from Carol (3:09 PM)
  ↓
Attention Manager: Check for Bundle
  - All from module: "messages"
  - All priority: "attention"
  - All within 10-minute window: ✓
  - Bundle size < 5: ✓
  ↓
Create Bundle:
  {
    id: "bundle-messages-xyz",
    title: "5 Messages updates",
    priority: "attention",
    items: [msg1, msg2, msg3, msg4, msg5]
  }
  ↓
User Sees ONE Notification:
  Badge: 🟡 (attention)
  Title: "5 Messages updates"
  [View All] → Opens bundled view
```

### Focus Mode Flow:
```
User Activates Focus Mode
  ↓
Focus Mode Settings:
  - enabled: true
  - allowUrgent: true
  - allowedModules: ["planner", "calendar"]
  ↓
New Attention Items Filtered:
  - Urgent planner task: ✓ SHOW (urgent + whitelisted module)
  - FYI message: ✗ HIDE (not urgent, not whitelisted)
  - Attention calendar event: ✓ SHOW (whitelisted module)
  - Urgent budget payment: ✓ SHOW (urgent overrides whitelist)
  ↓
User Sees Only Critical Notifications
Deep Work Protected
```

### Priority Classification Rules:
```
URGENT (requires action today):
  - Tasks due today or overdue
  - Events within 1 hour
  - Payment due today
  - Critical system alerts

ATTENTION (needs action this week):
  - Tasks due within 3 days
  - Events within 24 hours
  - Direct messages
  - Upcoming deadlines

FYI (nice to know):
  - General updates
  - Non-urgent notifications
  - Background sync events
  - Informational tips
```

---

## 3. Command Center (Intelligent Entry Point)

### Plain English:
When you open the app, instead of a wall of 38 modules, you see 3-5 AI-recommended actions based on what you need right now. It learns your patterns and surfaces the right tool at the right time.

### Technical Flow (Placeholder - Not Yet Implemented):
```
User Opens App
  ↓
Command Center Loads
  ↓
Recommendation Engine Analyzes:
  - Time of day: 9:15 AM (morning)
  - Calendar: Meeting at 10 AM
  - Tasks: 3 high-priority tasks due today
  - Recent usage: Opened Planner 5x this week
  - Context: Work mode (detected from calendar)
  ↓
Generate Recommendations:
  1. "Meeting in 45 min - Review notes?" (HIGH confidence)
     → Opens Notebook with meeting note template
  
  2. "3 urgent tasks today" (HIGH confidence)
     → Opens Planner filtered to urgent
  
  3. "Schedule focus time for tasks" (MEDIUM confidence)
     → Opens Calendar to block time
  
  4. Quick Actions Bar:
     [📝 Planner] [📅 Calendar] [📧 Email] [💬 Messages] [📋 Lists]
  
  5. [All Modules >] (tertiary option)
  ↓
User Taps Recommendation #1
  → Navigates to Notebook
  → Creates meeting note
  → Records usage for future recommendations
```

---

## 4. Sidebar Navigation (Persistent Access)

### Plain English:
A collapsible sidebar shows your most-used modules. Swipe from the left edge (or tap button) to access any module without losing your current screen.

### Technical Flow:
```
User on Calendar Screen
  ↓
Swipes from Left Edge (or taps Menu button)
  ↓
Sidebar Expands (animated slide-in)
  ↓
Shows Module List (sorted by usage):
  ┌──────────────────┐
  │ 🎯 Command       │ ← Always first
  │ ─────────────────│
  │ 📝 Planner    23 │ ← Most used (23 opens)
  │ 📓 Notebook   18 │
  │ 📅 Calendar   15 │ ← Currently active (highlighted)
  │ 💬 Messages   12 │
  │ 📧 Email       8 │
  │ ─────────────────│
  │ 📋 Lists       5 │
  │ 🔔 Alerts      3 │
  │ 💰 Budget      2 │
  │ 📸 Photos      1 │
  │ ─────────────────│
  │ ⚙️ More... >    │ ← Remaining modules
  └──────────────────┘
  ↓
User Taps "Planner"
  ↓
Sidebar Collapses (animated)
Navigation: Calendar → Planner
Context Preserved: Can return via breadcrumb
```

---

## 5. Omnisearch (Universal Search)

### Plain English:
One search box finds anything across all modules. Type "doctor" and see appointments, contacts, notes, expenses - all grouped by type and ranked by relevance.

### Technical Flow:
```
User Opens Search (⌘K or tap search icon)
  ↓
Types: "doctor"
  ↓
Search Engine Queries (parallel):
  - Calendar: Find events matching "doctor"
  - Contacts: Find people matching "doctor"
  - Notebook: Find notes matching "doctor"
  - Budget: Find transactions matching "doctor"
  - Lists: Find items matching "doctor"
  - Email: Find threads matching "doctor"
  ↓
Results Return in <500ms:
  ┌─────────────────────────────────────┐
  │ 🔍 doctor                            │
  ├─────────────────────────────────────┤
  │ 📅 CALENDAR (2 results)              │
  │ • Dr. Smith Appointment - Tomorrow   │
  │ • Annual Checkup - Next Week         │
  │                                     │
  │ 👥 CONTACTS (2 results)              │
  │ • Dr. Sarah Smith (Dermatologist)   │
  │ • Dr. Michael Johnson (GP)          │
  │                                     │
  │ 📝 NOTES (1 result)                  │
  │ • "Doctor appointment notes"        │
  │                                     │
  │ 💳 BUDGET (1 result)                 │
  │ • Medical Center - $150 (Dec 1)     │
  └─────────────────────────────────────┘
  ↓
User Taps "Dr. Smith Appointment"
  ↓
Navigation: Search → Calendar → Event Detail
Breadcrumb: [Search] > [Calendar] > [Event]
[← Back to Search]
```

### Relevance Scoring:
```
Score = (textMatch * 0.7) + (recencyBoost * 0.3)

textMatch:
  - Exact match in title: 1.0
  - Partial match in title: 0.8
  - Match in body: 0.6
  - Match in metadata: 0.4

recencyBoost:
  - < 1 day old: 1.0
  - < 1 week old: 0.8
  - < 1 month old: 0.6
  - < 1 year old: 0.4
  - > 1 year old: 0.2
```

---

## 6. Context Zones (Adaptive Interface)

### Plain English:
The app automatically adjusts what you see based on time, location, and calendar. During work hours, work tools appear. In the evening, personal and entertainment tools appear.

### Technical Flow (From Phase 1 - Already Implemented):
```
Monday 9:00 AM
  ↓
Context Engine Evaluates Rules:
  - Time: 9:00 AM (work hours)
  - Calendar: Has work meetings today
  - Location: Office (if available)
  ↓
Context: WORK
  ↓
Module Registry Filters:
  Visible: [Command, Planner, Notebook, Calendar, Email]
  Hidden: [Games, Entertainment, Shopping, Food Delivery]
  ↓
User Sees: Work-focused interface

Monday 6:30 PM
  ↓
Context Engine Re-evaluates:
  - Time: 6:30 PM (evening)
  - Calendar: No more work events
  - Location: Home
  ↓
Context: PERSONAL
  ↓
Module Registry Filters:
  Visible: [Command, Messages, Photos, Lists, Budget, Food Delivery]
  Hidden: [Work Email, Professional Services]
  ↓
User Sees: Personal-focused interface
```

---

## 7. Module Handoff (State Preservation)

### Plain English:
When you jump from one module to another (like Calendar → Maps), the app shows where you are and lets you return with one tap. Your scroll position and state are preserved in both places.

### Technical Flow (Placeholder - Not Yet Implemented):
```
User in Calendar: Viewing "Dinner with Sarah at 7pm"
  ↓
Taps: "Get Directions"
  ↓
Module Handoff Initiated:
  - Source: calendar/event/abc-123
  - Target: maps
  - Data: { address: "123 Main St", time: "7:00 PM" }
  ↓
Save Calendar State:
  - scrollPosition: 450px
  - selectedEvent: "abc-123"
  - viewMode: "day"
  ↓
Navigate to Maps:
  ┌─────────────────────────────────────┐
  │ [📅 Calendar] > 🗺️ Maps              │ ← Breadcrumb
  ├─────────────────────────────────────┤
  │ Directions to: 123 Main St          │
  │ Estimated time: 15 minutes          │
  │ [Map showing route]                 │
  │                                     │
  │ [← Back to Calendar Event]          │
  └─────────────────────────────────────┘
  ↓
User Taps "Back to Calendar Event"
  ↓
Restore Calendar State:
  - scrollPosition: 450px (exact position)
  - selectedEvent: "abc-123" (still selected)
  - viewMode: "day" (same view)
  ↓
User Returns to Exact Same State
No Context Loss
```

---

## 8. Quick Capture Overlay

### Plain English:
From any screen, long-press to quickly capture a note, task, expense, or photo without losing your place. When done, you return to exactly where you were.

### Technical Flow (Placeholder - Not Yet Implemented):
```
User in Messages: Scrolled down, reading conversation
  ↓
Long Press Anywhere on Screen
  ↓
Quick Capture Menu Appears (overlay):
  ┌─────────────────────────────────────┐
  │       QUICK CAPTURE                 │
  ├─────────────────────────────────────┤
  │ 📝 Quick Note                        │
  │ ✅ Quick Task                        │
  │ 💰 Quick Expense                     │
  │ 📸 Quick Photo                       │
  │ 🎤 Quick Voice Note                 │
  └─────────────────────────────────────┘
  ↓
User Taps "Quick Task"
  ↓
Mini Task Form Appears (overlay):
  ┌─────────────────────────────────────┐
  │ NEW TASK                            │
  ├─────────────────────────────────────┤
  │ Title: [                    ]       │
  │ Priority: Medium ▼                  │
  │ Due: Tomorrow ▼                     │
  │                                     │
  │ [Cancel] [Save Task]                │
  └─────────────────────────────────────┘
  ↓
User Types: "Buy groceries"
User Taps: "Save Task"
  ↓
Task Saved to Planner
Overlay Dismisses
  ↓
User Returns to Messages
Scroll Position: Preserved
Conversation: Still there
No Context Loss
```

---

## Design Principles Summary

### 1. Zero Overwhelm
- Start small (3 modules)
- Grow gradually (auto-unlock)
- Hide what's not needed (context zones)

### 2. Intelligent Surface
- AI recommends (Command Center)
- Priority filters (Attention Management)
- Context adapts (Work/Personal modes)

### 3. Always Accessible
- Sidebar (swipe from edge)
- Search (⌘K anywhere)
- Quick Capture (long press)

### 4. State Preservation
- Module Handoff (breadcrumbs)
- Scroll positions saved
- Context never lost

### 5. User Control
- Manual overrides everywhere
- Skip onboarding option
- Focus mode preferences
- Context zone customization

---

## Success Metrics

### Onboarding Success:
- **Target**: 80% of users unlock ≥10 modules within 30 days
- **Measure**: `onboardingManager.getStats().unlockedCount`

### Attention Management Success:
- **Target**: <15% of users feel overwhelmed by notifications
- **Measure**: User surveys + dismiss rates

### Context Switch Friction:
- **Target**: <1 second perceived module transitions
- **Measure**: Performance monitoring

### Discovery Rate:
- **Target**: Users discover 75% of relevant features organically
- **Measure**: Module unlock reasons (auto vs manual)

### Cognitive Load Proxy:
- **Target**: Search frequency decreases over time (users learn)
- **Measure**: Search usage patterns

---

## Future Enhancements

### Short Term (Phase 3):
1. Implement Mini-Mode for modules
2. Add Module Handoff with breadcrumbs
3. Create Quick Capture overlay
4. Build Attention Center UI screen

### Medium Term (Phase 4):
1. Add ML-based recommendation ranking
2. Implement predictive prefetch
3. Create usage pattern learning
4. Add smart notification bundling improvements

### Long Term:
1. Voice-based quick capture
2. Cross-device state sync
3. Collaborative module sharing
4. AI-powered workflow suggestions

---

**Document Version:** 1.0  
**Last Updated:** January 16, 2026  
**Status:** Phase 2 Implementation - Onboarding & Attention Management Complete
