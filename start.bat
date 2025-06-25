@echo off
echo ========================================
echo Starting Pack-App
echo ========================================
echo.

echo Starting server...
start "Pack-App Server" cmd /k "cd server && npm start"

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo Starting client...
start "Pack-App Client" cmd /k "cd client && npm start"

echo.
echo ========================================
echo Pack-App is starting...
echo ========================================
echo Server: http://localhost:3001
echo Client: http://localhost:3000
echo.
echo Both windows will open automatically.
echo Close the windows to stop the applications.
echo.
pause 