# Diamond++ Architecture Migration Diagrams

This document contains visual diagrams for the Diamond++ architecture migration.

## Target Architecture (End State)

```mermaid
graph TD
    subgraph "Apps (Thin Shells)"
        Mobile[apps/mobile<br/>React Native]
        Web[apps/web<br/>React]
        API[apps/api<br/>Express]
    end
    
    subgraph "Packages (Reusable)"
        Features[packages/features/*<br/>calendar, contacts, etc.]
        Contracts[packages/contracts<br/>schemas, types]
        Platform[packages/platform<br/>storage, network]
        DesignSystem[packages/design-system<br/>UI primitives]
    end
    
    Mobile --> Features
    Web --> Features
    API --> Features
    
    Features --> Platform
    Features --> Contracts
    Features --> DesignSystem
    
    Platform --> Contracts
    DesignSystem --> Contracts
    
    style Mobile fill:#00D9FF,stroke:#fff,color:#000
    style Web fill:#00D9FF,stroke:#fff,color:#000
    style API fill:#00D9FF,stroke:#fff,color:#000
    style Features fill:#00FF94,stroke:#fff,color:#000
    style Platform fill:#FFB800,stroke:#000,color:#000
    style Contracts fill:#FF3B5C,stroke:#fff,color:#fff
    style DesignSystem fill:#FFB800,stroke:#000,color:#000
```

## Feature Package Anatomy

```mermaid
graph TD
    subgraph "Feature Package (e.g., calendar)"
        Domain[domain/<br/>Pure business logic<br/>No React, no storage]
        Data[data/<br/>Repositories, queries<br/>Can use platform]
        UI[ui/<br/>Components<br/>No routing]
        Index[index.ts<br/>Public API only]
    end
    
    App[App Screen] --> Index
    Index --> Domain
    Index --> Data
    Index --> UI
    
    Data --> Domain
    UI --> Domain
    
    Data --> Platform[platform/storage]
    UI --> DesignSystem[design-system]
    
    style Domain fill:#00FF94,stroke:#fff,color:#000
    style Data fill:#FFB800,stroke:#000,color:#000
    style UI fill:#00D9FF,stroke:#fff,color:#000
    style Index fill:#FF3B5C,stroke:#fff,color:#fff
```

## Migration Phases Timeline

```mermaid
gantt
    title Diamond++ Migration Timeline
    dateFormat YYYY-MM-DD
    section Phase 0
    Repo Normalization           :p0, 2026-01-23, 1w
    section Phase 1
    Contracts Extraction          :p1, after p0, 1w
    section Phase 2
    Platform Creation             :p2, after p1, 3w
    section Phase 3
    Pilot Feature                 :p3, after p2, 2w
    section Phase 4
    Design System                 :p4, after p2, 2w
    section Phase 5
    Feature Extraction (Parallel) :crit, p5, after p3, 6w
    section Phase 6
    Web App                       :p6, after p5, 2w
    section Phase 7
    API Alignment                 :p7, after p5, 2w
```

## Current vs Target Structure

### Current (Before Migration)

```mermaid
graph TD
    subgraph "Current Structure"
        Client[client/<br/>5747-line database.ts<br/>45+ screens<br/>Interwoven concerns]
        Server[server/<br/>API routes]
        Shared[shared/<br/>Some types]
    end
    
    Client -.->|uses| Shared
    Server -.->|uses| Shared
    
    style Client fill:#FF3B5C,stroke:#fff,color:#fff
    style Server fill:#FFB800,stroke:#000,color:#000
    style Shared fill:#666,stroke:#fff,color:#fff
```

### Target (After Migration)

```mermaid
graph TD
    subgraph "Apps"
        Mobile[mobile/<br/><200 line screens<br/>Composition only]
        Web[web/<br/>Pages]
        API[api/<br/>Routes]
    end
    
    subgraph "Packages"
        Cal[features/calendar]
        Con[features/contacts]
        Bud[features/budget]
        More[features/...]
        Plat[platform]
        Cont[contracts]
        DS[design-system]
    end
    
    Mobile --> Cal
    Mobile --> Con
    Mobile --> Bud
    Mobile --> More
    
    Web --> Cal
    Web --> Con
    
    API --> Cal
    API --> Con
    
    Cal --> Plat
    Con --> Plat
    Bud --> Plat
    More --> Plat
    
    Cal --> Cont
    Con --> Cont
    
    Cal --> DS
    Con --> DS
    
    style Mobile fill:#00D9FF,stroke:#fff,color:#000
    style Web fill:#00D9FF,stroke:#fff,color:#000
    style API fill:#00D9FF,stroke:#fff,color:#000
    style Cal fill:#00FF94,stroke:#fff,color:#000
    style Con fill:#00FF94,stroke:#fff,color:#000
    style Bud fill:#00FF94,stroke:#fff,color:#000
    style More fill:#00FF94,stroke:#fff,color:#000
    style Plat fill:#FFB800,stroke:#000,color:#000
    style Cont fill:#FF3B5C,stroke:#fff,color:#fff
    style DS fill:#FFB800,stroke:#000,color:#000
```

## Dependency Flow Rules

```mermaid
graph LR
    Apps[Apps] -->|can import| Features[Features]
    Features -->|can import| Platform[Platform]
    Features -->|can import| Contracts[Contracts]
    Features -->|can import| DesignSystem[Design System]
    Platform -->|can import| Contracts
    DesignSystem -->|can import| Contracts
    
    Features -.->|CANNOT import| Features
    Platform -.->|CANNOT import| Features
    Contracts -.->|CANNOT import| Features
    DesignSystem -.->|CANNOT import| Features
    
    Domain[domain/] -.->|CANNOT import| React[React/RN]
    Domain -.->|CANNOT import| Storage[Storage APIs]
    Domain -.->|CANNOT import| HTTP[HTTP clients]
    
    style Apps fill:#00D9FF,stroke:#fff,color:#000
    style Features fill:#00FF94,stroke:#fff,color:#000
    style Platform fill:#FFB800,stroke:#000,color:#000
    style Contracts fill:#FF3B5C,stroke:#fff,color:#fff
    style DesignSystem fill:#FFB800,stroke:#000,color:#000
```

## Phase 5: Parallel Feature Extraction

```mermaid
graph TD
    Start[45+ Features in Apps] --> Split[Split into Work Queues]
    
    Split --> Q1[High Value, Low Complexity]
    Split --> Q2[High Value, High Complexity]
    Split --> Q3[Lower Priority]
    
    Q1 --> AI1[AI Agent 1: Notes]
    Q1 --> AI2[AI Agent 2: Contacts]
    Q1 --> AI3[AI Agent 3: Tasks]
    
    Q2 --> AI4[AI Agent 4: Calendar]
    Q2 --> AI5[AI Agent 5: Budget]
    Q2 --> AI6[AI Agent 6: Email]
    
    Q3 --> AI7[AI Agent 7+: Other features]
    
    AI1 --> Review1[Human Review]
    AI2 --> Review2[Human Review]
    AI3 --> Review3[Human Review]
    AI4 --> Review4[Human Review]
    AI5 --> Review5[Human Review]
    AI6 --> Review6[Human Review]
    AI7 --> Review7[Human Review]
    
    Review1 --> Merge[Sequential Merge]
    Review2 --> Merge
    Review3 --> Merge
    Review4 --> Merge
    Review5 --> Merge
    Review6 --> Merge
    Review7 --> Merge
    
    Merge --> Done[All Features Extracted]
    
    style Start fill:#FF3B5C,stroke:#fff,color:#fff
    style Split fill:#FFB800,stroke:#000,color:#000
    style Done fill:#00FF94,stroke:#fff,color:#000
    
    style AI1 fill:#00D9FF,stroke:#fff,color:#000
    style AI2 fill:#00D9FF,stroke:#fff,color:#000
    style AI3 fill:#00D9FF,stroke:#fff,color:#000
    style AI4 fill:#00D9FF,stroke:#fff,color:#000
    style AI5 fill:#00D9FF,stroke:#fff,color:#000
    style AI6 fill:#00D9FF,stroke:#fff,color:#000
    style AI7 fill:#00D9FF,stroke:#fff,color:#000
```

## Color Key

- **Electric Blue (#00D9FF):** Apps and UI components
- **Success Green (#00FF94):** Features and domain logic
- **Warning Yellow (#FFB800):** Platform and design system
- **Error Red (#FF3B5C):** Contracts and critical boundaries

---

**Related Documents:**
- [Diamond++ Migration Plan](./DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md)
- [Diamond++ Quick Reference](./DIAMOND_QUICK_REFERENCE.md)
- [ADR-008](../decisions/008-diamond-architecture-migration.md)
