# Pull Request

<!-- This template ensures all changes are properly documented and verified before merging. -->

## Description

<!-- Provide a clear and concise description of what this PR does and why it's needed. -->

## Type of Change

<!-- Select all that apply -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Code style/formatting
- [ ] Refactoring (no functional changes)
- [ ] Configuration change
- [ ] Performance improvement
- [ ] Test update
- [ ] Build system change
- [ ] Dependency update

## Related Issues

<!-- Link to related issues using #issue_number -->

Closes #
Relates to #
Fixes #

## Changes Summary

<!-- Provide a high-level summary of the changes made -->

### Files Modified
<!-- List key files that were changed -->

### Key Changes
<!-- Describe the main changes in this PR -->

## Verification

### Testing Performed

<!-- Describe how you verified this change works correctly -->

**Test Commands Executed:**
```bash
# List the commands you ran to verify this change
npm run check:types
npm test
npm run lint
```

**Test Results:**
- [ ] All existing tests pass
- [ ] New tests added (if applicable)
- [ ] Test coverage maintained or improved
- [ ] Manual testing completed on relevant platforms

### Platform Testing

- [ ] iOS (if applicable)
- [ ] Android (if applicable)
- [ ] Web (if applicable)

### Verification Evidence

<!-- Provide specific evidence that this change works as intended -->

1. 
2. 
3. 

## Checklist

### Code Quality

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented, particularly in complex areas
- [ ] No new warnings or errors introduced
- [ ] Debug statements (console.log, etc.) removed
- [ ] TypeScript types are properly defined
- [ ] No unused imports or variables

### Documentation

- [ ] Documentation in `docs/` updated to reflect changes
- [ ] Code comments and JSDoc updated where needed
- [ ] CHANGELOG.md updated (if applicable)
- [ ] README.md updated (if applicable)
- [ ] Architecture Decision Record created (if applicable)

### Testing

- [ ] Tests added for new functionality
- [ ] Tests updated for changed functionality
- [ ] All unit tests pass locally
- [ ] Integration tests pass (if applicable)
- [ ] E2E tests pass (if applicable)
- [ ] Type checking passes (`npm run check:types`)
- [ ] Linting passes (`npm run lint`)

### Security

- [ ] No new security vulnerabilities introduced
- [ ] No sensitive data (API keys, passwords) exposed
- [ ] New dependencies reviewed for security issues
- [ ] Security best practices followed
- [ ] Input validation implemented where needed

### Database & Migrations

- [ ] Database schema changes are backward compatible
- [ ] Migrations created (if applicable)
- [ ] Migration rollback tested
- [ ] Data migration scripts tested (if applicable)

### Governance Compliance

- [ ] Trace log created (for non-documentation changes)
- [ ] Compliance check passed (`npm run check:compliance`)
- [ ] Governance verification passed (`npm run check:governance`)
- [ ] HITL items addressed (if applicable)
- [ ] Waivers documented (if applicable)

## Screenshots / Visual Evidence

<!-- If applicable, provide screenshots or videos demonstrating the changes -->

### Before
<!-- Screenshot/video of behavior before changes -->

### After
<!-- Screenshot/video of behavior after changes -->

## Risks & Considerations

<!-- What could potentially break? What should reviewers pay special attention to? -->

### Potential Impact Areas

- 
- 
- 

### Breaking Changes

<!-- Document any breaking changes and migration path -->

### Performance Implications

<!-- Note any performance considerations -->

## Deployment Notes

<!-- Any special deployment considerations -->

### Environment Variables

<!-- List any new or changed environment variables -->

### Database Changes

<!-- Note any database schema changes or migrations required -->

### Configuration Changes

<!-- Note any configuration file changes -->

### Rollback Plan

<!-- Describe how to rollback this change if needed -->

## Additional Context

<!-- Any other context, background, or related work that reviewers should know -->

## For Reviewers

### Review Focus Areas

<!-- Highlight specific areas that need careful review -->

- [ ] Code quality and adherence to standards
- [ ] Test coverage and quality
- [ ] Documentation completeness
- [ ] Security implications
- [ ] Breaking changes clearly documented
- [ ] Performance considerations
- [ ] Governance compliance

### Documentation Resources

- [Contributing Guide](CONTRIBUTING.md)
- [Evidence Requirements](docs/ai/evidence_requirements.md)
- [Testing Strategy](docs/testing/strategy.md)
- [Architecture Decisions](docs/decisions/)
- [Governance Framework](.repo/policy/constitution.json)

---

**By submitting this pull request, I confirm that:**

1. My contribution is made under the terms of the project's license
2. I have read and followed the contributing guidelines
3. I have verified this change works as described
4. I have provided adequate evidence of verification
5. All required checks have passed
