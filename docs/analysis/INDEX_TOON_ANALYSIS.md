# INDEX.toon Files Analysis

**Date:** 2026-01-25  
**Purpose:** Analyze all INDEX.toon files to ensure proper scoping

## Analysis Criteria

1. **Root INDEX.toon** should contain:
   - All files in root directory
   - All subdirectories (including `.repo`, `.github`, `.husky` if they exist)
   - Quick navigation to major applications and packages
   - Most comprehensive information

2. **Subdirectory INDEX.toon files** should contain:
   - Only files within their directory
   - Only subdirectories within their directory
   - No information about parent or sibling directories

## Issues Found

### 1. Root INDEX.toon Missing Directories

**Current state:**
- Lists 7 subfolders: apps, assets, attached_assets, docs, frontend, packages, scripts
- Missing: `.repo`, `.github`, `.husky`, `.vscode` (if exists)

**Expected:**
- Should include all directories, including hidden ones that are important (`.repo`, `.github`, `.husky`)

**Impact:**
- Agents cannot discover `.repo` directory from root index
- Important governance files not discoverable through index navigation

### 2. Generation Script Filters Out Dot-Directories

**Issue in `scripts/generate-index-json.mjs`:**
```javascript
function shouldIncludeDir(dirName) {
  return !dirName.startsWith(".") && !IGNORE_DIRS.has(dirName);
}
```

This filters out ALL directories starting with `.`, including important ones like:
- `.repo` (governance files)
- `.github` (CI/CD workflows)
- `.husky` (git hooks)
- `.vscode` (IDE settings)

**Fix needed:**
- Allow specific dot-directories that are important
- Add `.repo`, `.github`, `.husky` to allowed list

### 3. Subdirectory INDEX.toon Files - Verification Needed

**Checked:**
- `apps/INDEX.toon` - ✅ Correct (only lists api, mobile, web subdirectories)
- `apps/api/INDEX.toon` - ✅ Correct (only lists files and subdirs in apps/api/)
- `apps/mobile/INDEX.toon` - ✅ Correct (only lists files and subdirs in apps/mobile/)
- `packages/INDEX.toon` - ✅ Correct (only lists packages subdirectories)
- `scripts/INDEX.toon` - ✅ Correct (only lists scripts files and subdirectories)
- `docs/INDEX.toon` - ✅ Correct (only lists docs subdirectories)

**Conclusion:** Subdirectory INDEX.toon files are properly scoped ✅

## Recommendations

1. **Update `shouldIncludeDir` function** to allow important dot-directories:
   ```javascript
   const ALLOWED_DOT_DIRS = new Set([".repo", ".github", ".husky", ".vscode"]);
   
   function shouldIncludeDir(dirName) {
     if (dirName.startsWith(".")) {
       return ALLOWED_DOT_DIRS.has(dirName);
     }
     return !IGNORE_DIRS.has(dirName);
   }
   ```

2. **Regenerate root INDEX.toon** to include `.repo` and other important directories

3. **Add `.repo` to INDEX_DIRECTORIES** list if it should have its own INDEX.toon

4. **Document scope rules** in generation script comments

## Files to Update

1. `scripts/generate-index-json.mjs` - Fix `shouldIncludeDir` function
2. `INDEX.toon` - Regenerate to include missing directories
3. Consider adding `.repo/INDEX.toon` if `.repo` directory should have its own index
