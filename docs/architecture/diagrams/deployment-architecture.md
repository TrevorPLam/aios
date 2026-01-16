# Deployment Architecture

## Overview

AIOS supports multiple deployment environments with automated CI/CD pipelines. This document outlines the deployment architecture for development, staging, and production environments.

## Environment Architecture

```mermaid
graph TB
    subgraph "Development"
        D1[Local Machine]
        D2[Expo Dev Server]
        D3[iOS Simulator]
        D4[Android Emulator]
        D5[Local Express Server]
        D6[Local PostgreSQL]
    end
    
    subgraph "Staging"
        S1[GitHub Actions]
        S2[Test Build]
        S3[Expo Cloud Build]
        S4[Staging Server]
        S5[Staging Database]
    end
    
    subgraph "Production"
        P1[App Store]
        P2[Google Play]
        P3[Production Server]
        P4[Production Database]
        P5[CDN]
    end
    
    D1 --> D2
    D2 --> D3
    D2 --> D4
    D1 --> D5
    D5 --> D6
    
    D1 -->|Push| S1
    S1 --> S2
    S2 --> S3
    S1 --> S4
    S4 --> S5
    
    S3 -->|Release| P1
    S3 -->|Release| P2
    S4 -->|Promote| P3
    S5 -->|Backup/Restore| P4
    P3 --> P5
    
    style P1 fill:#00D9FF,color:#000
    style P2 fill:#00D9FF,color:#000
    style P3 fill:#0099CC,color:#fff
```

## Development Environment

### Local Setup

```mermaid
graph LR
    A[Developer Machine] --> B[npm install]
    B --> C[Copy .env.example]
    C --> D[npm start]
    D --> E{Platform?}
    E -->|iOS| F[iOS Simulator]
    E -->|Android| G[Android Emulator]
    E -->|Both| H[Physical Device]
    
    style D fill:#00D9FF,color:#000
```

**Components:**

- **Node.js:** 18+
- **Expo CLI:** 54
- **iOS Simulator:** Xcode required (Mac only)
- **Android Emulator:** Android Studio
- **Express Server:** Local instance on port 5000
- **PostgreSQL:** Optional, for testing server features

**Environment Variables:**

```
NODE_ENV=development
EXPO_PUBLIC_DOMAIN=localhost:5000
API_URL=http://localhost:5000
DB_URL=postgresql://localhost:5432/aios_dev
JWT_SECRET=dev-secret-key
```

## Staging Environment

### CI/CD Pipeline

```mermaid
graph TB
    A[Git Push] --> B[GitHub Actions Trigger]
    B --> C{Branch?}
    C -->|main| D[Run Full Test Suite]
    C -->|feature| E[Run Fast Tests]
    D --> F{Tests Pass?}
    E --> F
    F -->|Yes| G[Build Client]
    F -->|No| H[Notify Developer]
    G --> I[Build Server]
    I --> J[Deploy to Staging]
    J --> K[Run E2E Tests]
    K --> L{E2E Pass?}
    L -->|Yes| M[Ready for Production]
    L -->|No| H
    
    style G fill:#00D9FF,color:#000
    style M fill:#00FF00,color:#000
```

**Components:**

- **CI/CD:** GitHub Actions
- **Build:** Expo EAS Build
- **Server:** Cloud hosting (e.g., Railway, Render)
- **Database:** Managed PostgreSQL
- **Monitoring:** Error tracking, performance monitoring

**Environment Variables:**

```
NODE_ENV=staging
EXPO_PUBLIC_DOMAIN=staging.aios.app
API_URL=https://api-staging.aios.app
DB_URL=postgresql://staging-db-url
JWT_SECRET=staging-secret-key
```

## Production Environment

### Infrastructure

```mermaid
graph TB
    subgraph "Client Distribution"
        A[App Store Connect]
        B[Google Play Console]
    end
    
    subgraph "Backend Services"
        C[Production Server]
        D[Load Balancer]
        E[Database Primary]
        F[Database Replica]
    end
    
    subgraph "Supporting Services"
        G[CDN Assets]
        H[Monitoring]
        I[Analytics]
        J[Error Tracking]
    end
    
    A --> K[iOS Users]
    B --> L[Android Users]
    K --> D
    L --> D
    D --> C
    C --> E
    E --> F
    C --> G
    C --> H
    C --> I
    C --> J
    
    style C fill:#00D9FF,color:#000
    style E fill:#0099CC,color:#fff
```

**Components:**

- **Client Apps:** Distributed via App Store and Google Play
- **API Server:** High-availability Express cluster
- **Database:** PostgreSQL with replication
- **CDN:** Static asset delivery
- **Monitoring:** Uptime, performance, errors
- **Analytics:** User behavior tracking (privacy-respecting)

**Environment Variables:**

```
NODE_ENV=production
EXPO_PUBLIC_DOMAIN=aios.app
API_URL=https://api.aios.app
DB_URL=postgresql://production-db-url
JWT_SECRET=production-secret-key
```

## Deployment Workflows

### Feature Deployment

```mermaid
flowchart LR
    A[Feature Branch] -->|PR| B[Code Review]
    B -->|Approved| C[Merge to main]
    C --> D[Auto-deploy to Staging]
    D --> E[QA Testing]
    E -->|Pass| F[Tag Release]
    F --> G[Deploy to Production]
    
    style G fill:#00FF00,color:#000
```

### Hotfix Deployment

```mermaid
flowchart LR
    A[Hotfix Branch] -->|Fast Track| B[Critical Review]
    B --> C[Merge to main]
    C --> D[Skip Staging]
    D --> E[Direct to Production]
    E --> F[Monitor Closely]
    
    style E fill:#FF6600,color:#fff
```

## Mobile App Updates

### Over-The-Air (OTA) Updates

```mermaid
graph LR
    A[JS Bundle Change] --> B[Expo Publish]
    B --> C[CDN Distribution]
    C --> D[App Checks on Launch]
    D --> E{Update Available?}
    E -->|Yes| F[Download Bundle]
    E -->|No| G[Use Current]
    F --> H[Apply on Next Restart]
    
    style B fill:#00D9FF,color:#000
```

**What can be updated via OTA:**

- JavaScript code
- React components
- Business logic
- Styling and assets

**What requires native build:**

- Native dependencies
- Expo SDK version
- App permissions
- iOS/Android configurations

### Native App Updates

```mermaid
graph TB
    A[Native Code Change] --> B[Expo Build]
    B --> C[Upload to Stores]
    C --> D[App Review]
    D --> E{Approved?}
    E -->|Yes| F[Published]
    E -->|No| G[Fix Issues]
    G --> B
    F --> H[Users Download Update]
    
    style F fill:#00FF00,color:#000
```

## Build Process

### Client Build

```mermaid
graph LR
    A[Source Code] --> B[TypeScript Compile]
    B --> C[Babel Transform]
    C --> D[Metro Bundle]
    D --> E{Platform?}
    E -->|iOS| F[Xcode Build]
    E -->|Android| G[Gradle Build]
    F --> H[.ipa file]
    G --> I[.apk/.aab file]
    
    style D fill:#00D9FF,color:#000
```

**Build Commands:**

```bash
# Development build
npm run start

# Production build
npm run expo:static:build

# Platform-specific
npx expo build:ios
npx expo build:android
```

### Server Build

```mermaid
graph LR
    A[TypeScript Code] --> B[esbuild Bundle]
    B --> C[Single JS File]
    C --> D[Deploy to Server]
    
    style B fill:#00D9FF,color:#000
```

**Build Commands:**

```bash
# Build server
npm run server:build

# Run production
npm run server:prod
```

## Database Migrations

```mermaid
graph TB
    A[Schema Change] --> B[Create Migration]
    B --> C[Test Locally]
    C --> D[Review & Approve]
    D --> E[Deploy to Staging]
    E --> F{Migration Success?}
    F -->|Yes| G[Deploy to Production]
    F -->|No| H[Rollback & Fix]
    G --> I[Monitor Performance]
    
    style G fill:#00FF00,color:#000
    style H fill:#FF0000,color:#fff
```

**Migration Commands:**

```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push

# Rollback (manual SQL)
psql -d $DB_URL -f rollback.sql
```

## Monitoring & Observability

### Health Check Flow

```mermaid
sequenceDiagram
    participant M as Monitoring Service
    participant S as Server
    participant D as Database
    participant A as Alert System
    
    M->>S: GET /health
    S->>D: Query Test
    D-->>S: Response
    S-->>M: Health Status
    
    alt Unhealthy
        M->>A: Trigger Alert
        A->>A: Notify Team
    end
```

**Monitoring Metrics:**

- **Uptime:** 99.9% target
- **Response Time:** < 200ms p95
- **Error Rate:** < 0.1%
- **Database Queries:** < 50ms average
- **Memory Usage:** < 80% capacity
- **CPU Usage:** < 70% average

## Security Considerations

### Production Security Layers

```mermaid
graph TB
    A[User Request] --> B[CDN/WAF]
    B --> C[Load Balancer]
    C --> D[SSL/TLS Termination]
    D --> E[API Gateway]
    E --> F[Rate Limiting]
    F --> G[JWT Validation]
    G --> H[Application Server]
    H --> I[Database Encryption]
    
    style D fill:#006699,color:#fff
    style G fill:#006699,color:#fff
    style I fill:#006699,color:#fff
```

**Security Measures:**

- HTTPS enforced (TLS 1.3)
- JWT token authentication
- Rate limiting (100 req/min per IP)
- Database encryption at rest
- Regular security audits (CodeQL)
- Dependency vulnerability scanning
- OWASP Top 10 compliance

## Disaster Recovery

### Backup Strategy

```mermaid
graph LR
    A[Production DB] -->|Continuous| B[Write-Ahead Logs]
    A -->|Daily| C[Full Backup]
    A -->|Hourly| D[Incremental Backup]
    C --> E[S3 Storage]
    D --> E
    B --> E
    E -->|Restore| F[Recovery Instance]
    
    style E fill:#006699,color:#fff
```

**Recovery Time Objectives:**

- **RPO (Recovery Point Objective):** < 1 hour
- **RTO (Recovery Time Objective):** < 4 hours
- **Backup Retention:** 30 days
- **Geo-Redundancy:** Multi-region backups

## Rollback Strategy

```mermaid
graph TB
    A[Deployment Issue Detected] --> B{Severity?}
    B -->|Critical| C[Immediate Rollback]
    B -->|High| D[Scheduled Rollback]
    B -->|Low| E[Fix Forward]
    
    C --> F[Restore Previous Version]
    D --> F
    F --> G[Verify Health]
    G --> H{Healthy?}
    H -->|Yes| I[Monitor]
    H -->|No| J[Escalate]
    
    style C fill:#FF0000,color:#fff
    style I fill:#00FF00,color:#000
```

## Environment Comparison

| Aspect          | Development    | Staging            | Production          |
|-----------------|----------------|--------------------|--------------------|
| Database        | Local/Mock      | Cloud DB            | Replicated DB       |
| Server          | localhost:5000  | staging.aios.app    | aios.app            |
| Monitoring      | Console logs    | Basic monitoring    | Full observability  |
| Error Tracking  | Local only      | Sentry staging      | Sentry production   |
| Analytics       | Disabled        | Sample rate 10%     | Full tracking       |
| Cache           | Memory only     | Redis (optional)    | Redis + CDN         |
| Backups         | None            | Daily               | Continuous          |
| SSL             | Not required    | Required            | Required            |
| Rate Limiting   | Disabled        | Relaxed             | Enforced            |
| Auto-scaling    | No              | No                  | Yes                 |

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Rollback plan documented

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check monitoring dashboards
- [ ] Verify feature functionality
- [ ] Load test if major changes

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify analytics events
- [ ] Update changelog
- [ ] Notify stakeholders

## Related Documents

- [System Architecture](./system-architecture.md)
- [CI/CD Configuration](../../../.github/workflows/)
- [Testing Instructions](../../technical/TESTING_INSTRUCTIONS.md)
