# Postmortem: [Incident Title]

**Date:** YYYY-MM-DD
**Authors:** [Names of postmortem authors]
 **Status:** [Draft | Under Review | Final]
 **Severity:** [1-Critical | 2-High | 3-Medium | 4-Low]

## Plain English Summary

[2-3 sentences explaining what happened, why it happened, and what we're doing to prevent it from happening again. Write this for non-technical stakeholders.]

## Incident Overview

| Field | Value |
| ------- | ------- |
| **Incident ID** | INC-YYYY-MM-DD-NNN |
| **Start Time** | YYYY-MM-DD HH:MM:SS UTC |
| **End Time** | YYYY-MM-DD HH:MM:SS UTC |
| **Duration** | X hours Y minutes |
| **Severity** | [1-4] |
| **Responders** | [Names of everyone who helped] |
| **Status Page** | [Link to status page updates] |

## Impact

### User Impact

- **Users Affected:** [Number or percentage of users]
- **User-Facing Impact:** [What users experienced]
- **Geographic Impact:** [Which regions affected]
- **Feature Impact:** [Which features were unavailable]

### Example

```text
- Users Affected: ~10,000 users (~25% of active users)
- User-Facing Impact: Unable to log in, existing sessions logged out
- Geographic Impact: All regions
- Feature Impact: Complete authentication unavailable
```text

### Business Impact

- **Revenue Impact:** [$X in lost transactions or N/A]
- **SLA Impact:** [Did we violate SLAs? Which ones?]
- **Support Impact:** [Number of support tickets]
- **Reputation Impact:** [Social media, reviews, etc.]

### System Impact

- **Services Affected:** [List of services/components]
- **Data Impact:** [Any data loss or corruption]
- **Dependencies:** [External systems affected or affecting us]

## Timeline

### All times in UTC

| Time | Event | Who |
| ------ | ------- | ----- |
| HH:MM | [Event description] | [Person/System] |
| HH:MM | Alert fired: "DatabaseConnectionFailed" | Monitoring |
| HH:MM | On-call engineer acknowledged | Engineer A |
| HH:MM | Investigation started, checked pod health | Engineer A |
| HH:MM | Identified database connection pool exhausted | Engineer A |
| HH:MM | Attempted to restart pods | Engineer A |
| HH:MM | Issue persisted, escalated to team lead | Engineer A |
| HH:MM | Identified root cause: connection leak in v1.2.3 | Team Lead |
| HH:MM | Rolled back to v1.2.2 | Engineer A + Team Lead |
| HH:MM | Service restored, monitoring recovery | Engineer A |
| HH:MM | Declared incident resolved | Team Lead |
| HH:MM | Post-incident monitoring complete | Engineer A |

## What Happened (Technical Detail)

### Root Cause

[Detailed technical explanation of what caused the incident. Be specific.]

### Example (2)
```text
In deployment v1.2.3, we introduced a change to the database connection
handling in `server/src/services/database.ts`. The new code acquired
connections from the pool but failed to release them in error scenarios
due to missing `finally` blocks. Over 30 minutes, all 100 connections
in the pool were exhausted, causing all new requests to fail with
"Connection pool timeout" errors.
```text

### Trigger

[What specific event triggered the incident?]

### Example (3)
```text
The incident was triggered by the deployment of v1.2.3 to production at
14:30 UTC. Traffic patterns were normal, but the connection leak caused
gradual degradation until complete failure at 15:00 UTC.
```text

### Detection

[How did we discover the incident?]

### Example (4)
```text
- 14:58 UTC: PagerDuty alert fired: "High Error Rate (>10%)"
- 15:00 UTC: PagerDuty alert fired: "Database Connection Pool Exhausted"
- 15:02 UTC: First user report received via support
```text

**Detection Gap:** [If users reported before alerts, explain why]

### Resolution

[How did we fix it?]

### Example (5)
```text
1. Rolled back deployment from v1.2.3 to v1.2.2
2. Restarted all API pods to clear connection pools
3. Monitored for 30 minutes to confirm resolution
4. Applied hotfix to v1.2.3 with proper finally blocks
5. Re-deployed fixed version v1.2.4
```text

## What Went Wrong

### Contributing Factors

1. **Factor 1:** [Description]
   - **Why it mattered:** [Impact on incident]
   - **Could we have known?** [Yes/No and why]

2. **Factor 2:** [Description]
   - **Why it mattered:** [Impact on incident]
   - **Could we have known?** [Yes/No and why]

### Example (6)
```text
1. Missing finally blocks in new code
   - Why it mattered: Connections not released on errors
   - Could we have known? Yes - code review should have caught this

2. Insufficient integration testing
   - Why it mattered: Bug not caught before production
   - Could we have known? Yes - needed better test coverage

3. Slow alert response
   - Why it mattered: 20 minute delay from error spike to alert
   - Could we have known? Yes - alert threshold too high
```text

## What Went Right

[Acknowledge what worked well]

1. **Right 1:** [What went well]
2. **Right 2:** [What went well]

### Example (7)
```text
1. Monitoring detected issue before complete outage
2. Rollback procedure worked smoothly
3. Team communication was clear and frequent
4. Runbook for database issues was helpful
5. Post-incident verification prevented recurrence
```text

## Action Items

### Immediate Actions (Completed)

- [x] **[Action]** - [Owner] - [Completion date]
- [x] **Rolled back to v1.2.2** - Engineer A - 2024-01-15
- [x] **Applied hotfix in v1.2.4** - Engineer B - 2024-01-15
- [x] **Updated status page** - Engineer A - 2024-01-15

### Short-term Actions (1-2 weeks)

- [ ] **[Action]** - [Owner] - [Due date] - [Ticket link]
- [ ] **Add integration test for connection handling** - Engineer B - 2024-01-29 - [TICKET-123]
- [ ] **Review all code for similar patterns** - Team - 2024-01-29 - [TICKET-124]
- [ ] **Lower alert threshold from 10% to 5%** - DevOps - 2024-01-22 - [TICKET-125]

### Long-term Actions (1-3 months)

- [ ] **[Action]** - [Owner] - [Due date] - [Ticket link]
- [ ] **Implement connection pool monitoring** - DevOps - 2024-03-01 - [TICKET-126]
- [ ] **Add chaos engineering tests** - SRE - 2024-03-15 - [TICKET-127]
- [ ] **Improve code review checklist** - Engineering - 2024-02-15 - [TICKET-128]

### Process Improvements

- [ ] **[Process change]** - [Owner] - [Due date]
- [ ] **Add "connection management" to PR checklist** - Tech Lead - 2024-01-22
- [ ] **Schedule quarterly runbook testing** - SRE - 2024-01-31
- [ ] **Update deployment playbook with verification steps** - DevOps - 2024-02-01

## Lessons Learned

### What We Learned

1. **Lesson 1:** [Insight gained from incident]
2. **Lesson 2:** [Another insight]

### Example (8)
```text
1. Integration tests must cover error paths, not just happy paths
2. Connection pools need active monitoring, not just alerts at exhaustion
3. Code review checklist should include resource management
4. Rollback procedures work well when practiced regularly
5. Status page updates early reduce support burden
```text

### Where We Got Lucky

[Be honest about what could have been worse]

### Example (9)
```text
- Incident occurred during business hours, not at 3 AM
- Rollback worked on first try (could have had rollback issues)
- No data loss occurred (connection exhaustion could have caused corruption)
- Monitoring caught issue before 100% failure (could have been worse UX)
```text

## Supporting Information

### Logs

[Include relevant log excerpts]

```text
2024-01-15 15:00:12 ERROR [Database] Connection pool timeout after 30000ms
2024-01-15 15:00:15 ERROR [API] Unable to acquire database connection
2024-01-15 15:00:18 ERROR [API] Request failed: DatabaseConnectionError
```text

### Metrics

[Include relevant metric screenshots or data]

- **Error Rate:** Spiked from 0.1% to 100% at 15:00 UTC
- **Response Time:** P99 went from 200ms to timeout (30s) at 15:00 UTC
- **Database Connections:** Flat at 100/100 from 14:30-15:30 UTC

[Link to dashboard snapshots]

### Code

[Include relevant code snippets showing the bug]

```typescript
// BEFORE (v1.2.3 - buggy)
async function executeQuery(sql: string) {
  const connection = await pool.acquire();
  const result = await connection.query(sql);
  // BUG: connection not released on error!
  pool.release(connection);
  return result;
}

// AFTER (v1.2.4 - fixed)
async function executeQuery(sql: string) {
  const connection = await pool.acquire();
  try {
    const result = await connection.query(sql);
    return result;
  } finally {
    pool.release(connection); // Always released
  }
}
```text

## Assumptions

- **Assumption 1:** [What we assumed during incident]
  - *If false:* [What actually was true and impact]

### Example (10)
```text
- Assumption 1: Database was the problem (initially)
  - If false: Actually was connection pool exhaustion in application layer
```text

## Failure Modes

[Document specific failure modes discovered]

### Failure Mode 1: [Name]

- **Symptom:** [How it manifests]
- **Impact:** [Effect on system]
- **Detection:** [How to detect]
- **Mitigation:** [How to prevent/recover]

## How to Verify

[If this incident recurs, how do we verify the fix worked?]

### Manual Verification

```bash
# Check connection pool metrics
# Monitor for connection leaks
# Verify finally blocks present
```text

### Automated Checks

- [ ] Integration test covers error paths
- [ ] Connection pool monitoring in place
- [ ] Alert fires before complete exhaustion

### Success Criteria

1. No connection pool exhaustion in 30 days
2. Connection pool metrics stable
3. Similar code patterns reviewed and fixed

## Related Documentation

- [Runbook: Database Connection Loss](../runbooks/database_connection_loss.md)
- [Escalation Procedures](./escalation.md)
- [Server Module Documentation](../../modules/server.md)
- [ADR: Database Connection Pooling](../../decisions/NNNN-database-pooling.md)

## Postmortem Meeting

**Date:** YYYY-MM-DD
**Attendees:** [List of attendees]
**Recording:** [Link if recorded]
**Notes:** [Key discussion points]

### Discussion Points

1. **Should we have caught this in code review?**
   - Answer: Yes, adding checklist item for resource management

2. **Why didn't integration tests catch it?**
   - Answer: Tests only covered happy paths, not error scenarios

3. **Could we have detected it sooner?**
   - Answer: Yes, connection pool metrics would have shown gradual leak

## Blameless Culture Reminder

This postmortem is **blameless**. We're analyzing the system and process failures, not individual mistakes. Everyone involved acted with good intentions and available information. The goal is to learn and improve, not to assign blame.

## Sign-off

| Role | Name | Date | Signature |
| ------ | ------ | ------ | ----------- |
| **Incident Commander** | [Name] | YYYY-MM-DD | Approved |
| **Engineering Manager** | [Name] | YYYY-MM-DD | Approved |
| **Action Item Owner** | [Name] | YYYY-MM-DD | Committed |

## Notes

[Any additional context or information]

## References

- [Incident Ticket: INC-YYYY-MM-DD-NNN](link)
- [Status Page Updates](link)
- [Monitoring Dashboard During Incident](link)
- [Slack #incidents Thread](link)

---

**Template Version:** 1.0
**Last Updated:** 2024-01-15
