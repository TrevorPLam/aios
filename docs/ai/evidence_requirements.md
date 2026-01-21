# Evidence Requirements for AI Contributions

## Plain English Summary

AI-generated code must be proven to work correctly. "It compiled" is not enough. We need tests, validation, and verification.

## Required Evidence

### 1. Tests Pass

```bash
✅ All existing tests still pass
✅ New tests added for new code
✅ Test coverage maintained or increased
```text

### 2. Linting & Type Checking

```bash
✅ npm run lint passes
✅ npm run type-check passes
✅ No new TypeScript errors
```text

### 3. Manual Verification

```bash
✅ Code reviewed line-by-line
✅ Logic understood by human
✅ Edge cases considered
✅ Error handling verified
```text

### 4. Documentation

```bash
✅ Complex logic commented
✅ Function/module docs updated
✅ Breaking changes noted
```text

## Verification Checklist

Before committing AI code:

- [ ] I understand what this code does
- [ ] I can explain it to another developer
- [ ] I've tested it works correctly
- [ ] I've tested error cases
- [ ] It follows our code standards
- [ ] It doesn't introduce security issues
- [ ] Tests provide adequate coverage

## Red Flags

🚩 **Don't commit if:**

- You don't understand the code
- Tests don't pass
- No tests exist for new code
- Security concerns present
- Breaking changes not documented
- Code quality standards violated

## Related

- [AI Contribution Policy](./ai_contribution_policy.md)
- [Safe Editing Rules](./safe_editing_rules.md)
- [Testing Strategy](../testing/strategy.md)
