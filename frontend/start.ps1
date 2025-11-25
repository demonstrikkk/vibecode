# Frontend startup script for Windows PowerShell

Write-Host "Starting ChefBuddy Frontend..." -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start development server
Write-Host "Starting Vite dev server on http://localhost:5173" -ForegroundColor Cyan
npm run dev
