# Quality Gates

## Plain English Summary
Quality gates are automatic checks that must pass before code can be merged or deployed. They enforce our quality standards and prevent bugs from reaching production.

## CI Quality Gates

### Required for PR Merge
- [ ] All unit tests pass
- [ ] All integration tests pass  
- [ ] Test coverage ≥ 80%
- [ ] Linting passes (ESLint)
- [ ] Type checking passes (TypeScript)
- [ ] Build succeeds
- [ ] No high/critical security vulnerabilities

### Required for Deployment
- [ ] All PR requirements pass
- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] Security scan passes (CodeQL)
- [ ] Code review approved by 2 engineers

## Enforcement

```yaml
# .github/workflows/ci.yml
- name: Test
  run: npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'

- name: Lint
  run: npm run lint

- name: Type Check
  run: npm run type-check

- name: Security Audit
  run: npm audit --audit-level=high
```

## Bypassing Gates

**Never bypass for:**
- Security vulnerabilities
- Failing tests
- Build failures

**May bypass with approval for:**
- Flaky test (must fix within 24h)
- Emergency hotfix (fix forward after)

## Related
- [Testing Strategy](./strategy.md)
- [Test Pyramid](./test_pyramid.md)
