#!/bin/bash
# Vercel Deployment Checklist
# Run this script to validate your setup before deploying

echo "╔════════════════════════════════════════════════╗"
echo "║   VERCEL DEPLOYMENT READINESS CHECKLIST       ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check 1: Node.js installed
echo "[1/7] Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not installed. Visit: https://nodejs.org"
    exit 1
fi

# Check 2: npm dependencies
echo ""
echo "[2/7] Checking npm packages..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "⚠️  Running npm install..."
    npm install
fi

# Check 3: .env file
echo ""
echo "[3/7] Checking .env configuration..."
if [ -f ".env" ]; then
    if grep -q "PINATA_JWT" .env; then
        echo "✅ .env file exists with PINATA_JWT"
    else
        echo "❌ PINATA_JWT not configured in .env"
        exit 1
    fi
else
    echo "❌ .env file not found. Create from .env.example:"
    echo "   cp .env.example .env"
    exit 1
fi

# Check 4: core_engine.js
echo ""
echo "[4/7] Checking core_engine.js..."
if [ -f "core_engine.js" ]; then
    if grep -q "express" core_engine.js; then
        echo "✅ core_engine.js is configured as Express app"
    else
        echo "❌ core_engine.js is missing Express configuration"
        exit 1
    fi
else
    echo "❌ core_engine.js not found"
    exit 1
fi

# Check 5: vercel.json
echo ""
echo "[5/7] Checking vercel.json..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json exists"
else
    echo "⚠️  vercel.json not found (will be created during deployment)"
fi

# Check 6: API entry point
echo ""
echo "[6/7] Checking API entry point..."
if [ -f "api/index.js" ]; then
    echo "✅ api/index.js exists for Vercel Functions"
else
    echo "❌ api/index.js not found"
    exit 1
fi

# Check 7: Test server startup
echo ""
echo "[7/7] Testing server startup..."
TIMEOUT=5
timeout $TIMEOUT node core_engine.js &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server starts successfully"
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
else
    echo "❌ Server failed to start"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  ✅ ALL CHECKS PASSED - READY FOR VERCEL!    ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy: vercel --prod"
echo "3. Monitor: vercel logs <project-name>"
echo ""
