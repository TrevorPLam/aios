# Runbook: [Incident/Task Name]

 **Severity:** [Critical | High | Medium | Low]
**Last Tested:** YYYY-MM-DD
**Owner:** [Team/Person]
 **Response Time:** [Immediate | < 30 min | < 2 hours | Next business day]

## Plain English Summary

[2-3 sentences describing what this runbook is for and when to use it]

## Symptoms

How do you know this incident is occurring?

- [Symptom 1] - e.g., "API returning 500 errors"
- [Symptom 2] - e.g., "Database connection pool exhausted alert"
- [Symptom 3] - e.g., "Users reporting cannot log in"

### Monitoring/Alerting

- **Alert Name:** `[alert-name]`
- **Dashboard:** [Link to Grafana/Datadog dashboard]
- **Logs:** Where to find relevant logs
- **Metrics:** Key metrics to check

## Impact

### User Impact

- [What users experience] - e.g., "Cannot access application"
- [Affected functionality] - e.g., "Login and data sync broken"

### System Impact

- [What systems are affected] - e.g., "API server cannot connect to database"
- [Cascading effects] - e.g., "Background jobs failing"

### Business Impact

- [Revenue/business effect] - e.g., "Users cannot complete purchases"
- [SLA impact] - e.g., "Violates 99.9% uptime SLA"

## Prerequisites

Before following this runbook, ensure you have:

- [ ] Access to production systems
- [ ] VPN connection established
- [ ] AWS/Cloud provider access
- [ ] PagerDuty/on-call system access
- [ ] Database admin credentials
- [ ] Slack/communication channel access

### Required Tools

```bash
# List tools needed
aws-cli >= 2.0
kubectl >= 1.24
psql >= 14.0
```text

### Required Permissions

- AWS: `[IAM role or policy needed]`
- Database: `[database user with specific permissions]`
- Kubernetes: `[namespace and RBAC permissions]`

## Initial Assessment

### Step 1: Verify the Issue

```bash
# Check system health
curl https://api.aios.example.com/health

# Expected output
# {"status": "ok"}

# If failing, output will be
# {"status": "error", "database": "unreachable"}
```text

### Step 2: Check Monitoring

1. **Open dashboard:** [Link to monitoring dashboard]
2. **Check error rate:** Should be < 1%, if higher proceed
3. **Check response times:** Should be < 500ms P99
4. **Review recent deployments:** Last 2 hours

### Step 3: Assess Severity

| Condition | Severity | Action |
| ----------- | ---------- | -------- |
| Complete outage | Critical | Continue with resolution |
| Partial functionality | High | Continue with resolution |
| Minor issues | Medium | Schedule during business hours |
| No user impact | Low | Create ticket, handle later |

## Resolution Steps

Follow these steps in order. Don't skip ahead.

### Step 1: [First Action]

**Goal:** [What this step accomplishes]

### Commands
```bash
# Command 1 with explanation
kubectl get pods -n production

# Expected output (2)
# NAME                    READY   STATUS    RESTARTS   AGE
# api-server-abc123       1/1     Running   0          5h

# If pods are not running
kubectl describe pod api-server-abc123 -n production
```text

### Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

### If this doesn't work
- Go to Step [alternative step number]
- Or escalate to [team/person]

### Step 2: [Second Action]

**Goal:** [What this step accomplishes]

### Commands (2)
```bash
# Command with explanation
```text

## Success Criteria
- [ ] [Measurable outcome]

### If this doesn't work (2)
- [Alternative approach]

### Step 3: [Third Action]

Continue for all resolution steps...

## Verification

After completing resolution steps, verify the fix:

### Step 1: Check Service Health

```bash
# Verify service is responding
curl https://api.aios.example.com/health

# Should return
# {"status": "ok", "database": "connected"}
```text

### Step 2: Monitor Error Rates

1. Open [monitoring dashboard]
2. Verify error rate < 1%
3. Verify response times normal
4. Watch for 5-10 minutes

### Step 3: Test Critical Paths

```bash
# Test user login
curl -X POST https://api.aios.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Should return 200 with JWT token
```text

### Step 4: Confirm with Users

- [ ] Check user reports (if any)
- [ ] Update status page
- [ ] Monitor support channels

## Communication

### During Incident

1. **Immediately:**
   - Update status page: [link]
   - Post in Slack: `#incidents`
   - Notify stakeholders: [distribution list]

2. **Every 30 minutes:**
   - Status update on progress
   - ETA for resolution

3. **When resolved:**
   - Update status page
   - Post resolution message
   - Thank responders

### Example Status Update

```text
INCIDENT UPDATE - [Timestamp]
Status: Investigating / Identified / Monitoring / Resolved
Impact: [Description of user impact]
Action: [What we're doing to fix it]
ETA: [When we expect resolution]
```text

## Rollback Procedure

If resolution steps don't work, rollback:

### Step 1: Identify Last Known Good State

```bash
# Check deployment history
kubectl rollout history deployment/api-server -n production

# Identify last good revision (e.g., revision 42)
```text

### Step 2: Execute Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/api-server -n production

# Or rollback to specific revision
kubectl rollout undo deployment/api-server --to-revision=42 -n production
```text

### Step 3: Verify Rollback

```bash
# Check rollout status
kubectl rollout status deployment/api-server -n production

# Verify health
curl https://api.aios.example.com/health
```text

## Escalation

Escalate if:

- [ ] Resolution steps don't work after 2 attempts
- [ ] Incident duration > 1 hour for Critical
- [ ] Incident duration > 4 hours for High
- [ ] New symptoms appear
- [ ] You're stuck and need help

### Escalation Contacts

- **Primary:** [Name] - [Contact method]
- **Secondary:** [Name] - [Contact method]
- **Manager:** [Name] - [Contact method]

See [Escalation Procedures](../oncall/escalation.md) for full escalation matrix.

## Root Cause Investigation

After the incident is resolved, investigate the root cause:

### Data to Collect

- [ ] Timeline of events
- [ ] Error logs from incident period
- [ ] Metrics showing issue start
- [ ] Recent changes (deployments, config, etc.)
- [ ] User reports

### Common Root Causes

1. **Recent deployment** - New code introduced bug
2. **Configuration change** - Environment variable modified
3. **Resource exhaustion** - Memory/CPU/disk full
4. **External dependency** - Third-party service outage
5. **Database issues** - Connection pool, slow queries

### Investigation Commands

```bash
# Check recent deployments
kubectl rollout history deployment/api-server -n production

# Check resource usage
kubectl top pods -n production

# Check logs for errors
kubectl logs -n production deployment/api-server --tail=100 | grep ERROR

# Check database performance
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```text

## Post-Incident Actions

After resolving the incident:

1. **Create postmortem:**
   - Use [postmortem template](../oncall/postmortem_template.md)
   - Schedule postmortem meeting within 48 hours
   - Document timeline, root cause, action items

2. **Update runbook:**
   - If steps didn't work perfectly, update them
   - Add new information learned
   - Update "Last Tested" date

3. **Implement preventions:**
   - Create tickets for action items
   - Add monitoring/alerting if missing
   - Automate manual steps if possible

4. **Share learnings:**
   - Post postmortem in documentation
   - Share in team meeting
   - Update training materials

## Assumptions

- **Assumption 1:** [What you're assuming to be true]
  - *If false:* [What to do instead]
- **Assumption 2:** [Another assumption]
  - *If false:* [Alternative action]

## Failure Modes

### Failure Mode 1: [Name]

- **Symptom:** [How this failure manifests]
- **Impact:** [Effect on resolution]
- **Detection:** [How to detect this failure]
- **Mitigation:** [How to work around it]

## How to Test This Runbook

To verify this runbook works:

```bash
# 1. Create test incident in staging
[commands to simulate the incident]

# 2. Follow runbook steps exactly
[run through procedure]

# 3. Verify resolution
[check that issue is resolved]

# 4. Update "Last Tested" date above
```text

 **Testing Schedule:** [Quarterly | Monthly | After major changes]

## Automation Candidate

This section identifies opportunities to automate this runbook.

### Manual Steps That Could Be Automated

1. **Step [N]:** [Description of manual step]
   - **Automation approach:** [How it could be automated]
- **Effort:** [Small | Medium | Large]
- **Priority:** [High | Medium | Low]
   - **Ticket:** [Link to automation ticket if created]

2. **Step [N]:** [Another manual step]
   - **Automation approach:** [How it could be automated]
- **Effort:** [Small | Medium | Large]
- **Priority:** [High | Medium | Low]

### Automation Plan

- **Phase 1:** Automate most frequent/error-prone steps
- **Phase 2:** Add self-healing capabilities
- **Phase 3:** Full automation with human approval gates

### Automation Criteria

Automate this runbook if:

- [ ] Executed more than once per month
- [ ] Steps are deterministic and safe
- [ ] No judgment calls required
- [ ] Clear success/failure criteria

## Related Documentation

- [Operations Overview](../README.md)
- [Escalation Procedures](../oncall/escalation.md)
- [Postmortem Template](../oncall/postmortem_template.md)
- [Logging Strategy](../observability/logging.md)
- [Metrics Strategy](../observability/metrics.md)
- [Server Module](../../modules/server.md)

## Notes

[Any additional context, gotchas, or important information]

## References

- [Link to related documentation]
- [Link to monitoring dashboard]
- [Link to similar incidents]
