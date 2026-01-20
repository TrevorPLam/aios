# Dependency Security Policy

## Plain English Summary
Third-party npm packages can have security vulnerabilities. We must check dependencies before adding them, keep them updated, and monitor for security advisories.

## Before Adding Dependencies

1. **Check security history** - Any past vulnerabilities?
2. **Check maintenance** - Last updated recently?
3. **Check popularity** - Well-used and trusted?
4. **Check license** - Compatible with our usage?
5. **Run security audit** - `npm audit` before adding

## Dependency Updates

- **Security updates:** Within 48 hours of advisory
- **Minor updates:** Monthly
- **Major updates:** Quarterly (with testing)

## Automated Scanning

```bash
# Daily automated scan
npm audit

# Or use GitHub Dependabot / Snyk
```

## Vulnerability Response

**Critical/High:**
1. Update within 48 hours
2. Test in staging
3. Deploy to production
4. Document in changelog

**Medium/Low:**
1. Update in next sprint
2. Track in backlog

## Approved Dependencies

Maintain list of vetted, approved dependencies. New dependencies require security review.

## Related
- [Supply Chain Security](./supply_chain.md)
- [Threat Model](./threat_model.md)
