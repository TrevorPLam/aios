# Tracing Strategy

**Last Updated:** 2024-01-15  
**Owner:** Platform Team

## Plain English Summary

Tracing tracks a single user request as it flows through multiple services and components. While logs show what happened in one place and metrics show aggregate numbers, tracing shows the entire journey of a request - from the mobile app through the API server to the database and back. This is essential for debugging complex, distributed systems.

## What is Distributed Tracing?

Imagine a user taps "Login" in the mobile app. That single action triggers:

1. HTTP request to API server
2. JWT token validation
3. Database query for user
4. Password hash comparison
5. Session creation in Redis
6. Response back to client

Tracing lets us see:
- **How long each step took**
- **Which step was slowest**
- **Where errors occurred**
- **The complete request path**

## Key Concepts

### Trace
A complete journey of a request through the system

```
Trace ID: abc123
Duration: 245ms
Spans: 5
Status: Success
```

### Span
A single operation within a trace (one step in the journey)

```
Span: Database Query
Parent: API Handler
Duration: 125ms
Operation: SELECT * FROM users WHERE email = ?
```

### Span Relationship
```
Trace: User Login
├── Span: HTTP Request         (200ms total)
│   ├── Span: Validate JWT     (5ms)
│   ├── Span: Database Query   (125ms) ← Slowest!
│   ├── Span: Hash Comparison  (50ms)
│   └── Span: Create Session   (20ms)
```

## What to Trace

### Always Trace

1. **HTTP Requests** - All incoming API requests
2. **Database Queries** - All DB operations
3. **External API Calls** - Third-party service calls
4. **Cache Operations** - Redis/memory cache hits/misses
5. **Background Jobs** - Asynchronous task processing
6. **Message Queue Operations** - Pub/sub, queue operations

### Span Attributes

Include these attributes in spans:

```typescript
{
  // Standard attributes
  'http.method': 'POST',
  'http.url': '/api/users',
  'http.status_code': 201,
  'http.user_agent': 'AIOS-Mobile/1.0',
  
  // Custom attributes
  'user.id': 'user_123',
  'user.type': 'premium',
  'request.id': 'req_abc123',
  
  // Database
  'db.system': 'postgresql',
  'db.operation': 'SELECT',
  'db.statement': 'SELECT * FROM users WHERE id = $1',
  'db.rows_affected': 1,
  
  // Result
  'result.cache_hit': false,
  'result.items_returned': 25,
}
```

## Implementation

### OpenTelemetry (Recommended)

OpenTelemetry is the industry standard for tracing.

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

// Configure OpenTelemetry
const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT,
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PgInstrumentation(),
  ],
  serviceName: 'aios-api',
});

sdk.start();
```

### Manual Instrumentation

For custom operations:

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('aios-api');

async function processPayment(payment) {
  // Create a span for this operation
  const span = tracer.startSpan('process_payment', {
    attributes: {
      'payment.id': payment.id,
      'payment.amount': payment.amount,
      'payment.currency': payment.currency,
    },
  });
  
  try {
    // Call external payment API
    const childSpan = tracer.startSpan('payment_api_call', {
      parent: span,
    });
    
    const result = await externalPaymentAPI.charge(payment);
    
    childSpan.setAttribute('payment.status', result.status);
    childSpan.end();
    
    span.setAttribute('result', 'success');
    return result;
  } catch (error) {
    // Record error in span
    span.recordException(error);
    span.setStatus({ code: 2, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
```

### Trace Context Propagation

Pass trace context between services:

```typescript
// Extract trace context from incoming request
const traceContext = propagation.extract(
  context.active(),
  req.headers
);

// Propagate to outgoing request
await axios.get(url, {
  headers: {
    // Inject trace context
    ...propagation.inject(traceContext, {}),
  },
});
```

## Trace Sampling

Don't trace every request (too expensive):

```typescript
// Sample 10% of requests
const sampler = new TraceIdRatioBasedSampler(0.1);

// Always trace errors
const sampler = new ParentBasedSampler({
  root: new AlwaysOnSampler(), // Always sample root spans with errors
});

// Adaptive sampling (trace slow requests)
const sampler = {
  shouldSample: (context) => {
    // Always sample slow requests
    if (context.duration > 1000) {
      return { decision: 1 }; // Sample
    }
    // 10% sampling for fast requests
    return { decision: Math.random() < 0.1 ? 1 : 0 };
  },
};
```

## Using Traces

### Finding Slow Requests

```
Query: duration > 1s
Sort by: duration desc
Result: Top 10 slowest traces
```

Look for:
- Which span took the most time?
- Are there many spans (N+1 queries)?
- Are spans sequential or parallel?
- Any errors in child spans?

### Debugging Errors

```
Query: status = error AND service = aios-api
Filter: last 1 hour
```

Click on trace to see:
- Which span failed?
- What was the error message?
- What happened before the error?
- Were there cascading failures?

### Analyzing Performance

```
Query: endpoint = /api/users AND method = POST
Aggregate: avg(duration), p95(duration), p99(duration)
Group by: time
```

Identify:
- Performance trends over time
- Impact of deployments
- Slowest operations
- Optimization opportunities

## Common Patterns

### Database N+1 Problem

**Symptom in trace:**
```
Trace: Get User Posts
├── Span: Get Posts (10ms)
├── Span: Get Author 1 (15ms) ← Repeated!
├── Span: Get Author 2 (15ms) ← Repeated!
├── Span: Get Author 3 (15ms) ← Repeated!
└── ...100 more author queries
```

**Solution:** Use joins or DataLoader

### Sequential vs Parallel

**Bad - Sequential (slow):**
```
Trace: User Dashboard
├── Span: Get User (50ms)
└── Span: Get Posts (100ms)  ← After user
    └── Span: Get Comments (75ms)  ← After posts
Total: 225ms
```

**Good - Parallel (fast):**
```
Trace: User Dashboard
├── Span: Get User (50ms)
├── Span: Get Posts (100ms)  ← Parallel!
└── Span: Get Comments (75ms)  ← Parallel!
Total: 100ms (longest span)
```

### Cache Hit/Miss

```
Trace: Get User Profile
├── Span: Check Cache (5ms)
│   Attribute: cache.hit = false
└── Span: Database Query (125ms)  ← Cache miss, fetch from DB
    └── Span: Update Cache (10ms)
```

## Visualization

### Jaeger UI
- Timeline view of spans
- Service dependency graph
- Latency percentiles
- Error rates

### DataDog APM
- Flame graphs
- Service map
- Infrastructure correlation
- Profiling integration

### Grafana Tempo
- Integrated with metrics
- LogQL query language
- Correlation with logs

## Best Practices

### 1. Meaningful Span Names

```typescript
// ❌ BAD - Generic
span.setName('function1');
span.setName('database');

// ✅ GOOD - Descriptive
span.setName('create_user');
span.setName('database.users.select');
```

### 2. Add Context

```typescript
// ❌ BAD - No context
span.setAttribute('result', 'success');

// ✅ GOOD - Rich context
span.setAttribute('user.id', user.id);
span.setAttribute('user.type', user.type);
span.setAttribute('query.duration_ms', duration);
span.setAttribute('query.rows_affected', rowCount);
```

### 3. Error Handling

```typescript
try {
  await operation();
  span.setStatus({ code: 1, message: 'OK' });
} catch (error) {
  // Record the exception
  span.recordException(error);
  span.setStatus({ code: 2, message: error.message });
  span.setAttribute('error.type', error.constructor.name);
  throw error;
}
```

### 4. Don't Trace Everything

```typescript
// ❌ BAD - Too granular (noise)
function calculateTotal(items) {
  const span1 = tracer.startSpan('loop_start');
  items.forEach(item => {
    const span2 = tracer.startSpan('process_item');
    // ... 
    span2.end();
  });
  span1.end();
}

// ✅ GOOD - Appropriate granularity
function calculateTotal(items) {
  const span = tracer.startSpan('calculate_total');
  span.setAttribute('item_count', items.length);
  // ... entire calculation
  span.end();
}
```

## Performance Considerations

### Overhead

Tracing adds overhead:
- **CPU:** 1-5% per instrumented operation
- **Memory:** ~1KB per span
- **Network:** Bandwidth to send spans

### Optimization

1. **Sample wisely** - 10% for normal traffic, 100% for errors
2. **Batch spans** - Send in batches, not individually
3. **Async export** - Don't block request thread
4. **Local aggregation** - Aggregate spans before sending
5. **Tail sampling** - Decide to keep trace after completion

```typescript
// Configure batch export
const exporter = new JaegerExporter({
  maxQueueSize: 1000,
  scheduledDelayMillis: 5000, // Batch every 5 seconds
});
```

## Troubleshooting with Traces

### Scenario: API Endpoint is Slow

1. **Find slow traces**
   ```
   Query: endpoint = /api/data AND duration > 1s
   ```

2. **Identify slowest span**
   - Database query taking 900ms
   - Operation: SELECT with JOIN

3. **Check span attributes**
   - No index used
   - Full table scan

4. **Solution**
   - Add database index
   - Optimize query

5. **Verify**
   - New traces show 50ms query time
   - Problem resolved

## Assumptions

- **Assumption 1:** Trace data storage can handle volume
  - *If false:* Increase sampling rate, reduce retention period
- **Assumption 2:** Trace overhead is acceptable (< 5%)
  - *If false:* Reduce instrumentation, increase sampling
- **Assumption 3:** All services propagate trace context
  - *If false:* Add context propagation to missing services

## Failure Modes

### Failure Mode 1: Missing Spans
- **Symptom:** Incomplete traces, gaps in execution flow
- **Impact:** Can't identify slow operations
- **Detection:** Traces missing expected operations
- **Mitigation:**
  - Add instrumentation to missing operations
  - Verify context propagation
  - Check sampling configuration

### Failure Mode 2: High Overhead
- **Symptom:** Application performance degraded after enabling tracing
- **Impact:** Poor user experience
- **Detection:** CPU/memory usage increased
- **Mitigation:**
  - Reduce sampling rate
  - Use async export
  - Remove excessive instrumentation
  - Batch span export

### Failure Mode 3: Lost Context
- **Symptom:** Spans not connected, each operation shows as separate trace
- **Impact:** Can't see full request path
- **Detection:** Many single-span traces
- **Mitigation:**
  - Implement context propagation
  - Use framework instrumentation libraries
  - Pass trace context explicitly

## How to Verify

### Manual Verification
```bash
# 1. Check tracing is enabled
curl http://localhost:3000/health | jq .tracing

# 2. Trigger a traced request
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 3. View trace in Jaeger UI
open http://localhost:16686

# 4. Search for recent traces
# Filter by service: aios-api
# Should see complete trace with multiple spans
```

### Automated Checks
- [ ] Tracing SDK is initialized
- [ ] HTTP requests create spans
- [ ] Database queries create spans
- [ ] Trace context propagates between services
- [ ] Spans contain required attributes

### Success Criteria
1. All services create traces
2. Traces contain all expected spans
3. Context propagates correctly
4. Performance overhead < 5%
5. Can debug issues using traces

## Related Documentation

- [Logging Strategy](./logging.md) - Structured logging
- [Metrics Strategy](./metrics.md) - Metrics collection
- [Operations Overview](../README.md) - Overall operations docs
- [Server Module](../../modules/server.md) - Where tracing happens

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Google Dapper Paper](https://research.google/pubs/pub36356/)
- [Distributed Tracing Best Practices](https://www.datadoghq.com/knowledge-center/distributed-tracing/)
