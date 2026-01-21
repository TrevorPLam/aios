# Secrets Handling

## Plain English Summary

Never put passwords, API keys, or other secrets directly in code. Use environment variables and secret management systems. Rotate secrets regularly. Never commit secrets to git.

## Best Practices

### DO

- ✅ Store secrets in environment variables
- ✅ Use AWS Secrets Manager / HashiCorp Vault in production
- ✅ Use `.env.example` with placeholder values
- ✅ Add `.env` to `.gitignore`
- ✅ Rotate secrets every 90 days
- ✅ Use different secrets per environment (dev/staging/prod)

### DON'T

- ❌ Commit secrets to git (check with git-secrets)
- ❌ Hardcode secrets in code
- ❌ Share secrets in Slack/email
- ❌ Reuse secrets across environments
- ❌ Log secrets (even accidentally)

## Secret Types

1. **Database Credentials** - PostgreSQL connection string
2. **API Keys** - Third-party service keys
3. **JWT Secret** - Token signing key
4. **Encryption Keys** - Data encryption keys
5. **OAuth Credentials** - Client ID/secret

## Implementation

```typescript
// ✅ GOOD - Load from environment
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set');
}

// ❌ BAD - Hardcoded
const jwtSecret = 'my-secret-key-12345';
```text

## Rotation Procedure

1. Generate new secret
2. Update in secret manager
3. Deploy with gradual rollout
4. Verify old secret still works
5. Remove old secret after migration

## Emergency Response

If secret is leaked:

1. **Immediate:** Rotate the secret
2. **Within 1 hour:** Review access logs
3. **Within 24 hours:** Complete postmortem
4. **Notify affected parties** if customer data exposed

## Related

- [Threat Model](./threat_model.md)
- [Supply Chain Security](./supply_chain.md)
