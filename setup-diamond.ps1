# Diamond-Prime Setup Script
# Run this script to complete the setup

Write-Host "🚀 Starting Diamond-Prime Setup..." -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure Node.js is installed and in your PATH." -ForegroundColor Yellow
    Write-Host "You can:" -ForegroundColor Yellow
    Write-Host "  1. Install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "  2. Or use nvm-windows: nvm install 18 && nvm use 18" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ npm found: $(npm --version)" -ForegroundColor Green
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Initialize Husky
Write-Host "🔧 Step 2: Initializing Husky..." -ForegroundColor Cyan
npm run prepare
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Husky initialization had issues (may be normal if already initialized)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Husky initialized" -ForegroundColor Green
}
Write-Host ""

# Step 3: Verify setup
Write-Host "🔍 Step 3: Verifying setup..." -ForegroundColor Cyan

# Check if .husky directory exists
if (Test-Path ".husky") {
    Write-Host "✅ Husky directory exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Husky directory not found" -ForegroundColor Yellow
}

# Check if hooks exist
if (Test-Path ".husky\pre-commit") {
    Write-Host "✅ Pre-commit hook exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pre-commit hook not found" -ForegroundColor Yellow
}

if (Test-Path ".husky\commit-msg") {
    Write-Host "✅ Commit-msg hook exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit-msg hook not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test commit message validation:" -ForegroundColor White
Write-Host "     git commit -m 'test commit'  (should fail)" -ForegroundColor Gray
Write-Host "     git commit -m 'test: verify hooks'  (should pass)" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Test pre-commit hooks:" -ForegroundColor White
Write-Host "     Make a change and commit to trigger hooks" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Verify CI jobs on your next PR:" -ForegroundColor White
Write-Host "     - coverage-ratchet" -ForegroundColor Gray
Write-Host "     - todo-format-check" -ForegroundColor Gray
Write-Host "     - bundle-budget" -ForegroundColor Gray
Write-Host ""
