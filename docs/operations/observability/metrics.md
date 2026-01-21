# Metrics Strategy

**Last Updated:** 2024-01-15
**Owner:** Platform Team

## Plain English Summary

Metrics are numbers that tell us how our system is performing. Unlike logs (which are detailed stories), metrics are simple measurements taken over time - like "how many requests per second" or "how much memory we're using". Good metrics help us detect problems early and understand system health at a glance.

## What to Measure

### The Golden Signals (Most Important)

Based on Google SRE practices, measure these four signals:

#### 1. Latency

**What:** Time taken to service a request
**Why:** Slow responses mean poor user experience

```typescript
// Measure API response time
const start = Date.now();
await handleRequest(req, res);
const duration = Date.now() - start;

metrics.histogram('api.request.duration', duration, {
  method: req.method,
  path: req.route.path,
  status: res.statusCode,
});
```text

### Key Metrics
- P50 (median) response time
- P95 response time
- P99 response time
- Max response time

### Targets
- P95 < 200ms
- P99 < 500ms

#### 2. Traffic

**What:** How much demand is on your system
**Why:** Understand usage patterns, capacity planning

```typescript
// Count requests
metrics.increment('api.requests', {
  method: req.method,
  path: req.route.path,
});

// Track active connections
metrics.gauge('api.active_connections', activeConnections);
```text

### Key Metrics (2)
- Requests per second
- Active connections
- Concurrent users
- Data transfer rate

#### 3. Errors

**What:** Rate of failed requests
**Why:** Errors directly impact users

```typescript
// Count errors by type
metrics.increment('api.errors', {
  type: error.name,
  endpoint: req.path,
  statusCode: res.statusCode,
});

// Track error rate
metrics.gauge('api.error_rate', errorCount / totalRequests);
```text

### Key Metrics (3)
- Error count
- Error rate (errors / total requests)
- Errors by endpoint
- Errors by type

### Targets (2)
- Error rate < 0.1%
- Zero 5xx errors

#### 4. Saturation

**What:** How "full" your service is
**Why:** Predicts when you'll run out of capacity

```typescript
// CPU usage
metrics.gauge('system.cpu_usage', process.cpuUsage().user);

// Memory usage
metrics.gauge('system.memory_usage', process.memoryUsage().heapUsed);

// Database connections
metrics.gauge('database.connections_used', pool.activeCount);
metrics.gauge('database.connections_available', pool.idleCount);
```text

### Key Metrics (4)
- CPU utilization
- Memory utilization
- Disk space used
- Connection pool usage

### Targets (3)
- CPU < 70% sustained
- Memory < 80%
- Disk < 80%
- Connection pool < 80%

## Additional Metrics

### Application Metrics

#### Authentication

```typescript
metrics.increment('auth.login.attempts');
metrics.increment('auth.login.success');
metrics.increment('auth.login.failures', { reason: 'invalid_password' });
metrics.histogram('auth.token.age', tokenAge);
```text

#### Database

```typescript
metrics.histogram('database.query.duration', duration, {
  query_type: 'SELECT',
});
metrics.increment('database.query.count', {
  operation: 'INSERT',
  table: 'users',
});
metrics.gauge('database.connection_pool.size', poolSize);
```text

#### Cache

```typescript
metrics.increment('cache.hits');
metrics.increment('cache.misses');
metrics.gauge('cache.hit_rate', hits / (hits + misses));
metrics.gauge('cache.size', cacheSize);
```text

#### Background Jobs

```typescript
metrics.increment('jobs.started', { job_type: 'send_email' });
metrics.increment('jobs.completed', { job_type: 'send_email' });
metrics.increment('jobs.failed', { job_type: 'send_email' });
metrics.histogram('jobs.duration', duration, { job_type: 'send_email' });
metrics.gauge('jobs.queue_size', queueSize);
```text

### Business Metrics

Track business-relevant metrics:

```typescript
// User activity
metrics.increment('users.registered');
metrics.increment('users.logged_in');
metrics.gauge('users.active_daily', dailyActiveUsers);
metrics.gauge('users.active_monthly', monthlyActiveUsers);

// Feature usage
metrics.increment('feature.used', { feature: 'search' });
metrics.histogram('feature.time_to_first_use', duration);

// Revenue (if applicable)
metrics.increment('purchases.completed', { product_type: 'subscription' });
metrics.histogram('purchases.amount', amount, { currency: 'USD' });
```text

## Metric Types

### Counter

**What:** A value that only increases
**When:** Counting events (requests, errors)

```typescript
// Total requests served (always increasing)
metrics.counter('http_requests_total', {
  method: 'GET',
  status: '200',
});
```text

### Gauge

**What:** A value that can go up or down
**When:** Current state (memory usage, active connections)

```typescript
// Current memory usage (goes up and down)
metrics.gauge('memory_usage_bytes', process.memoryUsage().heapUsed);
```text

### Histogram

**What:** Distribution of values
**When:** Measuring durations, sizes

```typescript
// Request duration distribution
metrics.histogram('http_request_duration_seconds', duration, {
  method: 'POST',
  endpoint: '/api/users',
});
```text

### Summary

**What:** Similar to histogram, different calculation
**When:** Percentiles without histogram overhead

```typescript
// Response time percentiles
metrics.summary('http_response_time', duration);
```text

## Metric Naming Conventions

Follow consistent naming:

```text
<namespace>.<component>.<action>.<unit>

Examples:
- api.request.duration.ms
- database.query.duration.ms
- cache.hit.count
- system.memory.usage.bytes
- job.send_email.duration.ms
```text

### Rules
- Use lowercase and underscores
- Be specific but not verbose
- Include units in name or labels
- Group related metrics with prefixes

## Labels / Tags

Use labels to add dimensions to metrics:

```typescript
// Good - Specific labels
metrics.increment('api.requests', {
  method: 'POST',
  endpoint: '/api/users',
  status_code: 201,
  environment: 'production',
});

// Bad - Too many labels (cardinality explosion)
metrics.increment('api.requests', {
  user_id: req.user.id,        // ❌ Too many unique values
  request_id: req.id,           // ❌ Unique per request
  full_url: req.originalUrl,    // ❌ Too many variations
});
```text

### Label Guidelines
- Low cardinality (< 100 unique values per label)
- Finite set of values
- Used for filtering and grouping
- Common labels: environment, service, endpoint, status

## Dashboards

### Key Dashboards

#### 1. System Health Dashboard

- Error rate (all endpoints)
- P95/P99 response times
- Request rate
- CPU/Memory usage
- Active connections

#### 2. API Performance Dashboard

- Response time by endpoint
- Error rate by endpoint
- Request volume by endpoint
- Slowest endpoints (P99)

#### 3. Database Dashboard

- Query duration (P95/P99)
- Connection pool usage
- Slow queries (> 1s)
- Query count by type

#### 4. Business Metrics Dashboard

- Daily active users
- Feature usage
- Conversion rates
- Revenue (if applicable)

### Dashboard Best Practices

1. **Start with overview** - System health at a glance
2. **Drill down available** - Click to see details
3. **Include thresholds** - Show healthy ranges
4. **Time range selector** - Last hour, day, week
5. **Annotations** - Mark deployments, incidents

## Alerting

### Alert on Symptoms, Not Causes

```text
✅ GOOD: "Error rate > 5%" (symptom users experience)
❌ BAD: "CPU > 80%" (might not affect users)

✅ GOOD: "P95 response time > 500ms" (users see slowness)
❌ BAD: "Database connection count high" (might not cause issues yet)
```text

### Alert Rules

#### Critical Alerts (Page On-Call)

```yaml
# Error rate too high
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: "Error rate above 5% for 5 minutes"

# Service down
- alert: ServiceDown
  expr: up{job="api-server"} == 0
  for: 1m
  annotations:
    summary: "Service is down"
```text

#### Warning Alerts (Ticket)

```yaml
# Elevated error rate
- alert: ElevatedErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
  for: 10m
  annotations:
    summary: "Error rate above 1% for 10 minutes"

# High latency
- alert: HighLatency
  expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
  for: 10m
  annotations:
    summary: "P95 latency above 500ms"
```text

### Alert Fatigue Prevention

1. **Tune thresholds** - Based on actual baselines
2. **Use `for` clause** - Avoid flapping alerts
3. **Group related alerts** - Single notification for related issues
4. **Silence during maintenance** - Planned maintenance windows
5. **Review alert usefulness** - Remove noisy alerts

## Implementation

### Prometheus Client (Node.js)

```typescript
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create registry
const register = new Registry();

// Counter: Total requests
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'endpoint', 'status'],
  registers: [register],
});

// Histogram: Request duration
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'endpoint'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Gauge: Active connections
const activeConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;

    httpRequestsTotal.inc({
      method: req.method,
 endpoint: req.route?.path |  | 'unknown',
      status: res.statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
 endpoint: req.route?.path |  | 'unknown',
      },
      duration
    );
  });

  next();
});
```text

### StatsD / DataDog

```typescript
import StatsD from 'hot-shots';

const metrics = new StatsD({
  host: process.env.STATSD_HOST,
  port: 8125,
  prefix: 'aios.api.',
  globalTags: {
    environment: process.env.NODE_ENV,
    service: 'api-server',
  },
});

// Counter
metrics.increment('requests', { endpoint: '/api/users' });

// Gauge
metrics.gauge('memory.usage', process.memoryUsage().heapUsed);

// Histogram
metrics.histogram('request.duration', duration, {
  endpoint: '/api/users',
});

// Timing (convenience for duration)
metrics.timing('database.query', queryDuration);
```text

## Best Practices

### 1. Cardinality Control

```typescript
// ❌ BAD - Unbounded labels
metrics.increment('requests', {
  user_id: req.user.id,  // Millions of unique values
});

// ✅ GOOD - Bounded labels
metrics.increment('requests', {
  user_type: req.user.type,  // Just a few values: 'free', 'premium'
});
```text

### 2. Consistent Naming

```typescript
// ✅ GOOD - Consistent pattern
'api.request.duration.ms'
'database.query.duration.ms'
'job.process.duration.ms'

// ❌ BAD - Inconsistent
'api_request_time'
'db-query-ms'
'job_processing_duration_milliseconds'
```text

### 3. Include Units

```typescript
// ✅ GOOD - Clear units
'memory.usage.bytes'
'request.duration.ms'
'disk.usage.percent'

// ❌ BAD - Unclear units
'memory.usage'  // Bytes? MB? Percent?
'request.time'  // Seconds? Milliseconds?
```text

### 4. Measure at Source

```typescript
// Measure where the work happens
async function processPayment(payment) {
  const start = Date.now();
  try {
    const result = await externalPaymentAPI.charge(payment);
    metrics.increment('payment.success');
    return result;
  } catch (error) {
    metrics.increment('payment.failure', {
      reason: error.code,
    });
    throw error;
  } finally {
    metrics.histogram('payment.duration', Date.now() - start);
  }
}
```text

## Related Documentation

- [Logging Strategy](./logging.md) - Structured logging
- [Tracing Strategy](./tracing.md) - Distributed tracing
- [Runbooks](../runbooks/README.md) - Using metrics in incident response
- [Operations Overview](../README.md) - Overall operations docs

## References

- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [The Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals)
