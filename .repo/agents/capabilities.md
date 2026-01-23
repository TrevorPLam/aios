# /.repo/agents/capabilities.md

This file lists all capabilities that agents may have. Different roles have different capability sets.

## Capability List

### create_feature
Create a new feature module following the feature structure (ui/domain/data layers). Must follow boundary rules and may require ADR for cross-feature dependencies.

### modify_existing
Modify existing code, files, or functionality. Must maintain backward compatibility unless explicitly breaking changes are approved. Must include tests and verification.

### add_dependency
Add a new npm package or external dependency. Must check for security vulnerabilities and follow dependency policy. May trigger HITL if security risk is detected.

### change_api_contract
Modify API contracts, schemas, or interfaces that affect external consumers. Requires ADR and may require versioning strategy.

### change_schema
Modify database schemas, data models, or validation schemas. Requires migration plan and may require HITL for production schema changes.

### update_security
Update security configurations, authentication, or authorization logic. Always triggers HITL per `/.repo/policy/SECURITY_BASELINE.md`.

### update_release_process
Modify release procedures, CI/CD pipelines, or deployment configurations. Reserved for release role only.

### apply_waiver
Create or approve policy waivers. Reserved for reviewer role only. Requires justification and expiration date.

### create_adr
Create Architecture Decision Records for significant architectural decisions, especially cross-feature imports or boundary exceptions.

### create_task_packet
Create task definitions in TODO files (P0TODO.md, P1TODO.md, etc.) with proper traceability and filepaths.

### run_verification_profiles
Execute verification commands defined in `/.repo/repo.manifest.yaml` (check:quick, check:ci, check:release, etc.).

## Capability Restrictions

- **Primary agents**: All capabilities except `apply_waiver` and `update_release_process`
- **Secondary agents**: Only `modify_existing` and refactor/port within boundaries
- **Reviewer (human)**: All capabilities including `apply_waiver`
- **Release (human)**: All capabilities including `update_release_process`

See role definitions in `/.repo/agents/roles/` for specific role capabilities.
