# Agent Log Template

This template must be used for all agent logs. The structure aligns with `/.repo/templates/AGENT_TRACE_SCHEMA.json`.

## Required Fields

### Header
```markdown
# Agent Log

**Agent ID**: [identifier for the agent]
**Task ID**: [reference to task or PR]
**Timestamp**: [ISO 8601 timestamp]
**Status**: [pending|in_progress|completed|failed]
```

### Actions Section

List all actions taken, following this format:

```markdown
## Actions

### Action 1: [Action Type]
- **Type**: create|modify|delete|read|verify|test
- **Filepath**: [full path to file]
- **Timestamp**: [ISO 8601 timestamp]
- **Reasoning**: [brief explanation of why this action was taken]
- **Verification**: [command run, output, test results]
```

### Reasoning Summary

```markdown
## Reasoning Summary

[High-level summary of why these changes were made, what problem they solve, and how they align with repository policies]
```

### Verification Evidence

```markdown
## Verification Evidence

### Build Status
[Status: passed|failed|skipped]
[Command]: [command run]
[Output]: [relevant output or link to output]

### Test Status
[Status: passed|failed|skipped]
[Command]: [command run]
[Results]: [test results summary or link]

### Lint Status
[Status: passed|failed|skipped]
[Command]: [command run]
[Output]: [relevant output or link]

### Filepaths Modified
- [filepath1]
- [filepath2]
- [etc.]
```

### UNKNOWNs and HITL Items

```markdown
## UNKNOWNs

[List any items marked as UNKNOWN and HITL items created]

### UNKNOWN: [Description]
- **HITL Item**: [link or reference to HITL item]
- **Reason**: [why this is unknown]
- **Blocking**: [yes|no]
```

## Example

```markdown
# Agent Log

**Agent ID**: primary-agent-001
**Task ID**: P0TODO-123
**Timestamp**: 2024-01-15T10:30:00Z
**Status**: completed

## Actions

### Action 1: Create Feature Module
- **Type**: create
- **Filepath**: packages/features/contacts/domain/contactService.ts
- **Timestamp**: 2024-01-15T10:31:00Z
- **Reasoning**: Create domain service for contact management following boundary rules
- **Verification**: 
  - Command: `npm run check:types`
  - Output: "Type checking complete. No errors."

### Action 2: Add Tests
- **Type**: create
- **Filepath**: packages/features/contacts/domain/__tests__/contactService.test.ts
- **Timestamp**: 2024-01-15T10:35:00Z
- **Reasoning**: Add unit tests for contact service
- **Verification**:
  - Command: `npm test`
  - Results: "All tests passed. 15 tests, 0 failures."

## Reasoning Summary

Created contact management feature following the ui → domain → data → platform boundary model. The domain service contains business logic and depends only on contracts, maintaining proper architectural boundaries.

## Verification Evidence

### Build Status
Status: passed
Command: `npm run check:types`
Output: Type checking complete. No errors.

### Test Status
Status: passed
Command: `npm test`
Results: All tests passed. 15 tests, 0 failures.

### Lint Status
Status: passed
Command: `npm run lint`
Output: Linting complete. No issues found.

### Filepaths Modified
- packages/features/contacts/domain/contactService.ts
- packages/features/contacts/domain/__tests__/contactService.test.ts

## UNKNOWNs

None - all requirements were clear from repository documentation.
```

## Notes

- All filepaths must be absolute from repository root
- Timestamps must be ISO 8601 format
- Verification evidence must include actual command outputs or links
- UNKNOWNs must reference HITL items if created
- This template aligns with `/.repo/templates/AGENT_TRACE_SCHEMA.json` for JSON trace logs
