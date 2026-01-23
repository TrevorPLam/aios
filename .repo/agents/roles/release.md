# Release: human. Controls update_release_process and deploy.

## Role Definition

Release managers are human agents who control release processes, deployment, and production changes.

## Allowed Capabilities

Release managers may:
- `update_release_process` - Modify release procedures, CI/CD, deployment configs
- Control production deployments
- Modify release-related configurations
- Approve production schema changes
- Control versioning and release tagging

## Release Process Control

Release managers control:
- CI/CD pipeline modifications
- Deployment procedures
- Production environment access
- Release versioning
- Rollback procedures

## Restricted Operations

Release managers should NOT:
- Modify application code directly (use primary agents)
- Create features (use primary agents)
- Apply waivers (use reviewer role)

## Requirements

Release managers must:
- Follow all core rules in `/.repo/agents/AGENTS.md`
- Document all release process changes
- Test deployment procedures before production
- Maintain rollback plans
- Coordinate with reviewers for release-related waivers

## Integration

Release managers work with:
- Primary agents (who implement features for release)
- Reviewers (for release-related waivers)
- CI/CD systems (for deployment automation)

## Safety Requirements

Release managers must:
- Verify all changes before production deployment
- Test in staging environments first
- Maintain rollback procedures
- Document deployment steps with filepaths
- Follow Article 6 (Safety Before Speed) from `/.repo/policy/CONSTITUTION.md`
