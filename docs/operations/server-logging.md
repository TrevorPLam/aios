# Server Logging Configuration

## Overview

The server uses Winston for structured logging with environment-specific formatting.

## Configuration

### Environment Variables

- `NODE_ENV`: Controls log format
  - `production`: JSON structured logs for parsing
  - `development`: Human-readable colored console logs

- `LOG_LEVEL`: Controls minimum log level (default: `info`)
  - `error`: Only errors
  - `warn`: Warnings and errors
  - `info`: Informational messages, warnings, and errors
  - `debug`: All messages including debug information

### Examples

```bash
# Development (colored console output)
NODE_ENV=development npm run server:dev

# Production (JSON logs)
NODE_ENV=production LOG_LEVEL=warn npm run server:prod

# Debug mode
LOG_LEVEL=debug npm run server:dev
```text

## Usage

```typescript
import { logger } from './utils/logger';

// Basic logging
logger.info('Server started');
logger.error('Database connection failed');

// With context metadata
logger.info('User login', { userId: '123', ip: '192.168.1.1' });
logger.error('API error', { endpoint: '/api/users', statusCode: 500 });

// Error object logging
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Operation failed', { error });
}
```text

## Log Format

### Development Format

```text
2026-01-19 04:59:00 [info]: Server started { "port": 5000, "host": "0.0.0.0" }
2026-01-19 04:59:01 [error]: Database connection failed { "error": "Connection timeout" }
```text

### Production Format (JSON)

```json
{
  "level": "info",
  "message": "Server started",
  "port": 5000,
  "host": "0.0.0.0",
  "timestamp": "2026-01-19T04:59:00.000Z",
  "service": "aios-server"
}
{
  "level": "error",
  "message": "Unexpected error",
  "error": { "message": "Connection timeout", "stack": "..." },
  "path": "/api/users",
  "method": "GET",
  "timestamp": "2026-01-19T04:59:01.000Z",
  "service": "aios-server"
}
```text

## Error Handler Integration

The error handler automatically logs errors with request context:

- **Operational errors** (AppError): Logged as warnings with context
- **Unexpected errors**: Logged as errors with full stack trace, request method, path, and timestamp

## Files Changed

- `apps/api/utils/logger.ts`: Winston logger configuration
- `apps/api/middleware/errorHandler.ts`: Error logging integration
- `apps/api/index.ts`: Replaced console.log with structured logger

## Migration from console.log

Before:

```typescript
console.log(`Server started on port ${port}`);
console.error('Unexpected error:', err);
```text

After:

```typescript
logger.info('Server started', { port });
logger.error('Unexpected error', { error: err, path: req.path });
```text

## Task Completion

- **Task ID**: T-031
- **Priority**: P2
- **Status**: COMPLETE
- **Acceptance Criteria**:
  - [x] Install Winston or Pino logging library
  - [x] Replace console.error with proper logger
  - [x] Add structured logging with context
  - [x] Configure log levels for environments
  - [x] Remove TODO at errorHandler.ts:28-30

