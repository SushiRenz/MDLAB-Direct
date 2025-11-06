# PowerShell script to start the MDLAB Direct backend server
# Usage: Right-click this file and select "Run with PowerShell"

Write-Host "🚀 Starting MDLAB Direct Backend Server..." -ForegroundColor Green
Write-Host ""

$backendPath = "C:\Users\renz0\OneDrive\Desktop\MDLAB Direct"

# Check if backend directory exists
if (Test-Path $backendPath) {
    Write-Host "✅ Found backend directory: $backendPath" -ForegroundColor Green
    
    # Change to backend directory
    Set-Location $backendPath
    
    # Check if package.json exists
    if (Test-Path "package.json") {
        Write-Host "✅ Found package.json" -ForegroundColor Green
        
        # Install dependencies if node_modules doesn't exist
        if (-not (Test-Path "node_modules")) {
            Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Start the server
        Write-Host "🌟 Starting server on port 5000..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        
        npm start
    } else {
        Write-Host "❌ No package.json found in backend directory" -ForegroundColor Red
        Write-Host "Please ensure the backend project is properly set up" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    Write-Host "Please check the path or ensure the MDLAB Direct backend is downloaded" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")