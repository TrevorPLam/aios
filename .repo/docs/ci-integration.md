# CI Integration Guide

## Overview

This guide explains how to integrate `governance-verify` into your CI/CD pipeline.

**Status**: ✅ **Integrated** - Governance verification is now integrated into `.github/workflows/ci.yml` as Job 7.

The integration includes:
- Automatic governance verification on every PR/push
- HITL status sync to PR descriptions
- Merge blocking on hard gate failures
- Local verification via Makefile
- Pre-commit hooks for early detection

## Three Integration Options

### Option 1: GitHub Actions (✅ Currently Integrated)

**Status**: Already integrated in `.github/workflows/ci.yml` as Job 7: Governance Verification.

The integration includes:
- Governance verification on every PR/push
- Automatic HITL sync to PR descriptions
- Merge blocking on hard gate failures
- Python dependencies installation
- Trace log detection and validation

**For reference, here's the integrated workflow:**

```yaml
# Integrated in .github/workflows/ci.yml as Job 7: governance-verify

governance-verify:
  name: Governance Verification
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request' || github.event_name == 'push'
  steps:
    - uses: actions/checkout@v6
    
    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Setup Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
        cache: 'pip'
    
    - name: Install Node.js dependencies
      run: npm ci
    
    - name: Install Python dependencies
      run: |
        pip install -r .repo/automation/scripts/requirements.txt
    
    - name: Find trace log
      id: trace-log
      run: |
        TRACE_LOG=$(find . -name "*trace*.json" -type f | head -1 || echo "")
        if [ -n "$TRACE_LOG" ]; then
          echo "path=$TRACE_LOG" >> $GITHUB_OUTPUT
        fi
    
    - name: Run governance verification
      id: gov-verify
      run: |
        TRACE_LOG="${{ steps.trace-log.outputs.path }}"
        if [ -n "$TRACE_LOG" ]; then
          node .repo/automation/scripts/governance-verify.js \
            --trace-log "$TRACE_LOG" \
            --hitl-file .repo/policy/HITL.md || EXIT_CODE=$?
        else
          node .repo/automation/scripts/governance-verify.js \
            --hitl-file .repo/policy/HITL.md || EXIT_CODE=$?
        fi
        echo "exit_code=${EXIT_CODE:-0}" >> $GITHUB_OUTPUT
        exit ${EXIT_CODE:-0}
      continue-on-error: true
    
    - name: Sync HITL status to PR
      if: github.event_name == 'pull_request' && steps.gov-verify.outputs.exit_code != '1'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      run: |
        PR_NUMBER=${{ github.event.pull_request.number }}
        python3 .repo/automation/scripts/sync-hitl-to-pr.py \
          --pr-number "$PR_NUMBER" \
          --hitl-file .repo/policy/HITL.md || echo "HITL sync failed (non-blocking)"
      continue-on-error: true
    
    - name: Check governance verification result
      if: steps.gov-verify.outputs.exit_code == '1'
      run: |
        echo "❌ Hard gate failures detected. Merge blocked."
        exit 1
```

**Local Verification:**

You can also run governance verification locally:

```bash
# Using Makefile
make check-governance

# Or directly
node .repo/automation/scripts/governance-verify.js --hitl-file .repo/policy/HITL.md
```

**Pre-commit Hook:**

Governance verification also runs automatically via pre-commit hooks (non-blocking):

```bash
# Install pre-commit hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Option 2: GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
governance-verify:
  stage: verify
  image: node:20
  before_script:
    - npm install
  script:
    - |
      TRACE_LOG=$(find . -name "*trace*.json" -type f | head -1)
      node .repo/automation/scripts/governance-verify.js \
        --trace-log "$TRACE_LOG" \
        --hitl-file .repo/policy/HITL.md
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == "main" || $CI_COMMIT_BRANCH == "develop"
```

### Option 3: Jenkins Pipeline

Add to `Jenkinsfile`:

```groovy
stage('Governance Verify') {
    steps {
        sh '''
            npm install
            TRACE_LOG=$(find . -name "*trace*.json" -type f | head -1)
            node .repo/automation/scripts/governance-verify.js \
                --trace-log "$TRACE_LOG" \
                --hitl-file .repo/policy/HITL.md
        '''
    }
}
```

## Exit Code Explanations

The `governance-verify` script uses the following exit codes:

- **0**: All checks passed ✅
- **1**: Hard gate failures (governance integrity violations) - **Merge blocked** ❌
- **2**: Waiverable gate failures (warnings) - **Review required** ⚠️

### Handling Exit Codes in CI

#### GitHub Actions

```yaml
- name: Run governance verification
  id: gov-verify
  run: |
    node .repo/automation/scripts/governance-verify.js || EXIT_CODE=$?
    echo "exit_code=$EXIT_CODE" >> $GITHUB_OUTPUT
    exit ${EXIT_CODE:-0}

- name: Check result
  if: steps.gov-verify.outputs.exit_code == '1'
  run: |
    echo "❌ Hard gate failures detected. Merge blocked."
    exit 1

- name: Warn on waiverable failures
  if: steps.gov-verify.outputs.exit_code == '2'
  run: |
    echo "⚠️  Warnings detected. Review recommended."
    # Don't fail the build, but mark as warning
```

#### GitLab CI

```yaml
governance-verify:
  script:
    - node .repo/automation/scripts/governance-verify.js || EXIT_CODE=$?
    - |
      if [ "$EXIT_CODE" = "1" ]; then
        echo "❌ Hard gate failures detected. Merge blocked."
        exit 1
      elif [ "$EXIT_CODE" = "2" ]; then
        echo "⚠️  Warnings detected. Review recommended."
        # Continue but mark as warning
      fi
  allow_failure:
    exit_codes: [2]  # Allow warnings to not block merge
```

## Required Environment Setup

### Node.js Version

Ensure Node.js 20+ is available in CI environment.

### Dependencies

The script requires:
- Node.js 20+
- Access to repository files (`.repo/` directory)
- Read access to trace logs, HITL files, waivers

### Optional: Trace Log Location

If trace logs are stored in a specific location, update the CI script to point to that location:

```yaml
- name: Run governance verification
  run: |
    node .repo/automation/scripts/governance-verify.js \
      --trace-log ".repo/traces/$(git rev-parse HEAD).json" \
      --hitl-file .repo/policy/HITL.md
```

## Integration with Existing CI

### Add to Existing Workflow

If you already have a CI workflow, add governance verification as an additional step:

```yaml
jobs:
  test:
    # ... existing test steps ...
  
  governance:
    needs: test  # Run after tests pass
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: node .repo/automation/scripts/governance-verify.js
```

### Parallel Execution

Run governance verification in parallel with other checks:

```yaml
jobs:
  lint:
    # ... lint steps ...
  
  test:
    # ... test steps ...
  
  governance:
    # ... governance steps ...
  
  all-checks:
    needs: [lint, test, governance]
    runs-on: ubuntu-latest
    steps:
      - name: All checks passed
        run: echo "✅ All checks passed"
```

## Future Enhancement Suggestions

### 1. Auto-Generate Waivers

When exit code is 2 (waiverable failures), automatically create a waiver file:

```yaml
- name: Auto-generate waiver on warnings
  if: steps.gov-verify.outputs.exit_code == '2'
  run: |
    node .repo/automation/scripts/generate-waiver.js \
      --reason "CI warnings" \
      --expiration "$(date -d '+30 days' +%Y-%m-%d)"
```

### 2. PR Comment Integration

Post governance check results as PR comments:

```yaml
- name: Comment on PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      const result = require('fs').readFileSync('governance-results.json', 'utf8');
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `## Governance Check Results\n\n\`\`\`\n${result}\n\`\`\``
      });
```

### 3. Trace Log Collection

Automatically collect and store trace logs:

```yaml
- name: Store trace log
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: trace-log-${{ github.sha }}
    path: "**/*trace*.json"
```

### 4. HITL Status Sync

Automatically sync HITL status to PR description:

```yaml
- name: Sync HITL status
  if: github.event_name == 'pull_request'
  run: |
    python3 .repo/automation/scripts/sync-hitl-to-pr.py \
      --pr-number ${{ github.event.pull_request.number }} \
      --hitl-file .repo/policy/HITL.md
```

## Troubleshooting

### Script Not Found

Ensure the script is executable and path is correct:

```bash
chmod +x .repo/automation/scripts/governance-verify.js
```

### Missing Dependencies

If Node.js modules are missing, ensure `npm install` runs before the script:

```yaml
- run: npm install
- run: node .repo/automation/scripts/governance-verify.js
```

### Trace Log Not Found

If trace logs are optional, handle missing files gracefully:

```yaml
- name: Run governance verification
  run: |
    TRACE_LOG=$(find . -name "*trace*.json" -type f | head -1 || echo "")
    if [ -n "$TRACE_LOG" ]; then
      node .repo/automation/scripts/governance-verify.js --trace-log "$TRACE_LOG"
    else
      node .repo/automation/scripts/governance-verify.js
    fi
```

## Related Documentation

- `.repo/automation/scripts/governance-verify.js` - Script implementation
- `.repo/policy/QUALITY_GATES.md` - Quality gate definitions
- `.repo/policy/HITL.md` - HITL process
- `.repo/templates/AGENT_TRACE_SCHEMA.json` - Trace log schema
