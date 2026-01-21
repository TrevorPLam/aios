# Server Module (Backend API)

**Location:** `server/`  
**Language:** TypeScript, JavaScript  
**Framework:** Node.js, Express  
**Status:** Active

## Plain English Summary

The server module is the backend REST API that powers the mobile application. Built with Node.js and Express, it handles all business logic, data persistence, authentication, and provides RESTful endpoints for the mobile client to consume.

## Purpose

### What This Module Does
- Provides REST API endpoints for client applications
- Manages authentication and authorization
- Implements business logic and data validation
- Persists data to database
- Handles file uploads and processing
- Sends push notifications
- Integrates with external services
- Manages background jobs and scheduled tasks

### What This Module Does NOT Do
- Does NOT render UI (that's the client's job)
- Does NOT trust client-side validation (always validates server-side)
- Does NOT store passwords in plain text (uses hashing)
- Does NOT expose internal implementation details in API responses

### Key Use Cases
1. User authentication and session management
2. CRUD operations for application data
3. File upload and processing
4. Third-party API integration
5. Background job processing

## Technical Detail

### Architecture Overview

```
server/
├── src/
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── models/            # Database models (Drizzle ORM)
│   ├── middleware/        # Express middleware
│   ├── validators/        # Request validation schemas
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── config/            # Configuration files
│   └── jobs/              # Background jobs
├── tests/
├── drizzle/               # Database migrations
├── server.ts              # Entry point
├── package.json
└── tsconfig.json
```

### Key Components

#### Component 1: Express Application
**Location:** `server/src/server.ts`  
**Purpose:** Main Express app configuration and startup  
**Interface:**
```typescript
// Express app with middleware
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/api', routes);
```

#### Component 2: Authentication Middleware
**Location:** `server/src/middleware/auth.ts`  
**Purpose:** Validates JWT tokens and protects routes  
**Interface:**
```typescript
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Validates JWT from Authorization header
  // Attaches user to req.user
};
```

#### Component 3: Database Service
**Location:** `server/src/services/database.ts`  
**Purpose:** Database connection and query execution  
**Interface:**
```typescript
export class DatabaseService {
  query<T>(sql: string, params: unknown[]): Promise<T[]>;
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
}
```

#### Component 4: API Controllers
**Location:** `server/src/controllers/`  
**Purpose:** Handle HTTP requests, call services, return responses  
**Interface:**
```typescript
export class UserController {
  async getUser(req: Request, res: Response): Promise<Response>;
  async updateUser(req: Request, res: Response): Promise<Response>;
  async deleteUser(req: Request, res: Response): Promise<Response>;
}
```

### Data Flow

```
[Client Request] → [Express Router] → [Middleware] → [Controller] → [Service] → [Database]
                                                                          ↓
                   [JSON Response] ←──────────────────────────────────────┘
```

1. Client sends HTTP request
2. Express routes to appropriate controller
3. Middleware validates auth, rate limits, etc.
4. Controller validates input and calls service
5. Service executes business logic and database operations
6. Response flows back through the chain

### State Management

The server is stateless - each request is independent:
- **Authentication:** JWT tokens (client stores, server validates)
- **Session Data:** Stored in database, not in memory
- **Caching:** Redis for frequently accessed data
- **Background Jobs:** Queue system (Bull/BullMQ)

### Error Handling

```typescript
// Centralized error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message, details: err.details });
  }
  
  if (err instanceof AuthenticationError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Default to 500 for unknown errors
  return res.status(500).json({ error: 'Internal server error' });
});
```

## APIs and Interfaces

### Public API

The server exposes a REST API documented with OpenAPI:

#### Authentication Endpoints
```typescript
POST   /api/auth/register       // Register new user
POST   /api/auth/login          // Login
POST   /api/auth/logout         // Logout
POST   /api/auth/refresh        // Refresh token
POST   /api/auth/reset-password // Password reset
```

#### User Endpoints
```typescript
GET    /api/users/me            // Get current user
PUT    /api/users/me            // Update current user
DELETE /api/users/me            // Delete account
GET    /api/users/:id           // Get user by ID (admin)
```

#### Data Endpoints
```typescript
GET    /api/data                // List data
POST   /api/data                // Create data
GET    /api/data/:id            // Get specific data
PUT    /api/data/:id            // Update data
DELETE /api/data/:id            // Delete data
```

See [OpenAPI Specification](../apis/openapi/openapi.yaml) for complete API documentation.

### Internal APIs

Services expose internal APIs used by controllers:

```typescript
// User Service
export class UserService {
  async createUser(data: CreateUserDTO): Promise<User>;
  async findUserById(id: string): Promise<User | null>;
  async updateUser(id: string, data: UpdateUserDTO): Promise<User>;
  async deleteUser(id: string): Promise<void>;
}
```

### Events

The server emits events for background processing:

| Event Name | Payload | When Fired |
|------------|---------|------------|
| `user:registered` | `{ userId, email }` | New user signs up |
| `data:created` | `{ dataId }` | New data created |
| `file:uploaded` | `{ fileId, path }` | File upload completes |
| `notification:send` | `{ userId, message }` | Need to send notification |

## Dependencies

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | `^4.18.0` | Web framework |
| `drizzle-orm` | `^0.29.0` | Database ORM |
| `jsonwebtoken` | `^9.0.0` | JWT authentication |
| `bcrypt` | `^5.1.0` | Password hashing |
| `zod` | `^3.22.0` | Schema validation |
| `helmet` | `^7.1.0` | Security headers |
| `cors` | `^2.8.5` | CORS middleware |
| `winston` | `^3.11.0` | Logging |
| `bull` | `^4.12.0` | Job queue |
| `redis` | `^4.6.0` | Caching |

See `server/package.json` for complete dependency list.

### Internal Dependencies

- `../shared/types` - Shared TypeScript types
- `../shared/validators` - Shared validation schemas
- `../shared/utils` - Shared utility functions

### Dependency Rationale

- **Express:** Battle-tested, flexible, large ecosystem
- **Drizzle ORM:** Type-safe, performant, migration support
- **Zod:** Type-safe validation matching TypeScript types
- **Winston:** Flexible logging with multiple transports

## Build and Deploy

### Build Process

```bash
# Install dependencies
cd server
npm install

# Run in development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint
```

### Configuration

**Environment Variables:**
```bash
# Server configuration
NODE_ENV=production              # Environment (development|production|test)
PORT=3000                        # Server port
HOST=0.0.0.0                    # Bind address

# Database
DATABASE_URL=postgresql://...    # PostgreSQL connection string
DATABASE_SSL=true               # Enable SSL for database

# Authentication
JWT_SECRET=your-secret-key      # JWT signing secret
JWT_EXPIRES_IN=7d               # Token expiration
REFRESH_TOKEN_EXPIRES_IN=30d    # Refresh token expiration

# Redis
REDIS_URL=redis://localhost:6379

# External Services
SENDGRID_API_KEY=...            # Email service
AWS_ACCESS_KEY_ID=...           # File storage
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...

# Monitoring
SENTRY_DSN=https://...          # Error tracking
LOG_LEVEL=info                  # Logging level
```

**Configuration Files:**
- `server/src/config/database.ts` - Database configuration
- `server/src/config/auth.ts` - Auth configuration
- `.env.example` - Example environment variables

### Deployment

```bash
# Build Docker image
docker build -t aios-server .

# Run container
docker run -p 3000:3000 --env-file .env aios-server

# Or deploy to cloud platform
# (Heroku, Railway, Render, etc.)
git push heroku main
```

## Common Tasks

### Task 1: Add a New API Endpoint

**Goal:** Create a new REST endpoint

**Steps:**
```bash
# 1. Define route
# server/src/routes/data.routes.ts
router.post('/items', authenticateUser, itemController.createItem);

# 2. Create controller
# server/src/controllers/item.controller.ts
export class ItemController {
  async createItem(req: Request, res: Response): Promise<Response> {
    const data = await itemService.createItem(req.body);
    return res.status(201).json(data);
  }
}

# 3. Create service with business logic
# server/src/services/item.service.ts
export class ItemService {
  async createItem(data: CreateItemDTO): Promise<Item> {
    // Validate, save to DB, return
  }
}

# 4. Add validation schema
# server/src/validators/item.validator.ts
export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

# 5. Update OpenAPI spec
# docs/apis/openapi/openapi.yaml
```

### Task 2: Run Database Migration

**Goal:** Apply schema changes to database

**Steps:**
```bash
# 1. Create migration
npm run db:generate

# 2. Review generated migration
cat drizzle/migrations/0001_*.sql

# 3. Apply migration
npm run db:migrate

# 4. Verify schema
npm run db:studio  # Opens Drizzle Studio
```

### Task 3: Debug Production Issue

**Goal:** Investigate issue in production

**Steps:**
```bash
# 1. Check logs
npm run logs:production

# 2. Check error tracking (Sentry)
# Visit Sentry dashboard

# 3. Reproduce locally
NODE_ENV=production npm start

# 4. Add additional logging if needed
logger.debug('Debugging info:', { context });

# 5. Deploy fix and verify
npm run deploy
npm run logs:tail
```

## Testing

### Test Structure

```
server/tests/
├── unit/                   # Unit tests for services, utils
│   ├── services/
│   ├── utils/
│   └── validators/
├── integration/            # API endpoint tests
│   └── routes/
└── e2e/                    # Full end-to-end tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/services/user.service.test.ts

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run with watch mode
npm test -- --watch
```

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage for services and utilities
- **Integration Tests:** All API endpoints tested
- **E2E Tests:** Critical business flows (registration → data creation → deletion)

## Performance Considerations

### Performance Characteristics
- **API Response Time:** Target P95 < 200ms, P99 < 500ms
- **Throughput:** Target 1000 req/sec on single instance
- **Database Queries:** Target < 50ms for most queries

### Optimization Strategies
1. Use database indexes on frequently queried fields
2. Implement Redis caching for expensive operations
3. Use connection pooling for database
4. Compress responses with gzip middleware
5. Rate limit to prevent abuse
6. Use asynchronous operations for non-critical tasks

### Known Performance Issues
- **N+1 Queries:** Can occur with nested data - use joins or DataLoader
- **Large Payloads:** Endpoints returning large arrays can be slow
  - Mitigation: Implement pagination with `limit` and `offset`
- **File Uploads:** Large files block event loop
  - Mitigation: Stream uploads directly to S3

## Assumptions

- **Assumption 1:** PostgreSQL can handle expected query load
  - *If false:* Add read replicas, implement caching layer, consider sharding
- **Assumption 2:** Single server instance is sufficient
  - *If false:* Scale horizontally with load balancer, use Redis for shared state
- **Assumption 3:** Synchronous request/response is acceptable
  - *If false:* Implement async processing with job queues

## Failure Modes

### Failure Mode 1: Database Connection Loss
- **Symptom:** All API requests fail with 500 errors, "Cannot connect to database"
- **Impact:** Complete application outage
- **Detection:** Health check endpoint fails, error rate spikes
- **Mitigation:**
  - Implement connection retry logic with exponential backoff
  - Use connection pooling with health checks
  - Set up database connection monitoring
  - Have runbook for database failover
- **Monitoring:** Database connection pool metrics, query error rate

### Failure Mode 2: Memory Leak
- **Symptom:** Server memory usage grows continuously until OOM crash
- **Impact:** Server becomes unresponsive, eventual crash
- **Detection:** Memory metrics show upward trend, process restarts
- **Mitigation:**
  - Use memory profiling tools (clinic.js, heapdump)
  - Implement memory limits and alerts
  - Regular dependency updates (some have memory leaks)
  - Set up automatic restarts as last resort
- **Monitoring:** Process memory usage, garbage collection metrics

### Failure Mode 3: Authentication Token Compromise
- **Symptom:** Unauthorized access to user accounts
- **Impact:** Security breach, data exposure
- **Detection:** Unusual activity patterns, security audit findings
- **Mitigation:**
  - Implement token rotation
  - Add IP-based validation
  - Monitor for suspicious patterns
  - Implement account lockout after failed attempts
  - Invalidate all tokens on password change
- **Monitoring:** Failed auth attempts, access patterns

### Failure Mode 4: External Service Outage
- **Symptom:** Third-party API calls fail (email, storage, etc.)
- **Impact:** Dependent features don't work (email notifications, file uploads)
- **Detection:** Third-party API errors in logs
- **Mitigation:**
  - Implement circuit breaker pattern
  - Have fallback mechanisms
  - Queue operations for retry
  - Degrade gracefully (disable non-critical features)
- **Monitoring:** Third-party API success rate, response times

### Failure Mode 5: Rate Limiting Triggered
- **Symptom:** Legitimate users receive 429 Too Many Requests
- **Impact:** Users cannot use the application
- **Detection:** High rate of 429 responses
- **Mitigation:**
  - Tune rate limits based on actual usage
  - Implement tiered rate limits (higher for authenticated users)
  - Add rate limit headers to help clients back off
  - Whitelist known good IPs
- **Monitoring:** Rate limit hit rate by endpoint and user

## How to Verify

### Manual Verification
```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Database connectivity
npm run db:check

# 3. API endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. Run smoke tests
npm run test:smoke
```

### Automated Checks
- [ ] Server starts: `npm start`
- [ ] All tests pass: `npm test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Health endpoint returns 200: `curl http://localhost:3000/health`

### Success Criteria
1. Server starts without errors
2. Database migrations apply successfully
3. All API endpoints return expected responses
4. Authentication flow works end-to-end
5. Performance metrics meet targets

### Health Check

```bash
# Health check endpoint
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z",
  "database": "connected",
  "redis": "connected",
  "version": "1.0.0"
}
```

## Troubleshooting

### Problem 1: Port Already in Use
**Symptoms:** Server fails to start with "EADDRINUSE" error  
**Cause:** Another process using port 3000  
**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Problem 2: Database Migration Fails
**Symptoms:** Migration command errors, schema out of sync  
**Cause:** Migration file conflicts, invalid SQL  
**Solution:**
```bash
# Check migration status
npm run db:check

# Rollback last migration
npm run db:rollback

# Fix migration file
# Re-run migration
npm run db:migrate

# If all else fails, reset (DEV ONLY!)
npm run db:reset
```

### Problem 3: Slow API Responses
**Symptoms:** Endpoints taking seconds to respond  
**Cause:** Unoptimized queries, missing indexes  
**Solution:**
```bash
# Enable query logging
DATABASE_LOGGING=true npm run dev

# Check slow queries
# Add indexes where needed
# Use EXPLAIN ANALYZE for query plans

# Monitor with tools
npm install -g clinic
clinic doctor -- node dist/server.js
```

## Migration and Upgrade Guides

### Upgrading Node.js Version

1. Update `.nvmrc` and `package.json` engines
2. Test locally with new version
3. Update CI/CD to use new version
4. Update production deployment configuration
5. Monitor for issues after deployment

### Database Schema Changes

Always use migrations:
```bash
# Never edit schema directly in production
# Always generate migration
npm run db:generate

# Test migration on staging
npm run db:migrate

# Apply to production
npm run db:migrate:production
```

## Security Considerations

- **Password Storage:** Bcrypt with 10 rounds minimum
- **SQL Injection:** Drizzle ORM prevents with parameterized queries
- **XSS Prevention:** Sanitize user input, use Content-Security-Policy headers
- **CSRF Protection:** Required for state-changing operations
- **Rate Limiting:** Prevents brute force and DoS attacks
- **Helmet Middleware:** Sets security headers
- **Input Validation:** All inputs validated with Zod schemas

See [Security Documentation](../security/threat_model.md) for complete threat model.

## Related Documentation

- [Architecture - Container Level](../architecture/c4/level-2-container.md#server-api) - Server in system context
- [API Documentation](../apis/README.md) - Complete API reference
- [Data Models](../data/README.md) - Database schemas
- [Client Module](./client.md) - API consumer
- [Shared Module](./shared.md) - Shared code
- [Operations Runbooks](../operations/runbooks/) - Operational procedures
- [ADR: AsyncStorage for Local Persistence](../decisions/001-use-asyncstorage.md)

## Maintenance and Support

### Module Owner
- **Team:** Backend Engineering
- **Primary Contact:** Backend Tech Lead
- **Slack Channel:** #backend-dev

### SLA Commitments
- **Critical Bugs:** Response within 2 hours
- **API Uptime:** 99.9% target
- **Security Patches:** Within 24 hours of disclosure

### Deprecation Policy

APIs follow semantic versioning:
- Breaking changes → Major version bump
- Deprecation warnings → 3 months before removal
- Backwards compatibility → Maintained for 1 major version

## Notes

- The server is the source of truth - never trust client-side validation alone
- Always use transactions for multi-step operations
- Log everything that might help debug production issues
- Keep sensitive data out of logs (passwords, tokens, PII)
- Test error paths as thoroughly as happy paths

## References

- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Twelve-Factor App](https://12factor.net/)
