# 🚀 Quick Setup Guide

Since npm is not available in the current environment, here are your options:

## Option 1: Run the Setup Script (Recommended)

### Windows PowerShell:
```powershell
.\setup-diamond.ps1
```

### Windows Command Prompt:
```cmd
setup-diamond.bat
```

The script will:
1. Check if npm is available
2. Install dependencies
3. Initialize Husky
4. Verify setup

---

## Option 2: Manual Setup

If the script doesn't work, run these commands manually:

```bash
# 1. Install dependencies
npm install

# 2. Install Python dependencies (for automation scripts)
pip install -r .repo/automation/scripts/requirements.txt

# 3. Install pre-commit framework (if not already installed)
pip install pre-commit

# 4. Install pre-commit hooks
pre-commit install

# 5. Initialize Husky
npm run prepare

# 6. Test hooks
git commit -m "test: verify hooks work"
```

---

## Option 3: If npm is Not in PATH

### Install Node.js:
1. Download from https://nodejs.org/ (LTS version 18+)
2. Install with default settings
3. Restart your terminal
4. Run the setup script again

### Or Use nvm-windows:
```bash
# Install nvm-windows from https://github.com/coreybutler/nvm-windows
nvm install 18
nvm use 18
npm install
npm run prepare
```

---

## Verification

After running setup, verify:

```bash
# Check Husky is installed
ls .husky/

# Test commit message (should fail)
git commit -m "invalid format"

# Test commit message (should pass)
git commit -m "test: valid format"
```

---

## What's Already Done ✅

- ✅ All CI jobs added to `.github/workflows/ci.yml`
- ✅ All scripts created
- ✅ All configuration files created
- ✅ Husky hooks created
- ✅ Documentation complete

**You just need to run `npm install` and `npm run prepare`!**

---

## Need Help?

- See `SETUP_INSTRUCTIONS.md` for detailed guide
- See `EXECUTION_COMPLETE.md` (in this archive directory) for what's been done
- Check GitHub Actions logs after your next PR
