# Shared Module

**Location:** `packages/contracts/`
**Language:** TypeScript
**Framework:** None (pure TypeScript/JavaScript)
**Status:** Active

## Plain English Summary

The shared module contains TypeScript code that is used by both the client (mobile app) and server (backend API). This includes type definitions, validation schemas, utility functions, and constants that need to be consistent across both platforms.

## Purpose

### What This Module Does

- Defines TypeScript types and interfaces used by both client and server
- Provides validation schemas (using Zod) for data consistency
- Implements utility functions needed in both environments
- Defines shared constants and enumerations
- Ensures data contracts are consistent across client and server

### What This Module Does NOT Do

- Does NOT contain platform-specific code (no React, no Express)
- Does NOT have side effects or perform I/O operations
- Does NOT depend on client or server modules (one-way dependency)
- Does NOT include DOM or Node.js-specific APIs

### Key Use Cases

1. Defining API request/response types
2. Validating data on both client and server
3. Sharing business logic utilities (date formatting, calculations)
4. Maintaining consistent constants across platforms
5. Type-safe data transformation

## Technical Detail

### Architecture Overview

```text
packages/contracts/
├── src/
│   ├── types/              # TypeScript type definitions
│   │   ├── api.ts         # API request/response types
│   │   ├── models.ts      # Data model types
│   │   └── common.ts      # Common utility types
│   ├── validators/         # Zod validation schemas
│   │   ├── user.ts        # User validation
│   │   └── data.ts        # Data validation
│   ├── utils/              # Utility functions
│   │   ├── date.ts        # Date utilities
│   │   ├── string.ts      # String utilities
│   │   └── validation.ts  # Validation helpers
│   ├── constants/          # Shared constants
│   │   └── index.ts       # All constants
│   └── index.ts            # Main export file
├── tests/
├── package.json
└── tsconfig.json
```text

### Key Components

#### Component 1: Type Definitions

**Location:** `packages/contracts/types/`
**Purpose:** Central TypeScript types for data structures
### Interface
```typescript
// API types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: ResponseMeta;
}

// User model
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs (Data Transfer Objects)
export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
}
```text

#### Component 2: Validation Schemas

**Location:** `packages/contracts/validators/`
**Purpose:** Zod schemas for runtime validation
### Interface (2)
```typescript
import { z } from 'zod';

// User validation schema
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
});

// Infer TypeScript type from schema
export type CreateUserInput = z.infer<typeof createUserSchema>;
```text

#### Component 3: Utility Functions

**Location:** `packages/contracts/utils/`
**Purpose:** Pure functions used in both client and server
### Interface (3)
```typescript
// Date utilities
export function formatDate(date: Date, format: string): string;
export function isValidDate(value: unknown): boolean;

// String utilities
export function slugify(text: string): string;
export function truncate(text: string, maxLength: number): string;

// Validation utilities
export function isValidEmail(email: string): boolean;
export function isValidUrl(url: string): boolean;
```text

#### Component 4: Constants

**Location:** `packages/contracts/constants/`
**Purpose:** Shared constants and enums
### Interface (4)
```typescript
// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    ME: '/api/users/me',
    BY_ID: (id: string) => `/api/users/${id}`,
  },
} as const;

// Status codes
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Validation constraints
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
} as const;
```text

### Data Flow

```text
Client/Server Module
       ↓
Imports from packages/contracts/
       ↓
Uses types, validators, utils
       ↓
Consistent behavior across platforms
```text

Shared code has no runtime dependencies on client or server - it's pure TypeScript that compiles to JavaScript and runs anywhere.

### State Management

Shared module is stateless - it only exports:

- Type definitions (compile-time only)
- Pure functions (no side effects)
- Constants (immutable values)
- Validation schemas (stateless validators)

### Error Handling

```typescript
// Shared error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error handling utilities
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}
```text

## APIs and Interfaces

### Public API

Everything exported from `packages/contracts/index.ts` is the public API:

#### Types

```typescript
// Import types in apps/mobile/server
import type { User, CreateUserDTO, ApiResponse } from '@aios/shared';
```text

#### Validators

```typescript
// Import validators in apps/mobile/server
import { createUserSchema } from '@aios/packages/contracts/validators';

// Use for validation
const result = createUserSchema.safeParse(input);
if (!result.success) {
  // Handle validation errors
}
```text

#### Utilities

```typescript
// Import utilities in apps/mobile/server
import { formatDate, slugify } from '@aios/packages/contracts/utils';

const formattedDate = formatDate(new Date(), 'YYYY-MM-DD');
const slug = slugify('Hello World!'); // 'hello-world'
```text

#### Constants

```typescript
// Import constants in apps/mobile/server
import { API_ENDPOINTS, UserStatus } from '@aios/packages/contracts/constants';

const loginUrl = API_ENDPOINTS.AUTH.LOGIN;
const status = UserStatus.ACTIVE;
```text

### Internal Organization

Shared module uses barrel exports:

```typescript
// packages/contracts/index.ts
export * from './types';
export * from './validators';
export * from './utils';
export * from './constants';
```text

This allows clean imports:

```typescript
// Instead of:
import { User } from '@aios/packages/contracts/types/models';

// Users do:
import { User } from '@aios/shared';
```text

## Dependencies

### External Dependencies

| Package | Version | Purpose |
| --------- | --------- | --------- |
| `zod` | `^3.22.0` | Schema validation |
| `date-fns` | `^3.0.0` | Date manipulation (if needed) |

Intentionally minimal dependencies to avoid platform-specific issues.

### Internal Dependencies

- **None** - Shared module doesn't depend on client or server
- Client depends on shared
- Server depends on shared
- Shared is independent

### Dependency Rationale

- **Zod:** Type-safe validation that integrates with TypeScript
- **Minimal deps:** Reduces bundle size, avoids platform conflicts
- **No platform-specific code:** Works in browser, Node.js, React Native

## Build and Deploy

### Build Process

```bash
# Install dependencies
cd shared
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint
```text

### Configuration

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```text

### Package Configuration
```json
{
  "name": "@aios/shared",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./types": "./dist/types/index.js",
    "./validators": "./dist/validators/index.js",
    "./utils": "./dist/utils/index.js",
    "./constants": "./dist/constants/index.js"
  }
}
```text

### Deployment

Shared module is not deployed independently - it's consumed by client and server:

```bash
# Client imports shared
cd client
npm install ../shared

# Server imports shared
cd server
npm install ../shared

# Or in monorepo, use workspaces
# package.json
{
  "workspaces": ["client", "server", "shared"]
}
```text

## Common Tasks

### Task 1: Add a New Shared Type

**Goal:** Define a new type used by both client and server

### Steps
```typescript
// 1. Add type definition
// packages/contracts/types/models.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  createdAt: Date;
}

// 2. Add DTO types
export interface CreateProductDTO {
  name: string;
  price: number;
  description?: string;
}

// 3. Export from index
// packages/contracts/types/index.ts
export * from './models';

// 4. Build shared module
npm run build

// 5. Use in apps/mobile/server
// apps/mobile/components/Product.tsx
import type { Product } from '@aios/shared';
```text

### Task 2: Add a Validation Schema

**Goal:** Create a new Zod schema for validation

### Steps (2)
```typescript
// 1. Create schema
// packages/contracts/validators/product.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  description: z.string().max(1000).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// 2. Export from validators index
// packages/contracts/validators/index.ts
export * from './product';

// 3. Use in client
// apps/mobile/forms/ProductForm.tsx
import { createProductSchema } from '@aios/packages/contracts/validators';

// Validate form input
const result = createProductSchema.safeParse(formData);

// 4. Use in server
// apps/api/controllers/product.controller.ts
import { createProductSchema } from '@aios/packages/contracts/validators';

// Validate request body
const validated = createProductSchema.parse(req.body);
```text

### Task 3: Add a Utility Function

**Goal:** Create a utility function used in both environments

### Steps (3)
```typescript
// 1. Add function to appropriate file
// packages/contracts/utils/price.ts
export function formatPrice(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars);
}

// 2. Write tests
// packages/contracts/tests/utils/price.test.ts
import { formatPrice } from '../../src/utils/price';

test('formatPrice formats cents to currency', () => {
  expect(formatPrice(1299)).toBe('$12.99');
  expect(formatPrice(999, 'EUR')).toBe('€9.99');
});

// 3. Export from utils index
// packages/contracts/utils/index.ts
export * from './price';

// 4. Use anywhere
import { formatPrice } from '@aios/packages/contracts/utils';
```text

## Testing

### Test Structure

```text
packages/contracts/tests/
├── types/              # Type tests (compile-time)
├── validators/         # Validator tests
├── utils/              # Utility function tests
└── integration/        # Cross-module tests
```text

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/utils/date.test.ts

# Run with coverage
npm run test:coverage

# Type-check tests
npm run type-check
```text

### Test Coverage Goals

- **Utilities:** 100% coverage (pure functions are easy to test)
- **Validators:** 100% coverage (test all validation cases)
- **Types:** Compile-time verification

## Performance Considerations

### Performance Characteristics

- **Bundle Size:** Keep minimal (< 50KB minified)
- **Import Cost:** Tree-shakeable exports
- **Runtime Cost:** Pure functions are fast

### Optimization Strategies

1. Use tree-shakeable exports (ESM)
2. Avoid circular dependencies
3. Keep utilities pure (no side effects)
4. Minimize external dependencies
5. Use type-only imports where possible

### Known Performance Issues

- **Large Zod Schemas:** Complex nested schemas can be slow
  - Mitigation: Split into smaller schemas, validate only what's needed

## Assumptions

- **Assumption 1:** Both client and server run JavaScript environments
  - *If false:* Would need to compile for other platforms (e.g., native mobile)
- **Assumption 2:** Types can be shared between environments
  - *If false:* Split into platform-specific type packages
- **Assumption 3:** Validation logic is identical on both sides
  - *If false:* Allow platform-specific validators

## Failure Modes

### Failure Mode 1: Type Mismatch Between Client and Server

- **Symptom:** Runtime errors, data doesn't match expected structure
- **Impact:** API calls fail, data corruption
- **Detection:** TypeScript compiler errors, integration test failures
- **Mitigation:**
  - Always update shared types when changing API contracts
  - Run type-check in CI for all modules
  - Use strict TypeScript settings
  - Version shared module properly
- **Monitoring:** TypeScript build errors, API validation failures

### Failure Mode 2: Breaking Changes in Shared Module

- **Symptom:** Client or server build fails after shared update
- **Impact:** Cannot deploy updates, blocked development
- **Detection:** Build failures in dependent modules
- **Mitigation:**
  - Follow semantic versioning strictly
  - Deprecate before removing (never delete immediately)
  - Document breaking changes clearly
  - Use TypeScript for compile-time checks
- **Monitoring:** CI build status for all modules

### Failure Mode 3: Circular Dependencies

- **Symptom:** Import/require cycles, undefined values at runtime
- **Impact:** Modules fail to load, undefined behavior
- **Detection:** Build errors, runtime errors
- **Mitigation:**
  - Use linting to detect cycles: `madge --circular`
  - Organize exports to prevent cycles
  - Use dependency inversion if needed
- **Monitoring:** Lint checks in CI

### Failure Mode 4: Platform-Specific Code Sneaks In

- **Symptom:** Code works on server but not client (or vice versa)
- **Impact:** Runtime errors in one environment
- **Detection:** Tests fail on one platform, runtime errors
- **Mitigation:**
  - Review all changes to shared module carefully
  - Test in both environments
  - Avoid APIs not available everywhere (window, process)
  - Use linting rules to catch platform-specific APIs
- **Monitoring:** Cross-platform test suite

### Failure Mode 5: Bloated Bundle Size

- **Symptom:** Client bundle grows too large
- **Impact:** Slow app load times, poor mobile experience
- **Detection:** Bundle size analysis tools
- **Mitigation:**
  - Keep shared dependencies minimal
  - Use tree-shakeable exports
  - Lazy load heavy utilities
  - Monitor bundle size in CI
- **Monitoring:** Bundle size metrics

## How to Verify

### Manual Verification

```bash
# 1. Build shared module
cd shared
npm run build

# 2. Verify TypeScript compilation
npm run type-check

# 3. Run tests
npm test

# 4. Check for circular dependencies
npx madge --circular src/

# 5. Verify client can import
cd ../client
node -e "console.log(require('../shared'))"

# 6. Verify server can import
cd ../server
node -e "console.log(require('../shared'))"
```text

### Automated Checks

- [ ] Build succeeds: `npm run build`
- [ ] All tests pass: `npm test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] No circular dependencies: `madge --circular src/`

### Success Criteria

1. Shared module builds without errors
2. Client can import and use shared code
3. Server can import and use shared code
4. Types are consistent across platforms
5. All tests pass

### Health Check

```typescript
// Test script to verify shared module works
import { createUserSchema, formatDate, API_ENDPOINTS } from '@aios/shared';

console.log('✓ Types imported');
console.log('✓ Validators imported:', createUserSchema);
console.log('✓ Utils imported:', formatDate(new Date()));
console.log('✓ Constants imported:', API_ENDPOINTS.AUTH.LOGIN);
```text

## Troubleshooting

### Problem 1: "Cannot find module '@aios/shared'"

**Symptoms:** Import statements fail in client or server
**Cause:** Shared module not built or not linked
### Solution
```bash
# Build shared module
cd shared
npm run build

# Link in client
cd ../client
npm install ../shared

# Link in server
cd ../server
npm install ../shared

# Or use npm workspaces
npm install
```text

### Problem 2: Type Errors After Updating Shared

**Symptoms:** TypeScript errors in apps/mobile/server after shared module changes
**Cause:** Cached types, build artifacts out of sync
### Solution (2)
```bash
# Rebuild shared
cd shared
rm -rf dist
npm run build

# Clear TypeScript cache in dependent modules
cd ../client
rm -rf node_modules/.cache

# Reinstall
npm install
```text

### Problem 3: Different Behavior in Client vs Server

**Symptoms:** Validation passes on server but fails on client
**Cause:** Different versions of shared module
### Solution (3)
```bash
# Check versions
grep '@aios/shared' apps/mobile/package.json
grep '@aios/shared' apps/api/package.json

# Sync versions
npm run sync-versions  # If you have such script

# Or manually update and reinstall
```text

## Migration and Upgrade Guides

### Adding New Exports

When adding new exports to shared:

1. Add code to appropriate file in `src/`
2. Export from that file's index
3. Export from main `src/index.ts`
4. Build: `npm run build`
5. Update dependent modules

### Removing Deprecated Exports

Never remove immediately:

1. Mark as deprecated with JSDoc:

   ```typescript
   /**
    * @deprecated Use newFunction instead
    */
   export function oldFunction() { }
   ```text

1. Add deprecation warning in code
2. Update documentation
3. Wait at least one major version
4. Remove in next major version

## Security Considerations

- **No Secrets:** Never put API keys, tokens, or secrets in shared module
- **Input Validation:** All validation schemas should be strict
- **Type Safety:** Use strict TypeScript to catch issues at compile time
- **No Sensitive Data:** Don't define types that encourage storing sensitive data client-side

## Related Documentation

- [Client Module](./client.md) - Consumer of shared code
- [Server Module](./server.md) - Consumer of shared code
- [API Documentation](../apis/README.md) - Types defined here match API contracts
- [Data Models](../data/README.md) - Database models use these types

## Maintenance and Support

### Module Owner

- **Team:** Full Stack Team
- **Primary Contact:** Tech Lead
- **Slack Channel:** #engineering

### SLA Commitments

- **Breaking Changes:** Advance notice, semantic versioning
- **Bug Fixes:** Within 1 business day
- **Documentation:** Updated with every change

### Deprecation Policy

Follow semantic versioning:

- **Patch:** Bug fixes only, no breaking changes
- **Minor:** New features, deprecations (not removals)
- **Major:** Breaking changes, removal of deprecated features

Always give at least 3 months warning before removing deprecated features.

## Notes

- Shared module is the contract between client and server - treat it with care
- Keep it minimal - resist the urge to add everything here
- Test in both environments before merging changes
- Version carefully - breaking changes affect multiple modules
- When in doubt, put code in the module that uses it, not in shared

Think of shared as the "common language" between client and server.

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Documentation](https://zod.dev/)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Tree Shaking](https://webpack.js.org/guides/tree-shaking/)


