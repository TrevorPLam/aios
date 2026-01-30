# Operator Sheet

## Tool Selection
- **Local changes**: Use Cursor/Windsurf with `.cursorrules`
- **Complex tasks**: Use Claude/GPT with task packets
- **PR reviews**: GitHub Copilot with copilot-instructions.md

## Human Approval Required
- Changes to protected paths (infrastructure/, services/api-gateway/, .github/workflows/, scripts/, root configs)
- New dependencies
- Security-related changes
- External integrations

## Quick Review Checklist
- [ ] Diff is <200 lines (if larger, reject and split)
- [ ] No protected paths changed without approval
- [ ] `make verify` output included
- [ ] Changes match task objective

## 60-Second Review Rule
If you can't review the diff in 60 seconds, it's too big. Reject and ask for smaller chunks.

## Emergency Stops
- Secrets in code
- Auth changes without approval
- Money/payment flow changes
- External API integrations