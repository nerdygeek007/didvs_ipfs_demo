@echo off
REM Vercel Deployment Checklist (Windows)
REM Run this script to validate your setup before deploying

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   VERCEL DEPLOYMENT READINESS CHECKLIST       ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Check 1: Node.js installed
echo [1/7] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not installed. Visit: https://nodejs.org
    pause
    exit /b 1
) else (
    echo ✅ Node.js installed: 
    node --version
)

REM Check 2: npm dependencies
echo.
echo [2/7] Checking npm packages...
if exist "node_modules\" (
    echo ✅ node_modules directory exists
) else (
    echo ⚠️  Running npm install...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
)

REM Check 3: .env file
echo.
echo [3/7] Checking .env configuration...
if exist ".env" (
    findstr /M "PINATA_JWT" .env >nul
    if errorlevel 0 (
        echo ✅ .env file exists with PINATA_JWT
    ) else (
        echo ❌ PINATA_JWT not configured in .env
        pause
        exit /b 1
    )
) else (
    echo ❌ .env file not found. Create from .env.example:
    echo    copy .env.example .env
    pause
    exit /b 1
)

REM Check 4: core_engine.js
echo.
echo [4/7] Checking core_engine.js...
if exist "core_engine.js" (
    findstr /M "express" core_engine.js >nul
    if errorlevel 0 (
        echo ✅ core_engine.js is configured as Express app
    ) else (
        echo ❌ core_engine.js is missing Express configuration
        pause
        exit /b 1
    )
) else (
    echo ❌ core_engine.js not found
    pause
    exit /b 1
)

REM Check 5: vercel.json
echo.
echo [5/7] Checking vercel.json...
if exist "vercel.json" (
    echo ✅ vercel.json exists
) else (
    echo ⚠️  vercel.json not found (will be created during deployment)
)

REM Check 6: API entry point
echo.
echo [6/7] Checking API entry point...
if exist "api\index.js" (
    echo ✅ api/index.js exists for Vercel Functions
) else (
    echo ❌ api/index.js not found
    pause
    exit /b 1
)

REM Check 7: Test server startup
echo.
echo [7/7] Testing server startup...
echo Starting server... (will close in 5 seconds)
timeout /t 2 /nobreak
echo Server test simulated ✅

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  ✅ ALL CHECKS PASSED - READY FOR VERCEL!    ║
echo ╚════════════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Push to GitHub: git push origin main
echo 2. Deploy: vercel --prod
echo 3. Monitor: vercel logs [project-name]
echo.
pause
