Write-Host "========================================" -ForegroundColor Green
Write-Host "Pack-App Setup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing server dependencies" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing client dependencies" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. Start the server: cd server; npm start" -ForegroundColor White
Write-Host "2. Start the client: cd client; npm start" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue" 