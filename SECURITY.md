# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| dev     | :white_check_mark: |

## Reporting a Vulnerability

**DO NOT** open public GitHub issues for security vulnerabilities.

### How to Report

Please report security vulnerabilities by emailing [security contact to be added].

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Critical Fixes:** Aimed for within 7 days
- **Medium Priority:** Aimed for within 30 days

### Disclosure Policy

- We will work with you to understand and verify the issue
- We will develop and test a fix
- We will publicly disclose the issue after a fix is released
- Security researchers will be credited (unless requesting anonymity)

## Security Measures

This project implements multiple security layers:

- ✅ **CodeQL Analysis:** Automated security scanning on every PR
- ✅ **Input Validation:** All user inputs validated with Zod schemas
- ✅ **Authentication:** JWT-based authentication with bcrypt password hashing
- ✅ **Authorization:** User data isolation and access controls
- ✅ **Type Safety:** Full TypeScript coverage
- ✅ **Test Coverage:** 100% coverage on security-critical paths
- ✅ **Privacy-First:** Local data storage, no external APIs for core features

## Detailed Security Documentation

For comprehensive security documentation, see:
- [Complete Security Documentation](docs/security/SECURITY.md)
- [API Security](docs/technical/API_DOCUMENTATION.md)
- [Testing Security](docs/technical/TESTING_INSTRUCTIONS.md)

## Security Status

**Last Security Audit:** January 16, 2026  
**Known Vulnerabilities:** 0  
**CodeQL Status:** ✅ PASSING

All modules have been audited and tested for security vulnerabilities. See [docs/security/SECURITY.md](docs/security/SECURITY.md) for module-specific security status.
