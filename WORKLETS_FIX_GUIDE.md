# Fix Worklets Version Mismatch - Immediate Action Guide

**Error:** `WorkletsError: Mismatch between JavaScript part and native part of Worklets (0.7.2 vs 0.5.1)`

## Immediate Fix (Choose One)

### Option 1: Quick Fix for Expo Development Builds (Recommended)

```bash
# Step 1: Clean all caches and reinstall
npm run expo:clean:native

# Step 2: Rebuild the native iOS app (REQUIRED)
npm run expo:rebuild:ios

# Step 3: Start the app
npm start
```

**Expected time:** 5-10 minutes

### Option 2: Full Clean (If Option 1 Doesn't Work)

```bash
# Step 1: Complete clean including node_modules
npm run expo:clean:full

# Step 2: Rebuild the native iOS app
npm run expo:rebuild:ios

# Step 3: Start the app
npm start
```

**Expected time:** 10-15 minutes (includes npm install)

### Option 3: Manual Deep Clean (Last Resort)

```bash
# Step 1: Remove all caches and dependencies
rm -rf node_modules/.cache .expo .metro-cache
rm -rf node_modules package-lock.json
watchman watch-del-all 2>/dev/null || true

# Step 2: Remove native build folders (if they exist)
rm -rf ios/build android/build

# Step 3: Reinstall everything
npm install

# Step 4: Rebuild native code from scratch
npx expo prebuild --clean
npx expo run:ios

# Step 5: If still not working, check iOS simulator
# Make sure the iOS Simulator app is completely closed
# Quit iOS Simulator from the menu bar
# Then restart
npm start
```

**Expected time:** 15-20 minutes

## Verification Steps

After running the fix, verify it worked:

1. **Check for the error message**: The `WorkletsError` should no longer appear
2. **Test animations**: Swipe gestures and animations should work smoothly
3. **Run the check script**: 
   ```bash
   npm run check:worklets
   ```
   Should show: `✅ Versions match! Everything looks good.`

## Why This Happens

This error occurs when:
- Dependabot or manual updates change `react-native-reanimated` or `react-native-worklets` versions
- The JavaScript bundle gets the new version (0.7.2)
- The native iOS/Android build still has the old version cached (0.5.1)
- The native code and JavaScript code versions must match exactly
- **Missing Expo config plugin:** The `react-native-reanimated` plugin is not configured in `app.json`, causing the native build to use incorrect versions

**Key insight:** JavaScript can be updated instantly via Metro bundler, but native iOS/Android code requires a complete rebuild. Additionally, Expo requires the `react-native-reanimated` plugin in `app.json` to properly configure native dependencies.

## Prevention Strategy

To prevent this issue in the future:

### 1. After Any Dependency Update

Always run these commands after updating animation-related packages:

```bash
# After updating react-native-reanimated, react-native-worklets,
# react-native-gesture-handler, or react-native-draggable-flatlist:
npm run expo:clean:native
npm run expo:rebuild:ios  # or android
```

### 2. When Switching Branches

If switching to a branch with different dependency versions:

```bash
npm run expo:clean:full
npm run expo:rebuild:ios
```

### 3. After Merging Dependabot PRs

After merging any Dependabot PR that updates these packages:
- `react-native-reanimated`
- `react-native-worklets`
- `react-native-gesture-handler`
- `react-native-draggable-flatlist`
- `react-native-keyboard-controller`

Always rebuild:
```bash
npm run expo:rebuild:ios
```

### 4. Use the Check Script

Before starting development work, verify versions match:
```bash
npm run check:worklets
```

## Related Commands

Here's what each command does:

| Command | What It Does | When to Use |
|---------|-------------|-------------|
| `npm run expo:clean` | Clears Metro cache only | Changes not appearing in app |
| `npm run expo:clean:native` | Clears all caches + watchman + reinstall | After dependency updates |
| `npm run expo:clean:full` | Full clean including node_modules | Severe dependency issues |
| `npm run expo:rebuild:ios` | Completely rebuilds native iOS app | After native dependency changes |
| `npm run check:worklets` | Verifies worklets version consistency | Before starting work |

## Still Having Issues?

If the error persists after all fixes:

1. **Check app.json configuration:**
   ```bash
   # Verify react-native-reanimated plugin is present
   grep -A 5 '"plugins"' app.json | grep "react-native-reanimated"
   ```
   If missing, add to `app.json`:
   ```json
   {
     "expo": {
       "plugins": [
         "react-native-reanimated"
       ]
     }
   }
   ```

2. **Check iOS Simulator:**
   - Quit the iOS Simulator app completely
   - In Simulator menu: Device → Erase All Content and Settings
   - Restart the simulator

2. **Check Xcode (if installed):**
   ```bash
   # Clean Xcode derived data
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

3. **Check for multiple versions:**
   ```bash
   # This should only show ONE version
   npm list react-native-worklets
   ```

4. **Verify package-lock.json:**
   ```bash
   # Check what version is locked
   grep -A 5 '"react-native-worklets"' package-lock.json | head -10
   ```

5. **Check for conflicting dependencies:**
   ```bash
   # Look for peer dependency warnings
   npm install --legacy-peer-deps
   ```

## Additional Resources

- [Common Incidents Runbook](docs/operations/runbooks/common_incidents.md#react-native-worklets-version-mismatch) - Detailed troubleshooting
- [React Native Worklets Troubleshooting](https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting) - Official docs
- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/) - Understanding native builds

## Quick Reference

**Most Common Fix:**
```bash
npm run expo:clean:native && npm run expo:rebuild:ios && npm start
```

**When That Doesn't Work:**
```bash
npm run expo:clean:full && npm run expo:rebuild:ios && npm start
```

**Emergency Nuclear Option:**
```bash
rm -rf node_modules package-lock.json .expo .metro-cache ios/build
npm install
npx expo prebuild --clean
npx expo run:ios
```
