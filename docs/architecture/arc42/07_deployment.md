# Deployment View

## Plain English Summary

This document describes where and how AIOS runs. The mobile app runs on users' iOS/Android devices (installed via App Store/Play Store or Expo Go for development). The backend server runs on Node.js (currently local development, future: cloud hosting). Data is stored locally on devices in AsyncStorage, with future cloud sync to PostgreSQL. Development uses Expo for bundling and hot reload, production uses static builds.

---

## Infrastructure Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                   Production Environment                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              User Devices                            │   │
│  │                                                       │   │
│  │  ┌──────────────┐         ┌──────────────┐         │   │
│  │  │   iPhone     │         │   Android    │         │   │
│  │  │              │         │              │         │   │
│  │  │  AIOS App    │         │  AIOS App    │         │   │
│  │  │  (Native)    │         │  (Native)    │         │   │
│  │  │              │         │              │         │   │
│  │  │  AsyncStorage│         │  AsyncStorage│         │   │
│  │  │  (6-10MB)    │         │  (6-10MB)    │         │   │
│  │  └──────┬───────┘         └──────┬───────┘         │   │
│  │         │                        │                  │   │
│  └─────────┼────────────────────────┼──────────────────┘   │
│            │                        │                       │
│            │    HTTPS (REST API)    │                       │
│            └────────────┬───────────┘                       │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────┐    │
│  │           Cloud Server (Future)                    │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐  │    │
│  │  │   Node.js Runtime                           │  │    │
│  │  │                                             │  │    │
│  │  │  AIOS Backend (Express)                    │  │    │
│  │  │  - REST API                                │  │    │
│  │  │  - JWT Authentication                      │  │    │
│  │  │  - Business Logic                          │  │    │
│  │  │                                             │  │    │
│  │  │  Port: 5000                                │  │    │
│  │  └──────────────────┬──────────────────────────┘  │    │
│  │                     │                              │    │
│  │  ┌──────────────────▼──────────────────────────┐  │    │
│  │  │   PostgreSQL Database                       │  │    │
│  │  │   - User accounts                           │  │    │
│  │  │   - Synced data                             │  │    │
│  │  │   - Backup/restore                          │  │    │
│  │  └─────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```text

---

## Development Environment

### Local Development Setup

```text
┌──────────────────────────────────────────────────────────┐
│               Developer Machine                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │   /home/runner/work/Mobile-Scaffold/               │ │
│  │   Mobile-Scaffold/                                 │ │
│  │                                                     │ │
│  │   ┌─────────────────┐   ┌─────────────────┐      │ │
│  │   │    /client      │   │    /server      │      │ │
│  │   │  React Native   │   │  Express API    │      │ │
│  │   │  Source Code    │   │  Source Code    │      │ │
│  │   └────────┬────────┘   └────────┬────────┘      │ │
│  │            │                     │                │ │
│  │            ▼                     ▼                │ │
│  │   ┌─────────────────┐   ┌─────────────────┐      │ │
│  │   │  Expo CLI       │   │  tsx / ts-node  │      │ │
│  │   │  (Metro bundler)│   │  (TypeScript)   │      │ │
│  │   └────────┬────────┘   └────────┬────────┘      │ │
│  │            │                     │                │ │
│  └────────────┼─────────────────────┼────────────────┘ │
│               │                     │                   │
│               │                     │                   │
│  ┌────────────▼─────────────────────▼────────────────┐ │
│  │        Expo Dev Server                             │ │
│  │        http://localhost:19000                      │ │
│  │        - QR code for device connection             │ │
│  │        - Hot reload                                │ │
│  │        - Debug menu                                │ │
│  └────────────┬───────────────────────────────────────┘ │
│               │                                          │
│               │ WebSocket / HTTP                        │
│               │                                          │
│  ┌────────────▼───────────────────────────────────────┐ │
│  │   Test Devices                                     │ │
│  │                                                     │ │
│  │   ┌──────────────┐    ┌──────────────┐           │ │
│  │   │iOS Simulator │    │Expo Go App   │           │ │
│  │   │(Xcode)       │    │(Physical iOS)│           │ │
│  │   └──────────────┘    └──────────────┘           │ │
│  │                                                     │ │
│  │   ┌──────────────┐    ┌──────────────┐           │ │
│  │   │Android Emu   │    │Expo Go App   │           │ │
│  │   │(Android Std) │    │(Physical And)│           │ │
│  │   └──────────────┘    └──────────────┘           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘
```text

### Commands
```bash
# Terminal 1: Start mobile app
npm run expo:dev
# Opens Expo Dev Server at http://localhost:19000
# Metro bundler runs on http://localhost:8081

# Terminal 2: Start backend server
npm run server:dev
# Server runs at http://localhost:5000
```text

## Environment Variables
```bash
# .env.example
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here

# Replit-specific (for cloud IDE)
EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN
REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN
EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN:5000
```text

---

## Mobile App Deployment

### iOS Deployment

#### Development
```text
Source Code → Expo CLI → Metro Bundler → iOS Simulator / Expo Go
```text

### Production
```text
Source Code → Expo Build → App Store Connect → TestFlight → App Store
```text

### Files
- `/app.json` - Expo configuration
- `/ios/` - Native iOS project (if ejected from Expo)
- `/.ipa` - iOS app bundle (generated by Expo build)

### Build Command
```bash
# Development build (for testing)
npx expo run:ios

# Production build (for App Store)
eas build --platform ios --profile production
```text

### Requirements
- macOS with Xcode (for local builds)
- Apple Developer Account (for App Store)
- Provisioning profiles and certificates
- Minimum iOS 13

### Distribution
- **Development:** Expo Go app (scan QR code)
- **Staging:** TestFlight (invite-only)
- **Production:** App Store (public release)

### Android Deployment

#### Development (2)
```text
Source Code → Expo CLI → Metro Bundler → Android Emulator / Expo Go
```text

### Production (2)
```text
Source Code → Expo Build → Google Play Console → Internal Testing → Production
```text

### Files (2)
- `/app.json` - Expo configuration
- `/android/` - Native Android project (if ejected)
- `/.apk` or `.aab` - Android app bundle (generated by Expo build)

### Build Command (2)
```bash
# Development build
npx expo run:android

# Production build (for Play Store)
eas build --platform android --profile production
```text

### Requirements (2)
- Android Studio + SDK (for local builds)
- Google Play Developer Account (for Play Store)
- Signing keystore
- Minimum Android 10 (SDK 29)

### Distribution (2)
- **Development:** Expo Go app (scan QR code)
- **Staging:** Internal testing track
- **Production:** Google Play Store

---

## Backend Server Deployment

### Current: Local Development

#### Runtime
- Node.js 18+
- tsx for TypeScript execution
- PORT 5000 (default)

### Start Command
```bash
npm run server:dev
# Runs: NODE_ENV=development tsx server/index.ts
```text

## Process
```text
server/index.ts → tsx (TypeScript loader) → Node.js → Express Server
```text

### Future: Production Server

#### Options
#### Option 1: Cloud Platform (Heroku, Railway, Fly.io)

```text
┌──────────────────────────────────────────┐
│        Cloud Platform                    │
├──────────────────────────────────────────┤
│                                           │
│  ┌────────────────────────────────────┐  │
│  │   Container / Dyno                 │  │
│  │                                     │  │
│  │   Node.js 18                       │  │
│  │   - Express server                 │  │
│  │   - Environment variables          │  │
│  │   - Auto-scaling                   │  │
│  │                                     │  │
│  │   PORT: $PORT (dynamic)            │  │
│  └─────────────┬──────────────────────┘  │
│                │                          │
│  ┌─────────────▼──────────────────────┐  │
│  │   Managed PostgreSQL               │  │
│  │   - Automatic backups              │  │
│  │   - Connection pooling             │  │
│  └────────────────────────────────────┘  │
│                                           │
└──────────────────────────────────────────┘
```text

### Build Command (3)
```bash
npm run server:build
# Outputs: /server_dist/index.js

npm run server:prod
# Runs: NODE_ENV=production node server_dist/index.js
```text

## Deployment
```bash
# Push to Git
git push heroku main

# Or use container
docker build -t aios-backend .
docker push registry.heroku.com/aios/web
heroku container:release web
```text

#### Option 2: Serverless (Vercel, Netlify Functions)

### Structure
```text
/api/
├── auth.ts         → /api/auth/*
├── notes.ts        → /api/notes/*
└── recommendations.ts → /api/recommendations/*
```text

### Pros
- Auto-scaling
- Pay per request
- No server management

### Cons
- Cold starts
- WebSocket limitations
- Stateless (need external DB)

---

## Database Deployment

### Current: In-Memory Storage

**Location:** `/server/storage.ts`

### Structure (2)
```typescript
// In-memory storage (lost on restart)
const users = new Map<string, User>();
const notes = new Map<string, Note[]>();
const tasks = new Map<string, Task[]>();
```text

### Pros (2)
- Simple
- Fast
- No setup required

### Cons (2)
- Data lost on restart
- No persistence
- Single server only

### Future: PostgreSQL

#### Deployment Options
#### Managed Database (Recommended)

### Providers
- **Supabase:** Free tier, managed PostgreSQL + Auth + Storage
- **Neon:** Serverless Postgres with auto-scaling
- **AWS RDS:** Enterprise-grade, high availability
- **Google Cloud SQL:** Managed with automatic backups

### Configuration
```typescript
// /drizzle.config.ts
export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};
```text

### Connection
```typescript
// /server/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);
```text

### Migrations
```bash
# Generate migration
npm run db:generate

# Push to database
npm run db:push

# Or use migrations
npm run db:migrate
```text

#### Self-Hosted PostgreSQL

### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: aios
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: aios_production
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```text

### Start
```bash
docker-compose up -d
```text

---

## CI/CD Pipeline

### GitHub Actions Workflow

#### Files
- `.github/workflows/test.yml` - Run tests on PR
- `.github/workflows/codeql.yml` - Security scanning
- `.github/workflows/build.yml` - Build app (future)
- `.github/workflows/deploy.yml` - Deploy to production (future)

### Test Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm install
      - run: npm test
      - run: npm run lint
      - run: npm run check:types
      - run: npm audit
```text

### Build & Deploy Workflow (Future)
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: eas build --platform all --profile production
      - run: eas submit --platform all

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run server:build
      - run: heroku container:push web
      - run: heroku container:release web
```text

---

## Monitoring and Logging (Future)

### Application Monitoring

#### Options (2)
- **Sentry:** Error tracking and performance monitoring
- **LogRocket:** Session replay and debugging
- **New Relic:** APM and infrastructure monitoring

### Implementation
```typescript
// /client/utils/errorReporting.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

export const logError = (error: Error) => {
  console.error(error);
  Sentry.captureException(error);
};
```text

### Server Logging

```typescript
// /server/middleware/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```text

### Analytics

#### Options (3)
- **Expo Analytics:** Built-in usage analytics
- **Mixpanel:** Event tracking and user analytics
- **Google Analytics:** Web analytics (if web platform enabled)

---

## Scaling Strategy (Future)

### Phase 1: Single Server (Current)

- 1 Node.js server
- In-memory storage
- < 1,000 users

### Phase 2: Managed Services (Next)

- Managed PostgreSQL (Supabase/Neon)
- Single Node.js server (auto-restart)
- 1,000 - 10,000 users

### Phase 3: Horizontal Scaling

- Multiple Node.js servers (load balanced)
- PostgreSQL read replicas
- Redis for caching
- CDN for static assets
- 10,000 - 100,000 users

### Phase 4: Microservices (Future)

- Separate services (auth, AI, notifications)
- Message queue (RabbitMQ, AWS SQS)
- Kubernetes orchestration
- 100,000+ users

---

## Assumptions

1. **Mobile Apps:** Distributed via App Store and Play Store
2. **Backend:** Initially single server, scales horizontally later
3. **Database:** PostgreSQL sufficient for 1M+ users
4. **Network:** Users have intermittent connectivity (offline-first)
5. **Storage:** AsyncStorage (6-10MB) adequate for local data
6. **CI/CD:** GitHub Actions provides sufficient automation
7. **Monitoring:** Sentry/LogRocket provide adequate error tracking
8. **Hosting:** Cloud platform (Heroku, Railway) sufficient for MVP

---

## Failure Modes

### Deployment Failures

1. **Build Failure:**
   - **Impact:** Cannot deploy new version
   - **Mitigation:** Automated tests in CI/CD, rollback capability
   - **Recovery:** Fix build error, rerun deployment

2. **Database Migration Failure:**
   - **Impact:** App cannot connect to database
   - **Mitigation:** Test migrations in staging, backup before migration
   - **Recovery:** Rollback migration, restore backup

3. **Server Crash:**
   - **Impact:** API unavailable, no cloud sync
   - **Mitigation:** Auto-restart (PM2, Kubernetes), health checks
   - **Recovery:** Automatic restart, load balancer redirects

4. **Storage Overflow:**
   - **Impact:** AsyncStorage full, cannot save data
   - **Mitigation:** Data pruning, archive old data, migrate to SQLite
   - **Recovery:** User manually archives data

---

## How to Verify

### Verify Development Setup

```bash
# Clone repository
git clone https://github.com/TrevorPowellLam/Mobile-Scaffold.git
cd Mobile-Scaffold

# Install dependencies
npm install

# Start mobile app
npm run expo:dev
# Should open Expo Dev Server at http://localhost:19000

# Start backend (separate terminal)
npm run server:dev
# Should start server at http://localhost:5000
```text

### Verify Production Build

```bash
# Build mobile app
npm run expo:static:build

# Build backend
npm run server:build
ls -la server_dist/

# Run production server
npm run server:prod
# Should start at PORT 5000 or $PORT
```text

### Verify CI/CD

```bash
# Check workflows
ls -la .github/workflows/

# Run tests locally (simulates CI)
npm test
npm run lint
npm run check:types
npm audit
```text

### Verify Deployment Configuration

```bash
# Check Expo config
cat app.json

# Check build config
cat drizzle.config.ts

# Check TypeScript config
cat tsconfig.json
```text

---

## Related Documentation

- [Building Blocks](05_building_blocks.md) - Components being deployed
- [Runtime View](06_runtime.md) - How deployed components interact
- [System Context](03_context.md) - External dependencies
- [Constraints](02_constraints.md) - Platform requirements
- [README.md](../../../README.md) - Installation and running instructions
