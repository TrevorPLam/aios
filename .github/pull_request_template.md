# Pull Request

<!-- PR template prevents undocumented changes from quietly landing. -->

## 📝 Description

<!-- What does this PR do? Explain the changes and their purpose. -->

## 🎯 Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that causes existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🎨 Code style/formatting
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🔧 Configuration change
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update

## 🔗 Related Issues

<!-- Link to related issues using #issue_number -->

Closes #
Relates to #

## 📋 Checklist

<!-- Review each item and check the box when complete -->

### Code Changes

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors
- [ ] I have checked for console.log() statements and removed them

### Documentation

- [ ] I have updated the documentation in `docs/` to reflect my changes
- [ ] I have updated relevant code comments and JSDoc
- [ ] I have updated the CHANGELOG.md (if applicable)
- [ ] README.md is updated (if needed)

### Testing & Verification

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested my changes on the following platforms:
  - [ ] iOS
  - [ ] Android
  - [ ] Web
- [ ] I have verified there are no TypeScript errors (`npm run check:types`)
- [ ] I have run the linter and fixed all issues (`npm run lint`)

**How I verified this works:**

<!-- Describe your testing approach. See docs/verification.md for guidelines. -->

```
1. 
2. 
3. 
```

### Security & Dependencies

- [ ] My changes do not introduce new security vulnerabilities
- [ ] I have checked that no sensitive data (API keys, passwords) is exposed
- [ ] New dependencies (if any) have been reviewed for security issues
- [ ] I have updated dependency versions if fixing security issues

### Database & Migrations

- [ ] Database schema changes are backward compatible
- [ ] I have created necessary migrations (if applicable)
- [ ] Migration rollback has been tested

## 📸 Screenshots / Videos

<!-- If applicable, add screenshots or videos demonstrating the changes -->

### Before

<!-- Screenshot/video of the behavior before your changes -->

### After

<!-- Screenshot/video of the behavior after your changes -->

## ⚠️ Risks & Considerations

<!-- What could potentially break? What should reviewers pay special attention to? -->

- 
- 
- 

## 🚀 Deployment Notes

<!-- Any special deployment considerations? Database migrations? Environment variables? -->

- 
- 

## 📚 Additional Context

<!-- Any other context, background, or related work -->

---

## For Reviewers

<!-- Automatically added notes for reviewers -->

### Review Checklist

- [ ] Code quality and style
- [ ] Tests are comprehensive and passing
- [ ] Documentation is complete and accurate
- [ ] No security vulnerabilities introduced
- [ ] Breaking changes are clearly documented
- [ ] Performance implications considered

### Documentation Resources

- [Verification Guidelines](docs/verification.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Architecture Decisions](ARCHITECTURE_DECISIONS.md)

---

**By submitting this pull request, I confirm that my contribution is made under the terms of the project's license.**
