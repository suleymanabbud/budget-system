@echo off
echo ========================================
echo    Budget Management System
echo    نظام إدارة الموازنات
echo ========================================
echo.

echo Starting Backend...
start "Backend" cmd /k "cd backend && python run.py"

echo.
echo Waiting 5 seconds for Backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo System is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Login Accounts:
echo Admin: admin / admin
echo Company Admin: company_admin / admin
echo Company User: company_user / user
echo.
pause
