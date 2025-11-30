#!/bin/bash

echo "========================================"
echo "  OpenYellow - Starting Server"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed!"
    echo ""
    echo "Please install Node.js:"
    echo "  - Ubuntu/Debian: sudo apt install nodejs"
    echo "  - macOS: brew install node"
    echo "  - Or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

echo "Starting server..."
echo ""

# Change to script directory
cd "$(dirname "$0")"

node server.js
