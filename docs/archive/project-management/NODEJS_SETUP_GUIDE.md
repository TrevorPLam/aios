# Node.js Setup Guide for Diamond-Prime

**Status:** Node.js/npm is not currently in your PATH. Here's how to install it.

---

## Quick Install (Recommended)

### Option 1: Install Node.js Directly (Easiest)

1. **Download Node.js:**
   - Go to https://nodejs.org/
   - Download the **LTS version** (18.x or 20.x)
   - Choose the Windows Installer (.msi)

2. **Install:**
   - Run the installer
   - ✅ Check "Add to PATH" during installation
   - Complete the installation

3. **Restart your terminal** (or PowerShell)

4. **Verify:**
   ```powershell
   node --version
   npm --version
   ```

5. **Run setup:**
   ```powershell
   npm install
   npm run prepare
   ```

---

### Option 2: Use nvm-windows (For Multiple Node Versions)

1. **Install nvm-windows:**
   - Download from: https://github.com/coreybutler/nvm-windows/releases
   - Install `nvm-setup.exe`

2. **Install Node.js 18:**
   ```powershell
   nvm install 18
   nvm use 18
   ```

3. **Verify:**
   ```powershell
   node --version  # Should show v18.x.x
   npm --version
   ```

4. **Run setup:**
   ```powershell
   npm install
   npm run prepare
   ```

---

## After Installing Node.js

Once Node.js is installed and in your PATH, run:

```powershell
# Navigate to project
cd C:\dev\aios

# Install dependencies
npm install

# Initialize Husky
npm run prepare

# Test hooks
git commit -m "test: verify hooks work"
```

---

## Verify Installation

After installing, verify in a **new PowerShell window**:

```powershell
node --version   # Should show v18.x.x or v20.x.x
npm --version    # Should show 9.x.x or 10.x.x
```

If these commands work, you're ready to proceed!

---

## What's Already Done ✅

All the code and configuration is ready:
- ✅ CI jobs added
- ✅ Scripts created
- ✅ Husky hooks configured
- ✅ All config files in place

**You just need Node.js installed to run `npm install`!**

---

## Need Help?

- **Node.js not found after install?** Restart your terminal/PowerShell
- **Still not working?** Check if Node.js is in PATH: `$env:PATH -split ';' | Select-String node`
- **Using nvm?** Make sure to run `nvm use 18` in each new terminal

---

## Alternative: Manual Setup (If npm still doesn't work)

If npm is installed but not in PATH, you can:

1. Find Node.js installation:
   - Usually: `C:\Program Files\nodejs\`
   - Or: `C:\Users\<YourName>\AppData\Roaming\npm\`

2. Add to PATH manually:
   ```powershell
   # Add to user PATH
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\nodejs\", "User")
   ```

3. Restart PowerShell and try again

---

**Once Node.js is installed, come back and I can run the setup commands for you!** 🚀
