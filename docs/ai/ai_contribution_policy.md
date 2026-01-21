# AI Contribution Policy

## Agent Responsibility Model: Unified AGENT Ownership

### AGENT

**Role:** Full delivery across platforms

### Responsibilities

- Builds all original features, screens, components, and business logic
- Delivers iOS, Android, and Web compatibility as required
- Owns architectural decisions
- Adds platform-specific adaptations when needed
- Tests on the platforms relevant to the task scope

### Workflow

1. Receives task assignment from P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md (Owner: AGENT)
2. Builds the feature with platform compatibility in mind
3. Tests on the required platforms
4. Merges PR with implementation and documentation updates

## When to Use AI

### Good Use Cases

- Writing repetitive boilerplate (models, types, tests)
- Generating test cases from examples
- Creating documentation from code
- Refactoring with clear before/after
- Suggesting implementation approaches

### Exercise Caution

- Security-sensitive code (auth, crypto, data handling)
- Complex business logic
- Performance-critical code
- Database migrations
- API contracts

### Seek Human Review

- Architectural decisions
- Security controls
- Complex algorithms
- Breaking changes
- Production hotfixes

## Requirements

All AI-contributed code must:

1. Pass all tests
2. Meet linting and type-checking standards
3. Be reviewed by human engineer
4. Include tests demonstrating correctness
5. Be understood by the contributor

## AI Declaration

For significant AI contributions, note in PR:

```text
AI Contribution: Used GitHub Copilot to generate test cases.
Verified: All tests pass, coverage increased by 15%.
```text

## Related

- [Evidence Requirements](./evidence_requirements.md)
- [Safe Editing Rules](./safe_editing_rules.md)
