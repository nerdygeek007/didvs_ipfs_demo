@echo off
REM Simple IPFS Document Uploader - Local Run Script

echo ========================================
echo Simple IPFS Document Uploader
echo ========================================
echo.

cd /d "%~dp0secure_client"

IF NOT EXIST package.json (
  echo [ERROR] package.json not found in secure_client folder.
  EXIT /B 1
)

echo Checking for existing server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Found existing process %%a using port 3000, terminating...
    taskkill /PID %%a /F > nul 2>&1
    timeout /t 2 /nobreak > nul
)

echo Installing dependencies...
npm install

echo.
echo Starting server on http://localhost:3000
echo.
echo To use the uploader:
echo 1. Open index.html in your browser
echo 2. Connect MetaMask
echo 3. Upload a document
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
