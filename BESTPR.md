# BESTPR — AIOS Best Practices (Repo-Specific)

## Purpose
Use this guide to ship changes that align with AIOS architecture, workflows, and quality bars. It captures the stack, repo layout, and the checks expected before delivery.

## Repository Map (where to work)
- **client/** — React Native + Expo app source (screens, components, hooks, context, models, navigation).
- **server/** — Express API/server entry, middleware, utilities, tests, and templates.
- **shared/** — Reusable logic and shared types between client and server.
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
   - `npm run lint`
   - `npm run check:types`
   - `npm test`
2. **When touching docs:** keep documentation in the organized `/docs` structure and update the canonical root guides as needed.

## Repo-Specific Coding Practices
### Client (React Native / Expo)
- Prefer existing module patterns and shared UI styles in `client/components`, `client/screens`, and `client/hooks` before introducing new abstractions.
- Use platform-aware APIs only when needed; default to Expo-provided modules for cross-platform parity.
- Keep animations and interactions aligned with Reanimated + Gesture Handler usage.

### Server (Express)
- Route logic should live close to server entry points with shared utilities in `server/utils` and middleware in `server/middleware`.
- Use Zod schemas for request validation where input is non-trivial.

### Shared / Cross-Cutting
- Favor `shared/` for types and helpers used by both client and server.
- Prefer Zod schemas and Drizzle types to keep client/server contracts aligned.

## Documentation Expectations
- Follow the documentation navigation guide and keep updates in the correct section of `/docs`.
- Root-level guides like `README.md` and `DOCUMENTATION_GUIDE.md` should only contain high-level navigation or onboarding details.

## Governance Alignment
- Follow the project governance rules for PR review, ADR/RFC expectations, and documentation rigor. See `GOVERNANCE.md`.

---
**Canonical reference:** This document is the single source of truth for repo-specific best practices. Link to it from all AGENTS.md files and governance docs.
