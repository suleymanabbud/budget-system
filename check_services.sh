#!/bin/bash

echo "========================================"
echo "   Checking Services Status"
echo "   فحص حالة الخدمات"
echo "========================================"
echo ""

echo "Backend Status:"
systemctl status budget-backend --no-pager -l

echo ""
echo "Backend Logs (last 30 lines):"
journalctl -u budget-backend -n 30 --no-pager

echo ""
echo "Frontend Status:"
systemctl status budget-frontend --no-pager -l

echo ""
echo "Frontend Logs (last 30 lines):"
journalctl -u budget-frontend -n 30 --no-pager

echo ""
echo "Ports:"
netstat -tulpn | grep -E ':(8001|3001)' || echo "No services listening on ports 8001 or 3001"

echo ""
echo "Testing Backend manually:"
cd /opt/budget-system/backend
source venv/bin/activate
python -c "from app.main import app; print('Backend import OK')" 2>&1

