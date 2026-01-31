#!/bin/bash
set -e

echo "🔍 Running verify checks..."

echo "1/6 Blast radius..."
./scripts/security/check-blast-radius.sh

echo "2/6 Secret scan..."
if command -v gitleaks &> /dev/null; then
    gitleaks detect --source . --verbose
else
    echo "⚠️  gitleaks not found, skipping secret scan"
fi

echo "3/6 Lint..."
pnpm lint

echo "4/6 Type check..."
pnpm type-check

echo "5/6 Tests..."
pnpm test

echo "6/6 Build..."
pnpm build

echo "✅ Verify passed"