@echo off
echo ========================================
echo Simple IPFS Document Uploader Demo
echo ========================================
echo.
echo This demo shows how to:
echo 1. Start the server
echo 2. Open the MetaMask uploader
echo 3. Upload documents to IPFS with SHA256
echo.
echo Press any key to continue...
pause > nul

echo.
echo Checking for existing server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found existing process %%a using port 3000, terminating...
    taskkill /PID %%a /F > nul 2>&1
    timeout /t 2 /nobreak > nul
)

echo Starting server...
cd /d "%~dp0secure_client"
start /B npm start

echo.
echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo.
echo Testing server connection...
curl -s http://localhost:3000/ > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Server failed to start. Please check the console output.
    pause
    exit /b 1
)

echo Server is running successfully!
echo.
echo Opening test page in browser...
start http://localhost:3000/test.html

echo Opening uploader in browser...
start http://localhost:3000/index.html

echo.
echo Test pages opened:
echo - Backend Test: http://localhost:3000/test.html
echo - MetaMask Uploader: http://localhost:3000/index.html
echo.
echo First, use the test page to verify backend functionality.
echo Then, use the uploader for MetaMask integration.
echo.
echo To test MetaMask connection:
echo 1. Make sure MetaMask is installed and unlocked
echo 2. Click "Connect MetaMask"
echo 3. Or click "Test Connection" to verify
echo 4. Then upload a file
echo.
pause