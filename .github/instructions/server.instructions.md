# Server/Backend Path Instructions

**Scope:** Applies to changes in `/server/**` directory  
**Authority:** Extends global `.github/copilot-instructions.md`

## Plain English Summary

- Server is Node.js/Express with TypeScript, PostgreSQL database via Drizzle ORM
- API contract discipline: OpenAPI spec (`docs/apis/openapi/openapi.yaml`) is source of truth
- All inputs validated with Zod schemas - no exceptions
- Database migrations are required for schema changes - never modify existing migrations
- Data integrity is paramount - use transactions for multi-step operations
- Observability built-in: structured logging, error tracking, health checks
- Failure-mode thinking: every endpoint must handle and communicate errors gracefully

## Technical Detail

### Code Structure

```
server/
├── index.ts                # Server entry point, Express app setup
├── routes.ts               # API route definitions
├── storage.ts              # Database access layer (Drizzle ORM)
├── middleware/             # Express middleware (auth, error handling, logging)
├── templates/              # Response templates
└── __tests__/              # Server tests
```

### API Contract Discipline

**OpenAPI spec is the source of truth:**

Location: `docs/apis/openapi/openapi.yaml`

**Before implementing an endpoint:**

1. **Define in OpenAPI first:**
   ```yaml
   # docs/apis/openapi/openapi.yaml
   paths:
     /api/users/{userId}:
       get:
         summary: Get user profile
         parameters:
           - name: userId
             in: path
             required: true
             schema:
               type: string
               format: uuid
         responses:
           '200':
             description: User profile
             content:
               application/json:
                 schema:
                   $ref: '#/components/schemas/UserProfile'
           '404':
             description: User not found
   ```

2. **Validate spec:**
   ```bash
   npm run lint:api
   # Uses Spectral to validate OpenAPI spec
   ```

3. **Implement endpoint matching spec exactly:**
   ```typescript
   // server/routes.ts
   app.get('/api/users/:userId', authenticate, async (req, res) => {
     const { userId } = req.params;
     
     // Validate input
     const validation = UserIdSchema.safeParse(userId);
     if (!validation.success) {
       return res.status(400).json({ error: 'Invalid user ID' });
     }
     
     // Implementation
     const user = await getUserById(userId);
     if (!user) {
       return res.status(404).json({ error: 'User not found' });
     }
     
     res.json(user);
   });
   ```

4. **Update traceability matrix:**
   - Document in `docs/traceability_matrix.md` (once created)
   - Link: Feature → API spec → Implementation → Tests

**Breaking changes to API:**
- Require ADR
- Version the API: `/api/v2/users` (don't modify `/api/v1/users`)
- Provide migration guide
- Deprecation warnings for old version

### Input Validation (MANDATORY)

**ALL inputs must be validated with Zod:**

```typescript
import { z } from 'zod';

// Define schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(18).max(120).optional(),
});

// Validate in route handler
app.post('/api/users', authenticate, async (req, res) => {
  // Validate request body
  const validation = CreateUserSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: validation.error.format(),
    });
  }
  
  const userData = validation.data;
  
  // Safe to use userData - types are guaranteed
  const user = await createUser(userData);
  res.status(201).json(user);
});
```

**Never trust inputs:**
```typescript
// ❌ BAD: No validation
app.post('/api/users', async (req, res) => {
  const user = await db.users.create(req.body); // DANGEROUS
  res.json(user);
});

// ✅ GOOD: Validated
app.post('/api/users', async (req, res) => {
  const validation = CreateUserSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const user = await createUser(validation.data);
  res.json(user);
});
```

### Database Migrations

**Location:** Database schema in `server/storage.ts` (Drizzle ORM)

**NEVER modify existing migrations:**
```bash
# ❌ BAD: Editing old migration
# server/migrations/0001_initial.sql  <- Don't touch this!

# ✅ GOOD: Create new migration
npm run db:push
# Generates new migration file
```

**Creating schema changes:**

1. **Update schema in `server/storage.ts`:**
   ```typescript
   // Add new column
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     email: text('email').notNull().unique(),
     name: text('name').notNull(),
     // NEW: Add avatar URL
     avatarUrl: text('avatar_url'),
     createdAt: timestamp('created_at').defaultNow(),
   });
   ```

2. **Generate migration:**
   ```bash
   npm run db:push
   ```

3. **Test migration:**
   ```bash
   # Run against test database
   DATABASE_URL=postgresql://test npm run db:push
   
   # Verify schema
   psql $DATABASE_URL -c "\d users"
   ```

4. **Document in ADR** if schema change is significant

**Transaction discipline:**

```typescript
// ✅ GOOD: Use transaction for multi-step operations
import { db } from './storage';

async function transferFunds(fromUserId: string, toUserId: string, amount: number) {
  await db.transaction(async (tx) => {
    // Deduct from sender
    await tx.update(accounts)
      .set({ balance: sql`balance - ${amount}` })
      .where(eq(accounts.userId, fromUserId));
    
    // Add to receiver
    await tx.update(accounts)
      .set({ balance: sql`balance + ${amount}` })
      .where(eq(accounts.userId, toUserId));
    
    // Log transaction
    await tx.insert(transactions).values({
      fromUserId,
      toUserId,
      amount,
      timestamp: new Date(),
    });
  });
}

// ❌ BAD: No transaction - can leave DB in inconsistent state
async function transferFunds(fromUserId: string, toUserId: string, amount: number) {
  await db.update(accounts).set({ balance: sql`balance - ${amount}` })...;
  // If this fails, sender loses money but receiver doesn't get it!
  await db.update(accounts).set({ balance: sql`balance + ${amount}` })...;
}
```

### Data Integrity Rules

**1. Never expose internal IDs directly:**
```typescript
// ❌ BAD: Sequential IDs are predictable
// User can guess other user IDs: 1, 2, 3, ...

// ✅ GOOD: Use UUIDs or non-sequential IDs
import { v4 as uuidv4 } from 'uuid';

const user = {
  id: uuidv4(), // e.g., "550e8400-e29b-41d4-a716-446655440000"
  email: 'user@example.com',
};
```

**2. Enforce access control:**
```typescript
// ❌ BAD: No authorization check
app.get('/api/users/:userId/profile', authenticate, async (req, res) => {
  const profile = await getUserProfile(req.params.userId);
  res.json(profile); // Any authenticated user can see any profile!
});

// ✅ GOOD: Check authorization
app.get('/api/users/:userId/profile', authenticate, async (req, res) => {
  const { userId } = req.params;
  const requestingUserId = req.user.id;
  
  // Users can only see their own profile
  if (userId !== requestingUserId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const profile = await getUserProfile(userId);
  res.json(profile);
});
```

**3. Sanitize outputs:**
```typescript
// ❌ BAD: Exposing sensitive data
function getUserProfile(user) {
  return user; // Includes password hash, tokens, etc.
}

// ✅ GOOD: Return only necessary fields
function getUserProfile(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    // password, tokens, etc. NOT included
  };
}
```

### Observability

**Structured logging (use consistently):**

```typescript
// ✅ GOOD: Structured logs with context
console.log(JSON.stringify({
  level: 'info',
  message: 'User login successful',
  userId: user.id,
  timestamp: new Date().toISOString(),
  requestId: req.id,
}));

// ❌ BAD: Unstructured logs
console.log('User ' + user.id + ' logged in');
```

**Error tracking:**

```typescript
// ✅ GOOD: Log errors with context
try {
  await performOperation();
} catch (error) {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Operation failed',
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  }));
  
  // Return user-friendly error
  res.status(500).json({ error: 'Internal server error' });
}
```

**Health check endpoint (REQUIRED):**

```typescript
// server/routes.ts
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await db.execute(sql`SELECT 1`);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
    });
  }
});
```

### Error Handling

**Every endpoint must handle errors:**

```typescript
app.post('/api/data', authenticate, async (req, res) => {
  try {
    // Validate input
    const validation = DataSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.format(),
      });
    }
    
    // Business logic
    const result = await processData(validation.data);
    
    res.json(result);
  } catch (error) {
    // Log error
    console.error('Data processing failed:', error);
    
    // Return appropriate error
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Generic error
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Error response format (consistent):**

```typescript
// Success response
{
  "data": { /* result */ }
}

// Error response
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE", // Optional
  "details": { /* Optional extra info */ }
}
```

### Authentication & Authorization

**Current system:** JWT tokens (see ADR-003)

**Authentication middleware:**
```typescript
// server/middleware/auth.ts (example)
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**NEVER log tokens or passwords:**
```typescript
// ❌ BAD
console.log('Request:', req.headers.authorization); // Contains token!

// ✅ GOOD
console.log('Request:', { ...req.headers, authorization: '[REDACTED]' });
```

### Testing Requirements

**All endpoints require tests:**

```typescript
// server/__tests__/users.test.ts
import request from 'supertest';
import { app } from '../index';

describe('GET /api/users/:userId', () => {
  it('should return user profile for authenticated user', async () => {
    const token = await getTestToken();
    const response = await request(app)
      .get('/api/users/test-user-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body).toMatchObject({
      id: 'test-user-id',
      email: expect.any(String),
      name: expect.any(String),
    });
  });
  
  it('should return 401 for unauthenticated request', async () => {
    await request(app)
      .get('/api/users/test-user-id')
      .expect(401);
  });
  
  it('should return 404 for non-existent user', async () => {
    const token = await getTestToken();
    await request(app)
      .get('/api/users/non-existent-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
```

**Run tests:**
```bash
npm test -- server/
```

## Assumptions

- Server runs on Node.js with Express (see `server/index.ts`)
- Database is PostgreSQL with Drizzle ORM (see `server/storage.ts`)
- Authentication uses JWT (see ADR-003)
- All inputs validated with Zod
- OpenAPI spec is maintained at `docs/apis/openapi/openapi.yaml`
- Environment variables configured in `.env` (see `.env.example`)

## Failure Modes

| Failure Mode | Symptom | Solution |
|--------------|---------|----------|
| Unvalidated inputs | SQL injection, crashes | Use Zod for all inputs |
| API drift | Spec doesn't match implementation | Validate spec with Spectral, update together |
| Data inconsistency | Lost funds, duplicate data | Use database transactions |
| Authorization bypass | Users access others' data | Check authorization in every endpoint |
| Migration conflicts | Schema out of sync | Never modify old migrations, test new ones |
| Exposed secrets | Tokens in logs | Redact sensitive data before logging |
| Unhandled errors | 500 errors, crashes | Wrap endpoints in try-catch, return structured errors |

## How to Verify

**Run server tests:**
```bash
npm test -- server/
# All tests should pass
```

**Validate API spec:**
```bash
npm run lint:api
# Should pass Spectral validation
```

**Check TypeScript:**
```bash
npm run check:types
# Server should have 0 type errors
```

**Start server locally:**
```bash
npm run server:dev
# Server should start on http://localhost:5000
```

**Test health endpoint:**
```bash
curl http://localhost:5000/health
# Should return: {"status":"healthy",...}
```

**Verify database connection:**
```bash
npm run db:push
# Should connect to database successfully
```

**Check for unvalidated inputs:**
```bash
# Search for req.body without validation
grep -r "req.body" server/ --include="*.ts" | grep -v "safeParse"
# Should ideally return nothing
```

**Check for exposed secrets:**
```bash
# Look for potential secret logging
grep -r "console.log.*authorization" server/ --include="*.ts"
grep -r "console.log.*token" server/ --include="*.ts"
# Should return nothing or redacted versions
```

---

**Remember:** The server is the guardian of data integrity and security. Never compromise on validation, authorization, or error handling.
