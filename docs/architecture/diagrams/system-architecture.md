# System Architecture

## Overview

AIOS is built as a mobile-first application using React Native with a modular architecture. The system consists of three main layers: client (mobile app), server (API), and storage (AsyncStorage/PostgreSQL).

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Native App]
        A1[14 Module Screens]
        A2[Navigation System]
        A3[State Management]
        A4[Local Storage]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end

    subgraph "Communication Layer"
        B[REST API]
        C[WebSocket]
    end

    subgraph "Server Layer"
        D[Express Server]
        D1[Middleware]
        D2[API Routes]
        D3[JWT Auth]
        D --> D1
        D --> D2
        D --> D3
    end

    subgraph "Storage Layer"
        E[AsyncStorage<br/>Local First]
        F[PostgreSQL<br/>Server DB]
    end

    subgraph "External Services"
        G[AI Engine]
        H[Analytics]
    end

 A --> | HTTP Requests | B
 A --> | Real-time | C
    B --> D
    C --> D
    A --> E
    D --> F
 A -.-> | Optional | G
 A -.-> | Telemetry | H

    style A fill:#00D9FF,color:#000
    style D fill:#0099CC,color:#fff
    style E fill:#006699,color:#fff
    style F fill:#006699,color:#fff
```text

## Component Details

### Client Layer (React Native)

#### Technologies
- React Native 0.81.5
- React 19.1.0
- Expo 54
- TypeScript 5.9

### Key Components
- **Screens:** 40+ screen components (14 modules)
- **Navigation:** React Navigation (bottom tabs + native stack)
- **State:** Context API + React Query
- **Storage:** AsyncStorage (privacy-first, local-first)
- **Animations:** React Native Reanimated 4.1
- **UI:** Custom components with dark-first design

### Server Layer (Express)

#### Technologies (2)
- Express 4.21
- TypeScript
- JWT for authentication
- WebSocket support (ws 8.18)

### Responsibilities
- API endpoints for data sync
- Authentication & authorization
- Business logic processing
- Real-time communication hub

### Storage Layer

#### Local Storage (AsyncStorage)
- Primary data store (privacy-first)
- Offline-first architecture
- Key-value store
- JSON serialization

### Server Database (PostgreSQL)
- Drizzle ORM 0.39
- Optional sync target
- Backup and cross-device sync
- Relational data modeling

## Communication Patterns

### REST API

- Client → Server: CRUD operations
- JWT authentication headers
- JSON data format
- RESTful endpoints

### WebSocket

- Server → Client: Real-time updates
- Bi-directional communication
- Event-based messaging
- Configured but optional

### Local-First

- Data created/modified locally first
- Background sync when online
- Conflict resolution strategies
- Full offline capability

## Technology Stack Summary

| Layer | Technology | Version |
| ------------------- | ------------------------ | --------- |
| Client Framework | React Native | 0.81.5 |
| UI Library | Expo | 54 |
| Language | TypeScript | 5.9 |
| Server | Express | 4.21 |
| Local DB | AsyncStorage | 2.2 |
| Server DB | PostgreSQL + Drizzle | 0.39 |
| Auth | JWT | 9.0 |
| Real-time | WebSocket | 8.18 |
| State | React Query | 5.90 |
| Animation | Reanimated | 4.1 |

## Scalability Considerations

1. **Modular Architecture:** Each module is independent and can scale separately
2. **Local-First:** Reduces server load, improves performance
3. **Async Operations:** Non-blocking I/O throughout
4. **Caching:** React Query for intelligent caching
5. **Code Splitting:** Module-based loading ready

## Security Architecture

- JWT tokens for authentication
- HTTPS for all API communication
- Local data encryption (AsyncStorage)
- No sensitive data in logs
- Regular security audits (CodeQL)

## Related Documents

- [Data Flow Diagram](./data-flow.md)
- [Module Relationships](./module-relationships.md)
- [Deployment Architecture](./deployment-architecture.md)
- [API Documentation](../../technical/API_DOCUMENTATION.md)
