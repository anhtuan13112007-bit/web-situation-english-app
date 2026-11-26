@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Situation English - Local Web Server

echo ==================================================
echo   SITUATION ENGLISH - KHOI DONG WEB LOCAL (EDGE)
echo ==================================================
echo.

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo Server dang chay san tai http://localhost:5173
    echo Dang mo Microsoft Edge...
    start msedge "http://localhost:5173"
    exit /b 0
)

if not exist "node_modules" (
    echo Chua thay thu muc node_modules. Dang cai dat thu vien lan dau...
    call npm install
)

echo Dang khoi dong server local tai http://localhost:5173 ...
echo Microsoft Edge se tu dong mo sau 2 giay.
echo (Giu cua so nay mo khi hoc. Nhan Ctrl + C de tat server.)
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start msedge http://localhost:5173"
call npm run dev -- --port 5173 --strictPort
