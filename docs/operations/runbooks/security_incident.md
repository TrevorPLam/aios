# Runbook: Security Incident Response

**Severity:** Critical | High (varies by incident)
**Last Tested:** 2026-01-22
**Owner:** Security Team
**Response Time:** Immediate

## Plain English Summary

This runbook provides step-by-step guidance for responding to security incidents in the AIOS application. Use this when a potential security breach, vulnerability exploitation, or suspicious activity is detected.

## Symptoms

How do you know a security incident is occurring?

- Unusual authentication patterns (multiple failed login attempts, logins from unusual locations)
- Alerts from security scanning tools (CodeQL, Trivy, OSSF Scorecard)
- Reports from users about suspicious activity
- Unexpected data access or modifications
- Suspicious network traffic patterns
- API rate limit violations
- Unauthorized access attempts

### Monitoring/Alerting

- **Alert Names:** 
  - `security-scanner-alert`
  - `failed-auth-spike`
  - `suspicious-api-activity`
  - `codeql-vulnerability-detected`
- **Logs:** GitHub Actions logs, application logs, auth logs
- **Metrics:** Failed authentication rate, API error rates, abnormal data access patterns

## Impact

### User Impact

- Potential compromise of user data
- Account takeovers
- Service disruption if systems are taken offline as a precaution
- Loss of trust

### System Impact

- Compromised authentication or authorization
- Data integrity issues
- Service availability if defensive actions required
- Potential lateral movement to other systems

### Business Impact

- Legal and regulatory compliance violations (GDPR, CCPA)
- Reputation damage
- Potential financial losses
- Required breach notifications

## Prerequisites

Before following this runbook, ensure you have:

- [ ] Access to production systems
- [ ] GitHub repository admin access
- [ ] Ability to disable user accounts
- [ ] Access to logs and monitoring systems
- [ ] Communication channels (Slack, email) ready
- [ ] Incident management system access

### Required Tools

```bash
# Command-line tools
gh >= 2.0  # GitHub CLI
git >= 2.30
jq >= 1.6  # JSON processing
```

### Required Permissions

- GitHub: Admin or Security Manager role
- Systems: Read access to all logs
- User Management: Ability to disable accounts
- Communication: Incident response channel access

## Incident Response Steps

### Step 1: Contain the Incident (IMMEDIATE)

**Goal:** Stop the breach from spreading

```bash
# If specific user accounts are compromised
# 1. Document the affected account IDs
# 2. Disable the accounts (specific command depends on your auth system)

# If a service or API key is compromised
# 1. Rotate the compromised credentials immediately
# 2. Revoke the old credentials
# 3. Update all systems with new credentials

# If a code vulnerability is being actively exploited
# 1. Consider temporary service degradation or shutdown
# 2. Deploy emergency patch if available
# 3. Enable additional monitoring
```

### Step 2: Assess the Scope

**Goal:** Understand what was affected

1. **Check logs for suspicious activity:**
   ```bash
   # Review authentication logs
   # Review data access logs
   # Check for unusual API calls
   # Identify affected time range
   ```

2. **Identify affected resources:**
   - Which user accounts?
   - Which data was accessed?
   - Which systems were compromised?
   - What was the attack vector?

3. **Document timeline:**
   - When did the incident start?
   - When was it detected?
   - What actions were taken?

### Step 3: Eradicate the Threat

**Goal:** Remove the attacker's access and close the vulnerability

1. **Patch the vulnerability:**
   - Apply security patches
   - Update dependencies
   - Fix code vulnerabilities
   - Deploy fixes

2. **Close attack vectors:**
   - Rotate all potentially compromised credentials
   - Update firewall rules
   - Disable vulnerable endpoints temporarily
   - Enable additional security controls

3. **Verify remediation:**
   ```bash
   # Re-run security scanners
   npm audit
   # Run CodeQL analysis
   # Verify no backdoors remain
   ```

### Step 4: Recover

**Goal:** Restore normal operations safely

1. **Restore services:**
   - Bring systems back online gradually
   - Monitor for any recurrence
   - Verify data integrity

2. **Reset affected user accounts:**
   - Force password resets for affected accounts
   - Notify users of the incident
   - Provide guidance on securing their accounts

3. **Monitor closely:**
   - Enable enhanced logging temporarily
   - Watch for any signs of continued attack
   - Verify security controls are working

### Step 5: Document and Learn

**Goal:** Prevent future incidents

1. **Create incident report:**
   - Timeline of events
   - Root cause analysis
   - Impact assessment
   - Response actions taken
   - Lessons learned

2. **Update security controls:**
   - Add new monitoring rules
   - Update runbooks
   - Improve detection capabilities
   - Update threat model

3. **Communicate:**
   - Internal stakeholders
   - Affected users (if required by law/policy)
   - Team retrospective

## Severity Classification

| Severity | Criteria | Response Time |
| -------- | -------- | ------------- |
| Critical | Active data breach, widespread user impact | Immediate (< 15 min) |
| High | Confirmed vulnerability exploitation, limited user impact | < 1 hour |
| Medium | Potential vulnerability, no confirmed exploitation | < 4 hours |
| Low | Minor security concern, no immediate risk | Next business day |

## Communication Plan

### Internal Communication

1. **Immediate notification:**
   - Security team
   - On-call engineers
   - Leadership team

2. **Status updates:**
   - Every 30 minutes during active incident
   - Use dedicated incident channel
   - Document all actions taken

### External Communication

1. **User notification (if required):**
   - Email to affected users
   - In-app notification
   - Public status page update

2. **Regulatory notification (if required):**
   - GDPR: 72 hours for breach notification
   - CCPA: As required by law
   - Other regulatory requirements

## Related Documentation

- [Security Policy](../../SECURITY.md)
- [Threat Model](../../security/threat_model.md)
- [Security Documentation](../../security/SECURITY.md)
- [Secrets Handling](../../security/secrets_handling.md)
- [Incident Response Template](../../.templates/incident-template.md)

## Post-Incident Review Template

Use this template after resolving a security incident:

```markdown
# Security Incident Post-Mortem

**Date:** YYYY-MM-DD
**Severity:** [Critical/High/Medium/Low]
**Duration:** [Time from detection to resolution]
**Responders:** [Names]

## Timeline

- **HH:MM** - Incident detected
- **HH:MM** - Initial response actions
- **HH:MM** - Incident contained
- **HH:MM** - Threat eradicated
- **HH:MM** - Services restored
- **HH:MM** - Incident closed

## What Happened

[Detailed description of the incident]

## Root Cause

[What allowed this incident to occur]

## Impact

- Users affected: [Number]
- Data compromised: [Description]
- Services impacted: [List]
- Duration of impact: [Time]

## Response Actions

[What was done to resolve the incident]

## What Went Well

- [Action 1]
- [Action 2]

## What Could Be Improved

- [Improvement 1]
- [Improvement 2]

## Action Items

- [ ] [Action item 1] - Owner: [Name] - Due: [Date]
- [ ] [Action item 2] - Owner: [Name] - Due: [Date]
```

## Verification Steps

After completing this runbook:

```bash
# Verify security posture
npm audit
npm run security:check

# Verify no active threats
# Check monitoring dashboards
# Review recent logs for anomalies

# Verify all systems operational
# Run health checks
# Confirm normal traffic patterns
```

## References

- [NIST Incident Response Guide](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf)
- [SANS Incident Response Steps](https://www.sans.org/white-papers/incident-handlers-handbook/)
- [OWASP Incident Response](https://owasp.org/www-community/Incident_Response)

## Revision History

| Date | Version | Changes | Author |
| ---- | ------- | ------- | ------ |
| 2026-01-22 | 1.0 | Initial creation | GitHub Copilot |
