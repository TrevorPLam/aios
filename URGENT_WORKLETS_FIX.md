# URGENT: Fix Your Worklets Version Mismatch Issue

**Your Error:** `WorkletsError: Mismatch between JavaScript part and native part of Worklets (0.7.2 vs 0.5.1)`

## 🚨 IMMEDIATE ACTION - Run This Now

```bash
npm run expo:clean:native && npm run expo:rebuild:ios
```

This will:
1. Clean all caches (Metro, Expo, watchman)
2. Reinstall node_modules
3. Completely rebuild your native iOS app with the correct worklets version

**Expected time:** 5-10 minutes

## What Happened?

After your Dependabot updates today, your JavaScript code updated to `react-native-worklets` 0.7.2, but your native iOS build still has the old cached version 0.5.1. React Native requires these versions to match EXACTLY.

**Why rollbacks didn't help:** Rollbacks fixed the JavaScript side but didn't rebuild the native code, so the mismatch persisted.

## If That Command Doesn't Work

### Try Option 2: Full Clean

```bash
npm run expo:clean:full && npm run expo:rebuild:ios
```

This is more aggressive - it removes node_modules entirely and reinstalls everything.

**Expected time:** 10-15 minutes

### Try Option 3: Nuclear Option (Last Resort)

See [WORKLETS_FIX_GUIDE.md](./WORKLETS_FIX_GUIDE.md) for manual deep clean instructions.

## Verify It's Fixed

After running the fix:

1. **Start your app:**
   ```bash
   npm start
   ```

2. **Check for the error:** The `WorkletsError` should be gone

3. **Verify versions match:**
   ```bash
   npm run check:worklets
   ```
   Should show: `✅ Versions match! Everything looks good.`

## Prevent This From Happening Again

**After ANY Dependabot PR that updates these packages:**
- `react-native-reanimated`
- `react-native-worklets`
- `react-native-gesture-handler`
- `react-native-draggable-flatlist`
- `react-native-keyboard-controller`

**ALWAYS run:**
```bash
npm run expo:rebuild:ios
```

**Before starting work each day:**
```bash
npm run check:worklets
```

This checks if your versions are in sync and warns you before you run into runtime errors.

## Complete Documentation

For detailed explanation, prevention strategies, and troubleshooting:
- **[WORKLETS_FIX_GUIDE.md](./WORKLETS_FIX_GUIDE.md)** - Complete fix guide with 3 options
- **[README.md#troubleshooting](./README.md#troubleshooting)** - Quick troubleshooting section
- **[Common Incidents Runbook](./docs/operations/runbooks/common_incidents.md#react-native-worklets-version-mismatch)** - Detailed runbook

## New Tools Added

I've added these tools to help you:

1. **`npm run check:worklets`** - Check if versions match (run anytime)
2. **`npm run check:postinstall`** - Post-install health check (run after npm install)
3. **WORKLETS_FIX_GUIDE.md** - Complete fix guide with 3 fix options
4. **Enhanced README troubleshooting** - Prominent link to fix guide

## Why This Keeps Happening

**The root cause:** React Native has two parts:
- **JavaScript bundle** (Metro bundler) - updates instantly
- **Native iOS/Android code** - requires complete rebuild

When Dependabot updates `react-native-reanimated` or `react-native-worklets`:
- ✅ JavaScript updates immediately via `npm install`
- ❌ Native code keeps old cached version until you rebuild

**Solution:** Always rebuild native code after animation library updates:
```bash
npm run expo:rebuild:ios
```

## Still Having Issues?

1. **Make sure iOS Simulator is completely closed:**
   - Quit from the menu bar (not just close the window)
   - Run the fix again

2. **Check for multiple worklets versions:**
   ```bash
   npm list react-native-worklets
   ```
   Should only show ONE version

3. **Clear Xcode cache (if Xcode installed):**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

4. **See WORKLETS_FIX_GUIDE.md for more troubleshooting**

## Summary

**Quick Fix:**
```bash
npm run expo:clean:native && npm run expo:rebuild:ios && npm start
```

**Prevent Future Issues:**
```bash
# After any Dependabot update to animation libs:
npm run expo:rebuild:ios

# Before starting work:
npm run check:worklets
```

**Get Help:**
- WORKLETS_FIX_GUIDE.md
- docs/operations/runbooks/common_incidents.md
