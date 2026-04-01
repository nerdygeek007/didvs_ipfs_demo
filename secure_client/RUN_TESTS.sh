#!/bin/bash

# ============================================
# TEST RUNNER: Zero-Trust Architecture Suite
# ============================================

set -e

echo ""
echo "=================================================="
echo "  ZERO-TRUST SYSTEM COMPREHENSIVE TEST SUITE"
echo "=================================================="
echo ""

cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    exit 1
fi

echo "[INFO] Node.js version:"
node --version
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "=================================================="
echo "  RUNNING UNIT TESTS: Cryptographic Functions"
echo "=================================================="
echo ""

npm run test:unit
if [ $? -ne 0 ]; then
    echo "[ERROR] Unit tests failed"
    exit 1
fi

echo ""
echo "=================================================="
echo "  RUNNING INTEGRATION TESTS: Full Pipeline"
echo "=================================================="
echo ""

npm run test:integration
if [ $? -ne 0 ]; then
    echo "[ERROR] Integration tests failed"
    exit 1
fi

echo ""
echo "=================================================="
echo "  RUNNING FULL TEST SUITE WITH COVERAGE"
echo "=================================================="
echo ""

npm test
if [ $? -ne 0 ]; then
    echo "[ERROR] Full test suite failed"
    exit 1
fi

echo ""
echo "=================================================="
echo "  TEST SUMMARY"
echo "=================================================="
echo ""
echo "[SUCCESS] All tests passed!"
echo "[INFO] Coverage report generated in ./coverage/"
echo ""
echo "Next Steps:"
echo "  1. Review coverage report (open ./coverage/lcov-report/index.html)"
echo "  2. Validate Vercel deployment (vercel --prod)"
echo "  3. Check Pinata credentials in .env"
echo ""
echo "=================================================="
echo ""
