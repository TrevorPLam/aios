# Schema Documentation

## Plain English Summary

This directory contains detailed documentation for each database table (schema) in the AIOS system. Each schema document explains what data is stored, how it's structured, what the rules are, and how it relates to other tables.

## Technical Detail

Database schemas are defined using Drizzle ORM in `server/src/models/`. This directory documents those schemas in human-readable format, explaining design decisions, constraints, and usage patterns.

### Documentation Structure

Each schema should be documented with:

1. **Purpose** - What this table stores and why
2. **Columns** - Each field, its type, constraints, and meaning
3. **Relationships** - Foreign keys and how data connects
4. **Indexes** - Performance optimizations
5. **Constraints** - Validation rules
6. **Queries** - Common query patterns
7. **Migrations** - History of schema changes
8. **Examples** - Sample data and usage

## Schema Documentation Template

```markdown
# [Table Name]

**Location:** `server/src/models/[filename].ts`  
**Migration:** `drizzle/migrations/NNNN_*.sql`

## Purpose

[What this table stores and why it exists]

## Schema Definition

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT random | Primary key |
| ... | ... | ... | ... |

### Relationships

- **Belongs To:** `[parent_table]` via `[foreign_key]`
- **Has Many:** `[child_table]` via `[foreign_key]`

### Indexes

- `[index_name]` on `[columns]` - [Purpose]

### Constraints

- **Unique:** `[column]` - [Reason]
- **Check:** `[condition]` - [Reason]

## Usage Patterns

### Common Queries

[TypeScript examples of typical queries]

### Performance Considerations

[Tips for querying this table efficiently]

## Examples

[Sample data and usage examples]
```

## Documenting Existing Schemas

For the AIOS system, document these core schemas:

### 1. Users Schema

Document the users table including:
- User identification (id, email)
- Authentication (password hash)
- Profile information (name, etc.)
- Timestamps (createdAt, updatedAt)
- Relationships to other tables

**File:** `docs/data/schemas/users.md`

### 2. Sessions Schema

Document user sessions including:
- Session identification
- User association
- Expiration
- Refresh tokens

**File:** `docs/data/schemas/sessions.md`

### 3. Application Data Schemas

Document your application-specific tables based on your actual `server/src/models/` directory.

## Creating New Schema Documentation

When adding a new table:

1. **Create migration:**
   ```bash
   # Update server/src/models/new_table.ts
   npm run db:generate
   ```

2. **Document the schema:**
   ```bash
   # Create docs/data/schemas/new_table.md
   # Follow the template above
   ```

3. **Include in this README:**
   - Add link in the list below
   - Update any affected relationship docs

## Available Schema Documentation

| Schema | Purpose | Documentation |
|--------|---------|---------------|
| **users** | User accounts and authentication | _To be created_ |
| **sessions** | User session management | _To be created_ |
| [Your tables here] | [Purpose] | _To be created_ |

## Assumptions

- **Assumption 1:** All tables have UUID primary keys
  - *If false:* Document exceptions and why
- **Assumption 2:** All tables have createdAt/updatedAt timestamps
  - *If false:* Document exceptions and add if needed
- **Assumption 3:** Foreign keys are always enforced
  - *If false:* Document exceptions and application-level handling

## Failure Modes

### Failure Mode 1: Schema Documentation Drift
- **Symptom:** Documentation doesn't match actual database schema
- **Impact:** Confusion, incorrect development, bugs
- **Detection:** Manual schema comparison, failed queries
- **Mitigation:**
  - Update docs with every migration
  - Include doc updates in PR checklist
  - Generate docs from schema (if tooling available)
- **Monitoring:** Manual reviews during code review

### Failure Mode 2: Missing Relationship Documentation
- **Symptom:** Developers don't understand data connections
- **Impact:** Incorrect queries, N+1 problems, data integrity issues
- **Detection:** Code review finds inefficient queries
- **Mitigation:**
  - Document all foreign keys clearly
  - Include relationship diagrams
  - Show join examples
- **Monitoring:** Query performance metrics

### Failure Mode 3: Undocumented Constraints
- **Symptom:** Developers violate database constraints
- **Impact:** Runtime errors, failed operations
- **Detection:** Constraint violation errors in logs
- **Mitigation:**
  - Document all constraints clearly
  - Explain business rules behind constraints
  - Show validation examples
- **Monitoring:** Constraint violation error rate

## How to Verify

### Manual Verification
```bash
# 1. Compare docs to actual schema
npm run db:studio  # Visual comparison

# 2. Verify all tables are documented
ls server/src/models/*.ts
ls docs/data/schemas/*.md

# 3. Check relationship accuracy
# Query actual foreign keys in PostgreSQL
psql $DATABASE_URL -c "\d+ users"
```

### Automated Checks
- [ ] All schema files in models/ have corresponding .md files
- [ ] All foreign keys are documented
- [ ] All indexes are documented
- [ ] All constraints are documented

### Success Criteria
1. Every table has documentation
2. All relationships are clear
3. Common queries are shown
4. Performance considerations are noted
5. Examples are realistic

## Schema Documentation Best Practices

### Clarity
1. **Use plain English** - Explain purpose in simple terms
2. **Include examples** - Show actual data samples
3. **Explain why** - Document reasons for design decisions
4. **Show queries** - Demonstrate common operations
5. **Link relationships** - Reference related schema docs

### Completeness
1. **Every column** - Document all fields
2. **Every constraint** - Explain all rules
3. **Every index** - Note all performance optimizations
4. **Every relationship** - Show all connections
5. **Migration history** - Note significant changes

### Maintenance
1. **Update with changes** - Keep docs current with code
2. **Version migrations** - Reference migration numbers
3. **Mark deprecated** - Flag old patterns
4. **Show alternatives** - Suggest better approaches
5. **Review regularly** - Audit for accuracy

## Tools for Schema Documentation

### Schema Visualization
```bash
# Generate ER diagram
npx prisma generate  # If using Prisma
# Or use dbdiagram.io, drawsql.app

# Export schema to SQL
pg_dump --schema-only $DATABASE_URL > schema.sql
```

### Schema Comparison
```bash
# Compare dev to production schema
pg_dump --schema-only $DEV_DATABASE_URL > dev_schema.sql
pg_dump --schema-only $PROD_DATABASE_URL > prod_schema.sql
diff dev_schema.sql prod_schema.sql
```

### Auto-Documentation
```bash
# Generate docs from schema (various tools)
npx schemats generate -c $DATABASE_URL -o docs/data/schemas/

# Or use Drizzle introspection
npx drizzle-kit introspect:pg
```

## Related Documentation

- [Data Overview](../README.md) - Overall data architecture
- [Server Module](../../modules/server.md) - Database access code
- [API Documentation](../../apis/README.md) - APIs exposing this data
- [ADR: Database Choice](../../decisions/0003-database-choice.md) - Why PostgreSQL

## Notes

- Schema docs are for humans - make them helpful
- Keep in sync with actual database schema
- Include real examples from your application
- Document the "why" not just the "what"
- Good schema docs prevent many bugs

Think of schema docs as the instruction manual for your database.

## References

- [Drizzle Schema Documentation](https://orm.drizzle.team/docs/sql-schema-declaration)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)
