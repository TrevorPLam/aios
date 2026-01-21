# OpenAPI Specification Guide

## Plain English Summary

This directory contains the OpenAPI specification for the AIOS REST API. OpenAPI is a standard format for describing REST APIs that both humans and machines can understand. Think of it as a contract that says "this is exactly how our API works."

## What is OpenAPI?

OpenAPI (formerly Swagger) is a specification for describing REST APIs. It defines:

- What endpoints exist (`/api/users`, `/api/data`, etc.)
- What HTTP methods they accept (GET, POST, PUT, DELETE)
- What parameters they need (query params, path params, request bodies)
- What they return (response schemas, status codes)
- Authentication requirements
- Examples of requests and responses

### Why Use OpenAPI?

1. **Single Source of Truth** - One spec describes the entire API
2. **Auto-Generated Docs** - Beautiful documentation from the spec
3. **Code Generation** - Generate client SDKs and server stubs
4. **Contract Testing** - Validate implementation matches spec
5. **Mock Servers** - Test clients before server is ready
6. **Team Alignment** - Frontend and backend agree on contracts

## Technical Detail

### File Structure

```text
docs/apis/openapi/
├── README.md          # This file
└── openapi.yaml       # Main OpenAPI 3.0 specification
```text

### OpenAPI Specification Format

The spec is written in YAML (or JSON) following OpenAPI 3.0 format:

```yaml
openapi: 3.0.0
info:
  title: AIOS API
  version: 1.0.0
  description: REST API for AIOS mobile application

servers:
  - url: http://localhost:3000/api
    description: Development
  - url: https://api.aios.example.com/api
    description: Production

paths:
  /users/me:
    get:
      summary: Get current user
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User object
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```text

### Key Sections

#### 1. Info Section

Metadata about the API (title, version, description, contact)

#### 2. Servers Section

Base URLs for different environments (dev, staging, production)

#### 3. Paths Section

All API endpoints with their operations (GET, POST, etc.)

#### 4. Components Section

Reusable schemas, responses, parameters, security schemes

#### 5. Security Section

Authentication/authorization requirements

## Using the OpenAPI Spec

### Viewing the Documentation

#### Option 1: Swagger UI (Interactive)

```bash
# Install globally
npm install -g swagger-ui-watcher

# Start server
swagger-ui-watcher docs/apis/openapi/openapi.yaml

# Open http://localhost:8000
```text

#### Option 2: Redoc (Beautiful Static Docs)

```bash
# Generate HTML documentation
npx @redocly/cli build-docs docs/apis/openapi/openapi.yaml \
  --output docs/apis/openapi/api-docs.html

# Open in browser
open docs/apis/openapi/api-docs.html
```text

#### Option 3: Online Swagger Editor

1. Go to <https://editor.swagger.io/>
2. File → Import File → Select `openapi.yaml`
3. Edit and validate in real-time

### Validating the Spec

```bash
# Validate syntax and structure
npx @stoplight/spectral-cli lint docs/apis/openapi/openapi.yaml

# Check for common issues
npx @redocly/cli lint docs/apis/openapi/openapi.yaml
```text

### Generating Code

#### Generate TypeScript Client

```bash
npx @openapitools/openapi-generator-cli generate \
  -i docs/apis/openapi/openapi.yaml \
  -g typescript-axios \
  -o client/src/generated/api
```text

#### Generate Node.js Server Stubs

```bash
npx @openapitools/openapi-generator-cli generate \
  -i docs/apis/openapi/openapi.yaml \
  -g nodejs-express-server \
  -o server/src/generated
```text

### Creating a Mock Server

Test your client against a mock server before the real API is ready:

```bash
# Start mock server
npx prism mock docs/apis/openapi/openapi.yaml

# Mock server runs on http://localhost:4010
# Automatically returns example responses from spec
```text

## Editing the OpenAPI Spec

### Adding a New Endpoint

1. **Add to paths section:**

```yaml
paths:
  /api/products:
    get:
      summary: List products
      description: Get a paginated list of products
      tags:
        - Products
      security:
        - bearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: List of products
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
```text

1. **Add schema to components:**

```yaml
components:
  schemas:
    Product:
      type: object
      required:
        - id
        - name
        - price
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        name:
          type: string
          minLength: 1
          maxLength: 200
          example: "Widget"
        price:
          type: integer
          description: Price in cents
          minimum: 0
          example: 1999
        description:
          type: string
          maxLength: 1000
          example: "A great widget"
        createdAt:
          type: string
          format: date-time
          example: "2024-01-15T12:00:00Z"
```text

1. **Validate:**

```bash
npx @stoplight/spectral-cli lint docs/apis/openapi/openapi.yaml
```text

### Defining Request Bodies

```yaml
paths:
  /api/products:
    post:
      summary: Create product
      tags:
        - Products
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProductRequest'
            examples:
              basic:
                summary: Basic product
                value:
                  name: "Widget"
                  price: 1999
              withDescription:
                summary: Product with description
                value:
                  name: "Premium Widget"
                  price: 2999
                  description: "The best widget"
      responses:
        '201':
          description: Product created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
```text

### Documenting Error Responses

```yaml
components:
  responses:
    BadRequestError:
      description: Bad request - validation error
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  code:
                    type: string
                    example: "VALIDATION_ERROR"
                  message:
                    type: string
                    example: "Invalid input"
                  details:
                    type: array
                    items:
                      type: object
                      properties:
                        field:
                          type: string
                          example: "email"
                        message:
                          type: string
                          example: "Invalid email format"
```text

Reference in endpoints:

```yaml
responses:
  '400':
    $ref: '#/components/responses/BadRequestError'
  '401':
    $ref: '#/components/responses/UnauthorizedError'
  '404':
    $ref: '#/components/responses/NotFoundError'
```text

## Assumptions

- **Assumption 1:** OpenAPI spec stays in sync with implementation
  - *If false:* Implement automated spec generation from code or validation in CI
- **Assumption 2:** YAML format is preferred over JSON
  - *If false:* Convert to JSON or maintain both formats
- **Assumption 3:** OpenAPI 3.0 is sufficient (not need 3.1)
  - *If false:* Upgrade to OpenAPI 3.1 for additional features

## Failure Modes

### Failure Mode 1: Spec Out of Sync with Code

- **Symptom:** Spec describes endpoints that don't exist or are different in implementation
- **Impact:** Confusion, broken code generation, failed contract tests
- **Detection:** Contract tests fail, manual testing finds discrepancies
- **Mitigation:**
  - Generate spec from code (decorators, comments)
  - Or generate code from spec
  - Run contract tests in CI
  - Make spec updates mandatory for API changes
- **Monitoring:** Contract test results

### Failure Mode 2: Invalid OpenAPI Syntax

- **Symptom:** Spec validation fails, tools can't parse spec
- **Impact:** Can't generate docs or code, spec is unusable
- **Detection:** Linting tools report errors
- **Mitigation:**
  - Run validation in pre-commit hook
  - Use editor with OpenAPI validation
  - Include validation in CI
- **Monitoring:** CI validation checks

### Failure Mode 3: Incomplete Documentation

- **Symptom:** Endpoints exist but are poorly documented
- **Impact:** Developers confused, incorrect API usage
- **Detection:** Code review, documentation review
- **Mitigation:**
  - Documentation checklist in PR template
  - Require examples for all endpoints
  - Regular documentation audits
- **Monitoring:** Documentation coverage metrics

### Failure Mode 4: Breaking Changes Without Version Bump

- **Symptom:** Spec changes in ways that break clients
- **Impact:** Client applications break after deployment
- **Detection:** Integration tests fail after spec update
- **Mitigation:**
  - Use spec diffing tools to detect breaking changes
  - Require version bump for breaking changes
  - Maintain backwards compatibility
- **Monitoring:** API version usage, breaking change detection

## How to Verify

### Manual Verification

```bash
# 1. Validate spec syntax
npx @stoplight/spectral-cli lint docs/apis/openapi/openapi.yaml

# 2. Check for breaking changes (requires previous version)
npx oasdiff breaking docs/apis/openapi/openapi-v1.yaml \
  docs/apis/openapi/openapi.yaml

# 3. Generate documentation to verify it looks good
npx @redocly/cli build-docs docs/apis/openapi/openapi.yaml \
  --output /tmp/api-docs.html
open /tmp/api-docs.html

# 4. Start mock server and test
npx prism mock docs/apis/openapi/openapi.yaml &
curl http://localhost:4010/api/users/me
```text

### Automated Checks

- [ ] Spec is valid OpenAPI 3.0: `spectral lint`
- [ ] No breaking changes without version bump: `oasdiff`
- [ ] All endpoints have examples
- [ ] All schemas have descriptions
- [ ] Contract tests pass

### Success Criteria

1. Spec validates without errors
2. Documentation generates successfully
3. Mock server works with all endpoints
4. Contract tests pass
5. No undocumented endpoints

## Best Practices

### General

1. **Be descriptive** - Use clear summaries and descriptions
2. **Provide examples** - Real examples help developers understand
3. **Use refs** - Don't repeat yourself, use `$ref` for reusable components
4. **Stay consistent** - Same patterns across all endpoints
5. **Version properly** - Break changes need version bumps

### Schemas

1. **Required fields** - Mark required fields explicitly
2. **Constraints** - Add min/max, patterns, formats
3. **Examples** - Include realistic example values
4. **Descriptions** - Explain what each field is for
5. **Types** - Use proper types and formats

### Examples

```yaml
# Good - Specific and realistic
example: "user@example.com"

# Bad - Generic and unhelpful
example: "string"

# Good - Shows actual structure
example:
  id: "123e4567-e89b-12d3-a456-426614174000"
  name: "John Doe"
  email: "john@example.com"

# Bad - Missing context
example:
  id: "string"
  name: "string"
```text

### Security

```yaml
# Define security schemes
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

# Apply to endpoints
security:
  - bearerAuth: []
```text

### Responses

1. **Document all codes** - 200, 400, 401, 404, 500, etc.
2. **Use refs** - Reference common error responses
3. **Include examples** - Show success and error responses
4. **Describe payloads** - Explain what's returned

## Tools and Resources

### Editing

- [Swagger Editor](https://editor.swagger.io/) - Online editor
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) - OpenAPI editing in VS Code
- [IntelliJ Plugin](https://plugins.jetbrains.com/plugin/14394-openapi-swagger-editor) - For IntelliJ/WebStorm

### Validation

- [Spectral](https://stoplight.io/open-source/spectral) - Linting and validation
- [Redocly CLI](https://redocly.com/docs/cli/) - Linting and bundling
- [OAS Diff](https://github.com/tufin/oasdiff) - Detect breaking changes

### Documentation Generation

- [Redoc](https://github.com/Redocly/redoc) - Beautiful API docs
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive docs
- [RapiDoc](https://mrin9.github.io/RapiDoc/) - Alternative UI

### Code Generation

- [OpenAPI Generator](https://openapi-generator.tech/) - Generate clients/servers in many languages
- [Swagger Codegen](https://swagger.io/tools/swagger-codegen/) - Original code generator

### Testing

- [Prism](https://stoplight.io/open-source/prism) - Mock servers and contract testing
- [Dredd](https://dredd.org/) - HTTP API testing
- [Schemathesis](https://schemathesis.readthedocs.io/) - Property-based API testing

## Related Documentation

- [API Overview](../README.md) - General API documentation
- [Server Module](../../modules/server.md) - API implementation
- [Client Module](../../modules/client.md) - API consumer
- [Shared Types](../../modules/shared.md) - Types matching API schemas
- [Testing Strategy](../../testing/strategy.md) - API testing approach

## Notes

- The OpenAPI spec should be the single source of truth for API contracts
- Update the spec BEFORE implementing new endpoints (design-first approach)
- Or generate the spec FROM your implementation (code-first approach)
- Either way, keep them in sync
- Good API documentation is an investment that pays dividends

Think of the OpenAPI spec as the blueprint for your API.

## References

- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)
- [OpenAPI Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)
- [AsyncAPI Style Guide](https://www.asyncapi.com/docs/community/011-styleguide)
- [API Design Patterns](https://cloud.google.com/apis/design)
