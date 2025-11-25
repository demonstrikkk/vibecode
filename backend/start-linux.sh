#!/bin/bash
# Backend startup script for Linux/WSL

echo "🚀 Starting ChefBuddy Backend..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10 or higher."
    exit 1
fi

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with required variables:"
    echo "  OPENROUTER_API_KEY=your_key_here"
    echo "  SECRET_KEY=your_secret_key"
    echo "  USE_MONGODB=false"
    exit 1
fi
echo "✓ .env file found"

# Check if required packages are installed
echo ""
echo "Checking dependencies..."
python3 -c "import fastapi, uvicorn, jose, passlib" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Some dependencies are missing. Installing..."
    pip3 install -r requirements.txt --quiet
    if [ $? -eq 0 ]; then
        echo "✓ Dependencies installed"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✓ All dependencies installed"
fi

# Start the server
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Backend server starting on port 8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 main.py
