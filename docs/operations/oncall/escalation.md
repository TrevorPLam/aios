# Escalation Procedures

**Last Updated:** 2024-01-15  
**Purpose:** Define when and how to escalate incidents

## Plain English Summary

This document explains when you need to call for help during an incident, who to contact, and how to escalate effectively. Not every incident requires escalation, but knowing when and how to escalate is critical for minimizing downtime and impact.

## When to Escalate

### Immediate Escalation (Don't Wait)

Escalate **immediately** if:

- [ ] **Complete service outage** - API completely down, users cannot access system
- [ ] **Data loss occurring** - Users losing data, database corruption
- [ ] **Security breach suspected** - Unauthorized access, data exposure
- [ ] **Cascading failures** - Multiple systems failing simultaneously
- [ ] **You're stuck** - Tried documented procedures, nothing works

### Escalate After 30 Minutes

Escalate if incident is **ongoing after 30 minutes** and:

- [ ] Critical (Sev 1) incident not resolved
- [ ] No clear path to resolution
- [ ] Need specialized expertise (database, security, etc.)
- [ ] Impact is growing or changing

### Escalate After 1 Hour

Escalate if incident is **ongoing after 1 hour** and:

- [ ] High (Sev 2) incident not resolved
- [ ] Workarounds not effective
- [ ] Multiple teams need coordination

### Don't Escalate If

- ✅ Following runbook successfully
- ✅ Making progress toward resolution
- ✅ Impact is stable or decreasing
- ✅ Within expected resolution time for severity
- ✅ Have all needed information and access

**But**: If unsure, escalate. It's better to escalate early than late.

## Technical Detail

### Escalation Matrix

| Severity | Initial Response | Escalate After | Escalate To |
|----------|------------------|----------------|-------------|
| **Sev 1 - Critical** | On-call engineer | 30 min or immediate if stuck | On-call lead → Engineering manager → CTO |
| **Sev 2 - High** | On-call engineer | 1 hour | On-call lead → Team lead |
| **Sev 3 - Medium** | On-call engineer | 4 hours or next business day | Team lead |
| **Sev 4 - Low** | Ticket in backlog | N/A | N/A |

### Severity Definitions

#### Severity 1 (Critical)
- **Complete service outage** - API down, database unavailable
- **Data loss** - Users losing data, corruption occurring
- **Security breach** - Unauthorized access, credentials compromised
- **Examples:** Database crashed, entire API returning 500s, security incident

**Response:** Immediate, all hands on deck  
**Communication:** Every 15-30 minutes  
**Executive notification:** Yes, immediately

#### Severity 2 (High)
- **Major functionality broken** - Login fails, critical feature unavailable
- **Significant performance degradation** - 50%+ error rate, extreme latency
- **Large user subset affected** - Region outage, 25%+ of users
- **Examples:** Authentication broken, payment processing down, half of API failing

**Response:** Within 30 minutes  
**Communication:** Every 30-60 minutes  
**Executive notification:** Within 1 hour

#### Severity 3 (Medium)
- **Minor functionality impaired** - Non-critical feature broken
- **Small user subset affected** - < 25% of users
- **Performance issues** - Elevated error rate (5-10%)
- **Examples:** Search slower than usual, background job delays, minor feature bug

**Response:** Within 2 hours  
**Communication:** Every 2-4 hours  
**Executive notification:** Daily summary

#### Severity 4 (Low)
- **No user impact** - Internal tools, logging issues
- **Cosmetic issues** - UI glitches with workarounds
- **Proactive alerts** - Warnings before they become problems
- **Examples:** Disk usage at 70%, elevated warnings, dev environment issues

**Response:** Next business day  
**Communication:** Via ticket  
**Executive notification:** Not required

## Escalation Contacts

### Primary On-Call Rotation

| Role | Contact Method | Response Time |
|------|----------------|---------------|
| **On-Call Engineer** | PagerDuty → Phone | 15 minutes |
| **On-Call Lead** | PagerDuty → Phone | 15 minutes |
| **Backend Team Lead** | PagerDuty → Phone | 30 minutes |
| **Mobile Team Lead** | PagerDuty → Phone | 30 minutes |

### Secondary Escalation

| Role | Contact Method | When to Contact |
|------|----------------|-----------------|
| **Engineering Manager** | Phone + Slack | Sev 1 after 30 min |
| **Database Admin** | PagerDuty | Database issues |
| **Security Lead** | Phone (24/7) | Security incidents |
| **DevOps Lead** | PagerDuty | Infrastructure issues |

### Executive Escalation

| Role | Contact Method | When to Contact |
|------|----------------|-----------------|
| **CTO** | Phone | Sev 1 after 1 hour |
| **CEO** | Via CTO | Data breach, PR impact |
| **Legal** | Via CTO/CEO | Security breach, compliance |

### External Contacts

| Vendor | Contact | When to Contact |
|--------|---------|-----------------|
| **AWS Support** | Support portal + Phone | Infrastructure issues |
| **Database Vendor** | Support ticket | Database-specific issues |
| **Security Vendor** | Emergency line | Security tool issues |

## How to Escalate

### Step 1: Gather Information

Before escalating, collect:

- **Incident start time** - When did it begin?
- **Symptoms** - What are users experiencing?
- **What you've tried** - Actions taken so far
- **Current state** - Is it getting worse?
- **Impact metrics** - Error rates, affected users
- **Relevant logs** - Recent error logs, metrics

### Step 2: Use PagerDuty

```
1. Open PagerDuty mobile app or web
2. Navigate to the incident
3. Click "Escalate"
4. Select escalation policy or person
5. Add context: "Escalating: [brief reason]"
6. Confirm escalation
```

### Step 3: Update Communication Channels

```
Post in #incidents Slack channel:

🚨 ESCALATING INCIDENT

Severity: [1-4]
Started: [HH:MM]
Impact: [Brief description]
Tried: [What you've attempted]
Escalating to: [@person]
Reason: [Why escalating]
```

### Step 4: Brief the Escalation Contact

When they respond, provide:

1. **Quick summary** - 30 seconds, what's happening
2. **Impact** - Who/what is affected
3. **Actions taken** - What you've tried
4. **Current state** - Metrics, error rates
5. **What you need** - Specific help needed

**Example:**
```
"API is down for 30 minutes. All requests returning 500.
Tried restarting pods and checking database - both healthy.
Error rate 100%, all users affected.
Need help identifying root cause - stuck on diagnosis."
```

## Assumptions

- **Assumption 1:** Contact information is current and tested
  - *If false:* Update this document, test escalation paths quarterly
- **Assumption 2:** Escalation contacts respond within SLA
  - *If false:* Use backup contact, document response time issues
- **Assumption 3:** PagerDuty is always available
  - *If false:* Have phone numbers as backup, use Slack

## Failure Modes

### Failure Mode 1: Delayed Escalation
- **Symptom:** Engineer tries to solve alone too long, incident duration extends
- **Impact:** Prolonged outage, missed SLAs, larger impact
- **Detection:** Post-incident review shows late escalation
- **Mitigation:**
  - Clear escalation criteria
  - "When in doubt, escalate" culture
  - Blameless postmortems
  - Track time-to-escalate metric
- **Monitoring:** Incident duration vs. escalation time

### Failure Mode 2: Escalation Contact Unreachable
- **Symptom:** Escalation contact doesn't respond within SLA
- **Impact:** Resolution delayed, uncertainty about next steps
- **Detection:** No response after alerting
- **Mitigation:**
  - Always have backup contacts
  - Escalate to next level after 10 minutes no response
  - Test escalation paths quarterly
  - Multiple contact methods
- **Monitoring:** Escalation response times

### Failure Mode 3: Insufficient Context Provided
- **Symptom:** Escalation contact has to ask many questions, slowing response
- **Impact:** Resolution delayed due to information gathering
- **Detection:** Escalation contact requests basic information
- **Mitigation:**
  - Use escalation checklist
  - Maintain incident timeline
  - Have metrics/logs ready
  - Practice escalation scenarios
- **Monitoring:** Questions asked during escalation

### Failure Mode 4: Too Many Escalations
- **Symptom:** Everything escalated, escalation loses meaning
- **Impact:** Alert fatigue, important incidents not prioritized
- **Detection:** High escalation rate, many false alarms
- **Mitigation:**
  - Clear escalation criteria
  - Better runbooks to reduce stuck situations
  - Training on incident response
  - Review escalations in postmortems
- **Monitoring:** Escalation rate, false positive rate

## How to Verify

### Manual Verification
```bash
# 1. Test PagerDuty escalation
# (In test/staging environment)
# Trigger test alert, verify escalation works

# 2. Verify contact information
# Review escalation matrix, confirm all contacts current

# 3. Test communication channels
# Send test message in #incidents Slack channel
```

### Quarterly Escalation Drills

Run escalation drills to verify:

- [ ] All contacts are reachable
- [ ] Contact information is current
- [ ] Escalation paths work correctly
- [ ] Response times meet SLAs
- [ ] Team knows how to escalate

### Success Criteria
1. Clear understanding of when to escalate
2. All contacts reachable within SLA
3. Escalation process is smooth and fast
4. No unnecessary escalations
5. Critical incidents escalated appropriately

## Best Practices

### For On-Call Engineers
1. **Escalate early** - Don't wait too long
2. **Document everything** - Keep incident timeline
3. **Communicate clearly** - Provide context
4. **Stay calm** - Escalation is normal, not failure
5. **Learn from escalations** - Improve runbooks

### For Escalation Contacts
1. **Respond quickly** - Acknowledge within SLA
2. **Ask for context** - Get full picture before acting
3. **Take ownership** - Be clear who's leading
4. **Communicate status** - Keep everyone informed
5. **Document learnings** - Update runbooks after

### For Managers
1. **Support escalation culture** - Never blame for escalating
2. **Review escalations** - Learn from patterns
3. **Keep contacts updated** - Ensure matrix is current
4. **Provide training** - Practice escalation scenarios
5. **Improve runbooks** - Reduce need for escalation

## Communication During Escalation

### Status Updates

Provide regular updates:

**Template:**
```
INCIDENT UPDATE [HH:MM]

Severity: [1-4]
Status: [Investigating | Identified | Monitoring | Resolved]
Duration: [X minutes]
Impact: [Brief description]
Current action: [What we're doing now]
ETA: [When we expect resolution or next update]
```

**Frequency:**
- **Sev 1:** Every 15-30 minutes
- **Sev 2:** Every 30-60 minutes
- **Sev 3:** Every 2-4 hours

### Stakeholder Communication

Who to notify:

| Severity | Notify | When | Method |
|----------|--------|------|--------|
| **Sev 1** | Engineering leadership, Support team | Immediately | Slack + Email + Phone |
| **Sev 1** | Executive team | After 1 hour | Email + Phone |
| **Sev 1** | Customers (via status page) | Immediately | Status page |
| **Sev 2** | Engineering leadership, Support team | Within 30 min | Slack + Email |
| **Sev 2** | Customers (if significant) | Within 1 hour | Status page |
| **Sev 3** | Team lead | Within 4 hours | Slack |

## After Escalation

### Handoff

When escalation contact takes over:

1. **Transfer context** - Brief them fully
2. **Offer to stay** - Provide continuity if helpful
3. **Document handoff** - Note in incident timeline
4. **Stay available** - They may need your help
5. **Learn** - Observe their approach

### Post-Incident

After resolution:

1. **Thank responders** - Acknowledge everyone's help
2. **Document escalation** - Note why and when in postmortem
3. **Review decision** - Was escalation timely?
4. **Update runbooks** - Prevent future need for escalation
5. **Share learnings** - Help team learn from incident

## Related Documentation

- [Runbooks](../runbooks/README.md) - Try these before escalating
- [Common Incidents](../runbooks/common_incidents.md) - Quick fixes
- [Postmortem Template](./postmortem_template.md) - After incident
- [Operations Overview](../README.md) - Overall operations docs

## Notes

- Escalation is not failure - it's good judgment
- Better to escalate too early than too late
- Clear communication is critical during escalation
- Practice makes perfect - run escalation drills
- Keep this document updated with current contacts

Think of escalation as calling for backup - sometimes you need it.

## References

- [PagerDuty Escalation Best Practices](https://ownership.pagerduty.com/escalations/)
- [Google SRE: Incident Management](https://sre.google/sre-book/managing-incidents/)
- [Atlassian Incident Escalation](https://www.atlassian.com/incident-management/on-call/escalation-policies)
