# Runbooks

## Plain English Summary

Runbooks are step-by-step instructions for operational tasks and incident response. Think of them as recipes for fixing problems or performing routine maintenance. When something goes wrong at 3 AM, you don't want to figure it out from scratch - you want a clear checklist to follow.

## What is a Runbook?

A runbook is a documented procedure that:

- Describes a specific operational task or incident
- Provides clear, sequential steps to resolve it
- Includes commands, screenshots, and examples
- Lists prerequisites and permissions needed
- Identifies automation opportunities
- Helps both experienced and new team members

## Available Runbooks

| Runbook | Description | Severity |
| --------- | ------------- | ---------- |
| [Common Incidents](./common_incidents.md) | Quick fixes for frequent issues | Varies |
| _Database Connection Loss_ | How to restore database connectivity | Critical |
| _High API Latency_ | Steps to diagnose and fix slow APIs | High |
| _Deployment Rollback_ | How to rollback a bad deployment | Critical |

### Note: Add more runbooks as you encounter and document incidents

## When to Create a Runbook

Create a runbook when:

1. **Recurring Incident** - Problem happens more than once
2. **Complex Procedure** - Multi-step process that's easy to forget
3. **High-Stakes Operation** - Mistake could cause major issues
4. **Knowledge Transfer** - New team members need guidance
5. **On-Call Response** - Incident requires quick, consistent action

## Runbook Template

Use [runbook_template.md](./runbook_template.md) for all new runbooks.

## Assumptions

- **Assumption 1:** On-call engineers have necessary access permissions
  - _If false:_ Document permission requirements, update access controls
- **Assumption 2:** Monitoring alerts trigger before user reports
  - _If false:_ Improve monitoring, add missing alerts
- **Assumption 3:** Runbooks are tested and work as documented
  - _If false:_ Schedule regular runbook testing, update as needed

## Failure Modes

### Failure Mode 1: Outdated Runbook

- **Symptom:** Steps don't work, commands fail, system has changed
- **Impact:** Extended incident resolution time, confusion
- **Detection:** Engineer reports runbook doesn't work
- **Mitigation:**
  - Update runbooks after system changes
  - Review runbooks quarterly
  - Test runbooks in staging
  - Mark last tested date
- **Monitoring:** Runbook last-updated dates

### Failure Mode 2: Missing Context

- **Symptom:** Runbook assumes knowledge engineer doesn't have
- **Impact:** Can't complete procedure, must escalate
- **Detection:** New team members struggle with runbook
- **Mitigation:**
  - Include all prerequisites
  - Link to related documentation
  - Add "Background" section
  - Provide examples
- **Monitoring:** Completion success rate

### Failure Mode 3: No Automation Path

- **Symptom:** Manual runbooks repeated frequently
- **Impact:** Wasted time, increased human error
- **Detection:** Runbook used more than weekly
- **Mitigation:**
  - Identify automation candidates
  - Prioritize automation work
  - Start with partial automation
  - Track automation progress
- **Monitoring:** Runbook execution frequency

## How to Verify

### Manual Verification

```bash
# 1. List all runbooks
ls docs/operations/runbooks/*.md

# 2. Check for required sections
grep "## Automation Candidate" docs/operations/runbooks/*.md

# 3. Verify last-updated dates
grep "Last Tested:" docs/operations/runbooks/*.md

# 4. Test a runbook in staging
# Follow procedure exactly as documented
```text

### Automated Checks

- [ ] All runbooks follow template structure
- [ ] All runbooks have "Automation Candidate" section
- [ ] All runbooks have "Last Tested" date
- [ ] No runbook older than 6 months untested

### Success Criteria

1. All common incidents have runbooks
2. Runbooks are clear and complete
3. New team members can follow runbooks successfully
4. Time to resolution decreases
5. Automation candidates are identified

## Runbook Best Practices

### Writing

1. **Be explicit** - Don't assume prior knowledge
2. **Use commands** - Show exact commands to run
3. **Include output** - Show what success looks like
4. **Add context** - Explain why, not just how
5. **Test thoroughly** - Verify every step works

### Structure

1. **Clear title** - Describe the problem/task
2. **Severity level** - Indicate urgency
3. **Prerequisites** - List what's needed first
4. **Step-by-step** - Number all steps clearly
5. **Verification** - How to confirm it worked

### Maintenance

1. **Update after incidents** - Improve based on experience
2. **Regular review** - Check quarterly for accuracy
3. **Test in staging** - Verify procedures work
4. **Version control** - Track changes over time
5. **Deprecate obsolete** - Remove outdated runbooks

## Creating a New Runbook

1. **Copy the template:**

   ```bash
   cp docs/operations/runbooks/runbook_template.md \
      docs/operations/runbooks/new_incident_name.md
   ```text

1. **Fill in all sections:**
   - Replace all placeholders
   - Include actual commands
   - Add real examples
   - Test procedure

2. **Add to this index:**
   - Update the table above
   - Link from relevant docs

3. **Review with team:**
   - Have someone else test it
   - Get feedback
   - Iterate

## Runbook Severity Levels

### Critical (Sev 1)

- Service completely down
- Data loss occurring
- Security breach
- **Response Time:** Immediate
- **Example:** Database unavailable, API returning all 500s

### High (Sev 2)

- Major functionality impaired
- Significant user impact
- Performance severely degraded
- **Response Time:** < 30 minutes
- **Example:** 50% error rate, critical feature broken

### Medium (Sev 3)

- Minor functionality affected
- Small user subset impacted
- Performance degraded
- **Response Time:** < 2 hours
- **Example:** Non-critical feature broken, elevated error rate

### Low (Sev 4)

- No immediate user impact
- Cosmetic issues
- Proactive maintenance
- **Response Time:** Next business day
- **Example:** Warnings in logs, disk usage above 50%

## Related Documentation

- [Operations Overview](../README.md) - Overall operations documentation
- [Common Incidents](./common_incidents.md) - Frequently occurring issues
- [Escalation Procedures](../oncall/escalation.md) - When and how to escalate
- [Postmortem Template](../oncall/postmortem_template.md) - After incident documentation
- [Logging](../observability/logging.md) - How to use logs for debugging

## Notes

- Good runbooks turn 3 AM panic into routine execution
- Every incident should result in a runbook (or update to existing one)
- Runbooks should be written for your least experienced team member
- Test your runbooks - they're useless if they don't work
- Automate what you can, document what you can't (yet)

Think of runbooks as your operational muscle memory.

## References

- [PagerDuty Runbook Best Practices](https://response.pagerduty.com/oncall/being_oncall/)
- [Google SRE: Responding to Incidents](https://sre.google/sre-book/effective-troubleshooting/)
- [Atlassian Incident Management Playbook](https://www.atlassian.com/incident-management/handbook)
