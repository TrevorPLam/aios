# Module Relationships

## Overview

AIOS consists of 14 production-ready modules with complex interdependencies. This document maps how modules interact, share data, and communicate.

## Module Dependency Graph

```mermaid
graph TB
    subgraph "Core Hub"
        CC[Command Center<br/>Recommendation Engine]
    end
    
    subgraph "Productivity Modules"
        NB[Notebook<br/>72% Complete]
        PL[Planner<br/>72% Complete]
        CAL[Calendar<br/>71% Complete]
        LST[Lists<br/>73% Complete]
        AL[Alerts<br/>72% Complete]
    end
    
    subgraph "Communication Modules"
        EM[Email<br/>72% Complete]
        MSG[Messages<br/>72% Complete]
    end
    
    subgraph "Personal Management"
        CT[Contacts<br/>69% Complete]
        BUD[Budget<br/>71% Complete]
        HIS[History<br/>71% Complete]
    end
    
    subgraph "Media & Utility"
        PH[Photos<br/>69% Complete]
        TR[Translator<br/>71% Complete]
        INT[Integrations<br/>70% Complete]
    end
    
    CC -.->|Reads All| NB
    CC -.->|Reads All| PL
    CC -.->|Reads All| CAL
    CC -.->|Reads All| EM
    CC -.->|Reads All| AL
    CC -.->|Reads All| LST
    
    PL -->|Creates| AL
    CAL -->|Creates| AL
    
    NB -->|Links| CT
    EM -->|Links| CT
    MSG -->|Links| CT
    
    HIS -.->|Tracks| NB
    HIS -.->|Tracks| PL
    HIS -.->|Tracks| CAL
    HIS -.->|Tracks| EM
    
    INT -.->|Connects| EM
    INT -.->|Connects| CAL
    INT -.->|Connects| BUD
    
    style CC fill:#00D9FF,color:#000
    style NB fill:#0099CC,color:#fff
    style PL fill:#0099CC,color:#fff
    style CAL fill:#0099CC,color:#fff
```

## Data Sharing Patterns

### Pattern 1: Central Hub (Command Center)

The Command Center reads from all modules but doesn't write back. It's a pure consumer.

```mermaid
graph LR
    A[Module Data] -->|Read Only| B[Command Center]
    B -->|AI Analysis| C[Recommendations]
    C -->|User Action| D[Target Module]
    
    style B fill:#00D9FF,color:#000
```

**Modules Feeding Command Center:**

- Notebook → Recent notes, tags
- Planner → Active tasks, priorities
- Calendar → Upcoming events
- Email → Unread count, important threads
- Alerts → Pending notifications
- Lists → Incomplete items

### Pattern 2: Reference Linking (Contacts)

Contacts is referenced by communication modules but doesn't reference back.

```mermaid
graph TB
    A[Contacts Database] --> B[Email Module]
    A --> C[Messages Module]
    A --> D[Notebook Module]
    
    B -->|Display Name| B
    C -->|Display Name| C
    D -->|@mentions| D
    
    style A fill:#006699,color:#fff
```

### Pattern 3: Cross-Module Creation (Alerts)

Planner and Calendar can create Alerts, establishing a parent-child relationship.

```mermaid
graph LR
    A[Planner Task] -->|Create Reminder| B[Alert]
    C[Calendar Event] -->|Create Reminder| B
    B -->|Links Back| A
    B -->|Links Back| C
    
    style B fill:#FF6600,color:#fff
```

### Pattern 4: Passive Tracking (History)

History tracks activity across modules without interfering.

```mermaid
graph TB
    A[User Action in Any Module]
    B[History Event Logger]
    C[History Timeline]
    
    A -->|Emit Event| B
    B -->|Store| C
    C -.->|Analytics| D[Insights]
    
    style B fill:#006699,color:#fff
```

### Pattern 5: External Integration (Integrations)

Integrations module bridges AIOS with external services.

```mermaid
graph LR
    A[External Services]
    B[Integrations Module]
    C[Email]
    D[Calendar]
    E[Budget]
    
    A <-->|OAuth/API| B
    B -->|Sync| C
    B -->|Sync| D
    B -->|Sync| E
    
    style B fill:#0099CC,color:#fff
    style A fill:#666,color:#fff
```

## Module Communication Matrix

| From/To         | CC | NB | PL  | CAL | EM  | MSG | LST | AL  | CT  | TR  | PH  | HIS | BUD | INT |
|-----------------|----|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| **Command Center**   | -  | ✅ | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ❌  | ❌  | ✅  | ✅  | ❌  |
| **Notebook**         | ❌ | -  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | 🔗  | ❌  | ❌  | ❌  | ❌  | ❌  |
| **Planner**          | ❌ | ❌ | -   | ❌  | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| **Calendar**         | ❌ | ❌ | ❌  | -   | ❌  | ❌  | ❌  | ✅  | ❌  | ❌  | ❌  | ❌  | ❌  | 🔗  |
| **Email**            | ❌ | ❌ | ❌  | ❌  | -   | ❌  | ❌  | ❌  | 🔗  | ❌  | ❌  | ❌  | ❌  | 🔗  |
| **Messages**         | ❌ | ❌ | ❌  | ❌  | ❌  | -   | ❌  | ❌  | 🔗  | ❌  | ❌  | ❌  | ❌  | ❌  |
| **Lists**            | ❌ | ❌ | ❌  | ❌  | ❌  | ❌  | -   | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| **Alerts**           | ❌ | ❌ | 🔗  | 🔗  | ❌  | ❌  | ❌  | -   | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  |
| **Contacts**         | ❌ | ❌ | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | -   | ❌  | ❌  | ❌  | ❌  | ❌  |
| **Translator**       | ❌ | ❌ | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | -   | ❌  | ❌  | ❌  | ❌  |
| **Photos**           | ❌ | ❌ | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | -   | ❌  | ❌  | ❌  |
| **History**          | ❌ | ✅ | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | -   | ✅  | ✅  |
| **Budget**           | ❌ | ❌ | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | -   | 🔗  |
| **Integrations**     | ❌ | ❌ | ❌  | 🔗  | 🔗  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | ❌  | 🔗  | -   |

**Legend:**

- ✅ = Reads data from target module
- 🔗 = References entities in target module
- ❌ = No direct interaction

## Shared Services & Utilities

### Global Context

```mermaid
graph TB
    subgraph "Global Context"
        A[Auth Context]
        B[Theme Context]
        C[Settings Context]
        D[Navigation Context]
    end
    
    subgraph "All Modules"
        E[Module 1]
        F[Module 2]
        G[Module N]
    end
    
    A --> E
    A --> F
    A --> G
    B --> E
    B --> F
    B --> G
    C --> E
    C --> F
    C --> G
    D --> E
    D --> F
    D --> G
    
    style A fill:#006699,color:#fff
    style B fill:#006699,color:#fff
    style C fill:#006699,color:#fff
    style D fill:#006699,color:#fff
```

### Shared Utilities

All modules have access to:

- **Storage API:** Unified AsyncStorage wrapper
- **Analytics:** Event tracking
- **Haptics:** Tactile feedback
- **Toast/Alerts:** User notifications
- **Navigation:** Deep linking and navigation helpers
- **Validation:** Common form validators
- **Date/Time:** Formatting utilities

## Navigation Hierarchy

```mermaid
graph TB
    A[App Root] --> B[Tab Navigator]
    B --> C1[Command Center Stack]
    B --> C2[Module Stack 1]
    B --> C3[Module Stack 2]
    B --> C14[Module Stack 14]
    
    C1 --> D1[Command Center Screen]
    C2 --> D2[Module List]
    C2 --> D3[Module Detail]
    C2 --> D4[Module Edit]
    
    style B fill:#00D9FF,color:#000
```

## Module Independence Levels

### Level 1: Fully Independent

No dependencies on other modules.

- Translator
- Photos
- Lists

### Level 2: Reference Only

References shared resources but doesn't read module data.

- Notebook (references Contacts)
- Email (references Contacts)
- Messages (references Contacts)
- Budget

### Level 3: Read Dependencies

Reads data from other modules.

- Command Center (reads all)
- History (tracks all)

### Level 4: Bidirectional

Creates or modifies data in other modules.

- Planner (creates Alerts)
- Calendar (creates Alerts)
- Integrations (syncs with Email, Calendar, Budget)

## Module Loading Strategy

```mermaid
graph LR
    A[App Start] --> B[Load Core]
    B --> C[Load Tab Navigator]
    C --> D[Lazy Load Modules]
    D --> E{User Navigates?}
    E -->|Yes| F[Load Module on Demand]
    E -->|No| G[Keep in Memory]
    
    style B fill:#FF6600,color:#fff
    style D fill:#00D9FF,color:#000
```

## Future Module Extensions

Planned additions that will integrate with existing modules:

- **Wallet** → Integrates with Budget, Email (receipts), Calendar (bills)
- **Maps** → Integrates with Calendar (event locations), Contacts (addresses)
- **Food** → Integrates with Budget, Calendar, Lists
- **Health** → Integrates with Calendar, Planner, History

## Design Principles

1. **Loose Coupling:** Modules should work independently
2. **Read-Only Cross-Module:** Avoid circular dependencies
3. **Event-Driven:** Use events for cross-module communication
4. **Shared Context:** Use global state sparingly
5. **Data Ownership:** Each module owns its data exclusively

## Related Documents

- [System Architecture](./system-architecture.md)
- [Data Flow](./data-flow.md)
- [Module Details](../../../MODULE_DETAILS.md)
