# Logging Strategy

**Last Updated:** 2024-01-15  
**Owner:** Platform Team

## Plain English Summary

This document describes how we log information in the AIOS system. Logs are like a detailed diary of everything the application does - they help us understand what's happening, debug problems, and track user actions. Good logging is essential for operating production systems.

## What to Log

### Always Log

**✅ DO log:**

1. **Application Start/Stop**
   ```typescript
   logger.info('Application starting', {
     version: packageInfo.version,
     environment: process.env.NODE_ENV,
     nodeVersion: process.version,
   });
   ```

2. **Incoming Requests** (API, significant events)
   ```typescript
   logger.info('API request', {
     method: req.method,
     path: req.path,
     userId: req.user?.id,
     requestId: req.id,
   });
   ```

3. **Outgoing Requests** (to external services)
   ```typescript
   logger.info('External API call', {
     service: 'payment-processor',
     endpoint: '/charges',
     requestId: context.requestId,
   });
   ```

4. **Authentication Events**
   ```typescript
   logger.info('User login', {
     userId: user.id,
     email: user.email,
     ip: req.ip,
   });
   
   logger.warn('Failed login attempt', {
     email: attemptedEmail,
     ip: req.ip,
     reason: 'invalid_password',
   });
   ```

5. **Authorization Failures**
   ```typescript
   logger.warn('Authorization denied', {
     userId: user.id,
     resource: 'admin_panel',
     action: 'access',
   });
   ```

6. **Database Operations** (significant ones)
   ```typescript
   logger.info('User created', {
     userId: newUser.id,
     method: 'email_registration',
   });
   ```

7. **Errors and Exceptions**
   ```typescript
   logger.error('Database query failed', {
     error: error.message,
     stack: error.stack,
     query: sql,
     requestId: context.requestId,
   });
   ```

8. **Performance Issues**
   ```typescript
   logger.warn('Slow query detected', {
     query: 'SELECT * FROM users',
     duration: 5000, // milliseconds
     threshold: 1000,
   });
   ```

9. **State Changes** (important ones)
   ```typescript
   logger.info('Order status changed', {
     orderId: order.id,
     from: 'pending',
     to: 'completed',
     userId: user.id,
   });
   ```

10. **Background Job Status**
    ```typescript
    logger.info('Job completed', {
      jobId: job.id,
      jobType: 'send_email',
      duration: 1500,
      status: 'success',
    });
    ```

### Never Log

**❌ DO NOT log:**

1. **Passwords** - NEVER, even hashed
2. **API Keys / Tokens** - ANY authentication credentials
3. **Credit Card Numbers** - Or any PCI data
4. **Social Security Numbers** - Or other PII
5. **Session Tokens** - JWT tokens, session IDs
6. **Encryption Keys** - Private keys, secrets
7. **Full Request Bodies** - May contain sensitive data
8. **Full Response Bodies** - May contain PII

```typescript
// BAD - Don't do this!
logger.info('User login', {
  email: user.email,
  password: password, // ❌ NEVER LOG PASSWORDS
});

// GOOD - Do this instead
logger.info('User login', {
  userId: user.id,
  email: user.email,
  // No password logged
});
```

## Log Levels

Use the correct log level for each message:

### ERROR
**When:** Something failed that requires attention
**Examples:**
- Unhandled exceptions
- Failed external API calls
- Database connection errors
- Data corruption detected

```typescript
logger.error('Payment processing failed', {
  error: error.message,
  userId: user.id,
  amount: payment.amount,
  requestId: context.requestId,
});
```

### WARN
**When:** Something unexpected but handled
**Examples:**
- Fallback to default behavior
- Resource usage approaching limits
- Failed login attempts
- Deprecated API usage

```typescript
logger.warn('Rate limit approaching', {
  userId: user.id,
  current: 95,
  limit: 100,
  window: '1 minute',
});
```

### INFO
**When:** Normal but significant events
**Examples:**
- Application start/stop
- User registration/login
- Important state changes
- Completed operations

```typescript
logger.info('User registered', {
  userId: user.id,
  method: 'oauth',
  provider: 'google',
});
```

### DEBUG
**When:** Detailed information for development
**Examples:**
- Function entry/exit
- Variable values
- Execution flow
- Configuration values

```typescript
logger.debug('Cache hit', {
  key: 'user:123',
  ttl: 300,
  requestId: context.requestId,
});
```

**Note:** DEBUG logs disabled in production by default

## Structured Logging

Always use structured logging (JSON), not plain strings:

```typescript
// ❌ BAD - String concatenation
logger.info('User ' + user.id + ' logged in from ' + req.ip);

// ✅ GOOD - Structured
logger.info('User login', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date().toISOString(),
});
```

### Benefits of Structured Logging

1. **Searchable** - Query by specific fields
2. **Parseable** - Easy for log aggregation tools
3. **Type-safe** - TypeScript can validate structure
4. **Consistent** - Same fields across all logs
5. **Analyzable** - Easy to generate metrics

## Standard Log Fields

Include these fields in every log:

```typescript
interface StandardLogFields {
  timestamp: string;      // ISO 8601 format
  level: string;          // ERROR, WARN, INFO, DEBUG
  message: string;        // Human-readable message
  requestId?: string;     // Trace requests across services
  userId?: string;        // Who performed the action
  service: string;        // Which service logged this
  environment: string;    // dev, staging, production
  version: string;        // App version
}
```

Example:
```typescript
logger.info('API request received', {
  requestId: 'req_abc123',
  userId: 'user_xyz789',
  method: 'POST',
  path: '/api/users',
  service: 'api-server',
  environment: 'production',
  version: '1.2.3',
});
```

## Request ID Tracing

Use request IDs to trace requests through the system:

```typescript
// Generate request ID
const requestId = `req_${uuidv4()}`;

// Add to request context
req.id = requestId;

// Include in all logs for this request
logger.info('Processing request', {
  requestId: requestId,
  // ... other fields
});

// Pass to external services
axios.get(url, {
  headers: {
    'X-Request-ID': requestId,
  },
});

// Return in response headers
res.setHeader('X-Request-ID', requestId);
```

This allows tracing a single request across:
- API server
- Database queries
- External API calls
- Background jobs
- Client errors

## Log Rotation and Retention

### Rotation
- **Local Development:** Console output, no rotation
- **Staging:** Rotate daily, keep 7 days
- **Production:** Rotate hourly, keep 1 day locally

### Retention
- **Production Logs:** 90 days in log aggregation (e.g., DataDog, CloudWatch)
- **Error Logs:** 1 year
- **Audit Logs:** 7 years (compliance requirement)

### Storage
- **Local:** `/var/log/aios/` (ephemeral)
- **Centralized:** CloudWatch / DataDog / ELK Stack
- **Archive:** S3 (for long-term retention)

## Performance Considerations

### Async Logging

Use async logging to avoid blocking:

```typescript
// Configure Winston for async
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'app.log',
      level: 'info',
      // Async transport
      flags: 'a',
    }),
  ],
});
```

### Log Sampling

For high-frequency events, sample logs:

```typescript
// Only log 1% of cache hits
if (Math.random() < 0.01) {
  logger.debug('Cache hit', {
    key: cacheKey,
    sampled: true,
  });
}
```

### Conditional DEBUG Logs

Only enable DEBUG in development or when investigating:

```typescript
// In production, DEBUG is disabled
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

logger.level = logLevel;
```

## Implementation

### Winston Configuration

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'aios-api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  transports: [
    // Write to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Write to file in production
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Context Logger

Create logger with request context:

```typescript
export function createContextLogger(requestId: string, userId?: string) {
  return logger.child({
    requestId,
    userId,
  });
}

// Usage
const contextLogger = createContextLogger(req.id, req.user?.id);
contextLogger.info('Processing payment', {
  amount: payment.amount,
});
```

## Querying Logs

### CloudWatch Insights

```sql
-- Find all errors for a user
fields @timestamp, @message, error
| filter userId = "user_123"
| filter level = "ERROR"
| sort @timestamp desc
| limit 100

-- Find slow queries
fields @timestamp, query, duration
| filter duration > 1000
| sort duration desc
| limit 20
```

### DataDog

```
service:aios-api env:production status:error @userId:user_123
```

## Assumptions

- **Assumption 1:** Structured JSON logs are parseable by log aggregation tool
  - *If false:* Update log format to match tool requirements
- **Assumption 2:** Request IDs are unique and traceable
  - *If false:* Implement UUID generation for request IDs
- **Assumption 3:** Log volume is manageable (< 10GB/day)
  - *If false:* Increase sampling, reduce verbosity

## Failure Modes

### Failure Mode 1: Log Flooding
- **Symptom:** Too many logs, disk space exhausted, logs truncated
- **Impact:** Can't find important logs, potential disk full
- **Detection:** High log volume, disk space alerts
- **Mitigation:**
  - Implement log sampling for high-frequency events
  - Set rate limits on logging
  - Rotate logs more frequently
  - Increase retention storage

### Failure Mode 2: Sensitive Data in Logs
- **Symptom:** PII, passwords, or tokens appear in logs
- **Impact:** Security breach, compliance violation
- **Detection:** Security audit, log review
- **Mitigation:**
  - Implement log sanitization
  - Code review checklist for logging
  - Automated scanning for sensitive patterns
  - Regular security audits

### Failure Mode 3: Missing Context
- **Symptom:** Logs don't have enough information to debug issues
- **Impact:** Extended incident resolution time
- **Detection:** Engineers struggle to debug from logs
- **Mitigation:**
  - Add standard fields (requestId, userId)
  - Include relevant context in logs
  - Review log completeness in code review

## How to Verify

### Manual Verification
```bash
# Check logs are being written
tail -f /var/log/aios/combined.log

# Verify log format is JSON
tail -1 /var/log/aios/combined.log | jq .

# Check for sensitive data (should find nothing)
grep -i "password" /var/log/aios/*.log
```

### Automated Checks
- [ ] All logs are JSON formatted
- [ ] No sensitive data in logs
- [ ] Request IDs present in all logs
- [ ] Log aggregation receiving logs

### Success Criteria
1. Can trace requests across system
2. Can debug incidents from logs
3. No sensitive data leaks
4. Log volume is manageable
5. Logs are searchable and analyzable

## Related Documentation

- [Metrics Strategy](./metrics.md) - What metrics to collect
- [Tracing Strategy](./tracing.md) - Distributed tracing
- [Operations Overview](../README.md) - Overall operations docs
- [Server Module](../../modules/server.md) - Where logging happens

## References

- [Winston Documentation](https://github.com/winstonjs/winston)
- [12 Factor App: Logs](https://12factor.net/logs)
- [Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
