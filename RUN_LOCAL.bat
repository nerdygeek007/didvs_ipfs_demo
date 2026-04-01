@echo off
REM RUN_LOCAL.bat - Start the secure_client server locally from project root

SETLOCAL

echo Starting local run for didvs_ipfs_demo...
cd /d "%~dp0\secure_client"

IF NOT EXIST package.json (
  echo [ERROR] package.json not found in secure_client folder.
  EXIT /B 1
)

echo Installing dependencies if needed...
npm install

REM Set environment variables (use your actual values for PINATA_JWT)
set NODE_ENV=development
set GATEWAY_URL=https://gateway.pinata.cloud
set PINATA_JWT=<YOUR_PINATA_JWT>

echo To run with your secrets, update RUN_LOCAL.bat or run commands manually:
echo set PINATA_JWT=YOUR_REAL_PINATA_JWT

echo Starting app...
npm run dev

ENDLOCAL
