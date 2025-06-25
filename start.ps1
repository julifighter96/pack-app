Write-Host "========================================" -ForegroundColor Green
Write-Host "Starting Pack-App" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Starting server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm start" -WindowStyle Normal

Write-Host "Waiting for server to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Starting client..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Pack-App is starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Client: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both windows will open automatically." -ForegroundColor White
Write-Host "Close the windows to stop the applications." -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue" 