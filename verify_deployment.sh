#!/bin/bash

# Script to verify complete deployment
# سكريبت للتحقق من اكتمال النشر

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   التحقق من النشر - Deployment Check${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check Backend Service
echo -e "${YELLOW}[1/4] فحص Backend Service...${NC}"
if systemctl is-active --quiet budget-backend; then
    echo -e "${GREEN}✅ Backend Service: RUNNING${NC}"
    BACKEND_STATUS=$(systemctl show budget-backend -p ActiveState --value)
    echo -e "   Status: $BACKEND_STATUS"
else
    echo -e "${RED}❌ Backend Service: NOT RUNNING${NC}"
fi

# Check Frontend Service
echo -e "${YELLOW}[2/4] فحص Frontend Service...${NC}"
if systemctl is-active --quiet budget-frontend; then
    echo -e "${GREEN}✅ Frontend Service: RUNNING${NC}"
    FRONTEND_STATUS=$(systemctl show budget-frontend -p ActiveState --value)
    echo -e "   Status: $FRONTEND_STATUS"
else
    echo -e "${RED}❌ Frontend Service: NOT RUNNING${NC}"
fi

# Check Ports
echo -e "${YELLOW}[3/4] فحص المنافذ...${NC}"
if netstat -tuln | grep -q ":8001"; then
    echo -e "${GREEN}✅ Port 8001 (Backend): LISTENING${NC}"
else
    echo -e "${RED}❌ Port 8001 (Backend): NOT LISTENING${NC}"
fi

if netstat -tuln | grep -q ":3001"; then
    echo -e "${GREEN}✅ Port 3001 (Frontend): LISTENING${NC}"
else
    echo -e "${RED}❌ Port 3001 (Frontend): NOT LISTENING${NC}"
fi

# Check Nginx
echo -e "${YELLOW}[4/4] فحص Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx: RUNNING${NC}"
    
    # Check if config includes budget-system
    if grep -q "budget-system.conf" /etc/nginx/sites-available/default 2>/dev/null || \
       grep -q "budget-system.conf" /etc/nginx/nginx.conf 2>/dev/null; then
        echo -e "${GREEN}✅ Nginx config: CONFIGURED${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx config: NOT FOUND${NC}"
    fi
else
    echo -e "${RED}❌ Nginx: NOT RUNNING${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   روابط الوصول - Access Links${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "Frontend:    ${GREEN}http://72.60.32.88/budget${NC}"
echo -e "Backend API: ${GREEN}http://72.60.32.88/budget-api/v1${NC}"
echo -e "API Docs:    ${GREEN}http://72.60.32.88/budget-api/docs${NC}"
echo ""

# Test Backend API
echo -e "${YELLOW}اختبار Backend API...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/docs | grep -q "200"; then
    echo -e "${GREEN}✅ Backend API: RESPONDING${NC}"
else
    echo -e "${RED}❌ Backend API: NOT RESPONDING${NC}"
fi

# Test Frontend
echo -e "${YELLOW}اختبار Frontend...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -qE "(200|404)"; then
    echo -e "${GREEN}✅ Frontend: RESPONDING${NC}"
else
    echo -e "${RED}❌ Frontend: NOT RESPONDING${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   حسابات تسجيل الدخول${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "System Admin: ${GREEN}admin / admin${NC}"
echo -e "Company 1:    ${GREEN}admin1 / admin${NC}  |  company1 / 123456"
echo -e "Company 2:    ${GREEN}admin2 / admin${NC}  |  company2 / 123456"
echo -e "Company 3:    ${GREEN}admin3 / admin${NC}  |  company3 / 123456"
echo -e "Company 4:    ${GREEN}admin4 / admin${NC}  |  company4 / 123456"
echo -e "Company 5:    ${GREEN}admin5 / admin${NC}  |  company5 / 123456"
echo ""

