@echo off
echo =======================================================
echo [SYSTEM] Injecting Dependency Tree ^& Env Schema...
echo =======================================================

:: 1. Generate Environment Schema (Safe to push to Git)
echo PINATA_JWT="insert_jwt_here" > secure_client\.env.example
echo GATEWAY_URL="https://gateway.pinata.cloud/ipfs/" >> secure_client\.env.example

:: 2. Generate Dependency Definition
echo { > secure_client\package.json
echo   "name": "secure_client_module", >> secure_client\package.json
echo   "version": "1.0.0", >> secure_client\package.json
echo   "description": "Zero-Trust IPFS and Crypto Engine", >> secure_client\package.json
echo   "main": "core_engine.js", >> secure_client\package.json
echo   "dependencies": { >> secure_client\package.json
echo     "dotenv": "^16.4.5", >> secure_client\package.json
echo     "pinata": "^1.0.0" >> secure_client\package.json
echo   } >> secure_client\package.json
echo } >> secure_client\package.json

echo.
echo [SUCCESS] .env.example and package.json injected.
echo [ACTION] Your teammates can now run 'npm install' inside \secure_client.
pause