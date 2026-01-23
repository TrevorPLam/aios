# AGENT.md (Folder-Level Guide)

## Purpose of this folder
Server-side Express application code including API routes, middleware, database access, and business logic.

## What agents may do here
- Create and modify API routes and endpoints
- Add or update middleware and authentication logic
- Modify database schemas and queries
- Update server configuration
- Follow Node.js and Express best practices

## What agents may NOT do
- Bypass security validation or authentication
- Expose sensitive data in responses
- Modify authentication without security review
- Bypass rate limiting or access controls
- Cross module boundaries without ADR

## Required links
- Refer to higher-level policy: /.repo/policy/BOUNDARIES.md
- Security baseline: /.repo/policy/SECURITY_BASELINE.md
- API standards: /.repo/docs/standards/api.md
