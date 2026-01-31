#!/bin/bash
set -e

PROTECTED_PATHS=(
    "infrastructure/"
    "services/api-gateway/"
    ".github/workflows/"
    "scripts/"
    "package.json"
    "pnpm-workspace.yaml"
    "tsconfig.base.json"
    "Makefile"
)

echo "🛡️  Checking blast radius..."

if [ -z "$GITHUB_BASE_REF" ]; then
    # Local check - compare with main
    CHANGED_FILES=$(git diff --name-only main...HEAD 2>/dev/null || echo "")
else
    # CI check - compare with base branch
    CHANGED_FILES=$(git diff --name-only origin/$GITHUB_BASE_REF...HEAD)
fi

if [ -z "$CHANGED_FILES" ]; then
    echo "✅ No changed files detected"
    exit 0
fi

PROTECTED_CHANGED=""
for file in $CHANGED_FILES; do
    for protected in "${PROTECTED_PATHS[@]}"; do
        if [[ "$file" == $protected* ]]; then
            PROTECTED_CHANGED="$PROTECTED_CHANGED\n  - $file"
        fi
    done
done

if [ -n "$PROTECTED_CHANGED" ]; then
    echo "❌ Protected paths changed:"
    echo -e "$PROTECTED_CHANGED"
    echo ""
    echo "These changes require explicit human approval."
    echo "Add 'protected-paths-approved' label to bypass this check."
    exit 1
fi

echo "✅ No protected paths changed"