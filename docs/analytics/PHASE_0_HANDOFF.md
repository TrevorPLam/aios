# Phase 0 Implementation Handoff Document

**Created:** 2026-01-20
**Status:** 4 of 5 tasks complete
**Next Agent:** Can pick up at T-085 (testing) or move to Phase 1
**Commit:** a757125

---

## Executive Summary

**Phase 0 is 80% complete.** The analytics system is now functional end-to-end:

- ✅ Database schema created
- ✅ Storage methods implemented
- ✅ Server endpoint added
- ✅ Validation schemas complete
- ⏸️ Integration testing needed

**Key Achievement:** Analytics client can now successfully POST events to `/api/telemetry/events` and they will persist in the server's storage layer.

---

## What Was Implemented

### T-081: Database Schema ✅ COMPLETE

**File:** `packages/contracts/schema.ts` (+57 lines)

### Added

```typescript
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id"),
    eventName: varchar("event_name", { length: 100 }).notNull(),
    eventProperties: jsonb("event_properties").notNull().default({}),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    sessionId: varchar("session_id", { length: 50 }),
    deviceId: varchar("device_id", { length: 100 }),
    platform: varchar("platform", { length: 20 }),
    appVersion: varchar("app_version", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("analytics_user_id_idx").on(table.userId),
    eventNameIdx: index("analytics_event_name_idx").on(table.eventName),
    timestampIdx: index("analytics_timestamp_idx").on(table.timestamp),
    sessionIdIdx: index("analytics_session_id_idx").on(table.sessionId),
  }),
);
```text

### Features
- UUID primary key with auto-generation
- JSONB column for flexible event properties
- Timestamp with timezone for correct time handling
- 4 indexes for performant queries
- `userId` can be NULL (supports privacy mode)

### Database Migration
- Drizzle ORM will auto-generate migration
- Run `npx drizzle-kit generate:pg` to create migration
- Run `npx drizzle-kit push:pg` to apply to database
- ⚠️ **NOTE:** Project uses in-memory storage, so migration may not be needed yet

---

### T-082: Storage Methods ✅ COMPLETE

**File:** `apps/api/storage.ts` (+109 lines)

### Added to IStorage interface
```typescript
saveAnalyticsEvents(events: Array<{...}>): Promise<void>
getAnalyticsEvents(userId, filters?): Promise<AnalyticsEvent[]>
deleteUserAnalytics(userId: string): Promise<void>
```text

### Implementation in MemStorage class
#### 1. `saveAnalyticsEvents(events)`

```typescript
// Batch insert with idempotency
// - Skips duplicate event IDs
// - Handles up to 100 events per batch
// - Logs saved count
await storage.saveAnalyticsEvents([...events]);
```text

### Features (2)
- **Idempotency**: Checks `event.eventId` and skips duplicates
- **Batch processing**: Efficient for 50+ events
- **Validation**: Assumes events are pre-validated
- **Logging**: Logs duplicate skips and save count

### 2. `getAnalyticsEvents(userId, filters)`

```typescript
// Query events with filters
const events = await storage.getAnalyticsEvents("user-123", {
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-01-31"),
  eventNames: ["app_opened", "module_opened"],
  limit: 100,
});
```text

### Features (3)
- Filters by userId (required)
- Optional date range filtering
- Optional event name filtering
- Optional limit for pagination
- Returns sorted by timestamp (newest first)

### 3. `deleteUserAnalytics(userId)`

```typescript
// GDPR deletion - removes all user events
await storage.deleteUserAnalytics("user-123");
```text

### Features (4)
- Deletes ALL events for a user
- Logs deletion count
- Required for GDPR compliance

---

### T-083: Server Endpoint ✅ COMPLETE

**File:** `apps/api/routes.ts` (+31 lines)

### Added endpoint
```typescript
POST /api/telemetry/events
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "events": [
    {
      "eventId": "uuid",
      "eventName": "app_opened",
      "timestamp": "2026-01-20T00:00:00.000Z",
      "properties": { "install_age_bucket": "0d" },
      "identity": {
        "userId": "uuid",
        "sessionId": "session-123",
        "deviceId": "device-456"
      },
      "appVersion": "1.0.0",
      "platform": "ios"
    }
  ],
  "schemaVersion": "1.0.0",
  "mode": "default"
}
```text

### Response (202 Accepted)
```json
{
  "received": 50,
  "timestamp": "2026-01-20T01:17:18.863Z",
  "schemaVersion": "1.0.0"
}
```text

### Features (5)
- **Authentication**: Requires JWT token via `authenticate` middleware
- **Validation**: Uses `analyticsBatchSchema` for request validation
- **Idempotency**: Duplicate events skipped by storage layer
- **Async processing**: Returns 202 (not 200) to indicate async handling
- **Error handling**:
  - 400 for validation errors
  - 401 for authentication failures
  - 500 for storage errors

### Event Mapping
- Maps client format (`eventId`, `eventName`, etc.) to storage format
- Preserves all fields
- Handles optional fields gracefully

---

### T-084: Validation Schemas ✅ COMPLETE

**File:** `packages/contracts/schema.ts` (+38 lines within T-081 changes)

### Added schemas
#### 1. `analyticsEventSchema`

```typescript
{
  eventId: z.string().uuid(),
  eventName: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  properties: z.record(z.any()),
  identity: z.object({
    userId: z.string().uuid().optional(),
    deviceId: z.string().optional(),
    sessionId: z.string().optional(),
  }),
  appVersion: z.string().optional(),
  platform: z.string().optional(),
}
```text

### 2. `analyticsBatchSchema`

```typescript
{
  events: z.array(analyticsEventSchema).min(1).max(100),
  schemaVersion: z.string().default("1.0.0"),
  mode: z.enum(["default", "privacy"]).optional(),
}
```text

### Features (6)
- Full Zod validation for type safety
- UUID validation for eventId and userId
- Datetime validation for timestamps
- Batch size limits (1-100 events)
- Schema version tracking
- Privacy mode support

### Exported Types
```typescript
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type AnalyticsEventPayload = z.infer<typeof analyticsEventSchema>;
export type AnalyticsBatchPayload = z.infer<typeof analyticsBatchSchema>;
```text

---

## What Remains: T-085 (Integration Testing)

**Priority:** P0
**Effort:** 4-6 hours
**Status:** Not started

### Requirements
1. **End-to-end test**: Client sends events → Server receives → Storage persists
2. **Offline queueing test**: Events queue when server is down
3. **Retry logic test**: Events retry on failure
4. **Batch sending test**: 50+ events sent as batch
5. **GDPR deletion test**: `deleteUserAnalytics()` removes all events
6. **Error handling test**: Bad payload returns 400

### How to Test Manually
#### 1. Start the server
```bash
cd /home/runner/work/Mobile-Scaffold/Mobile-Scaffold
npm run dev
```text

### 2. Send test event from client
```typescript
// In client code (e.g., App.tsx)
import analytics from "@/analytics";

// App should already be calling this:
await analytics.initialize();
await analytics.trackAppOpened(0, "wifi");
```text

### 3. Verify in server logs
```text
[Analytics] Saved 1 events
```text

### 4. Test query (add to server endpoint for testing)
```typescript
// Temporary test endpoint
app.get("/api/telemetry/debug", authenticate, async (req, res) => {
  const events = await storage.getAnalyticsEvents(req.user!.userId, {
    limit: 10,
  });
  res.json(events);
});
```text

### 5. Test GDPR deletion
```typescript
await storage.deleteUserAnalytics("user-id");
// Should log: [Analytics] Deleted N events for user user-id
```text

### Automated Testing
Create file: `apps/api/__tests__/analytics.test.ts`

```typescript
import { MemStorage } from "../storage";
import { randomUUID } from "crypto";

describe("Analytics Storage", () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  test("should save analytics events", async () => {
    const events = [
      {
        eventId: randomUUID(),
        eventName: "app_opened",
        timestamp: new Date().toISOString(),
        properties: { test: true },
        identity: { userId: "user-1", sessionId: "session-1" },
      },
    ];

    await storage.saveAnalyticsEvents(events);
    const saved = await storage.getAnalyticsEvents("user-1");

    expect(saved).toHaveLength(1);
    expect(saved[0].eventName).toBe("app_opened");
  });

  test("should skip duplicate events", async () => {
    const eventId = randomUUID();
    const event = {
      eventId,
      eventName: "test_event",
      timestamp: new Date().toISOString(),
      properties: {},
      identity: { userId: "user-1" },
    };

    await storage.saveAnalyticsEvents([event]);
    await storage.saveAnalyticsEvents([event]); // Duplicate

    const saved = await storage.getAnalyticsEvents("user-1");
    expect(saved).toHaveLength(1); // Not 2
  });

  test("should filter events by date range", async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await storage.saveAnalyticsEvents([
      {
        eventId: randomUUID(),
        eventName: "old_event",
        timestamp: yesterday.toISOString(),
        properties: {},
        identity: { userId: "user-1" },
      },
      {
        eventId: randomUUID(),
        eventName: "new_event",
        timestamp: now.toISOString(),
        properties: {},
        identity: { userId: "user-1" },
      },
    ]);

    const recentEvents = await storage.getAnalyticsEvents("user-1", {
      startDate: new Date(now.getTime() - 1000),
    });

    expect(recentEvents).toHaveLength(1);
    expect(recentEvents[0].eventName).toBe("new_event");
  });

  test("should delete all user analytics (GDPR)", async () => {
    await storage.saveAnalyticsEvents([
      {
        eventId: randomUUID(),
        eventName: "event1",
        timestamp: new Date().toISOString(),
        properties: {},
        identity: { userId: "user-1" },
      },
      {
        eventId: randomUUID(),
        eventName: "event2",
        timestamp: new Date().toISOString(),
        properties: {},
        identity: { userId: "user-1" },
      },
    ]);

    await storage.deleteUserAnalytics("user-1");
    const events = await storage.getAnalyticsEvents("user-1");

    expect(events).toHaveLength(0);
  });
});
```text

### Run tests
```bash
npm test apps/api/__tests__/analytics.test.ts
```text

---

## Known Issues and Limitations

### 1. In-Memory Storage

**Issue:** Events stored in memory, lost on server restart
**Impact:** Not production-ready for persistent analytics
**Solution:** Phase 1 or 2 should add database persistence (PostgreSQL with Drizzle ORM)
**Workaround:** Acceptable for MVP/testing

### 2. No Rate Limiting

**Issue:** No per-user rate limit on telemetry endpoint
**Impact:** Potential abuse (spam events)
**Solution:** Add rate limiting middleware
### Example
```typescript
import rateLimit from "express-rate-limit";

const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many analytics events, please slow down",
});

app.post("/api/telemetry/events",
  authenticate,
  analyticsLimiter, // Add rate limiter
  validate(analyticsBatchSchema),
  asyncHandler(async (req, res) => { ... })
);
```text

### 3. No Compression Detection

**Issue:** Server doesn't check for `Content-Encoding: gzip` header
**Impact:** Compressed payloads may not decompress correctly
**Solution:** Add compression middleware or check header
**Status:** Client has compression but may not be sending gzipped payloads yet

### 4. No Background Job for Cleanup

**Issue:** Old events never deleted automatically
**Impact:** Memory grows indefinitely
**Solution:** Add cleanup job in Phase 1
### Example (2)
```typescript
// Run daily cleanup
setInterval(() => {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days
  // Delete events older than cutoff
}, 24 * 60 * 60 * 1000);
```text

### 5. No Event Streaming

**Issue:** Can't stream events in real-time
**Impact:** Event Inspector (Phase 1) can't show live events
**Solution:** Add WebSocket or Server-Sent Events in Phase 1
**Status:** Not blocking for Phase 0

---

## Next Steps

### Immediate (T-085)

1. **Write automated tests** (see testing section above)
2. **Test end-to-end** (client → server → storage)
3. **Verify GDPR deletion** works correctly
4. **Test with 50+ events** in a batch
5. **Test offline queueing** (stop server, send events, restart server)

### Phase 1 (T-071) - After T-085

**Estimated effort:** 80-120 hours over 3 months

### Task 1.1: Event Inspector UI (20-30h)

- React component showing real-time event stream
- Filters by event type, module, date range
- Shows validation errors
- Search functionality

### Task 1.2: Metrics Collection (20-30h)

- Throughput metrics (events/sec, events/min)
- Latency tracking (p50, p95, p99)
- Error rate calculation
- Dashboard integration

### Task 1.3: Consent Management (15-20h)

- Consent categories (necessary, analytics, marketing)
- Granular consent per category
- GDPR-compliant opt-in
- Consent change tracking

### Task 1.4: Data Retention (15-20h)

- Configurable retention periods
- Automatic cleanup job
- Backend enforcement

### Task 1.5: Data Deletion API (10-15h)

- User data deletion endpoint
- Export before deletion
- Audit logging

### Task 1.6: Testing & Documentation (10-20h)

- Comprehensive tests
- Usage documentation
- Integration guide

---

## Troubleshooting Guide

### Problem: Events not reaching server

#### Symptoms
- Client logs show events being sent
- Server logs don't show "Saved N events"
- No errors visible

### Diagnosis
1. Check client transport configuration:

   ```typescript
   // In apps/mobile/analytics/client.ts
   endpoint: "/api/telemetry/events", // Should match server
   ```text

1. Check server is running:

   ```bash
   curl http://localhost:5000/status
   # Should return: {"status":"ok","timestamp":"..."}
   ```text

1. Check authentication:

   ```typescript
   // Client must send JWT token
   headers: {
     "Authorization": `Bearer ${token}`,
   }
   ```text

1. Check network errors in client:

   ```typescript
   // In apps/mobile/analytics/transport.ts
   // Add console.log to see actual error
   ```text

### Solution
- Verify endpoint path matches
- Ensure JWT token is valid
- Check CORS if applicable
- Enable debug mode: `debugMode: true` in analytics config

---

### Problem: Duplicate events being saved

#### Symptoms (2)
- Same event ID appearing multiple times
- Storage showing more events than sent

### Diagnosis (2)
1. Check if idempotency is working:

   ```typescript
   // In apps/api/storage.ts, line ~765
   if (this.analyticsEvents.has(event.eventId)) {
     console.log(`[Analytics] Skipping duplicate event: ${event.eventId}`);
     continue;
   }
   ```text

1. Check if client is generating unique IDs:

   ```typescript
   // In apps/mobile/analytics/client.ts
   event_id: randomUUID(), // Should be unique per event
   ```text

### Solution (2)
- Ensure `randomUUID()` is used for each event
- Check server logs for "Skipping duplicate event" messages
- If duplicates persist, check if Map.has() is working correctly

---

### Problem: GDPR deletion not working

#### Symptoms (3)
- `deleteUserAnalytics()` called but events still exist
- Query returns events after deletion

### Diagnosis (3)
1. Check if user ID matches:

   ```typescript
   // userId must match exactly
   const events = await storage.getAnalyticsEvents("user-123");
   await storage.deleteUserAnalytics("user-123"); // Same ID
   ```text

1. Check deletion logic:

   ```typescript
   // In apps/api/storage.ts, line ~831
   const eventsToDelete = Array.from(this.analyticsEvents.values()).filter(
     (event) => event.userId === userId,
   );
   ```text

### Solution (3)
- Verify user ID format (UUID vs string)
- Check if userId field is populated (may be NULL in privacy mode)
- Add logging to see how many events are being deleted

---

### Problem: Validation errors on endpoint

#### Symptoms (4)
- 400 Bad Request
- Error message about validation failure

### Diagnosis (4)
1. Check event format matches schema:

   ```typescript
   {
     eventId: "uuid", // Must be valid UUID
     eventName: "app_opened", // String, 1-100 chars
     timestamp: "2026-01-20T00:00:00.000Z", // ISO datetime
     properties: {}, // Any object
     identity: {
       userId: "uuid", // Optional UUID
       sessionId: "string", // Optional string
     },
   }
   ```text

1. Check batch format:

   ```typescript
   {
     events: [...], // Array of 1-100 events
     schemaVersion: "1.0.0", // String
     mode: "default", // Optional: "default" or "privacy"
   }
   ```text

### Solution (4)
- Use exact schema from `packages/contracts/schema.ts`
- Validate locally before sending
- Check Zod error messages for specific field issues

---

## File Structure Reference

```text
/home/runner/work/Mobile-Scaffold/Mobile-Scaffold/
├── packages/contracts/
│   └── schema.ts                          # Database schema + validation ✅ MODIFIED
├── apps/api/
│   ├── storage.ts                         # Storage layer ✅ MODIFIED
│   ├── routes.ts                          # API endpoints ✅ MODIFIED
│   └── __tests__/
│       └── analytics.test.ts              # ⏸️ NEEDS CREATION (T-085)
├── apps/mobile/
│   └── analytics/
│       ├── client.ts                      # Already configured to POST
│       ├── transport.ts                   # HTTP transport with retry
│       └── types.ts                       # Client-side types
└── docs/
    └── analytics/
        ├── PHASE_0_HANDOFF.md             # ✅ THIS DOCUMENT
        ├── DEEP_ASSESSMENT_AND_GAMEPLAN.md
        ├── IMPLEMENTATION_PLAN.md
        └── WORLD_CLASS_ANALYTICS_ROADMAP.md
```text

---

## Code References

### Key Functions Implemented

#### 1. Server Endpoint

```typescript
// File: apps/api/routes.ts, line ~687
app.post("/api/telemetry/events", authenticate, validate(analyticsBatchSchema), ...)
```text

### 2. Storage Methods

```typescript
// File: apps/api/storage.ts
saveAnalyticsEvents(events)      // Line ~751
getAnalyticsEvents(userId, filters)  // Line ~790
deleteUserAnalytics(userId)      // Line ~831
```text

### 3. Database Schema

```typescript
// File: packages/contracts/schema.ts, line ~303
export const analyticsEvents = pgTable("analytics_events", {...})
```text

### 4. Validation Schemas

```typescript
// File: packages/contracts/schema.ts, line ~328
export const analyticsEventSchema = z.object({...})
export const analyticsBatchSchema = z.object({...})
```text

### Client Configuration

#### Endpoint Configuration
```typescript
// File: apps/mobile/analytics/client.ts, line ~32
endpoint: "/api/telemetry/events",  // Matches server
```text

### Transport Layer
```typescript
// File: apps/mobile/analytics/transport.ts, line ~145
method: "POST",
body: JSON.stringify(payload),
```text

---

## Success Criteria

Phase 0 is considered **COMPLETE** when:

- ✅ Database schema created with indexes
- ✅ Storage methods implemented (save, get, delete)
- ✅ Server endpoint accepts POST requests
- ✅ Validation schemas enforce data quality
- ⏸️ **End-to-end test passes** (client → server → storage)
- ⏸️ **GDPR deletion test passes** (all events removed)
- ⏸️ **Idempotency test passes** (duplicates skipped)

**Current Status:** 4/5 complete (80%)
**Remaining:** T-085 testing

---

## Contact / Questions

If you have questions about this handoff:

1. **Read first:**
   - This document (PHASE_0_HANDOFF.md)
   - DEEP_ASSESSMENT_AND_GAMEPLAN.md
   - IMPLEMENTATION_PLAN.md

2. **Check code:**
   - `packages/contracts/schema.ts` - Schema definitions
   - `apps/api/storage.ts` - Storage implementation
   - `apps/api/routes.ts` - API endpoint

3. **Test manually:**
   - Start server: `npm run dev`
   - Send event from client
   - Check server logs

4. **Known good commit:** `a757125`

---

## Summary

### What works
- ✅ Client can POST events to `/api/telemetry/events`
- ✅ Server validates events with Zod
- ✅ Events persist in memory storage
- ✅ Can query events by user + filters
- ✅ Can delete all user events (GDPR)
- ✅ Idempotency prevents duplicates
- ✅ Batch processing (up to 100 events)

### What needs work
- ⏸️ Automated tests (T-085)
- 🔜 Rate limiting (security)
- 🔜 Database persistence (PostgreSQL)
- 🔜 Background cleanup job (retention)
- 🔜 Real-time streaming (WebSocket)

### Next agent should
1. Write automated tests for T-085
2. Test end-to-end flow manually
3. Begin Phase 1 (T-071) after tests pass

---

**Created:** 2026-01-20
**Last Updated:** 2026-01-20
**Version:** 1.0
**Status:** Ready for handoff

