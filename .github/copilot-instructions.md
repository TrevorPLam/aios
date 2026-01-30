# GitHub Copilot Instructions

## Branch Naming
- feature/description
- fix/description  
- chore/description

## PR Requirements
- `make verify` must pass
- Add tests for new logic
- Keep PRs focused and small

## Protected Paths
Changes to these require extra review:
- infrastructure/
- services/api-gateway/
- .github/workflows/
- scripts/
- Root config files

## Review Process
- PRs must have at least 1 human review
- Large PRs (>200 lines) should be split