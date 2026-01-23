# AI Contribution Guide

**File**: `AGENTS.md`

> **Governance**: All agents must follow `.repo/policy/CONSTITUTION.md` - immutable rules for this repository.
> **Principles**: See `.repo/policy/PRINCIPLES.md` for operating principles that guide daily development.
> **Quality Gates**: See `.repo/policy/QUALITY_GATES.md` for merge rules and verification requirements.
> **Security**: See `.repo/policy/SECURITY_BASELINE.md` for security rules and HITL triggers.
> **HITL**: See `.repo/policy/HITL.md` for Human-In-The-Loop process and item management.
> **Boundaries**: See `.repo/policy/BOUNDARIES.md` for module boundary enforcement.
> **Best Practices**: See `BESTPR.md` for repo-specific coding practices, structure, and delivery workflow.

## Commands

Run from repo root:
- `npm install` - Install all dependencies
- `npm run lint` - Run ESLint for TypeScript/TSX files
- `npm run check:types` - Run TypeScript type checking
- `npm test` - Run Jest test suites
- `npm run test:coverage` - Run tests with coverage report
- `npm start` - Start Expo development server
- `npm run server:dev` - Start Node.js/Express API server

Mobile-specific:
- `npm start` - Start Expo dev server (iOS/Android/Web)
- `npm run expo:clean` - Clear Expo cache and restart
- `npm run check:expo-config` - Validate Expo configuration

Backend-specific:
- `npm run server:dev` - Run API server in development mode
- `npm run db:push` - Push database schema changes (Drizzle)

## Tech Stack

- **Mobile**: React Native 0.76+, Expo SDK 54, TypeScript 5.x
- **Backend**: Node.js 20+, Express, TypeScript, Drizzle ORM
- **State & Data**: TanStack React Query, AsyncStorage
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint (Expo config), TypeScript compiler
- **UI/UX**: React Native Reanimated, Gesture Handler, Safe Area Context

## Project Structure

See `BESTPR.md` for detailed repository map. Quick reference:

```
apps/
  mobile/          # React Native + Expo mobile app
    screens/      # Screen components
    navigation/   # Navigation setup
    context/      # React contexts (Theme, Navigation)
  api/            # Express API server
    middleware/   # Auth, error handling, validation
    routes.ts     # API route definitions
packages/
  contracts/      # Shared types and schemas
  features/       # Feature modules (vertical slices)
    */domain/     # Business logic
    */data/       # Data access
    */ui/         # UI components and screens
  platform/       # Platform adapters (storage, analytics, logging)
  design-system/  # Shared UI primitives, hooks, constants
docs/             # Documentation
scripts/          # Automation and validation scripts
```

## Code Style

### Mobile (React Native/Expo)
- Use functional components with TypeScript
- Use React Query for data fetching
- Follow Expo patterns for cross-platform compatibility
- Use ThemedView/ThemedText from design-system for styling

Example:
```typescript
import { ThemedView } from "@design-system/components/ThemedView";
import { ThemedText } from "@design-system/components/ThemedText";
import { useQuery } from "@tanstack/react-query";

export default function MyScreen() {
  const { data } = useQuery({ queryKey: ["myData"] });
  return (
    <ThemedView>
      <ThemedText>{data?.title}</ThemedText>
    </ThemedView>
  );
}
```

### Backend (Node.js/Express)
- Use Express route handlers with TypeScript
- Use Zod for input validation
- Use Drizzle ORM for database access
- Follow RESTful patterns

Example:
```typescript
import { z } from "zod";
import { db } from "@platform/storage/database";

const schema = z.object({ name: z.string() });

export async function createItem(req: Request, res: Response) {
  const data = schema.parse(req.body);
  const item = await db.items.create(data);
  res.json(item);
}
```

## Testing

- Mobile: Add tests in `apps/mobile/__tests__/` or component `__tests__/` directories
- Backend: Add tests in `apps/api/__tests__/`
- Packages: Add tests in package `__tests__/` directories
- Always add/update tests for behavioral changes
- Ensure `npm test` passes before submitting
- Use React Testing Library for component tests

## Git Workflow

- Create branch for changes
- Keep changes minimal and focused (Article 4: incremental delivery, Principle 3: one change type per PR)
- Link changes to task in `P0TODO.md`, `P1TODO.md`, `P2TODO.md`, or `P3TODO.md` (Article 5: traceability, Principle 25)
- Run `npm run lint && npm run check:types && npm test` before opening PR (Article 2: verification evidence, Principle 6: evidence over vibes)
- Include filepaths in PR descriptions (Principle: global rule)
- Explain what, why, filepaths, verification, risks, rollback in PR (Principle 17: PR narration)
- Never commit secrets, tokens, or `.env` files (SECURITY_BASELINE.md: absolute prohibition)
- Archive completed tasks after PR merge (Article 5: strict traceability)

## Boundaries

See `.repo/policy/BOUNDARIES.md` for module boundary rules and `.repo/policy/SECURITY_BASELINE.md` for security prohibitions.

**NEVER:**
- Modify database migrations directly (create new migrations instead)
- Change public APIs without updating tests and docs (see Article 2: verification required)
- Refactor unrelated code (see Article 4: incremental delivery)
- Commit secrets, tokens, `.env`, or sensitive data (SECURITY_BASELINE.md: absolute prohibition)
- Skip running `npm run lint` before proposing changes
- Proceed with uncertain changes (see Article 3: mark UNKNOWN, route to HITL per `.repo/policy/HITL.md`)
- Make risky changes without HITL approval (see Article 6 & 8: safety first, `.repo/policy/HITL.md` for process)
- Cross feature boundaries without ADR (see BOUNDARIES.md, Principle 13)
- Import from `apps/` in `packages/` (violates boundary rules)
- Use `@/` aliases for cross-package imports (use `@features/`, `@platform/`, `@design-system/`, `@contracts/`)

**ALWAYS:**
- Run `npm run lint && npm run check:types` before submitting
- Update tests for behavioral changes (Article 2: verification evidence, Principle 6)
- Keep changes focused on the task at hand (Article 4: incremental, Principle 3)
- Reference `docs/architecture/` for system design (Principle 8: read repo first)
- Link changes to explicit tasks in TODO files (Article 5: traceability, Principle 25)
- Archive completed tasks (Article 5)
- Update docs when code behavior changes (Principle 19: docs age with code)
- Update examples when code changes (Principle 20: examples are contracts)
- Use package aliases (`@features/*`, `@platform/*`, `@design-system/*`, `@contracts/*`) for imports
- Follow Diamond++ architecture: features in `packages/features/*`, platform in `packages/platform/`, design system in `packages/design-system/`
