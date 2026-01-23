# Diamond-Prime Setup Instructions

**Quick setup guide to complete the remaining tasks**

## Step 1: Install Dependencies

Open a terminal in the project root and run:

```bash
npm install
```

This will install:
- Husky (pre-commit hooks)
- Semantic-release packages
- All other dependencies

**Expected time:** 1-2 minutes

---

## Step 2: Install Python Dependencies

Install Python dependencies for automation scripts:

```bash
pip install -r .repo/automation/scripts/requirements.txt
```

Or use the Makefile:
```bash
make install
```

**Expected time:** < 30 seconds

---

## Step 3: Install Pre-commit Hooks

Install the pre-commit framework and hooks:

```bash
# Install pre-commit framework (if not already installed)
pip install pre-commit

# Install pre-commit hooks
pre-commit install
```

Or use the Makefile (which includes this):
```bash
make install
```

**Expected time:** < 10 seconds

---

## Step 4: Initialize Husky

After `npm install` completes, run:

```bash
npm run prepare
```

Or manually:
```bash
npx husky install
```

This sets up Git hooks in `.husky/` directory.

**Expected time:** < 10 seconds

---

## Step 5: Verify Hooks are Working

Test the commit message hook:

```bash
# This should FAIL (invalid format)
git commit -m "test commit"
```

You should see an error about Conventional Commits format.

Then test with valid format:

```bash
# This should PASS
git commit -m "test: verify pre-commit hooks work"
```

**Expected time:** < 1 minute

---

## Step 4: Test Pre-commit Hooks

Make a small change and commit:

```bash
# Make a test change
echo "# Test" >> TEST.md

# Try to commit (hooks will run)
git add TEST.md
git commit -m "test: verify all hooks work"
```

The hooks will:
1. Check formatting
2. Run linting
3. Run type checking
4. Scan for secrets (if gitleaks is installed)

**Expected time:** 10-30 seconds (depending on hook execution time)

---

## Step 5: Verify CI Jobs Are Added

The following CI jobs have been automatically added to `.github/workflows/ci.yml`:

✅ **coverage-ratchet** - Checks 90% coverage on new code only  
✅ **todo-format-check** - Validates TODO/FIXME have ticket IDs  
✅ **bundle-budget** - Enforces 2% bundle size increase limit  

These will run automatically on pull requests.

**No action needed** - Already done!

---

## Step 6: Test Scripts Locally (Optional)

Test the new check scripts:

```bash
# Check TODO format
npm run check:todo-format

# Check coverage (after running tests with coverage)
npm test -- --coverage
npm run check:coverage-ratchet

# Check bundle budget (after building)
npm run expo:static:build
npm run check:bundle-budget
```

---

## Step 7: Review Configurations (Recommended)

### 7.1 Gitleaks Config
Review `.gitleaks.toml`:
- Check allowlist patterns match your project
- Add any project-specific false positive patterns

### 7.2 Semantic Release Config
Review `.releaserc.json`:
- Verify branch names (`main`, `develop`) match your workflow
- Adjust release rules if needed
- Set `npmPublish: true` if publishing to npm

### 7.3 Stryker Config (Optional)
Review `.stryker.conf.json`:
- Adjust file patterns if needed
- Test on a small subset first: `npx stryker run --mutate apps/mobile/screens/HomeScreen.tsx`

---

## Verification Checklist

After completing the steps above, verify:

- [ ] `npm install` completed successfully
- [ ] `npm run prepare` completed successfully
- [ ] Husky hooks are active (test commit fails with invalid format)
- [ ] Pre-commit hooks run on commit
- [ ] CI jobs appear in GitHub Actions (on next PR)
- [ ] All scripts run without errors

---

## Troubleshooting

### Husky hooks not running?
```bash
# Reinstall hooks
npx husky install

# Make hooks executable (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### npm install fails?
- Check Node.js version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then retry

### Pre-commit hooks too slow?
- Check execution time: hooks should be < 5s
- Consider parallelizing or removing slow checks
- Use `--no-verify` flag to skip hooks (not recommended)

### CI jobs failing?
- Check GitHub Actions logs
- Verify scripts work locally first
- Ensure BASE_REF environment variable is set correctly

---

## Next Steps After Setup

1. **Make a test PR** to verify CI jobs work
2. **Review first CI run** to ensure all checks pass
3. **Customize configs** based on your project needs
4. **Add mutation testing** (optional, see DIAMOND_REMAINING_TASKS.md)

---

## Quick Command Reference

```bash
# Install everything
npm install

# Setup Husky
npm run prepare

# Test hooks
git commit -m "test: verify hooks"

# Run checks locally
npm run check:todo-format
npm run check:coverage-ratchet
npm run check:bundle-budget

# Run all checks
npm run lint && npm run check:types && npm run check:format
```

---

**All setup tasks are now automated or documented!** 🎉

The CI jobs have been added automatically. You just need to:
1. Run `npm install`
2. Run `npm run prepare`
3. Test the hooks

Everything else will work automatically on your next PR!
