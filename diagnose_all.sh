#!/bin/bash

# Complete diagnosis
# تشخيص شامل

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   تشخيص شامل${NC}"
echo -e "${BLUE}   Complete Diagnosis${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 1. Check services status
echo -e "${YELLOW}[1/6] حالة الخدمات...${NC}"
systemctl status budget-backend --no-pager -l | head -15
echo ""
systemctl status budget-frontend --no-pager -l | head -15
echo ""

# 2. Check ports
echo -e "${YELLOW}[2/6] فحص المنافذ...${NC}"
netstat -tuln | grep -E ':(8001|3001)' || echo "No ports listening"
echo ""

# 3. Test Backend directly
echo -e "${YELLOW}[3/6] اختبار Backend مباشرة...${NC}"
echo "Testing http://localhost:8001/api/docs"
BACKEND_RESPONSE=$(curl -s http://localhost:8001/api/docs | head -5)
if echo "$BACKEND_RESPONSE" | grep -q "html\|swagger"; then
    echo -e "${GREEN}✅ Backend works${NC}"
else
    echo -e "${RED}❌ Backend not working${NC}"
    echo "Response: $BACKEND_RESPONSE"
fi
echo ""

# 4. Test Frontend directly
echo -e "${YELLOW}[4/6] اختبار Frontend مباشرة...${NC}"
echo "Testing http://localhost:3001"
FRONTEND_RESPONSE=$(curl -s http://localhost:3001 | head -5)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
echo "Status: $FRONTEND_STATUS"
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend works${NC}"
elif [ "$FRONTEND_STATUS" = "404" ]; then
    echo -e "${YELLOW}⚠️  Frontend returns 404 - may need basePath${NC}"
    echo "Testing http://localhost:3001/budget"
    curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3001/budget
else
    echo -e "${RED}❌ Frontend not working${NC}"
fi
echo ""

# 5. Check Nginx config
echo -e "${YELLOW}[5/6] فحص إعداد Nginx...${NC}"
echo "Location blocks order:"
grep -n "location" /etc/nginx/sites-available/default | head -10
echo ""
echo "Budget location blocks:"
sed -n '/location \/budget/,/}/p' /etc/nginx/sites-available/default
echo ""
sed -n '/location \/budget-api/,/}/p' /etc/nginx/sites-available/default
echo ""

# 6. Test through Nginx with verbose
echo -e "${YELLOW}[6/6] اختبار من خلال Nginx...${NC}"
echo "Testing /budget:"
curl -v http://localhost/budget 2>&1 | grep -E "HTTP|Host|Location|404|200" | head -5
echo ""
echo "Testing /budget-api/docs:"
curl -v http://localhost/budget-api/docs 2>&1 | grep -E "HTTP|Host|Location|404|200" | head -5
echo ""

# 7. Check Nginx error log
echo -e "${YELLOW}سجلات الأخطاء...${NC}"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log"
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"

