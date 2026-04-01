@echo off
echo =======================================================
echo [SYSTEM] Bootstrapping Decentralized Workspace...
echo [SYSTEM] Enforcing Zero-Trust Directory Boundaries...
echo =======================================================

:: 1. EVM State Layer (Smart Contracts & Tests)
mkdir evm_core\contracts
mkdir evm_core\scripts
mkdir evm_core\test

:: 2. Off-Chain Security & Storage Layer
mkdir secure_client\crypto_module
mkdir secure_client\ipfs_bridge
mkdir secure_client\assets

:: 3. Architecture & Documentation
mkdir docs\threat_models

:: 4. Injecting Foundational Files
echo // SPDX-License-Identifier: MIT > evm_core\contracts\DocRegistry.sol
echo // AES-256 Buffer Encryption > secure_client\crypto_module\cipher.js
echo // Content-Addressable Storage Logic > secure_client\ipfs_bridge\pinata_node.js

:: 5. Git Security (CRITICAL)
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo build/ >> .gitignore
echo artifacts/ >> .gitignore
echo cache/ >> .gitignore

:: 6. Project Identifier
echo # Decentralized Verification Engine > README.md
echo **Author:** Maharshi Trivedi (D25DCE167) >> README.md
:: Using the caret ^ to escape the ampersand so Windows prints it instead of executing it
echo **Role:** Security ^& IPFS Implementation >> README.md

echo.
echo [SUCCESS] Structural boundaries mapped.
echo [ACTION] Ready for 'git add .' and push to main.
pause