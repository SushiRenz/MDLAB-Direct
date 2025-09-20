@echo off
echo 🔄 MDLAB Direct Server Manager
echo ===============================

:menu
echo.
echo Choose an option:
echo 1. Start Server
echo 2. Start Server with Monitor
echo 3. Stop Server
echo 4. Restart Server
echo 5. Check Server Health
echo 6. View Server Logs (if using PM2)
echo 7. Exit
echo.

set /p choice=Enter your choice (1-7): 

if "%choice%"=="1" goto start
if "%choice%"=="2" goto startmonitor
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto restart
if "%choice%"=="5" goto health
if "%choice%"=="6" goto logs
if "%choice%"=="7" goto exit
echo Invalid choice, please try again.
goto menu

:start
echo 🚀 Starting MDLAB Direct Server...
cd /d "%~dp0"
npm start
goto menu

:startmonitor
echo 🚀 Starting MDLAB Direct Server with Monitor...
cd /d "%~dp0"
echo Starting server in background...
start /B npm start
timeout /t 3
echo Starting monitor...
npm run monitor
goto menu

:stop
echo 🛑 Stopping MDLAB Direct Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)
echo Server stopped.
goto menu

:restart
echo 🔄 Restarting MDLAB Direct Server...
call :stop
timeout /t 2
call :start
goto menu

:health
echo 📊 Checking Server Health...
cd /d "%~dp0"
npm run health
goto menu

:logs
echo 📋 Server Logs:
echo (This would show PM2 logs if PM2 is installed)
echo To install PM2: npm install -g pm2
echo To start with PM2: pm2 start server.js --name mdlab-backend
echo To view logs: pm2 logs mdlab-backend
goto menu

:exit
echo 👋 Goodbye!
exit /b 0