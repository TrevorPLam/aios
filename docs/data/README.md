# Data Documentation

## Plain English Summary

This directory contains documentation about the data structures in AIOS - what data we store, how it's organized, what the rules are, and how different pieces of data relate to each other. Think of this as the "data dictionary" for the entire system.

## Technical Detail

The AIOS system uses PostgreSQL as its primary database, managed through Drizzle ORM. Data documentation covers:

- **Schemas** - Structure of tables and columns
- **Relationships** - How data connects (foreign keys, joins)
- **Constraints** - Rules and validation (unique, required, etc.)
- **Indexes** - Performance optimizations
- **Migrations** - History of schema changes
- **Data Models** - TypeScript representations

### Data Documentation Structure

```
docs/data/
├── README.md                # This file - data overview
└── schemas/                 # Schema documentation
    └── README.md           # Schema documentation guide
```

### Database Technology Stack

- **Database:** PostgreSQL 15+
- **ORM:** Drizzle ORM
- **Migration Tool:** Drizzle Kit
- **Type Safety:** TypeScript types generated from schema
- **Location:** `server/src/models/` (schema definitions)
- **Migrations:** `drizzle/migrations/` (SQL migration files)

## Data Architecture

### High-Level Structure

```
┌─────────────┐
│   Client    │
│  (Mobile)   │
└──────┬──────┘
       │ HTTP API
       ↓
┌─────────────┐
│   Server    │
│ (Node.js)   │
└──────┬──────┘
       │ Drizzle ORM
       ↓
┌─────────────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

### Data Layers

1. **Database Layer** - PostgreSQL tables, constraints, indexes
2. **ORM Layer** - Drizzle schema definitions and queries
3. **Service Layer** - Business logic and data access
4. **API Layer** - REST endpoints exposing data
5. **Client Layer** - Mobile app consuming data

### Core Data Entities

| Entity | Description | Schema File |
|--------|-------------|-------------|
| **Users** | User accounts and authentication | `server/src/models/users.ts` |
| **Sessions** | User session management | `server/src/models/sessions.ts` |
| **Data** | Application-specific data | `server/src/models/data.ts` |

_(Expand this table as your data model grows)_

## Data Access Patterns

### Read Operations

```typescript
// Example: Get user by ID
const user = await db
  .select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

// Example: List data with pagination
const data = await db
  .select()
  .from(dataTable)
  .limit(limit)
  .offset(offset)
  .orderBy(desc(dataTable.createdAt));
```

### Write Operations

```typescript
// Example: Create user
const [user] = await db
  .insert(users)
  .values({
    email: 'user@example.com',
    passwordHash: hashedPassword,
    name: 'John Doe',
  })
  .returning();

// Example: Update user
await db
  .update(users)
  .set({ name: 'Jane Doe', updatedAt: new Date() })
  .where(eq(users.id, userId));

// Example: Delete user
await db
  .delete(users)
  .where(eq(users.id, userId));
```

### Transaction Operations

```typescript
// Example: Multi-step transaction
await db.transaction(async (tx) => {
  // Create user
  const [user] = await tx
    .insert(users)
    .values({ ... })
    .returning();

  // Create related data
  await tx
    .insert(dataTable)
    .values({ userId: user.id, ... });
});
```

## Data Consistency

### ACID Properties

- **Atomicity** - Transactions are all-or-nothing
- **Consistency** - Data follows all constraints and rules
- **Isolation** - Concurrent transactions don't interfere
- **Durability** - Committed data survives system failures

### Constraints

1. **Primary Keys** - Every table has unique identifier
2. **Foreign Keys** - Relationships are enforced
3. **Unique Constraints** - Prevent duplicates (e.g., emails)
4. **Not Null** - Required fields enforced at DB level
5. **Check Constraints** - Custom validation rules

### Data Validation

Validation happens at multiple levels:

```
┌──────────────┐
│ 1. Client    │ - User experience (immediate feedback)
└──────┬───────┘
       ↓
┌──────────────┐
│ 2. API       │ - Zod schemas (shared/validators)
└──────┬───────┘
       ↓
┌──────────────┐
│ 3. Service   │ - Business logic validation
└──────┬───────┘
       ↓
┌──────────────┐
│ 4. Database  │ - Constraints (final enforcement)
└──────────────┘
```

## Schema Management

### Migration Workflow

```bash
# 1. Update schema definition
# Edit server/src/models/*.ts

# 2. Generate migration
npm run db:generate

# 3. Review generated SQL
cat drizzle/migrations/0001_*.sql

# 4. Apply migration to development
npm run db:migrate

# 5. Test changes

# 6. Commit migration with code
git add server/src/models/ drizzle/migrations/
git commit -m "feat: add new data model"

# 7. Deploy to production
npm run db:migrate:production
```

### Migration Best Practices

1. **Always use migrations** - Never edit database directly
2. **Review SQL** - Check generated SQL before applying
3. **Test rollback** - Ensure migrations can be reversed
4. **Small changes** - One logical change per migration
5. **Backwards compatible** - When possible, don't break old code

### Breaking vs. Non-Breaking Changes

#### Non-Breaking (Safe)
- Adding new tables
- Adding nullable columns
- Adding indexes
- Creating new constraints (with existing data handling)

#### Breaking (Requires Coordination)
- Removing columns/tables
- Renaming columns/tables
- Adding NOT NULL to existing columns
- Changing column types
- Removing constraints

## Performance Considerations

### Indexes

```typescript
// Example: Index on frequently queried fields
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(), // Implicit index
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  // Explicit index for queries filtering by createdAt
  createdAtIdx: index('users_created_at_idx').on(table.createdAt),
}));
```

### Query Optimization

1. **Use indexes** - Index frequently queried/sorted fields
2. **Avoid N+1** - Use joins instead of loops
3. **Paginate** - Always limit large result sets
4. **Select specific columns** - Don't `SELECT *` unnecessarily
5. **Use connection pooling** - Reuse database connections

### Monitoring Queries

```sql
-- Find slow queries (PostgreSQL)
SELECT 
  mean_exec_time,
  calls,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## Assumptions

- **Assumption 1:** PostgreSQL is sufficient for all data needs
  - *If false:* Add Redis for caching, consider read replicas
- **Assumption 2:** Single database instance handles the load
  - *If false:* Implement connection pooling, read replicas, sharding
- **Assumption 3:** Referential integrity is always enforced
  - *If false:* Document exceptions, add application-level checks

## Failure Modes

### Failure Mode 1: Database Connection Lost
- **Symptom:** All queries fail, application can't access data
- **Impact:** Complete application outage
- **Detection:** Connection errors, health check fails
- **Mitigation:**
  - Connection retry logic with exponential backoff
  - Connection pooling with health checks
  - Database failover/replication
  - Graceful degradation where possible
- **Monitoring:** Connection pool metrics, query error rate

### Failure Mode 2: Migration Failure
- **Symptom:** Migration script fails halfway through
- **Impact:** Database in inconsistent state, application may break
- **Detection:** Migration command errors
- **Mitigation:**
  - Always use transactions in migrations
  - Test migrations on copy of production data
  - Have rollback plan ready
  - Take database backup before major migrations
- **Monitoring:** Migration logs, database schema version

### Failure Mode 3: Data Corruption
- **Symptom:** Invalid data in database, constraint violations
- **Impact:** Application errors, incorrect behavior
- **Detection:** Constraint violation errors, data validation checks
- **Mitigation:**
  - Strong constraints at database level
  - Validation at multiple layers
  - Regular data integrity checks
  - Audit logging for sensitive data
- **Monitoring:** Constraint violation rate, data validation errors

### Failure Mode 4: Slow Queries
- **Symptom:** API endpoints timeout or are very slow
- **Impact:** Poor user experience, potential timeouts
- **Detection:** High query response times, timeout errors
- **Mitigation:**
  - Add indexes for slow queries
  - Optimize query structure (avoid N+1)
  - Implement caching layer
  - Set query timeouts
- **Monitoring:** Query performance metrics, slow query log

### Failure Mode 5: Database Running Out of Space
- **Symptom:** Write operations fail with disk full errors
- **Impact:** Can't store new data, potential data loss
- **Detection:** Disk space monitoring alerts
- **Mitigation:**
  - Monitor disk usage proactively
  - Implement data retention policies
  - Archive old data
  - Auto-scaling disk (if cloud-hosted)
- **Monitoring:** Disk usage metrics, growth trends

## How to Verify

### Manual Verification
```bash
# 1. Check database connection
npm run db:check

# 2. Verify schema is up to date
npm run db:studio  # Opens Drizzle Studio

# 3. Run data validation checks
npm run db:validate

# 4. Check for missing indexes
npm run db:analyze

# 5. Test migrations on copy
npm run db:test-migration
```

### Automated Checks
- [ ] Database connection works
- [ ] All migrations applied
- [ ] Schema matches model definitions
- [ ] All foreign keys are valid
- [ ] No constraint violations
- [ ] Indexes exist on critical fields

### Success Criteria
1. Database is accessible and responsive
2. Schema matches code definitions
3. All constraints are enforced
4. Queries perform within acceptable limits
5. Data integrity checks pass

## Data Security

### Sensitive Data Handling

1. **Passwords** - Never store plaintext, always hash (bcrypt)
2. **Tokens** - Store securely, expire appropriately
3. **PII** - Encrypt at rest, audit access
4. **API Keys** - Store hashed, rotate regularly

### Access Control

```typescript
// Example: Row-level security with user context
const userOwnedData = await db
  .select()
  .from(dataTable)
  .where(eq(dataTable.userId, currentUserId)); // Only user's data
```

### Audit Logging

```typescript
// Example: Audit sensitive operations
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: text('ip_address'),
});
```

## Backup and Recovery

### Backup Strategy

- **Frequency:** Daily automated backups
- **Retention:** 30 days for daily, 12 months for monthly
- **Location:** Separate region from primary database
- **Testing:** Monthly backup restore tests

### Recovery Process

```bash
# 1. Identify backup to restore
pg_restore --list backup_file.dump

# 2. Restore to new database
pg_restore --dbname=recovery_db backup_file.dump

# 3. Verify data integrity
psql recovery_db -c "SELECT COUNT(*) FROM users;"

# 4. Switch application to recovered database
# Update DATABASE_URL in environment

# 5. Monitor for issues
```

## Related Documentation

- [Schema Documentation](./schemas/README.md) - Detailed schema docs
- [Server Module](../modules/server.md) - Database access code
- [API Documentation](../apis/README.md) - API endpoints exposing data
- [Security](../security/threat_model.md) - Data security considerations
- [Operations Runbooks](../operations/runbooks/) - Database operations

## Best Practices

### Schema Design
1. **Normalize** - Reduce redundancy, use proper relationships
2. **Use constraints** - Enforce data integrity at DB level
3. **Index wisely** - Index frequently queried fields
4. **Plan for growth** - Consider future scale
5. **Document everything** - Clear naming and documentation

### Query Writing
1. **Be specific** - Select only needed columns
2. **Use prepared statements** - Prevent SQL injection
3. **Limit results** - Always paginate large datasets
4. **Use transactions** - For multi-step operations
5. **Monitor performance** - Track slow queries

### Data Management
1. **Version control** - All schema changes in migrations
2. **Test migrations** - On copy of production data
3. **Backup regularly** - Automated, tested backups
4. **Monitor growth** - Track table sizes and growth
5. **Clean up** - Archive or delete old data

## Notes

- Schema documentation should be updated with every migration
- Keep data models in sync with TypeScript types
- Database is the source of truth - enforce rules there
- Good data structure makes everything else easier
- Plan for scale from the beginning

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)
- [Normalization](https://en.wikipedia.org/wiki/Database_normalization)
