# Backend API Template

When creating a new API endpoint in the Express/Fastify API:

1. **Add route**: `apps/api/routes.ts` or create new route file
2. **Add middleware**: `apps/api/middleware/` if needed
3. **Use platform packages**: Import from `packages/platform/` for storage, logging, etc.
4. **Follow REST conventions**: Use appropriate HTTP methods and status codes
