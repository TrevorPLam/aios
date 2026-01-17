# AI Prompting Playbook

## Effective Prompting

### Be Specific
❌ Bad: "make it better"  
✅ Good: "refactor this function to reduce cyclomatic complexity below 10"

### Provide Context
❌ Bad: "write a test"  
✅ Good: "write a Jest test for the userService.createUser function that tests successful user creation and duplicate email error"

### Show Examples
❌ Bad: "follow our style"  
✅ Good: "follow this style: [paste example]"

### Iterate
1. Start with broad prompt
2. Review suggestion
3. Refine prompt with specifics
4. Repeat until satisfactory

## Example Prompts

### Generate Tests
```
Create Jest unit tests for the following function:
[paste function]

Test cases to cover:
1. Happy path with valid input
2. Error when input is null
3. Error when user not found

Use the same style as existing tests in this file.
```

### Refactor Code
```
Refactor this function to:
1. Use async/await instead of promises
2. Add error handling
3. Extract magic numbers to constants
4. Add JSDoc comments

Keep the same functionality and tests passing.
```

### Generate Documentation
```
Generate JSDoc comments for this module following our standard:
[paste module]

Include:
- Plain English Summary
- @param descriptions
- @returns description
- @throws documentation
- Examples
```

## Related
- [AI Contribution Policy](./ai_contribution_policy.md)
- [Safe Editing Rules](./safe_editing_rules.md)
