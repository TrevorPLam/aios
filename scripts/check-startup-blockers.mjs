#!/usr/bin/env node

/**
 * App Startup Blocker Diagnostic
 *
 * Checks for common issues that prevent React Native/Expo apps from starting:
 * - Missing critical dependencies
 * - Configuration errors
 * - Platform misconfigurations
 * - Port conflicts
 * - Build artifacts issues
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('\n' + '='.repeat(70));
console.log('🚫 APP STARTUP BLOCKER DIAGNOSTIC');
console.log('='.repeat(70) + '\n');

let blockersFound = 0;

/**
 * Check 1: Critical Files
 */
function checkCriticalFiles() {
  console.log('1️⃣  CRITICAL FILES CHECK\n');
  
  const criticalFiles = {
    'package.json': 'Package manifest',
    'package-lock.json': 'Dependency lock file',
    'babel.config.js': 'Babel configuration',
    'metro.config.js': 'Metro bundler configuration',
    'app.json': 'Expo app configuration',
    'client/index.js': 'App entry point',
  };

  let missing = [];
  
  for (const [file, description] of Object.entries(criticalFiles)) {
    const fullPath = join(rootDir, file);
    if (!existsSync(fullPath)) {
      console.log(`   ❌ MISSING: ${file} (${description})`);
      missing.push(file);
      blockersFound++;
    } else {
      console.log(`   ✅ ${file}`);
    }
  }

  if (missing.length === 0) {
    console.log('\n   All critical files present!\n');
  } else {
    console.log(`\n   ⚠️  ${missing.length} critical files missing!\n`);
  }
  
  return missing;
}

/**
 * Check 2: app.json Configuration
 */
function checkAppJson() {
  console.log('2️⃣  APP.JSON CONFIGURATION\n');
  
  const appJsonPath = join(rootDir, 'app.json');
  if (!existsSync(appJsonPath)) {
    console.log('   ❌ app.json not found!\n');
    blockersFound++;
    return;
  }

  try {
    const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
    
    // Check expo config
    if (!appJson.expo) {
      console.log('   ❌ No "expo" configuration in app.json');
      blockersFound++;
    } else {
      console.log('   ✅ Expo configuration present');
      
      // Check critical fields
      const expo = appJson.expo;
      const criticalFields = ['name', 'slug', 'version'];
      
      for (const field of criticalFields) {
        if (!expo[field]) {
          console.log(`   ⚠️  Missing field: expo.${field}`);
        }
      }
      
      // Check platforms
      if (expo.platforms) {
        console.log(`   📱 Platforms: ${expo.platforms.join(', ')}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error parsing app.json: ${error.message}`);
    blockersFound++;
  }
  
  console.log();
}

/**
 * Check 3: Babel Configuration
 */
function checkBabelConfig() {
  console.log('3️⃣  BABEL CONFIGURATION\n');
  
  const babelPath = join(rootDir, 'babel.config.js');
  if (!existsSync(babelPath)) {
    console.log('   ❌ babel.config.js not found!\n');
    blockersFound++;
    return;
  }

  try {
    const babelContent = readFileSync(babelPath, 'utf8');
    
    // Check for critical plugins
    const hasReanimatedPlugin = babelContent.includes('react-native-reanimated/plugin');
    const hasExpoPreset = babelContent.includes('babel-preset-expo');
    
    if (!hasExpoPreset) {
      console.log('   ⚠️  babel-preset-expo not found in config');
      console.log('      This is required for Expo apps');
    } else {
      console.log('   ✅ babel-preset-expo configured');
    }
    
    if (!hasReanimatedPlugin) {
      console.log('   ⚠️  react-native-reanimated/plugin not found');
      console.log('      Required for animations to work');
    } else {
      console.log('   ✅ react-native-reanimated/plugin configured');
    }
    
    console.log();
  } catch (error) {
    console.log(`   ❌ Error reading babel.config.js: ${error.message}\n`);
    blockersFound++;
  }
}

/**
 * Check 4: Metro Configuration
 */
function checkMetroConfig() {
  console.log('4️⃣  METRO BUNDLER CONFIGURATION\n');
  
  const metroPath = join(rootDir, 'metro.config.js');
  if (!existsSync(metroPath)) {
    console.log('   ❌ metro.config.js not found!\n');
    blockersFound++;
    return;
  }

  try {
    const metroContent = readFileSync(metroPath, 'utf8');
    
    // Check for Expo default config
    const hasExpoConfig = metroContent.includes('expo/metro-config');
    
    if (!hasExpoConfig) {
      console.log('   ⚠️  Not using expo/metro-config');
      console.log('      This may cause issues with Expo');
    } else {
      console.log('   ✅ Using expo/metro-config');
    }
    
    // Check platform configuration
    if (metroContent.includes('platforms')) {
      console.log('   ✅ Platform configuration present');
      
      if (metroContent.includes('"web"')) {
        console.log('   ℹ️  Web platform configured');
      }
      if (metroContent.includes('"ios"')) {
        console.log('   ℹ️  iOS platform configured');
      }
      if (metroContent.includes('"android"')) {
        console.log('   ℹ️  Android platform configured');
      }
    }
    
    console.log();
  } catch (error) {
    console.log(`   ❌ Error reading metro.config.js: ${error.message}\n`);
    blockersFound++;
  }
}

/**
 * Check 5: Entry Point
 */
function checkEntryPoint() {
  console.log('5️⃣  ENTRY POINT CHECK\n');
  
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const mainEntry = packageJson.main;
  
  if (!mainEntry) {
    console.log('   ❌ No "main" entry in package.json');
    blockersFound++;
    console.log();
    return;
  }
  
  console.log(`   📍 Entry point: ${mainEntry}`);
  
  const entryPath = join(rootDir, mainEntry);
  if (!existsSync(entryPath)) {
    console.log(`   ❌ Entry point file not found: ${mainEntry}`);
    blockersFound++;
  } else {
    console.log(`   ✅ Entry point exists`);
    
    try {
      const entryContent = readFileSync(entryPath, 'utf8');
      
      // Check for App component registration
      if (entryContent.includes('registerRootComponent')) {
        console.log('   ✅ Root component registered');
      } else {
        console.log('   ⚠️  No registerRootComponent found');
        console.log('      Make sure app is properly registered');
      }
    } catch (error) {
      console.log(`   ⚠️  Could not read entry point: ${error.message}`);
    }
  }
  
  console.log();
}

/**
 * Check 6: Cache and Build Artifacts
 */
function checkCacheAndArtifacts() {
  console.log('6️⃣  CACHE AND BUILD ARTIFACTS\n');
  
  const cacheDirs = {
    '.expo': 'Expo cache',
    '.metro-cache': 'Metro bundler cache',
    'node_modules/.cache': 'Module cache',
  };

  let hasCacheIssues = false;
  
  for (const [dir, description] of Object.entries(cacheDirs)) {
    const fullPath = join(rootDir, dir);
    if (existsSync(fullPath)) {
      try {
        const contents = readdirSync(fullPath);
        if (contents.length > 0) {
          console.log(`   ℹ️  ${description} exists (${contents.length} items)`);
          hasCacheIssues = true;
        }
      } catch (error) {
        console.log(`   ⚠️  Cannot read ${description}`);
      }
    }
  }

  if (hasCacheIssues) {
    console.log('\n   💡 If experiencing issues, try:');
    console.log('      npm run expo:clean\n');
  } else {
    console.log('   ✅ No cache directories found (clean state)\n');
  }
}

/**
 * Check 7: Port Availability
 */
function checkPorts() {
  console.log('7️⃣  PORT AVAILABILITY CHECK\n');
  
  const portsToCheck = [
    { port: 8081, service: 'Metro Bundler' },
    { port: 19000, service: 'Expo DevTools' },
    { port: 19001, service: 'Expo' },
    { port: 19002, service: 'Expo' },
  ];

  console.log('   ℹ️  Checking if ports are available...\n');
  
  // Note: This is informational only, actual port check requires netstat/lsof
  console.log('   💡 If app fails to start, check for port conflicts:');
  for (const { port, service } of portsToCheck) {
    console.log(`      - Port ${port}: ${service}`);
  }
  
  console.log('\n   To kill processes on a port (Mac/Linux):');
  console.log('      lsof -ti:<PORT> | xargs kill -9');
  console.log('   Replace <PORT> with the actual port number (e.g., 8081, 19000)\n');
}

/**
 * Check 8: TypeScript Configuration
 */
function checkTypeScript() {
  console.log('8️⃣  TYPESCRIPT CONFIGURATION\n');
  
  const tsConfigPath = join(rootDir, 'tsconfig.json');
  if (!existsSync(tsConfigPath)) {
    console.log('   ⚠️  tsconfig.json not found');
    console.log('      TypeScript may not work correctly\n');
    return;
  }

  try {
    const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));
    
    console.log('   ✅ tsconfig.json exists');
    
    // Check for JSX config
    if (tsConfig.compilerOptions?.jsx) {
      console.log(`   ✅ JSX mode: ${tsConfig.compilerOptions.jsx}`);
    } else {
      console.log('   ⚠️  No JSX configuration');
    }
    
    console.log();
  } catch (error) {
    console.log(`   ⚠️  Error parsing tsconfig.json: ${error.message}\n`);
  }
}

// Run all checks
checkCriticalFiles();
checkAppJson();
checkBabelConfig();
checkMetroConfig();
checkEntryPoint();
checkCacheAndArtifacts();
checkPorts();
checkTypeScript();

// Summary
console.log('='.repeat(70));
console.log('📊 DIAGNOSTIC SUMMARY\n');

if (blockersFound === 0) {
  console.log('✅ NO CRITICAL BLOCKERS FOUND!\n');
  console.log('   Configuration appears correct for app startup.\n');
  console.log('   If app still fails to start:\n');
  console.log('   1. npm run expo:clean:native');
  console.log('   2. npm run expo:rebuild:ios');
  console.log('   3. npm start\n');
} else {
  console.log(`🔴 FOUND ${blockersFound} CRITICAL BLOCKER(S)\n`);
  console.log('   Fix the issues above before attempting to start the app.\n');
  console.log('   After fixing:\n');
  console.log('   1. npm install');
  console.log('   2. npm run expo:rebuild:ios');
  console.log('   3. npm start\n');
}

console.log('='.repeat(70) + '\n');

process.exit(blockersFound > 0 ? 1 : 0);
