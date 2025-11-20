@echo off
echo ====================================
echo Resetting all users...
echo ====================================
cd backend
python init_users.py
cd ..
echo.
echo ====================================
echo Users reset complete!
echo ====================================
pause

