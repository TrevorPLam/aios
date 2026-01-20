# ADR-003: Use JWT for authentication

**Status:** Accepted  
**Date:** 2026-01-16

## Context
AIOS requires stateless authentication that works for mobile clients and server APIs. Tokens must be portable, cacheable, and easy to validate.

## Decision
Adopt JSON Web Tokens (JWT) as the primary authentication token format.

## Consequences
- Simplifies authentication for mobile clients without server session state.
- Enables easy verification across services.
- Requires careful token storage and rotation practices.
- Adds responsibility for token expiration and revocation strategies.
