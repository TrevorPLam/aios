# Common Incidents Runbook

**Last Updated:** 2024-01-15  
**Purpose:** Quick reference for frequently occurring incidents

## Plain English Summary

This runbook contains quick fixes for common incidents that occur regularly in the AIOS system. These are the "greatest hits" of production issues - problems you'll see again and again. Each incident has a quick diagnosis and resolution path.

## How to Use This Runbook

1. **Find your symptom** in the table of contents below
2. **Follow the Quick Fix** steps
3. **Verify the resolution** worked
4. **If not resolved**, escalate or use detailed runbook

## Incident Index

| Incident | Severity | Avg Resolution Time |
|----------|----------|---------------------|
| [Database Connection Pool Exhausted](#database-connection-pool-exhausted) | High | 5 minutes |
| [API High Latency](#api-high-latency) | High | 10 minutes |
| [Out of Memory (OOM) Errors](#out-of-memory-oom-errors) | Critical | 15 minutes |
| [Authentication Failures](#authentication-failures) | High | 5 minutes |
| [Failed Deployment](#failed-deployment) | Critical | 10 minutes |
| [Disk Space Full](#disk-space-full) | High | 15 minutes |
| [Rate Limiting Triggered](#rate-limiting-triggered) | Medium | 5 minutes |
| [Background Job Failures](#background-job-failures) | Medium | 10 minutes |
| [React Native Worklets Version Mismatch](#react-native-worklets-version-mismatch) | High | 10 minutes |

---

## Database Connection Pool Exhausted

### Symptoms
- API returning 500 errors
- Logs show "Connection pool exhausted" or "Too many connections"
- Database connection metrics maxed out

### Quick Fix

```bash
# 1. Check current connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Kill idle connections (if > 100)
psql $DATABASE_URL -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
  AND state_change < NOW() - INTERVAL '5 minutes';
"

# 3. Restart API servers to reset connection pools
kubectl rollout restart deployment/api-server -n production

# 4. Verify
curl https://api.aios.example.com/health
```

### Verification
- [ ] API health check returns 200
- [ ] Error rate drops below 1%
- [ ] Database connections < 80% of max

### Root Cause Investigation
- Check for connection leaks in recent deployments
- Review slow queries that might hold connections
- Consider increasing connection pool size

### Automation Candidate
- **Priority:** High
- **Approach:** Auto-detect and restart affected pods
- **Ticket:** [Create ticket for automation]

---

## API High Latency

### Symptoms
- P95 response time > 500ms
- P99 response time > 1000ms
- Users reporting slow application

### Quick Fix

```bash
# 1. Check recent deployments
kubectl rollout history deployment/api-server -n production

# 2. Check database performance
psql $DATABASE_URL -c "
  SELECT query, mean_exec_time, calls
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"

# 3. If recent deployment is cause, rollback
kubectl rollout undo deployment/api-server -n production

# 4. If database query is slow, kill long-running queries
psql $DATABASE_URL -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'active'
  AND query_start < NOW() - INTERVAL '30 seconds';
"

# 5. Clear cache if stale
redis-cli FLUSHDB

# 6. Verify
curl -w "@curl-format.txt" https://api.aios.example.com/api/users/me
```

### Verification
- [ ] P95 response time < 300ms
- [ ] P99 response time < 500ms
- [ ] No slow query warnings

### Root Cause Investigation
- Profile slow endpoints
- Check for N+1 query problems
- Review database indexes

### Automation Candidate
- **Priority:** Medium
- **Approach:** Auto-rollback on latency spike
- **Ticket:** [Create ticket]

---

## Out of Memory (OOM) Errors

### Symptoms
- Pods restarting frequently
- Logs show "Out of memory" errors
- Memory metrics show 100% usage

### Quick Fix

```bash
# 1. Identify memory-heavy pods
kubectl top pods -n production --sort-by=memory

# 2. Check for memory leaks
kubectl logs -n production <pod-name> --previous | grep "heap out of memory"

# 3. Scale up temporarily
kubectl scale deployment/api-server -n production --replicas=6

# 4. If recent deployment, rollback
kubectl rollout undo deployment/api-server -n production

# 5. Restart problematic pods
kubectl delete pod <pod-name> -n production

# 6. Verify
kubectl get pods -n production
kubectl top pods -n production
```

### Verification
- [ ] Pods not restarting
- [ ] Memory usage < 80%
- [ ] No OOM errors in logs

### Root Cause Investigation
- Profile memory usage in recent code
- Check for memory leaks
- Review object retention patterns

### Automation Candidate
- **Priority:** High
- **Approach:** Auto-scale on high memory
- **Ticket:** [Create ticket]

---

## Authentication Failures

### Symptoms
- Users can't log in
- "Invalid token" or "Unauthorized" errors
- Auth endpoints returning 401

### Quick Fix

```bash
# 1. Check JWT secret configuration
kubectl get secret jwt-secret -n production -o yaml

# 2. Verify auth service is running
kubectl get pods -n production -l app=auth-service

# 3. Check for token expiration issues
# Review recent JWT_EXPIRES_IN changes

# 4. Clear invalid sessions from database
psql $DATABASE_URL -c "
  DELETE FROM sessions
  WHERE expires_at < NOW();
"

# 5. If auth service down, restart
kubectl rollout restart deployment/auth-service -n production

# 6. Verify
curl -X POST https://api.aios.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### Verification
- [ ] Login endpoint returns 200
- [ ] Valid tokens are accepted
- [ ] Error rate < 1%

### Root Cause Investigation
- Check for JWT secret rotation issues
- Review recent auth code changes
- Verify time sync across servers

### Automation Candidate
- **Priority:** Medium
- **Approach:** Auto-restart auth service on health check failure
- **Ticket:** [Create ticket]

---

## Failed Deployment

### Symptoms
- Deployment stuck in "Progressing" state
- New pods not reaching "Ready" status
- Health checks failing for new version

### Quick Fix

```bash
# 1. Check deployment status
kubectl rollout status deployment/api-server -n production

# 2. Check pod events
kubectl describe pod <pod-name> -n production

# 3. Check logs of failing pods
kubectl logs -n production <pod-name>

# 4. Rollback immediately
kubectl rollout undo deployment/api-server -n production

# 5. Verify rollback
kubectl rollout status deployment/api-server -n production

# 6. Check health
curl https://api.aios.example.com/health
```

### Verification
- [ ] All pods are "Running" and "Ready"
- [ ] Health checks passing
- [ ] No error spikes

### Root Cause Investigation
- Review deployment logs for specific error
- Check for missing environment variables
- Verify database migrations ran successfully
- Review container image build

### Automation Candidate
- **Priority:** High
- **Approach:** Auto-rollback on failed health checks
- **Ticket:** [Create ticket]

---

## Disk Space Full

### Symptoms
- "No space left on device" errors
- Disk usage metrics at 100%
- Pods evicted due to disk pressure

### Quick Fix

```bash
# 1. Check disk usage
kubectl get pods -n production -o wide
kubectl exec -it <pod-name> -n production -- df -h

# 2. Clear old logs
kubectl exec -it <pod-name> -n production -- sh -c "
  find /var/log -name '*.log' -mtime +7 -delete
"

# 3. Clear Docker/containerd cache (on node)
# SSH to node, then:
docker system prune -af
# or
crictl rmi --prune

# 4. Clear application temp files
kubectl exec -it <pod-name> -n production -- rm -rf /tmp/*

# 5. Restart affected pods
kubectl delete pod <pod-name> -n production

# 6. Verify
kubectl exec -it <pod-name> -n production -- df -h
```

### Verification
- [ ] Disk usage < 80%
- [ ] Pods not evicted
- [ ] No disk pressure warnings

### Root Cause Investigation
- Identify what's consuming space
- Check log rotation configuration
- Review file upload handling
- Implement disk monitoring alerts

### Automation Candidate
- **Priority:** High
- **Approach:** Auto-cleanup of old logs/temp files
- **Ticket:** [Create ticket]

---

## Rate Limiting Triggered

### Symptoms
- Users receiving 429 "Too Many Requests" errors
- Rate limit metrics showing high hit rate
- Legitimate users being blocked

### Quick Fix

```bash
# 1. Check rate limit metrics
# View dashboard at [rate-limit-dashboard-url]

# 2. Identify affected IPs/users
redis-cli KEYS "ratelimit:*" | head -20

# 3. Temporarily increase limits (if legitimate traffic)
# Update rate limit configuration
kubectl set env deployment/api-server -n production \
  RATE_LIMIT_MAX=200

# 4. Or clear rate limit for specific user
redis-cli DEL "ratelimit:user:<user-id>"

# 5. Or identify and block malicious IPs
# Add to firewall/WAF rules

# 6. Verify
curl -I https://api.aios.example.com/api/users/me
# Check X-RateLimit-Remaining header
```

### Verification
- [ ] Legitimate users can access API
- [ ] Rate limit hit rate normalized
- [ ] No user complaints

### Root Cause Investigation
- Distinguish between attack and legitimate spike
- Review rate limit thresholds
- Check for client-side retry loops
- Investigate traffic patterns

### Automation Candidate
- **Priority:** Medium
- **Approach:** Auto-adjust limits based on patterns
- **Ticket:** [Create ticket]

---

## Background Job Failures

### Symptoms
- Job queue growing
- Jobs failing repeatedly
- Job processing delayed

### Quick Fix

```bash
# 1. Check job queue status
redis-cli LLEN "bull:jobs:waiting"
redis-cli LLEN "bull:jobs:failed"

# 2. Check worker pods
kubectl get pods -n production -l app=job-worker

# 3. Review failed jobs
# Access Bull dashboard at [bull-dashboard-url]

# 4. Restart job workers
kubectl rollout restart deployment/job-worker -n production

# 5. Clear failed jobs (if many)
redis-cli DEL "bull:jobs:failed"

# 6. Retry specific job type
# Use Bull dashboard to retry jobs

# 7. Verify
redis-cli LLEN "bull:jobs:waiting"
```

### Verification
- [ ] Job queue length decreasing
- [ ] Failed job count not growing
- [ ] Workers processing jobs

### Root Cause Investigation
- Review job failure logs
- Check for external service issues
- Verify job timeout configurations
- Test job logic in staging

### Automation Candidate
- **Priority:** Medium
- **Approach:** Auto-restart workers on failure spike
- **Ticket:** [Create ticket]

---

## React Native Worklets Version Mismatch

### Symptoms
- App crashes on startup with `WorkletsError` 
- Error message: "Mismatch between JavaScript part and native part of Worklets (X.X.X vs Y.Y.Y)"
- iOS/Android app fails to load
- Metro bundler shows worklets-related errors

### Quick Fix

```bash
# 1. Clean all caches and reinstall dependencies
npm run expo:clean:native

# 2. If that doesn't work, do a full clean
npm run expo:clean:full

# 3. Start fresh Metro bundler
npm start -- --clear

# 4. If using development build, rebuild the app
npx expo prebuild --clean
npx expo run:ios  # or npx expo run:android

# 5. Verify
# App should start without WorkletsError
```

### Manual Steps (if scripts fail)

```bash
# 1. Remove all caches
rm -rf node_modules/.cache .expo .metro-cache

# 2. Clear watchman (if installed)
watchman watch-del-all

# 3. Remove and reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# 4. Clear native build folders (if they exist)
rm -rf ios/build android/build

# 5. For custom development builds
npx expo prebuild --clean
npx expo run:ios  # or npx expo run:android
```

### Verification
- [ ] App starts without WorkletsError
- [ ] No version mismatch warnings in logs
- [ ] Animations and gestures work correctly
- [ ] React Native Reanimated features work

### Root Cause
This error occurs when:
- The JavaScript bundle has a different version of `react-native-worklets` than the native iOS/Android code
- Common after updating `react-native-reanimated` or `react-native-worklets`
- Native builds cached old version while JS updated
- Expo development builds not rebuilt after dependency changes

### Prevention
- Always run `npm run expo:clean:native` after updating animation-related dependencies
- For Expo development builds, rebuild native code when updating:
  - `react-native-reanimated`
  - `react-native-worklets`
  - `react-native-gesture-handler`
  - `react-native-draggable-flatlist`
- Use `expo:clean:full` when switching branches with different dependency versions

### Related Documentation
- react-native-worklets troubleshooting: https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting
- Expo prebuild: https://docs.expo.dev/workflow/prebuild/
- React Native Reanimated installation: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation

### Automation Candidate
- **Priority:** Low (manual intervention required for native builds)
- **Approach:** Pre-commit hook to detect dependency version changes
- **Ticket:** [Create ticket if needed]

---

## General Troubleshooting Steps

If the incident doesn't match any above:

### 1. Check Recent Changes
```bash
# Deployments
kubectl rollout history deployment/api-server -n production

# Configuration
kubectl get configmap -n production
kubectl describe configmap <name> -n production
```

### 2. Check Dependencies
```bash
# Database
psql $DATABASE_URL -c "SELECT 1;"

# Redis
redis-cli PING

# External services
curl https://external-api.example.com/health
```

### 3. Review Logs
```bash
# Application logs
kubectl logs -n production deployment/api-server --tail=100

# System logs (on node)
journalctl -u kubelet --since "1 hour ago"
```

### 4. Check Resource Usage
```bash
# Pods
kubectl top pods -n production

# Nodes
kubectl top nodes
```

### 5. When Stuck
- Don't guess - escalate
- Document what you've tried
- Preserve evidence (logs, metrics)
- Communicate status

## Related Documentation

- [Runbook Template](./runbook_template.md) - Create detailed runbooks
- [Escalation Procedures](../oncall/escalation.md) - When to escalate
- [Logging Strategy](../observability/logging.md) - How to use logs
- [Metrics Strategy](../observability/metrics.md) - What metrics mean

## Notes

- This runbook is for quick fixes - create detailed runbooks for complex incidents
- Update this runbook when you discover new common incidents
- If an incident occurs more than 3 times, it needs automation
- Always verify the fix and investigate root cause

## References

- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [PostgreSQL Admin Commands](https://www.postgresql.org/docs/current/app-psql.html)
- [Redis Commands](https://redis.io/commands)
