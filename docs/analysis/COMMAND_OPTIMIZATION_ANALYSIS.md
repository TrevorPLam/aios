# Command Optimization Critique Analysis

**Date:** 2026-01-25  
**Status:** Analysis Complete - Implementation Strategy Defined

## Critique Summary

The critique identifies 4 critical patterns:
1. **Command Spamming**: Running 11 commands without conditional logic
2. **Missing Pre-Checks**: Never checking if targets exist first
3. **No Dependency Graph**: Running commands in wrong order
4. **Evidence Contradiction**: Claiming things work without verification

## Current State Assessment

### ✅ What Already Exists

1. **Command Batching** (AGENTS.toon, TRACES.toon)
   - Guidance to use `npm run check:quick` instead of separate commands
   - Evidence format requires brief summaries
   - Commands array can be empty for doc-only changes

2. **Canonical Commands** (repo.manifest.toon)
   - Source of truth for commands
   - Notes about optional tools (e.g., `check:boundaries` skips if Python tool missing)

3. **Evidence Requirements** (TRACES.toon, AGENT_TRACE_SCHEMA.json)
   - Brief proof summaries required
   - Examples provided

### ❌ What's Missing

1. **Verification Status Labels**: No distinction between verified/assumed/unknown
2. **Pre-Execution Checks**: No guidance on checking if commands/targets exist
3. **Conditional Execution**: No rules for skipping commands when prerequisites fail
4. **Command Intelligence Guide**: Referenced but doesn't exist (COMMAND_OPTIMIZATION_GUIDE.toon)

## Value Assessment

### High Value (Implement)
- **Verification Status**: Critical for truthfulness - separates "changed" from "verified"
- **Pre-Checks**: Simple mental model - "check before running"
- **Conditional Execution**: Prevents cascading failures

### Medium Value (Consider)
- **Command Dependency Graph**: Useful but can be handled with simple rules
- **Smart Failure Handling**: Good principle, but needs simple implementation

### Low Value (Skip - Adds Complexity)
- **Pre-Check Scripts**: Adds maintenance burden, agents can check mentally
- **Command Planner Python Script**: Over-engineered, simple rules suffice
- **AI Knowledge Base**: Premature optimization, can add later if needed
- **Machine Learning**: Not needed for this problem

## Implementation Strategy (Minimal Complexity)

### Phase 1: Create Missing Guide (Immediate)

**File:** `.repo/logs/COMMAND_OPTIMIZATION_GUIDE.toon`
- Already referenced in AGENTS.toon but doesn't exist
- Consolidate existing guidance
- Add verification status labels
- Add pre-check principles

### Phase 2: Enhance Evidence Format (Immediate)

**Update:** `.repo/templates/AGENT_TRACE_SCHEMA.json`
- Add optional `verification_status` field
- Values: `verified`, `assumed`, `unknown`
- Backward compatible (optional field)

**Update:** `TRACES.toon`
- Document verification status usage
- Examples of verified vs assumed evidence

### Phase 3: Add Conditional Execution Principles (Short-term)

**Update:** `AGENTS.toon` command_optimization section
- Add pre-check principle: "Check if command/target exists before running"
- Add conditional rule: "If prerequisite fails, skip dependent commands"
- Add dependency order: "Install → Test → Lint (in that order)"

**Update:** `repo.manifest.toon`
- Mark which commands are optional/skip-able
- Note prerequisites for each command

### Phase 4: Enhance Manifest with Skip Logic (Short-term)

**Update:** `repo.manifest.toon`
- Add `skip_if` conditions for optional commands
- Example: `check:boundaries` already has note about skipping

## What We're NOT Implementing

1. ❌ **Pre-Check Scripts** - Agents can check mentally, scripts add maintenance
2. ❌ **Command Planner Python Script** - Over-engineered, simple rules suffice
3. ❌ **AI Knowledge Base** - Premature, can add later if patterns emerge
4. ❌ **Machine Learning** - Not needed for this problem
5. ❌ **New Directories** - Use existing structure

## Implementation Principles

1. **Enhance Existing, Don't Create New**
   - Update AGENTS.toon, TRACES.toon, repo.manifest.toon
   - Create only the missing COMMAND_OPTIMIZATION_GUIDE.toon

2. **Simple Rules, Not Frameworks**
   - Mental models, not scripts
   - Principles, not automation

3. **Backward Compatible**
   - Optional fields, not required changes
   - Existing traces remain valid

4. **Token Efficient**
   - Brief guidance, not lengthy documentation
   - Examples, not exhaustive lists

## Expected Impact

### Waste Reduction
- **Command attempts**: 11 → 3-4 per task (via batching + conditional logic)
- **False evidence**: Eliminated via verification status
- **Time wasted**: Reduced via pre-checks and conditional execution

### Truth Increase
- **Clear verification status**: Know what's actually tested
- **Honest reporting**: Separate "changed" from "verified"
- **Better decisions**: Humans see real status

### Complexity
- **Minimal**: Only 1 new file, updates to 3 existing files
- **No scripts**: Mental models only
- **No automation**: Simple principles

## Next Steps

1. Create `.repo/logs/COMMAND_OPTIMIZATION_GUIDE.toon`
2. Update `AGENTS.toon` command_optimization section
3. Update `TRACES.toon` with verification status
4. Update `repo.manifest.toon` with skip conditions
5. Update `AGENT_TRACE_SCHEMA.json` with optional verification_status field
