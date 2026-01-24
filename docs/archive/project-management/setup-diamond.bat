@echo off
REM Diamond-Prime Setup Script (Windows Batch)
REM Run this script to complete the setup

echo.
echo 🚀 Starting Diamond-Prime Setup...
echo.

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found in PATH
    echo.
    echo Please ensure Node.js is installed and in your PATH.
    echo You can:
    echo   1. Install Node.js from https://nodejs.org/
    echo   2. Or use nvm-windows: nvm install 18 ^&^& nvm use 18
    echo.
    exit /b 1
)

echo ✅ npm found
npm --version
echo.

REM Step 1: Install dependencies
echo 📦 Step 1: Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 2: Initialize Husky
echo 🔧 Step 2: Initializing Husky...
call npm run prepare
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Husky initialization had issues (may be normal if already initialized)
) else (
    echo ✅ Husky initialized
)
echo.

REM Step 3: Verify setup
echo 🔍 Step 3: Verifying setup...

if exist ".husky" (
    echo ✅ Husky directory exists
) else (
    echo ⚠️  Husky directory not found
)

if exist ".husky\pre-commit" (
    echo ✅ Pre-commit hook exists
) else (
    echo ⚠️  Pre-commit hook not found
)

if exist ".husky\commit-msg" (
    echo ✅ Commit-msg hook exists
) else (
    echo ⚠️  Commit-msg hook not found
)

echo.
echo 🎉 Setup Complete!
echo.
echo Next steps:
echo   1. Test commit message validation:
echo      git commit -m "test commit"  (should fail)
echo      git commit -m "test: verify hooks"  (should pass)
echo.
echo   2. Test pre-commit hooks:
echo      Make a change and commit to trigger hooks
echo.
echo   3. Verify CI jobs on your next PR:
echo      - coverage-ratchet
echo      - todo-format-check
echo      - bundle-budget
echo.

pause
