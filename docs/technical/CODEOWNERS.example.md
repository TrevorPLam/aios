# CODEOWNERS ensures qualified reviewers see critical changes.
#
# This file defines individuals or teams responsible for code in this repository.
# When a PR modifies files matching these patterns, the specified owners are
# automatically requested for review.
#
# SETUP INSTRUCTIONS:
# 1. Rename this file to CODEOWNERS (remove .example extension)
# 2. Replace placeholder usernames with actual GitHub usernames or team slugs
# 3. Enable branch protection requiring CODEOWNERS approval
#
# Format: <file-pattern> @username-or-team
# More specific patterns override less specific ones
# See: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# ============================================================================
# DEFAULT OWNERS
# ============================================================================
# These owners will be requested for review on all PRs unless overridden below

* @repo-owner @tech-lead

# ============================================================================
# DOCUMENTATION
# ============================================================================
# Documentation changes require review from technical writers and maintainers

/docs/ @tech-writers @maintainers
/docs/ai/ @ai-specialists @maintainers
/docs/apis/ @api-team @maintainers
*.md @tech-writers

# Root-level documentation requires special attention
/README.md @repo-owner @tech-lead
/CONTRIBUTING.md @repo-owner @maintainers
/SECURITY.md @security-team @repo-owner
/LICENSE @repo-owner

# ============================================================================
# GITHUB CONFIGURATION
# ============================================================================
# Changes to CI/CD, workflows, and GitHub settings require DevOps review

/.github/ @devops-team @repo-owner
/.github/workflows/ @devops-team @ci-maintainers
/.github/CODEOWNERS @repo-owner
/.github/dependabot.yml @devops-team @security-team

# ============================================================================
# INFRASTRUCTURE & CONFIGURATION
# ============================================================================
# Infrastructure and configuration files require DevOps and security review

/scripts/ @devops-team
*.config.js @devops-team @frontend-team
*.config.ts @devops-team @frontend-team
/drizzle.config.ts @backend-team @database-team
/.eslintrc* @frontend-team @code-quality-team
/tsconfig.json @frontend-team @backend-team
/babel.config.js @frontend-team @mobile-team
/metro.config.js @mobile-team

# ============================================================================
# APPLICATION CODE
# ============================================================================
# Code ownership by functional area

# Client/Frontend
/client/ @frontend-team @mobile-team
/client/components/ @frontend-team @ui-team
/client/screens/ @frontend-team @mobile-team
/client/navigation/ @frontend-team @mobile-team
/client/hooks/ @frontend-team
/client/utils/ @frontend-team
/client/types/ @frontend-team @typescript-specialists

# Server/Backend
/server/ @backend-team
/server/routes/ @backend-team @api-team
/server/db/ @backend-team @database-team
/server/middleware/ @backend-team @security-team
/server/auth/ @backend-team @security-team

# Shared code requires review from both frontend and backend
/shared/ @frontend-team @backend-team

# ============================================================================
# SECURITY-SENSITIVE FILES
# ============================================================================
# Security-critical code requires security team review

**/auth* @security-team @backend-team
**/security* @security-team
**/*auth*.ts @security-team @backend-team
**/*security*.ts @security-team
/server/middleware/auth* @security-team @backend-team

# ============================================================================
# DATABASE & MIGRATIONS
# ============================================================================
# Database schema changes require DBA and backend review

/server/db/schema* @database-team @backend-team
/server/db/migrations/ @database-team @backend-team
**/migrations/ @database-team @backend-team

# ============================================================================
# TESTING
# ============================================================================
# Test infrastructure changes require QA review

*.test.ts @qa-team @respective-code-owner
*.test.tsx @qa-team @frontend-team
*.spec.ts @qa-team @respective-code-owner
/jest.config.js @qa-team @devops-team
/jest.setup.js @qa-team @devops-team

# ============================================================================
# DEPENDENCIES
# ============================================================================
# Dependency changes require security and respective team review

/package.json @devops-team @security-team @tech-lead
/package-lock.json @devops-team @security-team

# ============================================================================
# EXAMPLE TEAM DEFINITIONS
# ============================================================================
# Teams should be defined in GitHub Organization settings
# Format: @org/team-slug
#
# Example teams you might create:
# - @your-org/frontend-team
# - @your-org/backend-team
# - @your-org/mobile-team
# - @your-org/devops-team
# - @your-org/security-team
# - @your-org/database-team
# - @your-org/api-team
# - @your-org/qa-team
# - @your-org/tech-writers
# - @your-org/maintainers
#
# Or use individual usernames:
# - @alice (Tech Lead)
# - @bob (DevOps)
# - @carol (Security)
# - @dave (Backend)
# - @eve (Frontend)

# ============================================================================
# NOTES
# ============================================================================
# - Patterns are evaluated top-to-bottom; last matching pattern takes precedence
# - Use ** to match any directory at any depth
# - Use * to match any file or directory name
# - Patterns without leading / match anywhere in the tree
# - Patterns with leading / match from repository root
# - You can use # for comments
# - Empty lines are ignored
