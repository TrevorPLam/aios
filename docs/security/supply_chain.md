# Supply Chain Security

## Plain English Summary  
Supply chain attacks compromise the tools and dependencies we use to build software. Protect against malicious npm packages, compromised build systems, and dependency confusion attacks.

## Threats

1. **Malicious Packages** - Intentionally harmful npm packages
2. **Compromised Packages** - Legitimate packages hijacked by attackers
3. **Typosquatting** - Packages with names similar to popular ones
4. **Dependency Confusion** - Internal packages replaced by public ones

## Mitigations

### Package Verification
- Verify package names before installing
- Review package contents after installing
- Use package lock files (package-lock.json)
- Enable 2FA on npm account

### Build Security
- Use trusted CI/CD (GitHub Actions)
- Sign commits with GPG
- Verify container image signatures
- Scan containers for vulnerabilities

### Access Control
- Limit npm publish access
- Use scoped packages for internal code
- Implement private npm registry if needed
- Review package.json changes carefully

## Incident Response

If compromised dependency detected:
1. Remove dependency immediately
2. Scan for malicious code execution
3. Rotate all secrets
4. Review access logs
5. Notify security team

## Tools

- **npm audit** - Vulnerability scanning
- **Snyk** - Dependency monitoring
- **Dependabot** - Automated updates
- **Socket.dev** - Supply chain protection

## Related
- [Dependency Policy](./dependency_policy.md)
- [Threat Model](./threat_model.md)
