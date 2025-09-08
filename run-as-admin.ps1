# Run this in PowerShell as Administrator

# Navigate to project directory
cd "E:\VS Code\Arthasva\Shree Dattaguru Roadlines\changes\shreeDattaguruRoadlines"

# Run the electron build
npm run electron-build

# This should work because admin permissions will:
# 1. Allow access to Visual Studio Build Tools
# 2. Bypass permission issues with native modules
# 3. Allow writing to system directories if needed
