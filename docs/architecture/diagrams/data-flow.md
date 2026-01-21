# Data Flow Diagram

## Overview

This diagram illustrates how data flows through AIOS from user action to persistence and back.

## User Action Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Component
    participant S as State Management
    participant A as AsyncStorage
    participant API as Express API
    participant DB as PostgreSQL

    U->>UI: Interaction (tap, swipe)
    UI->>UI: Haptic Feedback
    UI->>S: Update State
    S->>UI: Re-render

    par Local Persistence
        S->>A: Save to AsyncStorage
        A-->>S: Success/Failure
    and Optional Server Sync
        S->>API: POST/PUT Request
        API->>DB: Write to Database
        DB-->>API: Confirmation
        API-->>S: Response
    end

    S->>UI: Update with Result
    UI->>U: Visual Feedback
```text

## Module Data Flow

```mermaid
graph LR
    subgraph "User Input"
        A[User Action]
    end

    subgraph "Component Layer"
        B[Screen Component]
        C[Context Provider]
    end

    subgraph "Storage Layer"
        D[AsyncStorage API]
        E[Local Storage]
    end

    subgraph "Business Logic"
        F[Validation]
        G[Transformation]
        H[AI Processing]
    end

    A --> B
    B --> F
    F --> G
    G --> C
    C --> D
    D --> E
 G -.-> | Optional | H
 H -.-> | Recommendations | C

    style A fill:#00D9FF,color:#000
    style E fill:#006699,color:#fff
```text

## Cross-Module Data Sharing

```mermaid
graph TD
    subgraph "Command Center Module"
        CC[Recommendation Engine]
    end

    subgraph "Source Modules"
        NB[Notebook]
        PL[Planner]
        CAL[Calendar]
        EM[Email]
        AL[Alerts]
    end

    subgraph "Shared Context"
        CTX[Global Context]
        AI[AI Engine]
    end

 NB --> | Recent Notes | CTX
 PL --> | Active Tasks | CTX
 CAL --> | Upcoming Events | CTX
 EM --> | Unread Count | CTX
 AL --> | Pending Alerts | CTX

    CTX --> AI
    AI --> CC
 CC --> | Actions | NB
 CC --> | Actions | PL
 CC --> | Actions | CAL

    style CC fill:#00D9FF,color:#000
    style AI fill:#FF6600,color:#fff
```text

## State Management Pattern

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: User Action
    Loading --> Success: Data Loaded
    Loading --> Error: Load Failed
    Success --> Idle: Auto-save Complete
    Error --> Idle: User Dismisses
    Error --> Loading: Retry

    Success --> Syncing: Online & Needs Sync
    Syncing --> Success: Sync Complete
    Syncing --> Error: Sync Failed
```text

## Data Persistence Strategy

### Priority Levels

```mermaid
graph TB
    subgraph "Immediate"
        A1[User Input]
        A2[Critical State]
    end

    subgraph "Debounced"
        B1[Search Queries]
        B2[Filter State]
    end

    subgraph "Batched"
        C1[Analytics Events]
        C2[Usage Metrics]
    end

    subgraph "On-Demand"
        D1[Large Files]
        D2[Media Content]
    end

 A1 --> | Save Immediately | AS[AsyncStorage]
 A2 --> | Save Immediately | AS
 B1 --> | 300ms delay | AS
 B2 --> | 300ms delay | AS
 C1 --> | Every 5min | AS
 C2 --> | Every 5min | AS
 D1 --> | User triggered | FS[File System]
 D2 --> | User triggered | FS

    style AS fill:#006699,color:#fff
    style FS fill:#006699,color:#fff
```text

## AI Recommendation Flow

```mermaid
graph LR
    subgraph "Data Collection"
        A[User Behavior]
        B[Module State]
        C[Historical Data]
    end

    subgraph "AI Processing"
        D[Pattern Analysis]
        E[Confidence Scoring]
        F[Priority Ranking]
    end

    subgraph "Recommendation Output"
        G[Top 3 Actions]
        H[Confidence Meters]
        I[Quick Actions]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I

    style D fill:#FF6600,color:#fff
    style G fill:#00D9FF,color:#000
```text

## Offline-First Strategy

```mermaid
flowchart TD
    A[User Action] --> B{Network Available?}
 B --> | Yes | C[Save Locally]
 B --> | No | C
    C --> D[Update UI Optimistically]
    D --> E{Network Available?}
 E --> | Yes | F[Sync to Server]
 E --> | No | G[Queue for Later]
    F --> H{Sync Success?}
 H --> | Yes | I[Mark as Synced]
 H --> | No | G
    G --> J[Retry on Network Change]
    J --> F

    style C fill:#006699,color:#fff
    style I fill:#00FF00,color:#000
```text

## Read vs Write Patterns

### Read Pattern (Typical)

1. Check AsyncStorage cache
2. Return cached data if fresh
3. Fetch from server in background (optional)
4. Update cache with server data
5. Re-render if data changed

### Write Pattern (Typical)

1. Validate input locally
2. Save to AsyncStorage immediately
3. Update UI optimistically
4. Queue server sync (if online)
5. Handle conflicts on sync response

## Performance Optimizations

### Data Loading

- **Lazy Loading:** Modules load data on-demand
- **Pagination:** Large lists fetch in chunks
- **Caching:** React Query caches API responses
- **Memoization:** Expensive calculations cached

### Data Persistence

- **Debouncing:** Frequent updates batched
- **Background Sync:** Non-blocking operations
- **Compression:** Large data compressed before storage
- **Incremental:** Only changed data persisted

## Related Documents

- [System Architecture](./system-architecture.md)
- [Module Relationships](./module-relationships.md)
- [API Documentation](../../technical/API_DOCUMENTATION.md)
