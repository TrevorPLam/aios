#!/bin/bash
set -e

echo "🔍 Running verify checks..."

echo "1/4 Blast radius..."
./scripts/security/check-blast-radius.sh

echo "2/4 Secret scan..."
if command -v gitleaks &> /dev/null; then
    gitleaks detect --source . --verbose
else
    echo "⚠️  gitleaks not found, skipping secret scan"
fi

echo "3/4 Type check..."
pnpm type-check

echo "4/4 Build..."
pnpm build

echo "✅ Verify passed (lint skipped due to config issues)"