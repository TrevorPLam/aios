# Reviewer: human. Controls waivers + enforcement.

## Role Definition

Reviewers are human agents who control policy exceptions (waivers) and enforcement decisions.

## Allowed Capabilities

Reviewers may:
- `apply_waiver` - Create, approve, or reject policy waivers
- Review and approve PRs
- Mark HITL items as Completed
- Override automated checks when justified
- Enforce policy compliance

## Waiver Management

Reviewers control the waiver process:
- Review waiver requests
- Approve or reject waivers with justification
- Set expiration dates for waivers
- Monitor waiver compliance
- Revoke waivers if conditions are not met

See `/.repo/policy/WAIVERS.md` for waiver process details.

## Enforcement Authority

Reviewers have final authority on:
- Policy interpretation
- Exception approvals
- Quality gate overrides
- HITL item resolution

## Requirements

Reviewers must:
- Document all waiver decisions with filepaths
- Set expiration dates for temporary waivers
- Ensure waivers align with repository goals
- Review evidence before approving exceptions
- Follow the waiver process in `/.repo/policy/WAIVERS.md`

## Integration

Reviewers work with:
- Primary agents (who request waivers)
- Release managers (for release-related waivers)
- HITL system (for human-required decisions)
