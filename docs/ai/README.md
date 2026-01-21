# AI Documentation

## Plain English Summary
This directory contains guidelines for using AI tools (like GitHub Copilot) in the AIOS codebase. AI is a powerful assistant, but we need rules to ensure quality, security, and maintainability.

## AI Usage Policy

### Approved Uses
✅ Generating boilerplate code  
✅ Writing tests  
✅ Documenting existing code  
✅ Refactoring with clear intent  
✅ Suggesting solutions to problems

### Prohibited Uses
❌ Copying code without understanding  
❌ Generating security-sensitive code without review  
❌ Making architectural decisions  
❌ Committing AI-generated code without testing  
❌ Using AI to bypass code review

## Documentation

| Document | Purpose |
|----------|---------|
| [AI Contribution Policy](./ai_contribution_policy.md) | When and how to use AI |
| [Prompting Playbook](./prompting_playbook.md) | How to get good AI suggestions |
| [Evidence Requirements](./evidence_requirements.md) | Proving AI code works |
| [Safe Editing Rules](./safe_editing_rules.md) | Preventing AI mistakes |

## Quick Rules

1. **Always test AI-generated code**
2. **Always review AI suggestions**
3. **Document when using AI for complex logic**
4. **Never commit secrets from AI**
5. **Verify AI code meets our standards**

## Related
- [Contributing Guidelines](../../CONTRIBUTING.md)
- [Testing Strategy](../testing/strategy.md)
- [Code Review Process](../GOVERNANCE.md)
- [Repo Best Practices](../../BESTPR.md)
