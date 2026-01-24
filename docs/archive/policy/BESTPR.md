# BESTPR — AIOS Best Practices (Repo-Specific)

**File**: `.repo/policy/BESTPR.md`

## Purpose
Use this guide to ship changes that align with AIOS architecture, workflows, and quality bars. It captures the stack, repo layout, and the checks expected before delivery.

## Repository Map (where to work)
- **apps/mobile/** — React Native + Expo app source (screens, components, hooks, context, models, navigation).
- **apps/api/** — Express API/server entry, middleware, utilities, tests, and templates.
- **packages/contracts/** — Reusable logic and shared types between client and server.
- **docs/** — Primary documentation source tree (technical, governance, planning, and archives).
- **scripts/** — Project automation and validation scripts.

## Tech Stack & Core Libraries
- **Mobile/Web:** React Native (React 19) + Expo (v54) for the client app.
- **Backend:** Node.js + Express, with TypeScript via `tsx` for dev.
- **Data & Validation:** Drizzle ORM + Zod validation.
- **State & Data Fetching:** TanStack React Query.
- **UX/Platform:** Reanimated, Gesture Handler, Safe Area Context, and other Expo modules for native UX.
- **Testing:** Jest + Testing Library (React Native).
- **Formatting & Linting:** Prettier + ESLint (Expo config).

## Delivery Workflow (what to run)
1. **Local checks before PR:**
   - `npm run lint` — Run ESLint
   - `npm run check:types` — TypeScript type checking
   - `npm test` — Run Jest tests
2. **When touching APIs:** Update Drizzle schema if needed (`npm run db:push`).
3. **When touching docs:** Keep documentation in the organized `/docs` structure and update canonical root guides as needed.

## Repo-Specific Coding Practices
### Client (React Native / Expo)
- Prefer existing module patterns and shared UI styles in `apps/mobile/components`, `apps/mobile/screens`, and `apps/mobile/hooks` before introducing new abstractions.
- Use platform-aware APIs only when needed; default to Expo-provided modules for cross-platform parity.
- Keep animations and interactions aligned with Reanimated + Gesture Handler usage.
- Use React Navigation for routing, not React Router DOM.

Example:
```typescript
import { useQuery } from '@tanstack/react-query';
import { View, Text } from 'react-native';

export const Component: React.FC = () => {
  const { data } = useQuery({ queryKey: ['data'] });
  return <View><Text>{data}</Text></View>;
};
```

### Server (Express)
- Route logic should live close to server entry points with shared utilities in `apps/api/utils` and middleware in `apps/api/middleware`.
- Use Zod schemas for request validation where input is non-trivial.
- Use TypeScript throughout for type safety.

Example:
```typescript
import express from 'express';
import { z } from 'zod';

const router = express.Router();
const schema = z.object({ name: z.string() });

router.post('/endpoint', (req, res) => {
  const validated = schema.parse(req.body);
  // ... handle request
});
```

### Shared / Cross-Cutting
- Favor `packages/contracts/` for types and helpers used by both client and server.
- Prefer Zod schemas and Drizzle types to keep apps/mobile/server contracts aligned.
- Keep integration tests in appropriate test directories.

## Documentation Expectations
- Follow the documentation navigation guide and keep updates in the correct section of `/docs`.
- Root-level guides like `README.md` and `DOCUMENTATION_GUIDE.md` should only contain high-level navigation or onboarding details.

## Governance Alignment
- Follow the project governance rules in `.repo/policy/CONSTITUTION.md` for PR review, task traceability, verification evidence, and documentation rigor.
- Apply operating principles from `.repo/policy/PRINCIPLES.md` for day-to-day development practices.
- Quality gates in `.repo/policy/QUALITY_GATES.md` define merge requirements and verification checks.
- Security rules in `.repo/policy/SECURITY_BASELINE.md` define security checks, HITL triggers, and forbidden patterns.
- HITL process in `.repo/policy/HITL.md` defines how human-required actions are tracked and managed.
- Module boundaries in `.repo/policy/BOUNDARIES.md` define import rules and enforcement (Principle 13: Respect Boundaries).
- All changes must be traceable to tasks in `.repo/tasks/` (Article 5: Strict Traceability, Principle 25).
- Completed tasks must be archived to `.repo/tasks/ARCHIVE.md` after PR merge.
- For risky changes (logins, money flows, user data, security), route to HITL per Article 6 & 8, Principle 10, SECURITY_BASELINE.md triggers, and HITL.md process.
- PRs must include filepaths, verification evidence, and rollback plans per Principles 6, 12, and 17.
- All quality gates must pass before merge (hard gates) or have approved waivers (waiverable gates).
- Never commit secrets (SECURITY_BASELINE.md: absolute prohibition).

---
**Canonical reference:** This document is the single source of truth for repo-specific best practices. Link to it from all AGENTS.md files and governance docs.
