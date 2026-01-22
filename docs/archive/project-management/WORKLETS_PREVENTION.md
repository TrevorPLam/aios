# Preventing Worklets Version Mismatch

This guide explains how to prevent the worklets version mismatch issue from occurring in the future.

## Automated Prevention Measures

### 1. Post-Install Hook ✅

**Status:** Enabled

The project now includes an automatic post-install hook that runs after every `npm install`:

```bash
npm install  # Automatically runs check after installation
```text

This hook:

- Checks worklets version consistency
- Verifies Expo configuration (app.json)
- Warns immediately if issues are detected
- Provides fix commands

### What it checks
- ✅ React-native-worklets version matches package.json
- ✅ React-native-reanimated plugin is configured in app.json

### 2. CI/CD Checks ✅

**Status:** Enabled

The CI pipeline includes automated checks that run on every PR:

```yaml
# .github/workflows/ci.yml
expo-config-check:
  name: Expo Configuration Check
  runs-on: ubuntu-latest
  steps:
    - name: Check Expo configuration
      run: npm run check:expo-config
```text

This prevents PRs from being merged if the Expo configuration is incorrect.

### 3. Manual Check Commands

You can run these checks manually anytime:

```bash
# Check worklets version
npm run check:worklets

# Check Expo configuration
npm run check:expo-config

# Run full post-install checks
npm run check:postinstall
```text

## Best Practices

### After Dependency Updates

#### Always rebuild native code after updating these packages
```bash
# After updating any of these
# - react-native-reanimated
# - react-native-worklets
# - react-native-gesture-handler
# - react-native-draggable-flatlist
# - react-native-keyboard-controller

# Run
npm run expo:rebuild:ios  # or :android
```text

### Before Starting Work

#### Add this to your daily workflow
```bash
git pull origin main
npm install  # Post-install checks run automatically
npm run check:worklets  # Additional manual check
```text

### When Reviewing PRs

#### Checklist for Dependabot PRs
- [ ] Check if PR updates animation-related packages
- [ ] Verify CI passes (including expo-config-check)
- [ ] After merging, rebuild native app: `npm run expo:rebuild:ios`
- [ ] Test animations and gestures work correctly

### Branch Switching

#### When switching to a branch with different dependencies
```bash
git checkout feature-branch
npm run expo:clean:full  # Full clean
npm run expo:rebuild:ios  # Rebuild native
```text

## Configuration Requirements

### Required in app.json

The `react-native-reanimated` plugin **must** be present in `app.json`:

```json
{
  "expo": {
    "plugins": [
      "react-native-reanimated"
    ]
  }
}
```text

### Why this matters
- Babel plugin (in `babel.config.js`) handles JavaScript transforms
- Expo plugin (in `app.json`) handles native code linking
- Both are required for worklets to function correctly

### Required in babel.config.js

The reanimated Babel plugin **must** be last in the plugins array:

```javascript
module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    // ... other plugins
    "react-native-reanimated/plugin", // Must be last!
  ],
};
```text

## Troubleshooting Prevention Failures

### If Post-Install Check Fails

1. **Read the error message carefully** - it provides specific fix commands
2. **Run the suggested fix:**

   ```bash
   npm run expo:clean:native && npm run expo:rebuild:ios
   ```text

1. **Verify the fix:**

   ```bash
   npm run check:worklets
   npm run check:expo-config
   ```text

### If CI Check Fails

1. **Check the CI logs** for specific error
2. **Most common issues:**
   - Missing `react-native-reanimated` in app.json plugins
   - Worklets version mismatch in package-lock.json
3. **Fix locally and push:**

   ```bash
   # Fix app.json or package.json
   npm install
   npm run check:expo-config
   git commit -am "Fix expo configuration"
   git push
   ```text

## Monitoring and Alerts

### GitHub Actions Status

Monitor the CI status badge to ensure checks are passing:

```markdown
![CI](https://github.com/TrevorPowellLam/Mobile-Scaffold/workflows/CI/badge.svg)
```text

### Pre-Commit Hook (Optional)

You can add a pre-commit hook to check before committing:

```bash
# .husky/pre-commit
#!/bin/sh
npm run check:expo-config
npm run check:worklets
```text

## Education and Documentation

### For Team Members

#### Share these resources
- [WORKLETS_FIX_GUIDE.md](./WORKLETS_FIX_GUIDE.md) - Complete fix guide
- [URGENT_WORKLETS_FIX.md](./URGENT_WORKLETS_FIX.md) - Quick reference
- [Common Incidents Runbook](../../operations/runbooks/common_incidents.md) - Detailed troubleshooting

### Onboarding Checklist

New team members should:

- [ ] Read WORKLETS_FIX_GUIDE.md
- [ ] Understand why rebuild is needed after dependency updates
- [ ] Know the commands: `check:worklets`, `check:expo-config`, `expo:rebuild:ios`
- [ ] Add rebuild step to their personal workflow

## Summary

### Prevention is now automated through
1. ✅ Post-install hooks (runs after every `npm install`)
2. ✅ CI/CD checks (runs on every PR)
3. ✅ Manual check commands (available anytime)
4. ✅ Documentation (comprehensive guides)

### Your responsibility
- Always rebuild native code after animation library updates
- Run checks before starting work
- Review Dependabot PRs carefully
- Share knowledge with team members

### If issues still occur
1. Run `npm run check:worklets` and `npm run check:expo-config`
2. Follow the suggested fix commands
3. See WORKLETS_FIX_GUIDE.md for detailed troubleshooting
4. Report persistent issues for further automation

---

**Last Updated:** 2026-01-19
**Automation Status:** Active
**Next Review:** When new automation opportunities identified
