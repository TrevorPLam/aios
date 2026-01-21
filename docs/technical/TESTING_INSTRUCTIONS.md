# Testing Instructions for Mobile-First Configuration

## Overview

These instructions help verify that the mobile-first configuration changes are working correctly.

## Before Testing

### Prerequisites

1. Ensure all dependencies are installed:

   ```bash
   npm install
   ```text

1. Have iOS Simulator installed (Xcode) or access to Expo Go on an iOS device

## Test 1: Verify Metro Configuration

**Purpose:** Ensure Metro is configured to only bundle for iOS and Android

### Steps

1. Check metro.config.js exists:

   ```bash
   ls -la metro.config.js
   ```text

1. Verify platforms configuration:

   ```bash
   node -p "require('./metro.config.js').resolver.platforms"
   ```text

**Expected Result:** Should output `[ 'ios', 'android' ]`

**Pass/Fail:** ___________

## Test 2: Verify Expo Configuration

**Purpose:** Ensure web platform is removed from app.json

### Steps (2)

1. Check for web configuration:

   ```bash
   grep -i '"web"' app.json
   ```text

1. List expo config keys:

   ```bash
   node -p "Object.keys(require('./app.json').expo)"
   ```text

### Expected Result

- First command should return nothing (no "web" key found)
- Second command should NOT include "web" in the list

**Pass/Fail:** ___________

## Test 3: Verify Dev Script Forces iOS Mode

**Purpose:** Ensure expo:dev starts in iOS mode by default

### Steps (3)

1. Check the expo:dev script:

   ```bash
   npm run expo:dev --dry-run 2>&1 | grep "expo start"
   ```text

**Expected Result:** Should see `--ios` flag in the command

**Pass/Fail:** ___________

## Test 4: Start Expo in Development Mode

**Purpose:** Verify Expo starts correctly with iOS-first configuration

### Steps (4)

1. Clear any existing cache:

   ```bash
   npm run expo:clean
   ```text

1. In a separate terminal, start the development server:

   ```bash
   npm run expo:dev
   ```text

1. Observe the output:

   - Should see Metro bundler starting
   - Should see iOS as the primary target
   - Should NOT see "Press w to open in web browser"

1. Press `i` (or it should auto-open iOS simulator)

### Expected Result (2)

- Expo starts successfully
- iOS simulator opens (or QR code for iOS device)
- No web option available
- App renders in native iOS mode

**Pass/Fail:** ___________

## Test 5: Verify Cache Clearing

**Purpose:** Ensure the cache clearing script works

### Steps (5)

1. Create some cache (by running expo once):

   ```bash
   npm run expo:dev
   # Wait for it to start, then stop with Ctrl+C
   ```text

1. Check cache directories exist:

   ```bash
   ls -la .expo .metro-cache node_modules/.cache 2>/dev/null
   ```text

1. Run cache clear:

   ```bash
   npm run expo:clean
   # Stop with Ctrl+C after it starts
   ```text

1. Check cache directories are removed:

   ```bash
   ls -la .expo .metro-cache node_modules/.cache 2>/dev/null
   ```text

### Expected Result (3)

- Cache directories exist after step 1
- Cache directories are removed after step 3
- Expo starts with `--clear` flag

**Pass/Fail:** ___________

## Test 6: Make a Visual Change and Verify

**Purpose:** Ensure changes appear when refreshing the app

### Steps (6)

1. Start Expo:

   ```bash
   npm run expo:dev
   ```text

1. Open the app in iOS simulator

1. Make a visible change in any screen file (e.g., change text in `client/screens/ModuleGridScreen.tsx`)

1. Save the file

1. In the iOS simulator, press `Cmd+R` to reload, or shake device and tap "Reload"

### Expected Result (4)

- Change appears immediately after reload
- No need to restart Metro
- No need to clear cache for simple changes

**Pass/Fail:** ___________

## Test 7: Verify Platform Detection

**Purpose:** Ensure the app knows it's running on iOS, not web

### Steps (7)

1. Add a temporary Platform check in `client/App.tsx`:

   ```typescript
   import { Platform } from 'react-native';
   console.log('Platform:', Platform.OS);
   console.log('Is iOS:', Platform.OS === 'ios');
   console.log('Is Web:', Platform.OS === 'web');
   ```text

1. Start Expo and check Metro bundler logs

### Expected Result (5)

- `Platform: ios`
- `Is iOS: true`
- `Is Web: false`

**Pass/Fail:** ___________

## Test 8: Screenshot Test

**Purpose:** Verify screenshots show native iOS rendering

### Steps (8)

1. Start Expo with the app running in iOS simulator

2. Navigate to any screen (e.g., Command Center)

3. Take a screenshot using:
   - Simulator: `Cmd+S`
   - Or screenshot tool of your choice

4. Examine the screenshot for:
   - Native iOS status bar
   - iOS-specific fonts (San Francisco)
   - iOS-specific shadows and UI elements
   - No web browser chrome
   - No mouse cursor (should have mobile touch targets)

### Expected Result (6)

Screenshot shows native iOS rendering with:

- iOS status bar at top
- Native iOS fonts
- Native iOS UI elements
- No web-like appearance

**Pass/Fail:** ___________

## Test 9: Verify No Web Bundle Created

**Purpose:** Ensure Metro doesn't create unnecessary web bundles

### Steps (9)

1. Start Expo:

   ```bash
   npm run expo:dev
   ```text

1. Check Metro bundler output for any web-related messages

1. Try pressing `w` (for web) in the Expo CLI

### Expected Result (7)

- No web bundle messages in Metro output
- Pressing `w` should do nothing or show "unsupported platform" message
- Only iOS and Android bundles available

**Pass/Fail:** ___________

## Test 10: Build Verification (Optional)

**Purpose:** Verify static build also excludes web

### Steps (10)

1. Run static build:

   ```bash
   npm run expo:static:build
   ```text

1. Check build output directory:

   ```bash
   ls -la static-build/
   ```text

### Expected Result (8)

- Only `ios` and `android` directories created
- No `web` directory
- Build completes successfully

**Pass/Fail:** ___________

## Troubleshooting

### If Test 4 Fails (Expo Won't Start)

1. Clear all caches: `npm run expo:clean`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node version: `node --version` (should be 18+)

### If Test 6 Fails (Changes Don't Appear)

1. Clear cache: `npm run expo:clean`
2. Enable Fast Refresh in Expo Dev Tools
3. Check for syntax errors in the file you changed

### If Test 8 Fails (Still Looks Like Web)

1. Verify metro.config.js exists and has correct content
2. Verify app.json has no "web" section
3. Stop and restart Expo completely
4. Clear cache: `npm run expo:clean`

## Summary

After completing all tests:

**Total Passed:** _____ / 10

### Configuration Status

- [ ] All tests passed - Ready to use
- [ ] Some tests failed - See troubleshooting above
- [ ] Major issues - Contact support

## Expected Behavior After All Tests Pass

1. **Development:** Run `npm run expo:dev` → Opens iOS simulator automatically
2. **Changes:** Edit code → Save → Refresh → Changes appear immediately
3. **Screenshots:** Show native iOS UI, not web
4. **Platform:** App knows it's running on iOS, not web
5. **Performance:** Faster builds (no web bundling)
6. **Caching:** Run `npm run expo:clean` if changes don't appear

## Notes

- These tests assume iOS development. For Android, replace `i` with `a` and iOS simulator with Android emulator.
- Some tests are optional but recommended for thorough verification.
- Document any failures and their solutions for future reference.

## Questions?

See `MOBILE_CONFIGURATION_EXPLANATION.md` for detailed explanations of each fix.
