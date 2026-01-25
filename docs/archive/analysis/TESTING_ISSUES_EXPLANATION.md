# Testing Issues Explanation

## Offline Queueing Test Pattern Issue

**Problem:** TASK-085 asks to "Test offline queueing (events queue when server down)" but this is difficult to test in API tests.

**Why it's hard:**
1. **Client-side code**: Offline queueing is implemented in `packages/platform/analytics/queue.ts` which uses React Native's `AsyncStorage`
2. **Different environment**: API tests run in Node.js, not React Native environment
3. **Network simulation**: Would need to simulate network failures and server downtime
4. **Integration complexity**: Requires testing client + server together, not just server

**What offline queueing does:**
- When network is unavailable, events are stored in AsyncStorage
- When network returns, queued events are sent in batches
- Queue has max size limits and compaction logic

**Better approach:**
- Test queue logic in client-side unit tests (React Native test environment)
- Test API endpoint separately (what we did)
- Integration tests could mock network failures, but that's complex

## Retry Logic Testing Issue

**Problem:** TASK-085 asks to "Test retry logic (events retry on failure)" but retry logic is in client transport layer.

**Why it's hard:**
1. **Client-side code**: Retry logic is in `packages/platform/analytics/transport.ts`
2. **Exponential backoff**: Tests would need to wait for backoff delays (slow tests)
3. **Network mocking**: Would need to mock HTTP failures at different stages
4. **State management**: Retry count and backoff state are managed client-side

**What retry logic does:**
- Attempts to send events up to `maxRetries` times (default 3)
- Uses exponential backoff with jitter between retries
- Returns `shouldRetry: false` for permanent failures (4xx errors)
- Returns `shouldRetry: true` for transient failures (5xx, network errors)

**Better approach:**
- Test retry logic in client-side unit tests with mocked HTTP
- Test API error responses separately (what we did)
- Integration tests could verify end-to-end retry behavior, but requires client test setup

## Recommendation

Split testing into:
1. **API Tests** (what we created): Test server-side behavior (endpoint, validation, storage)
2. **Client Tests** (separate task): Test client-side behavior (queue, retry, offline)
3. **Integration Tests** (optional): Test full flow with mocked network conditions
