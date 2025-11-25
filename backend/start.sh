#!/bin/bash
# Backend startup script for WSL/Linux

echo "Starting ChefBuddy Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "Installing dependencies..."
pip install --upgrade -r requirements.txt

# Run the server
echo "Starting FastAPI server on http://localhost:8000"
python main.py
