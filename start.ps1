# MDLAB Direct - Quick Start Script
# This script helps you start all services easily

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MDLAB Direct - Quick Start Menu" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start ALL (Backend + Web + Mobile)" -ForegroundColor Green
Write-Host "2. Start Backend + Web Dashboard" -ForegroundColor Green
Write-Host "3. Start Backend + Mobile App" -ForegroundColor Green
Write-Host "4. Start Backend Only" -ForegroundColor Yellow
Write-Host "5. Start Web Dashboard Only" -ForegroundColor Yellow
Write-Host "6. Start Mobile App Only" -ForegroundColor Yellow
Write-Host "7. Install All Dependencies" -ForegroundColor Magenta
Write-Host "8. Exit" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Enter your choice (1-8)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting ALL services..." -ForegroundColor Cyan
        Write-Host "Opening 3 terminal windows..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; npm start"
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Starting Web Dashboard...' -ForegroundColor Green; npm run dev"
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\mobile'; Write-Host 'Starting Mobile App...' -ForegroundColor Green; npm start"
        Write-Host "`n✅ All services started!" -ForegroundColor Green
        Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "Web: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "Mobile: Check Expo DevTools" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "`nStarting Backend + Web Dashboard..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; npm start"
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Starting Web Dashboard...' -ForegroundColor Green; npm run dev"
        Write-Host "`n✅ Backend + Web started!" -ForegroundColor Green
    }
    "3" {
        Write-Host "`nStarting Backend + Mobile App..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Starting Backend Server...' -ForegroundColor Green; npm start"
        Start-Sleep -Seconds 2
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\mobile'; Write-Host 'Starting Mobile App...' -ForegroundColor Green; npm start"
        Write-Host "`n✅ Backend + Mobile started!" -ForegroundColor Green
    }
    "4" {
        Write-Host "`nStarting Backend Only..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\backend"
        npm start
    }
    "5" {
        Write-Host "`nStarting Web Dashboard Only..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\frontend"
        npm run dev
    }
    "6" {
        Write-Host "`nStarting Mobile App Only..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\mobile"
        npm start
    }
    "7" {
        Write-Host "`nInstalling dependencies for all projects..." -ForegroundColor Cyan
        Write-Host "This may take a few minutes..." -ForegroundColor Yellow
        Write-Host "`nInstalling Backend dependencies..." -ForegroundColor Green
        Set-Location "$PSScriptRoot\backend"
        npm install
        Write-Host "`nInstalling Frontend dependencies..." -ForegroundColor Green
        Set-Location "$PSScriptRoot\frontend"
        npm install
        Write-Host "`nInstalling Mobile dependencies..." -ForegroundColor Green
        Set-Location "$PSScriptRoot\mobile"
        npm install
        Set-Location $PSScriptRoot
        Write-Host "`n✅ All dependencies installed!" -ForegroundColor Green
    }
    "8" {
        Write-Host "`nGoodbye! 👋" -ForegroundColor Cyan
        exit
    }
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
