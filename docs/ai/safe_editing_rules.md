# Safe Editing Rules for AI

## Plain English Summary
AI can make mistakes. Follow these rules to catch errors before they cause problems.

## The Rules

### 1. Small Changes
- Make one logical change at a time
- Don't let AI refactor entire files
- Review each suggestion before accepting

### 2. Test Immediately
- Run tests after accepting AI suggestion
- Don't accept multiple suggestions without testing
- Revert if tests break

### 3. Review Everything
- Read AI-generated code line by line
- Don't blindly accept "looks good"
- Question suspicious patterns

### 4. Verify Assumptions
- AI doesn't know your business logic
- AI doesn't know your conventions
- AI guesses from context

### 5. Protect Critical Code
- Extra scrutiny for auth/security code
- Always manually review database changes
- Never auto-accept production hotfixes

## Common AI Mistakes

### Outdated APIs
AI trains on old code, may suggest deprecated APIs.
**Fix:** Check documentation for current API.

### Security Issues
AI may generate insecure code patterns.
**Fix:** Security review all auth/data handling code.

### Breaking Changes
AI may not understand your API contracts.
**Fix:** Verify contracts unchanged or documented.

### Logic Errors
AI may misunderstand requirements.
**Fix:** Write tests first, then use AI to implement.

### Missing Edge Cases
AI focuses on happy path.
**Fix:** Add tests for edge cases, errors, nulls.

## Safe AI Workflow

1. **Write test first** (or have clear requirements)
2. **Prompt AI** with specific task
3. **Review suggestion** thoroughly
4. **Accept if good** (or refine prompt)
5. **Run tests immediately**
6. **Verify behavior** manually if needed
7. **Commit** with good message

## Emergency: AI Broke Something

If AI introduces a bug:
1. **Revert immediately** (`git revert` or `git reset`)
2. **Understand what broke**
3. **Fix manually** or re-prompt AI correctly
4. **Add test** to prevent regression
5. **Document** what went wrong (learn from it)

## Related
- [AI Contribution Policy](./ai_contribution_policy.md)
- [Evidence Requirements](./evidence_requirements.md)
- [Prompting Playbook](./prompting_playbook.md)
