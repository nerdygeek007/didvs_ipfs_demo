@echo off
REM ============================================
REM TEST RUNNER: Zero-Trust Architecture Suite
REM ============================================

echo.
echo ==================================================
echo  ZERO-TRUST SYSTEM COMPREHENSIVE TEST SUITE
echo ==================================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
)

echo.
echo ==================================================
echo  RUNNING UNIT TESTS: Cryptographic Functions
echo ==================================================
echo.

call npm run test:unit
if errorlevel 1 (
    echo [ERROR] Unit tests failed
    exit /b 1
)

echo.
echo ==================================================
echo  RUNNING INTEGRATION TESTS: Full Pipeline
echo ==================================================
echo.

call npm run test:integration
if errorlevel 1 (
    echo [ERROR] Integration tests failed
    exit /b 1
)

echo.
echo ==================================================
echo  RUNNING FULL TEST SUITE WITH COVERAGE
echo ==================================================
echo.

call npm test
if errorlevel 1 (
    echo [ERROR] Full test suite failed
    exit /b 1
)

echo.
echo ==================================================
echo  TEST SUMMARY
echo ==================================================
echo.
echo [SUCCESS] All tests passed!
echo [INFO] Coverage report generated in ./coverage/
echo.
echo Next Steps:
echo   1. Review coverage report (open ./coverage/lcov-report/index.html)
echo   2. Validate Vercel deployment (vercel --prod)
echo   3. Check Pinata credentials in .env
echo.
echo ==================================================

pause
