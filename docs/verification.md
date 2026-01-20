# Standard Verification Commands

## Plain English Summary

- This document defines the canonical commands to verify AIOS code and documentation
- Use these exact commands in docs - don't invent new ones
- Every "How to Verify" section should reference these commands
- This prevents "works on my machine" problems caused by different verification methods
- CI uses these same commands - local verification matches CI exactly
- When commands change, update here once instead of in 100+ docs

## Canonical Commands

### Code Quality

#### Linting
```bash
# Lint all code (JavaScript, TypeScript, JSX, TSX)
npm run lint

# Lint with auto-fix
npm run lint:fix

# Check specific files
npx expo lint client/screens/CommandCenter.tsx
```

**Expected Output (Success):**
```
✔ No lint errors found
```

**Expected Output (Failure):**
```
✖ 3 problems (2 errors, 1 warning)
  client/screens/Notebook.tsx:42:3  error  'useState' is not defined
```

---

#### Type Checking
```bash
# Type check entire codebase
npm run check:types

# Type check with detailed output
npx tsc --noEmit --pretty

# Check specific file
npx tsc --noEmit client/screens/Calendar.tsx
```

**Expected Output (Success):**
```
(no output - silence means success)
```

**Expected Output (Failure):**
```
client/screens/Planner.tsx(42,3): error TS2322: Type 'string' is not assignable to type 'number'.
```

---

#### Code Formatting
```bash
# Check formatting (doesn't modify files)
npm run check:format

# Format all files
npm run format

# Format specific files
npx prettier --write "client/screens/*.tsx"
```

**Expected Output (Success):**
```
All matched files use Prettier code style!
```

**Expected Output (Failure):**
```
Code style issues found in 3 files:
  client/screens/Email.tsx
  client/screens/Lists.tsx
  server/routes.ts
```

---

### Testing

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Notebook.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="CommandCenter"
```

**Expected Output (Success):**
```
Test Suites: 42 passed, 42 total
Tests:       247 passed, 247 total
Snapshots:   18 passed, 18 total
Time:        12.456 s
```

**Expected Output (Failure):**
```
FAIL client/screens/__tests__/Planner.test.tsx
  ● Planner › should handle task creation
    expect(received).toBe(expected)
    Expected: "Buy milk"
    Received: undefined
```

---

#### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

**Coverage Thresholds:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Expected Output:**
```
--------------|---------|----------|---------|---------|
File          | % Stmts | % Branch | % Funcs | % Lines |
--------------|---------|----------|---------|---------|
All files     |   92.41 |    87.23 |   94.12 |   92.35 |
 CommandCenter|  100.00 |   100.00 |  100.00 |  100.00 |
 Notebook     |   95.23 |    91.43 |   96.15 |   95.12 |
```

---

### Building

#### Development Build
```bash
# Start Expo development server
npm start

# Start with specific platform
npm run expo:dev  # iOS simulator (Replit)

# Clear cache and start fresh
npm run expo:clean
```

**Expected Output:**
```
Metro waiting on exp://192.168.1.100:8081
Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
Press │ r │ to reload │ m │ to toggle menu
```

---

#### Production Build
```bash
# Build optimized JavaScript bundle
npm run expo:static:build

# Build backend for production
npm run server:build

# Verify build output exists
ls -la dist/  # Frontend build
ls -la server_dist/  # Backend build
```

**Expected Output:**
```
✓ JavaScript bundle created successfully
  Size: 2.4 MB (minified)
  Location: dist/index.bundle.js
```

---

### Database

#### Schema Management
```bash
# Push schema changes to database
npm run db:push

# Generate migrations (when ready)
# npm run db:migrate  # TODO

# Verify database connection
node -e "const pg = require('pg'); const client = new pg.Client(process.env.DATABASE_URL); client.connect().then(() => console.log('✓ Database connected')).catch(err => console.error('✗ Connection failed:', err));"
```

**Expected Output:**
```
✓ Database connected
✓ Schema synced successfully
```

---

### Server

#### Development Server
```bash
# Start development server
npm run server:dev

# Verify server is running
curl http://localhost:5000/health

# Check server logs
tail -f server.log  # If logging to file
```

**Expected Output:**
```
Server running on http://localhost:5000
✓ Database connected
✓ WebSocket server ready
```

---

#### Production Server
```bash
# Build and start production server
npm run server:build
npm run server:prod

# Health check
curl http://localhost:5000/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T10:00:00Z",
  "version": "1.0.0"
}
```

---

### Documentation

#### Documentation Linting
```bash
# Lint markdown formatting
markdownlint "docs/**/*.md"

# Lint prose (Vale)
vale docs/

# Check spelling
npx cspell "docs/**/*.md"

# Check all doc quality gates
npm run lint:docs  # TODO: Combine above commands
```

**Expected Output (Success):**
```
✓ 0 markdown issues
✓ 0 prose issues
✓ 0 spelling errors
```

**Expected Output (Failure):**
```
docs/architecture/c4/README.md:42:1 MD013/line-length Line length [Expected: 80; Actual: 95]
docs/testing/strategy.md:12:5 Vale.Spelling Did you really mean 'testabilty'?
```

---

#### Documentation Links
```bash
# Check for broken links
npx lychee "docs/**/*.md"

# Check specific file
npx lychee docs/README.md

# Check external links only
npx lychee --offline false "docs/**/*.md"
```

**Expected Output (Success):**
```
✓ 0 errors, 0 warnings, 247 links checked
```

**Expected Output (Failure):**
```
✗ [404] docs/architecture/README.md:42 → https://example.com/missing-page
✗ [FILE] docs/testing/strategy.md:15 → ./nonexistent.md
```

---

#### Documentation Site
```bash
# Build documentation site (MkDocs)
mkdocs build

# Serve documentation locally
mkdocs serve

# Open in browser
open http://localhost:8000  # macOS
```

**Expected Output:**
```
INFO     -  Building documentation...
INFO     -  Documentation built in 2.34 seconds
INFO     -  Serving on http://127.0.0.1:8000/
```

---

### Security

#### Dependency Audit
```bash
# Check for security vulnerabilities
npm audit

# Show only high/critical
npm audit --audit-level=high

# Fix automatically (when safe)
npm audit fix

# Fix forcing semver-major updates
npm audit fix --force  # Use with caution
```

**Expected Output (Success):**
```
found 0 vulnerabilities
```

**Expected Output (Warnings):**
```
found 3 vulnerabilities (1 moderate, 2 high)
  high: Prototype Pollution in json5
  Package: json5
  Patched in: >=2.2.2
  Dependency of: @babel/core [dev]
```

---

#### Code Security Scan (CodeQL)
```bash
# Run locally (requires CodeQL CLI)
# Typically runs in CI only
codeql database create --language=javascript codeql-db
codeql database analyze codeql-db --format=sarif-latest --output=results.sarif

# Check CI results
gh run list --workflow=codeql.yml --limit 5
```

**Expected Output:**
```
✓ No security issues found
```

---

### Git

#### Pre-commit Checks
```bash
# Run all checks that would run in CI
npm run lint && npm run check:types && npm test

# Check commit message format (if Husky configured)
# Runs automatically on git commit

# Verify branch is clean
git status

# Show changes
git diff
```

**Expected Output (Clean):**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

#### Commit Verification
```bash
# Verify last commit
git log -1 --stat

# Check for large files
git ls-files --stage | awk '$1 ~ /^100/ {sum+=$4} END {print sum " bytes total"}'

# Verify no secrets in commit
git diff HEAD~ | grep -E "(password|secret|key|token)" && echo "⚠️ Possible secret detected"
```

---

### Mobile-Specific

#### iOS Simulator
```bash
# List available simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 15 Pro"

# Install app on simulator
npm run expo:dev  # Builds and installs automatically
```

---

#### Android Emulator
```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator @Pixel_5_API_33

# Install app on emulator
npm run expo:dev  # Builds and installs automatically
```

---

## Complete Verification Checklist

Use this before submitting any PR:

```bash
# 1. Lint code
npm run lint

# 2. Type check
npm run check:types

# 3. Format code
npm run check:format

# 4. Run tests
npm test

# 5. Check coverage
npm run test:coverage

# 6. Build frontend
npm run expo:static:build

# 7. Build backend
npm run server:build

# 8. Lint documentation
markdownlint "docs/**/*.md"

# 9. Check doc links
npx lychee "docs/**/*.md"

# 10. Security audit
npm audit --audit-level=high

# 11. Verify git status
git status
```

**All-in-One Command:**
```bash
# Run everything (add to package.json)
npm run verify:all  # TODO: Implement as script

# Proposed implementation:
# "verify:all": "npm run lint && npm run check:types && npm test && npm run build"
```

---

## CI/CD Commands

These commands run in GitHub Actions:

```yaml
# .github/workflows/ci.yml
- run: npm ci  # Clean install
- run: npm run lint
- run: npm run check:types
- run: npm test
- run: npm run build

# .github/workflows/docs-quality.yml
- run: markdownlint "docs/**/*.md"
- run: vale docs/
- run: npx lychee "docs/**/*.md"
```

**Golden Rule:** If it passes locally with these commands, it passes in CI.

---

## Environment Variables

Required for verification:

```bash
# Copy example env file
cp .env.example .env

# Required variables
DATABASE_URL=postgresql://user:pass@localhost:5432/aios
JWT_SECRET=your-secret-key-here
NODE_ENV=development

# Verify environment
node -e "console.log(process.env.DATABASE_URL ? '✓ DATABASE_URL set' : '✗ DATABASE_URL missing')"
```

---

## Troubleshooting Verification Failures

### "Command not found"
```bash
# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### "Port already in use"
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>
```

### "Tests timing out"
```bash
# Increase timeout
npm test -- --testTimeout=10000

# Run single test
npm test -- path/to/test.tsx --testNamePattern="specific test"
```

### "Type errors in node_modules"
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Build fails with memory error"
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

## Assumptions

- Node.js 18+ and npm 9+ are installed
- Repository is cloned and dependencies installed (`npm install`)
- Environment variables are set (.env file exists)
- Git is configured correctly
- For mobile: Xcode (iOS) or Android Studio (Android) is installed
- Commands are run from repository root

## Failure Modes

| Failure | Symptom | Solution |
|---------|---------|----------|
| Command not found | `npm: command not found` | Install Node.js and npm |
| Wrong directory | `package.json not found` | `cd` to repository root |
| Stale dependencies | Tests fail unexpectedly | `rm -rf node_modules && npm install` |
| Port conflict | `EADDRINUSE: port already in use` | Kill process or change port |
| Cache issues | Build fails randomly | Run `expo:clean` or delete caches |
| Out of sync | Local passes, CI fails | Pull latest, verify same Node version |

## How to Verify

```bash
# Verify this document is accurate
# Run each command and confirm output matches documentation

# Check commands exist
command -v npm && echo "✓ npm installed"
command -v node && echo "✓ node installed"
command -v git && echo "✓ git installed"

# Verify package.json scripts exist
cat package.json | grep -A 50 '"scripts"' | grep -E "(lint|test|build)"

# Test a simple verification
npm run lint && echo "✓ Lint command works"
```

---

**HIGH LEVERAGE:** Standardizing verification commands eliminates the "works on my machine" problem. Every developer and CI uses identical commands, ensuring consistency. When commands change, update here once instead of in hundreds of docs.

**CAPTION:** This single source of truth for verification prevents documentation drift where different docs recommend different commands. The "Complete Verification Checklist" gives contributors confidence their changes will pass CI before they push.

---

**Last Updated:** 2026-01-17  
**Used By:** All documentation "How to Verify" sections  
**CI Integration:** .github/workflows/ci.yml, .github/workflows/docs-quality.yml  
**Maintenance:** Update when adding/changing npm scripts or verification tools
