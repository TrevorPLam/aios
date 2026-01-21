# API Documentation

## Plain English Summary

This directory contains documentation for all APIs in the AIOS system. APIs (Application Programming Interfaces) are the contracts that define how different parts of the system communicate with each other - primarily how the mobile client talks to the backend server.

## Technical Detail

The AIOS system uses RESTful HTTP APIs for communication between the client and server. All API contracts are documented using the OpenAPI 3.0 specification, providing:

- **Machine-readable contracts** - Tools can generate code, validate requests/responses
- **Human-readable documentation** - Developers can understand API behavior
- **Testing support** - Automated tests can verify API compliance
- **Code generation** - Client SDKs and server stubs can be generated

### API Documentation Structure

```text
docs/apis/
├── README.md                    # This file - API overview
├── openapi/                     # OpenAPI specifications
│   ├── README.md               # OpenAPI documentation guide
│   └── openapi.yaml            # Main API specification
└── [future expansions]         # GraphQL, WebSockets, etc.
```text

## Available API Documentation

| API Type | Description | Documentation |
| ---------- | ------------- | --------------- |
| **REST API** | Main HTTP API for client-server communication | [OpenAPI Spec](./openapi/openapi.yaml) |
| **WebSocket** | Real-time bidirectional communication | _Future_ |
| **GraphQL** | Flexible query API | _Future_ |

## REST API Overview

### Base URL

```text
Development:  http://localhost:3000/api
Staging:      https://staging-api.aios.example.com/api
Production:   https://api.aios.example.com/api
```text

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```text

Tokens are obtained through the `/api/auth/login` endpoint and expire after 7 days.

### Common Headers

#### Request Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Client-Version: 1.0.0
```text

#### Response Headers

```http
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```text

### Standard Response Format

#### Success Response

```json
{
  "data": {
    // Response payload
  },
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```text

#### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```text

### HTTP Status Codes

| Code | Meaning | Usage |
| ------ | --------- | ------- |
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST creating new resource |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server overloaded or maintenance |

### Rate Limiting

APIs are rate-limited to prevent abuse:

- **Authenticated users:** 100 requests per minute
- **Unauthenticated users:** 20 requests per minute

Rate limit information is included in response headers.

### Pagination

List endpoints support pagination using query parameters:

```http
GET /api/data?limit=20&offset=0
```text

Response includes pagination metadata:

```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 150,
      "hasMore": true
    }
  }
}
```text

### Filtering and Sorting

List endpoints support filtering and sorting:

```http
GET /api/data?filter[status]=active&sort=-createdAt
```text

- `filter[field]=value` - Filter by field value
- `sort=field` - Sort ascending by field
- `sort=-field` - Sort descending by field

### Versioning

The API uses URL-based versioning:

```text
/api/v1/users
/api/v2/users
```text

Currently on v1. When breaking changes are needed, v2 will be introduced while maintaining v1 for backwards compatibility.

## Assumptions

- **Assumption 1:** REST is sufficient for all client-server communication
  - _If false:_ Add WebSocket for real-time features, consider GraphQL for complex queries
- **Assumption 2:** JSON is the only content type needed
  - _If false:_ Support additional content types (XML, Protocol Buffers)
- **Assumption 3:** OpenAPI specification stays current with implementation
  - _If false:_ Implement automated OpenAPI generation from code

## Failure Modes

### Failure Mode 1: API Contract Drift

- **Symptom:** Client and server disagree on API structure, unexpected errors
- **Impact:** Application bugs, data corruption, poor user experience
- **Detection:** Integration tests fail, increased error rates
- **Mitigation:**
  - Generate OpenAPI spec from code (or vice versa)
  - Validate requests/responses against spec in tests
  - Run contract tests in CI
  - Version APIs properly for breaking changes
- **Monitoring:** API validation errors, test failures

### Failure Mode 2: Breaking Changes Without Version Bump

- **Symptom:** Old clients break when server is updated
- **Impact:** App crashes, users can't access features
- **Detection:** Spike in client errors after deployment
- **Mitigation:**
  - Always bump API version for breaking changes
  - Maintain backwards compatibility where possible
  - Deprecate old endpoints before removing
  - Monitor old API version usage
- **Monitoring:** API version usage, error rates by client version

### Failure Mode 3: Undocumented Endpoints

- **Symptom:** Endpoints exist but aren't in OpenAPI spec
- **Impact:** Developers don't know endpoints exist, duplicated effort
- **Detection:** Code review finds API handlers not in spec
- **Mitigation:**
  - Make OpenAPI spec the source of truth
  - Generate code from spec
  - Or generate spec from code automatically
  - Fail CI if undocumented endpoints detected
- **Monitoring:** Manual audits, automated spec validation

### Failure Mode 4: Inconsistent Error Responses

- **Symptom:** Different endpoints return errors in different formats
- **Impact:** Client error handling is complex and fragile
- **Detection:** Integration tests, manual testing
- **Mitigation:**
  - Use centralized error handler
  - Document error format in OpenAPI
  - Validate error responses in tests
- **Monitoring:** Error response format validation

### Failure Mode 5: Security Vulnerabilities

- **Symptom:** Endpoints expose sensitive data or allow unauthorized access
- **Impact:** Data breaches, security incidents
- **Detection:** Security audits, penetration testing
- **Mitigation:**
  - Document authentication requirements in OpenAPI
  - Validate auth on every endpoint
  - Use security definitions in OpenAPI spec
  - Regular security reviews
- **Monitoring:** Security scanning, audit logs

## How to Verify

### Manual Verification

```bash
# 1. Validate OpenAPI spec syntax
npx @stoplight/spectral-cli lint docs/apis/openapi/openapi.yaml

# 2. Generate API documentation
npx @redocly/cli build-docs docs/apis/openapi/openapi.yaml

# 3. Test API endpoints match spec
npm run test:api-contract

# 4. Start API mock server from spec
npx prism mock docs/apis/openapi/openapi.yaml
```text

### Automated Checks

- [ ] OpenAPI spec is valid YAML/JSON
- [ ] OpenAPI spec passes linting: `spectral lint`
- [ ] All endpoints are documented in spec
- [ ] Request/response examples are valid
- [ ] Integration tests validate against spec

### Success Criteria

1. OpenAPI spec is valid and complete
2. All endpoints are documented
3. Examples work as documented
4. Contract tests pass
5. API documentation is generated successfully

## Working with OpenAPI

### Tools

- **Editor:** [Swagger Editor](https://editor.swagger.io/) - Edit and validate specs
- **Documentation:** [Redoc](https://github.com/Redocly/redoc) - Generate beautiful docs
- **Validation:** [Spectral](https://stoplight.io/open-source/spectral) - Lint OpenAPI specs
- **Mock Server:** [Prism](https://stoplight.io/open-source/prism) - Mock API from spec
- **Code Generation:** [OpenAPI Generator](https://openapi-generator.tech/) - Generate clients/servers

### Editing the OpenAPI Spec

```bash
# 1. Open spec in editor
code docs/apis/openapi/openapi.yaml

# 2. Make changes following OpenAPI 3.0 format

# 3. Validate
npx @stoplight/spectral-cli lint docs/apis/openapi/openapi.yaml

# 4. Generate documentation to preview
npx @redocly/cli build-docs docs/apis/openapi/openapi.yaml \
  --output docs/apis/openapi/docs.html

# 5. Open in browser
open docs/apis/openapi/docs.html
```text

### Adding a New Endpoint

When adding a new API endpoint:

1. **Implement the endpoint** in `server/src/routes/`
2. **Update OpenAPI spec** with:
   - Path and operation
   - Parameters (path, query, body)
   - Request body schema
   - Response schemas (success and errors)
   - Authentication requirements
3. **Add request/response examples**
4. **Update integration tests** to validate against spec
5. **Regenerate API documentation**

See [OpenAPI Guide](./openapi/README.md) for detailed instructions.

## API Development Workflow

### 1. Design First

- Write OpenAPI spec before implementing
- Review with team
- Get feedback from client developers

### 2. Implement

- Generate server stubs from spec (optional)
- Implement endpoint logic
- Validate against spec in tests

### 3. Test

- Unit tests for controllers
- Integration tests against OpenAPI spec
- Manual testing with Postman/Insomnia

### 4. Document

- Ensure OpenAPI spec is up to date
- Add examples and descriptions
- Generate documentation

### 5. Deploy

- Version appropriately
- Monitor for errors
- Collect usage metrics

## Related Documentation

- [OpenAPI Specification](./openapi/README.md) - Detailed OpenAPI guide
- [Server Module](../modules/server.md) - API implementation
- [Client Module](../modules/client.md) - API consumer
- [Shared Types](../modules/shared.md) - Types used in API contracts
- [Data Models](../data/README.md) - Database schemas behind APIs
- [Security](../security/threat_model.md) - API security considerations

## Best Practices

### API Design

1. **Use RESTful conventions** - Standard HTTP methods and status codes
2. **Be consistent** - Same patterns across all endpoints
3. **Version your API** - Plan for breaking changes
4. **Document everything** - Every endpoint, parameter, response
5. **Provide examples** - Request and response examples help developers

### Security

1. **Authenticate everything** - Except deliberately public endpoints
2. **Validate all input** - Never trust client data
3. **Rate limit** - Prevent abuse
4. **Use HTTPS** - Always, no exceptions
5. **Don't leak info** - Error messages shouldn't reveal internal details

### Performance

1. **Paginate lists** - Don't return thousands of records
2. **Allow filtering** - Let clients request only what they need
3. **Use caching** - Cache headers, ETags
4. **Compress responses** - Gzip large responses
5. **Monitor performance** - Track response times

### Backwards Compatibility

1. **Add, don't remove** - Adding fields is safe, removing isn't
2. **Make optional** - New required fields break clients
3. **Deprecate gradually** - Give clients time to migrate
4. **Version when necessary** - Breaking changes need new version

## Notes

- The OpenAPI specification is the source of truth for API contracts
- Keep specs and implementation in sync
- When in doubt, favor client convenience over server simplicity
- Good API documentation is as important as good code
- APIs are forever - design carefully, you'll live with it for years

## References

- [OpenAPI Specification 3.0](https://swagger.io/specification/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [API Design Patterns](https://www.apiguide.com/)
- [OAuth 2.0](https://oauth.net/2/) (if implementing)
