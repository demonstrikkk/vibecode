# Backend startup script for Windows PowerShell

Write-Host "Starting ChefBuddy Backend..." -ForegroundColor Green

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Green
.\venv\Scripts\Activate.ps1

# Install/upgrade dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install --upgrade -r requirements.txt

# Run the server
Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Cyan
python main.py
