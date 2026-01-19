#!/usr/bin/env node

/**
 * Post-install check script
 * 
 * Runs after npm install to check for common issues and provide helpful guidance.
 * This is especially useful after Dependabot updates or branch switches.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('\n' + '='.repeat(60));
console.log('📦 Post-Install Checks');
console.log('='.repeat(60) + '\n');

// Check 1: Worklets version consistency
function checkWorklets() {
  try {
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const expectedVersion = 
      packageJson.dependencies?.['react-native-worklets'] ||
      packageJson.devDependencies?.['react-native-worklets'];

    if (!expectedVersion) {
      return true; // Not using worklets - no issue
    }

    const installedPackagePath = join(
      rootDir,
      'node_modules',
      'react-native-worklets',
      'package.json'
    );

    if (!existsSync(installedPackagePath)) {
      console.log('⚠️  react-native-worklets not found in node_modules');
      return false; // Package expected but not found
    }

    const installedPackage = JSON.parse(
      readFileSync(installedPackagePath, 'utf8')
    );
    const installedVersion = installedPackage.version;
    const cleanExpectedVersion = expectedVersion.replace(/^[\^~>=<]+/, '');

    if (installedVersion !== cleanExpectedVersion) {
      console.log('🚨 IMPORTANT: Worklets version mismatch detected!\n');
      console.log(`   Expected: ${expectedVersion}`);
      console.log(`   Installed: ${installedVersion}\n`);
      console.log('   This may cause runtime errors in your app.\n');
      console.log('   🔧 Quick Fix:');
      console.log('   npm run expo:clean:native && npm run expo:rebuild:ios\n');
      console.log('   📖 See WORKLETS_FIX_GUIDE.md for details\n');
      return false;
    } else {
      console.log('✅ Worklets version: OK (' + installedVersion + ')');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Could not check worklets version:', error.message);
    return true; // Don't block on check errors
  }
}

// Run checks
const workletsOk = checkWorklets();

console.log('\n' + '='.repeat(60));
console.log('📱 Native Build Reminder:');
console.log('='.repeat(60));
console.log('\nIf you just updated dependencies (especially Dependabot updates):');
console.log('  • Always rebuild native iOS/Android after animation library updates');
console.log('  • Run: npm run expo:rebuild:ios (or :android)\n');

if (!workletsOk) {
  console.log('⚠️  ACTION REQUIRED: Fix the worklets version mismatch above!\n');
}

console.log('ℹ️  To check worklets version anytime: npm run check:worklets\n');
console.log('='.repeat(60) + '\n');
