# AI Contribution Policy

## Agent Responsibility Model: Primary-Secondary Architecture

### GitHub Copilot (Primary Agent)
**Role:** Original development, iOS-only

**Responsibilities:**
- Builds ALL original features, screens, components, and business logic
- Targets iOS platform exclusively
- Owns all architectural decisions
- Cannot add Android or Web-specific code
- Must not include `Platform.OS === 'android'` or `Platform.OS === 'web'` checks
- Must use iOS-native components and patterns
- Creates follow-up tasks for Codex Agent when Android/Web compatibility is needed

**Workflow:**
1. Receives task assignment from TODO.md (Owner: GitHub Agent (Primary))
2. Builds feature for iOS platform
3. Tests on iOS simulator/device
4. Merges PR with iOS implementation
5. Creates follow-up task for Codex Agent if multi-platform support needed

### Codex Agent (Secondary Agent)
**Role:** Platform adaptation, Android/Web compatibility

**Responsibilities:**
- Adapts Copilot's completed iOS implementations for Android/Web compatibility ONLY
- Cannot create original features, screens, or components
- Cannot make architectural decisions
- Only adds platform-specific adaptations (Material Design for Android, web responsive layouts, etc.)
- Must reference Copilot's completed work (commit hash or PR number) in all contributions
- Must preserve iOS functionality while adding Android/Web support
- Cannot modify core business logic, only add platform adaptations

**Workflow:**
1. Receives task assignment from TODO.md (Owner: Codex Agent (Secondary), Dependencies: GitHub Agent task)
2. Reviews Copilot's iOS implementation (PR/commit reference required)
3. Adds Android/Web platform adaptations without modifying core logic
4. Tests on Android/Web platforms
5. Merges PR with platform compatibility additions

### Handoff Protocol

1. **GitHub Copilot** builds feature for iOS
2. **GitHub Copilot** merges PR and marks task complete
3. **GitHub Copilot** creates follow-up task for **Codex Agent**: "Adapt [feature] for Android/Web compatibility"
4. **Codex Agent** picks up task and references Copilot's PR/commit
5. **Codex Agent** adapts and tests on Android/Web platforms

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
```
AI Contribution: Used GitHub Copilot to generate test cases.
Verified: All tests pass, coverage increased by 15%.
```

## Related
- [Evidence Requirements](./evidence_requirements.md)
- [Safe Editing Rules](./safe_editing_rules.md)
