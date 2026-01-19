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
        return true;
      } else {
        console.log('\n⚠️  Version mismatch detected!\n');
        console.log('This may cause runtime errors like:');
        console.log(
          '  "Mismatch between JavaScript part and native part of Worklets"\n'
        );
        console.log('💡 Recommended fix:\n');
        console.log('  1. Clean caches: npm run expo:clean:native');
        console.log('  2. Rebuild native: npm run expo:rebuild:ios\n');
        return false;
      }
    } catch (error) {
      console.log('⚠️  node_modules not found or react-native-worklets not installed\n');
      console.log('💡 Run: npm install\n');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking versions:', error.message);
    return false;
  }
}

// Check for native build version mismatch warning
console.log('📱 Native Build Check:');
console.log(
  'If you see runtime errors about version mismatch, the native iOS/Android'
);
console.log('build may have a cached old version.\n');
console.log('Solution:');
console.log('  • For development builds: npm run expo:rebuild:ios');
console.log('  • For Expo Go: npm run expo:clean:native && npx expo start --clear\n');
console.log('---\n');

const result = checkWorkletsVersion();

process.exit(result ? 0 : 1);
