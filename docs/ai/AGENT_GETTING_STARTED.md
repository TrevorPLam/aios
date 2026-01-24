# Agent Getting Started Guide

**Welcome to the AI-Native Repository Governance Framework!**

This guide will help you (an AI agent) understand how to work safely and effectively in this repository.

## 🎯 Quick Start (5 Minutes)

1. **Read the Constitution** (2 min)
   - Open `.repo/policy/CONSTITUTION.md`
   - Understand the 8 fundamental articles
   - **Key takeaway:** No guessing, safety first, verify everything

2. **Check the Manifest** (1 min)
   - Open `.repo/repo.manifest.yaml`
   - Find the commands you need (`check:quick`, `check:ci`, etc.)
   - **Key takeaway:** This is your instruction card - use these commands

3. **Understand Your Workflow** (2 min)
   - Read `.repo/agents/AGENTS.md` (core rules)
   - Understand three-pass generation: Plan → Change → Verify
   - **Key takeaway:** Always plan, change, then verify

## 📋 Required Workflow

### Before Starting Work

1. **Read the task** (if one exists)
   - Check `P0TODO.md`, `P1TODO.md`, `P2TODO.md`, or `P3TODO.md`
   - Understand what you're trying to accomplish

2. **Check if HITL is required**
   - Security changes? → HITL required
   - External systems? → HITL required
   - See `.repo/policy/SECURITY_BASELINE.md` for triggers

3. **Create HITL item if needed**
   ```bash
   python3 .repo/automation/scripts/create-hitl-item.py \
     --category "Risk" \
     --summary "Security change requires approval" \
     --required-for "security" \
     --owner "human-name"
   ```

### During Work (Three-Pass Generation)

#### Pass 1: Plan
- List all actions you will take
- Identify risks and filepaths affected
- Mark any UNKNOWNs
- Reference relevant policies

**Example:**
```
Plan:
- Modify packages/features/auth/domain/authService.ts
- Add new authentication method
- Risk: Security change → HITL required
- Unknown: API endpoint unclear → HITL
```

#### Pass 2: Change
- Apply edits to files
- Follow boundary rules (ui → domain → data → platform)
- Maintain existing patterns
- Include filepaths in all changes

#### Pass 3: Verify
- Run tests: `npm run check:types && npm test && npm run lint`
- Create trace log:
  ```bash
  node .repo/automation/scripts/create-trace-log.js \
    --intent "Add authentication feature" \
    --files "packages/features/auth/domain/authService.ts" \
    --commands "npm run check:types,npm test,npm run lint" \
    --evidence "Type check passed,All tests passed,Linting clean"
  ```
- Document verification in PR

### Before Creating PR

1. **Run compliance check**
   ```bash
   node .repo/automation/scripts/check-framework-compliance.js \
     --base-ref main \
     --trace-log .repo/traces/trace-*.json
   ```

2. **Run governance verification**
   ```bash
   node .repo/automation/scripts/governance-verify.js \
     --trace-log .repo/traces/trace-*.json \
     --hitl-file .repo/policy/HITL.md
   ```

3. **Ensure PR includes:**
   - Filepaths (required everywhere)
   - Evidence of verification
   - Task reference (if applicable)
   - HITL references (if applicable)

## 🚨 Critical Rules (Never Skip)

### Article 3: No Guessing
- **If you don't know → Mark UNKNOWN → Create HITL → Stop**
- Don't proceed on uncertain portions
- Example: "API endpoint unclear → UNKNOWN → HITL-0001"

### Article 6: Safety Before Speed
- **Risky changes → STOP → ASK (HITL) → VERIFY → PROCEED**
- Security, money, production = always HITL
- Example: "Adding payment flow → HITL required → Create HITL item"

### Article 2: Verifiable over Persuasive
- **Work is not done without verification evidence**
- Show proof: commands run, outputs, test results
- Example: "All tests passed (15/15)" not "Tests should work"

### Principle 24: Logs Required for Non-Docs
- **Non-doc changes require trace logs**
- Create trace log using the generator script
- Store in `.repo/traces/`

## 📚 Common Scenarios

### Scenario 1: Adding a Feature

1. **Plan:**
   - Check boundary rules (ui → domain → data → platform)
   - Identify files to create/modify
   - Check if cross-feature import (requires ADR)

2. **Change:**
   - Create feature following boundary model
   - Add tests
   - Update documentation if needed

3. **Verify:**
   - Run `npm run check:types && npm test && npm run lint`
   - Create trace log
   - Check boundaries: `npm run check:boundaries`

### Scenario 2: Security Change

1. **STOP** - Security change detected
2. **Create HITL item** (required)
3. **Wait for human approval**
4. **Proceed only after HITL is Completed**

### Scenario 3: Unknown/Uncertain

1. **Mark as UNKNOWN** in your plan
2. **Create HITL item** with clarification request
3. **Stop on that portion** - don't guess
4. **Wait for human resolution**

### Scenario 4: Cross-Feature Import

1. **Check if ADR exists** for this import
2. **If no ADR → Create ADR** (required)
3. **Document in ADR:**
   - Why cross-feature import is needed
   - What boundaries are being crossed
   - Justification

## 🛠️ Tools Available

### Trace Log Generator
```bash
node .repo/automation/scripts/create-trace-log.js \
  --intent "<what you're doing>" \
  --files "<file1,file2>" \
  --commands "<cmd1,cmd2>" \
  --evidence "<evidence1,evidence2>"
```

### HITL Item Creator
```bash
python3 .repo/automation/scripts/create-hitl-item.py \
  --category "<category>" \
  --summary "<summary>" \
  --required-for "<change-types>" \
  --owner "<owner>"
```

### Compliance Checker
```bash
node .repo/automation/scripts/check-framework-compliance.js \
  --base-ref main \
  --trace-log .repo/traces/trace-*.json
```

### Governance Verifier
```bash
node .repo/automation/scripts/governance-verify.js \
  --trace-log .repo/traces/trace-*.json \
  --hitl-file .repo/policy/HITL.md
```

## 📖 Key Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `CONSTITUTION.md` | 8 fundamental articles | **First** - understand core rules |
| `PRINCIPLES.md` | Operating principles | **Second** - understand daily workflow |
| `AGENTS.md` | Core agent rules | **Third** - understand your workflow |
| `repo.manifest.yaml` | Command definitions | **Always** - before running commands |
| `QUICK_REFERENCE.md` | One-page cheat sheet | **Reference** - quick lookup |

## ❓ When in Doubt

1. **Read the repo first** (Principle 8)
   - Check `.repo/` docs
   - Check `repo.manifest.yaml`
   - Check existing code patterns

2. **Mark UNKNOWN** (Article 3)
   - Don't guess
   - Create HITL item
   - Stop on uncertain portion

3. **Ask for help**
   - Create HITL item with clarification request
   - Reference specific filepaths
   - Explain what you tried

## ✅ Checklist Before PR

- [ ] Read task (if applicable)
- [ ] Created HITL item (if required)
- [ ] Followed three-pass workflow (Plan → Change → Verify)
- [ ] Created trace log (for non-doc changes)
- [ ] Ran compliance check
- [ ] Ran governance verification
- [ ] PR includes filepaths
- [ ] PR includes evidence
- [ ] PR references task (if applicable)
- [ ] PR references HITL items (if applicable)
- [ ] All tests pass
- [ ] No linting errors
- [ ] Type checking passes

## 🎓 Learning Path

1. **Day 1:** Read Constitution, Principles, AGENTS.md
2. **Day 2:** Try creating a simple feature following three-pass workflow
3. **Day 3:** Practice with HITL items and trace logs
4. **Day 4:** Understand boundaries and ADRs
5. **Day 5:** Master the full workflow

## 🔗 Related Documentation

- `.repo/GOVERNANCE.md` - Framework overview
- `.repo/agents/QUICK_REFERENCE.md` - One-page cheat sheet
- `.repo/examples/` - Example files
- `.repo/docs/ci-integration.md` - CI integration guide

---

**Remember:** The framework exists to help you work safely and effectively. When in doubt, escalate (HITL). Safety before speed. Verify everything.
