# Threat Model

**Last Updated:** 2024-01-15
**Owner:** Security Team

## Plain English Summary

A threat model identifies what could go wrong with our system from a security perspective. It answers: What are we protecting? Who might attack us? How might they attack? What can we do to prevent or detect these attacks?

## Assets

What we're protecting:

1. **User Data** - Personal information, credentials
2. **API Keys** - Authentication tokens, secrets
3. **Application Code** - Proprietary business logic
4. **Infrastructure** - Servers, databases, networks

## Threat Actors

Who might attack:

1. **External Attackers** - Malicious internet users
2. **Compromised Accounts** - Stolen user credentials
3. **Malicious Insiders** - Rogue employees (lower risk)
4. **Automated Bots** - Scrapers, credential stuffers

## Attack Vectors

### 1. Authentication & Authorization

#### Threats

- Credential stuffing attacks
- Brute force login attempts
- JWT token theft or manipulation
- Session hijacking

### Mitigations

- Rate limiting on auth endpoints
- Strong password requirements (min 8 chars)
- JWT tokens with short expiration (7 days)
- HTTPS only (no HTTP)
- HttpOnly, Secure cookies for sessions

### 2. API Security

#### Threats (2)

- SQL injection
- Mass assignment vulnerabilities
- API abuse/scraping
- Denial of service (DoS)

### Mitigations (2)

- Parameterized queries (Drizzle ORM)
- Input validation with Zod schemas
- Rate limiting (100 req/min authenticated, 20 unauthenticated)
- Request size limits
- CORS configuration

### 3. Data Protection

#### Threats (3)

- Data exposure in logs
- Unencrypted data at rest
- Unencrypted data in transit
- Backup data exposure

### Mitigations (3)

- Never log passwords or tokens
- Database encryption at rest
- HTTPS/TLS for all API calls
- Encrypted backups
- Secrets management (AWS Secrets Manager / environment variables)

### 4. Client Security

#### Threats (4)

- Man-in-the-middle attacks
- Insecure data storage
- Reverse engineering
- Certificate pinning bypass

### Mitigations (4)

- Certificate pinning (mobile apps)
- Secure storage for tokens (Keychain/KeyStore)
- Code obfuscation (ProGuard for Android)
- API key rotation
- No hardcoded secrets

### 5. Infrastructure

#### Threats (5)

- Unauthorized access to servers
- Container/pod escape
- Exposed management interfaces
- Misconfigured security groups

### Mitigations (5)

- VPN for admin access
- Security groups/firewall rules
- Regular security updates
- Container security scanning
- Least privilege IAM policies

## STRIDE Analysis

| Threat | Example | Mitigation |
| -------- | --------- | ------------ |
| **Spoofing** | Attacker impersonates user | JWT authentication, HTTPS |
| **Tampering** | Modified requests | Input validation, HTTPS |
| **Repudiation** | User denies action | Audit logging |
| **Information Disclosure** | Data leakage | Encryption, access controls |
| **Denial of Service** | System overwhelmed | Rate limiting, auto-scaling |
| **Elevation of Privilege** | User gains admin access | RBAC, principle of least privilege |

## Security Controls

### Authentication

- [x] Password hashing with bcrypt (10 rounds)
- [x] JWT tokens with expiration
- [x] Rate limiting on auth endpoints
- [ ] Multi-factor authentication (planned)
- [ ] OAuth 2.0 integration (planned)

### Authorization

- [x] Role-based access control (RBAC)
- [x] Resource-level permissions
- [ ] Attribute-based access control (future)

### Data Protection

- [x] HTTPS/TLS everywhere
- [x] Database encryption at rest
- [x] Secrets in environment variables
- [x] No secrets in code or logs
- [ ] Field-level encryption for PII (planned)

### Monitoring

- [x] Failed login attempt tracking
- [x] Error logging
- [x] API access logs
- [ ] Security incident alerts (planned)
- [ ] Anomaly detection (future)

## Incident Response

If security incident occurs:

1. **Contain** - Isolate affected systems
2. **Assess** - Determine scope and impact
3. **Notify** - Alert security team and stakeholders
4. **Remediate** - Fix vulnerability
5. **Document** - Create incident report
6. **Learn** - Update threat model and controls

See [Security Incidents Runbook](../operations/runbooks/security_incident.md) (to be created)

## Compliance

- **GDPR** - User data protection, right to deletion
- **CCPA** - California privacy law compliance
- **SOC 2** - Security controls audit (if applicable)
- **PCI DSS** - If handling payment data

## Related Documentation

- [Secrets Handling](./secrets_handling.md)
- [Dependency Policy](./dependency_policy.md)
- [Supply Chain Security](./supply_chain.md)

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [STRIDE Threat Model](https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
