@echo off
REM ATAK MQTT - Installation Script for Windows
REM This script installs dependencies and provides next steps

echo ========================================
echo ATAK MQTT Target System
echo Installation Script
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js installed
node --version
echo.

echo [2/3] Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ Installation Complete!
echo ========================================
echo.
echo Next Steps:
echo.
echo 1. Start development server:
echo    npm run dev
echo.
echo 2. Open in browser:
echo    http://localhost:5173
echo.
echo 3. Deploy to Vercel:
echo    npm install -g vercel
echo    vercel
echo.
echo 4. Read documentation:
echo    README.md         - Full documentation
echo    QUICKSTART.md     - 5-minute setup guide
echo    DEPLOYMENT_GUIDE.md - Vercel deployment
echo.
echo ========================================
echo.
pause
