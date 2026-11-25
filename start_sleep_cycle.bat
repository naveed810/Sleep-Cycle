@echo off
title Sleep Cycle Launcher
echo ============================================================
echo   🌙 Launching Sleep Cycle...
echo ============================================================

REM Check if backend is running on 8000
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo Starting Sleep Cycle Backend on port 8000...
    start "Sleep Cycle Backend" /b /min cmd /c "cd /d "%~dp0backend" && .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
    timeout /t 2 /nobreak >nul
) else (
    echo Backend is already running on port 8000.
)

REM Check if live server is running on 5500
netstat -ano | findstr :5500 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo Starting Sleep Cycle Live Server on port 5500...
    start "Sleep Cycle Live Server" /b /min cmd /c "cd /d "%~dp0" && python live_server.py"
    timeout /t 1 /nobreak >nul
) else (
    echo Live Server is already running on port 5500.
)

echo Opening website in default browser...
start http://127.0.0.1:5500/
echo Done!
