#!/usr/bin/env node

/**
 * Check for react-native-worklets version consistency
 * 
 * This script verifies that the installed version of react-native-worklets
 * matches what's specified in package.json to help diagnose version mismatch errors.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function checkWorkletsVersion() {
  console.log('🔍 Checking react-native-worklets version consistency...\n');

  try {
    // Read package.json
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const expectedVersion = 
      packageJson.dependencies?.['react-native-worklets'] ||
      packageJson.devDependencies?.['react-native-worklets'];

    if (!expectedVersion) {
      console.log('❌ react-native-worklets not found in package.json\n');
      console.log('💡 This package should be listed in dependencies or devDependencies.\n');
      return false;
    }

    console.log(`📦 Expected version (package.json): ${expectedVersion}`);

    // Try to read installed version
    try {
      const installedPackagePath = join(
        rootDir,
        'node_modules',
        'react-native-worklets',
        'package.json'
      );
      const installedPackage = JSON.parse(
        readFileSync(installedPackagePath, 'utf8')
      );
      const installedVersion = installedPackage.version;

      console.log(`📲 Installed version: ${installedVersion}`);

      // Remove version range prefix (^, ~, >=, etc.) for comparison
      // Note: This handles simple version ranges. Complex ranges like ">=1.2.0 <2.0.0"
      // are not expected for react-native-worklets and would require semver parsing.
      const cleanExpectedVersion = expectedVersion.replace(/^[\^~>=<]+/, '');

      if (installedVersion === cleanExpectedVersion) {
        console.log('\n✅ Versions match! Everything looks good.\n');
        console.log('📱 Note: If you still see runtime version mismatch errors,');
        console.log('   the native iOS/Android build may have a cached old version.');
        console.log('   Run: npm run expo:rebuild:ios (or :android)\n');
        return true;
      } else {
        console.log('\n⚠️  Version mismatch detected!\n');
        console.log('This may cause runtime errors like:');
        console.log(
          '  "Mismatch between JavaScript part and native part of Worklets"\n'
        );
        console.log('💡 IMMEDIATE FIX:\n');
        console.log('  npm run expo:clean:native && npm run expo:rebuild:ios\n');
        console.log('📖 For detailed fix guide, see: WORKLETS_FIX_GUIDE.md\n');
        return false;
      }
    } catch (error) {
      console.log('⚠️  node_modules not found or react-native-worklets not installed\n');
      console.log('💡 Run: npm install\n');
      console.log('   Then run this check again: npm run check:worklets\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking versions:', error.message);
    return false;
  }
}

// Check for native build version mismatch warning
console.log('📱 React Native Worklets Version Check\n');
console.log('=' .repeat(50));
console.log('\nℹ️  This script checks if your JavaScript and native builds');
console.log('   have matching worklets versions.\n');
console.log('🚨 Common after: Dependabot updates, branch switches,');
console.log('   dependency version changes\n');
console.log('=' .repeat(50));
console.log();

const result = checkWorkletsVersion();

if (!result) {
  console.log('=' .repeat(50));
  console.log('🔧 QUICK FIX COMMANDS:\n');
  console.log('  Option 1 (Most Common):');
  console.log('  npm run expo:clean:native && npm run expo:rebuild:ios\n');
  console.log('  Option 2 (If Option 1 fails):');
  console.log('  npm run expo:clean:full && npm run expo:rebuild:ios\n');
  console.log('  Option 3 (Nuclear option):');
  console.log('  See WORKLETS_FIX_GUIDE.md for complete manual cleanup\n');
  console.log('=' .repeat(50));
}

process.exit(result ? 0 : 1);
