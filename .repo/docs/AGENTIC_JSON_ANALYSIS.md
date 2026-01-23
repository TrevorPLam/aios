# Agentic.json Analysis - Incorrect Information Report

**Date:** 2026-01-23  
**Purpose:** Identify incorrect information in `agentic.json` that doesn't match the actual AIOS repository

---

## Executive Summary

The `agentic.json` file contains **significant incorrect information** from a different project (UBOS - a Django-based system). The file describes Django/Python/PostgreSQL architecture, but AIOS is actually a **React Native mobile app with Express/Node.js backend**.

**Severity:** 🔴 **CRITICAL** - This will mislead agents about the actual tech stack and project structure.

---

## Major Discrepancies

### 1. ❌ Tech Stack Completely Wrong

**In agentic.json:**
- Backend: Django 4.2 + Python 3.11 + PostgreSQL 15
- Frontend: React 18.3 + TypeScript 5.9 + Vite 5.4
- Testing: pytest (backend), Vitest + Playwright (frontend)
- Formatting: ruff + black + mypy (backend), ESLint + Prettier + tsc (frontend)

**Actual AIOS Tech Stack:**
- Mobile: React Native 0.83.1 + Expo 54 + TypeScript
- Backend: Node.js + Express + TypeScript (via tsx)
- Database: PostgreSQL with Drizzle ORM (not Django ORM)
- Testing: Jest + React Native Testing Library
- Formatting: Prettier + ESLint (Expo config)

**Location in agentic.json:**
- Line ~202-214: `tech_stack` section in rules.json content
- Line ~95-97: `tech_stack` in BESTPR.md content

---

### 2. ❌ Project Structure Completely Wrong

**In agentic.json:**
- `backend/modules/` - Domain modules with firm-scoped multi-tenancy
- `backend/api/` - API endpoints
- `backend/config/` - Django settings, middleware
- `frontend/src/` - React application source
- `frontend/src/api/` - API client functions
- `frontend/src/components/` - Reusable React components
- `frontend/src/pages/` - Page components
- `frontend/src/contexts/` - React contexts

**Actual AIOS Structure:**
- `apps/mobile/` - React Native + Expo app (screens, components, hooks, navigation)
- `apps/api/` - Express API/server entry, middleware, utilities
- `packages/contracts/` - Shared types between client and server
- No `backend/` or `frontend/` directories
- No Django modules structure

**Location in agentic.json:**
- Line ~214-225: `project_structure` section
- Line ~9-20: BESTPR.md repository map content

---

### 3. ❌ Code Patterns Completely Wrong

**In agentic.json:**
- Backend: Django REST Framework viewsets with `FirmScopedMixin`
- Example: `class ClientViewSet(FirmScopedMixin, viewsets.ModelViewSet)`
- Frontend: React components with TanStack React Query
- Example: `export const Component: React.FC = () => { const { data } = useQuery(...); }`

**Actual AIOS Patterns:**
- Backend: Express routes with TypeScript
- Frontend: React Native components with Expo
- No Django viewsets, no FirmScopedMixin
- Uses React Navigation, not React Router DOM

**Location in agentic.json:**
- Line ~227-240: `code_style` section
- Line ~44-48: BESTPR.md backend practices

---

### 4. ❌ BESTPR.md References Wrong Project

**In agentic.json:**
- Title: "BESTPR — UBOS Best Practices (Repo-Specific)"
- References: "UBOS architecture", "firm-scoped multi-tenancy"
- Mentions: Django modules, Django REST Framework, FirmScopedMixin

**Actual AIOS BESTPR.md:**
- Title: "BESTPR — AIOS Best Practices (Repo-Specific)"
- References: React Native, Expo, Express
- Structure: apps/mobile, apps/api, packages/contracts

**Location in agentic.json:**
- Line ~209-230: BESTPR.md file entry
- The entire BESTPR.md content is from UBOS, not AIOS

---

### 5. ❌ Commands Reference Wrong Tools

**In agentic.json:**
- `make -C backend migrate` (Django migrations)
- `make -C backend openapi` (Django REST Framework OpenAPI)
- `make -C frontend test` (Vitest)
- `make -C frontend e2e` (Playwright)
- References: `pip-audit`, `safety`, `bandit`, `ruff`, `black`, `mypy`

**Actual AIOS Commands:**
- `npm run db:push` (Drizzle schema push)
- `npm run lint` (ESLint)
- `npm run test` (Jest)
- `npm run check:types` (TypeScript)
- No Python tools, no Django commands

**Location in agentic.json:**
- Line ~183-200: `commands` section
- Line ~21-24: repo.manifest.yaml references Python tools

---

### 6. ❌ Package Manager Wrong

**In agentic.json:**
- `package_manager: npm+pip` (mentions both)
- References `requirements.txt`, `requirements-dev.txt`
- Python-specific security tools

**Actual AIOS:**
- `package_manager: npm` only
- Uses `package.json`, no Python dependencies
- Node.js security tools (npm audit)

**Location in agentic.json:**
- Line ~11: `package_manager: npm+pip` in repo.manifest.yaml content

---

## Files That Need Correction

### Critical Files (Must Fix)

1. **agentic.json** - Lines ~209-230 (BESTPR.md content)
   - Replace entire BESTPR.md content with actual AIOS BESTPR.md

2. **agentic.json** - Lines ~202-240 (rules.json tech_stack, project_structure, code_style)
   - Update tech stack to React Native + Express
   - Update project structure to apps/mobile, apps/api
   - Update code patterns to Express routes and React Native components

3. **agentic.json** - Lines ~183-200 (commands section)
   - Remove Django/Python commands
   - Add actual AIOS commands (npm run db:push, etc.)

4. **agentic.json** - Line ~11 (repo.manifest.yaml package_manager)
   - Change from `npm+pip` to `npm`

### Files to Verify

5. **.repo/policy/BESTPR.md** - Check if it contains UBOS references
   - **Status:** ❌ **CONTAINS UBOS INFORMATION** - Needs complete rewrite for AIOS
   - Currently references: Django, backend/modules/, FirmScopedMixin, UBOS architecture
   - Should reference: React Native, apps/mobile/, Express, AIOS architecture
   - **Note:** Root `BESTPR.md` is correct (AIOS), but `.repo/policy/BESTPR.md` is wrong (UBOS)

6. **.repo/agents/rules.json** - Check tech_stack, project_structure, code_style
   - **Status:** ❌ **CONTAINS UBOS INFORMATION** - Lines 202-238 are wrong
   - Currently references: Django 4.2, Python 3.11, backend/modules/, Django viewsets
   - Should reference: React Native, Express, Node.js, apps/mobile/, Express routes

7. **.repo/repo.manifest.yaml** - Check commands and package_manager
   - **Status:** ⚠️ Contains Python references that don't match AIOS
   - References: pip-audit, safety, bandit, requirements.txt
   - Should use: npm audit, Node.js security tools

---

## Impact Assessment

### High Impact (Will Mislead Agents)

1. **Tech Stack Confusion** - Agents will try to use Django/Python tools that don't exist
2. **Project Structure Confusion** - Agents will look for `backend/modules/` that doesn't exist
3. **Code Pattern Confusion** - Agents will try to create Django viewsets instead of Express routes
4. **Command Confusion** - Agents will try to run `make -C backend migrate` which doesn't exist

### Medium Impact

1. **BESTPR.md Content** - The embedded content in agentic.json is wrong, but the actual file is correct
2. **Manifest References** - Python tools referenced but not used

---

## Recommended Actions

### Immediate (Critical)

1. **Update agentic.json BESTPR.md content** (lines ~209-230)
   - Replace with actual AIOS BESTPR.md content from `.repo/policy/BESTPR.md`

2. **Update agentic.json rules.json content** (lines ~202-240)
   - Fix tech_stack: React Native + Expo + Express + Node.js
   - Fix project_structure: apps/mobile, apps/api, packages/contracts
   - Fix code_style: Express routes, React Native components

3. **Update agentic.json commands** (lines ~183-200)
   - Remove Django/Python commands
   - Add actual AIOS commands

4. **Update agentic.json manifest content** (line ~11)
   - Change package_manager from `npm+pip` to `npm`

### Verification

5. **Verify .repo/agents/rules.json** matches AIOS (not UBOS)
6. **Verify .repo/repo.manifest.yaml** commands match AIOS
7. **Re-generate agentic.json** from actual repository state

---

## Root Cause

The `agentic.json` file was created from a different project (UBOS - Django-based) and was not properly updated when migrated to AIOS. The file contains embedded content from the old project that doesn't match the current repository.

---

## Verification Checklist

- [ ] agentic.json BESTPR.md content matches actual `.repo/policy/BESTPR.md`
- [ ] agentic.json tech_stack matches AIOS (React Native + Express)
- [ ] agentic.json project_structure matches AIOS (apps/mobile, apps/api)
- [ ] agentic.json code_style matches AIOS (Express routes, React Native)
- [ ] agentic.json commands match AIOS (npm, not pip)
- [ ] agentic.json manifest package_manager is `npm` only
- [ ] .repo/agents/rules.json matches AIOS
- [ ] .repo/repo.manifest.yaml matches AIOS

---

**Next Steps:** Update agentic.json with correct AIOS information, or regenerate it from the actual repository state.
