#!/bin/bash
# ATAK MQTT - Installation Script for Linux/Mac
# This script installs dependencies and provides next steps

echo "========================================"
echo "ATAK MQTT Target System"
echo "Installation Script"
echo "========================================"
echo ""

echo "[1/3] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js installed"
node --version
echo ""

echo "[2/3] Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "✓ Installation Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. Start development server:"
echo "   npm run dev"
echo ""
echo "2. Open in browser:"
echo "   http://localhost:5173"
echo ""
echo "3. Deploy to Vercel:"
echo "   npm install -g vercel"
echo "   vercel"
echo ""
echo "4. Read documentation:"
echo "   README.md         - Full documentation"
echo "   QUICKSTART.md     - 5-minute setup guide"
echo "   DEPLOYMENT_GUIDE.md - Vercel deployment"
echo ""
echo "========================================"
echo ""
