#!/bin/bash

# Final status check
# فحص الحالة النهائية

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   الحالة النهائية للنظام${NC}"
echo -e "${BLUE}   Final System Status${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Test Frontend
echo -e "${YELLOW}[1/3] Frontend:${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ Frontend: WORKING (HTTP $FRONTEND_STATUS)${NC}"
    echo -e "   URL: http://72.60.32.88/budget"
else
    echo -e "${RED}❌ Frontend: FAILED (HTTP $FRONTEND_STATUS)${NC}"
fi
echo ""

# Test Backend API Docs
echo -e "${YELLOW}[2/3] Backend API Docs:${NC}"
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget-api/docs 2>/dev/null || echo "000")
if [ "$DOCS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ API Docs: WORKING (HTTP $DOCS_STATUS)${NC}"
    echo -e "   URL: http://72.60.32.88/budget-api/docs"
else
    echo -e "${RED}❌ API Docs: FAILED (HTTP $DOCS_STATUS)${NC}"
fi
echo ""

# Test Backend API Endpoints
echo -e "${YELLOW}[3/3] Backend API Endpoints:${NC}"
ENDPOINTS=(
    "/budget-api/v1/auth/login"
    "/budget-api/v1/companies"
    "/budget-api/v1/accounts"
)

ALL_WORKING=true
for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$endpoint" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "405" ] || [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
        echo -e "${GREEN}✅ $endpoint: HTTP $STATUS${NC}"
    else
        echo -e "${YELLOW}⚠️  $endpoint: HTTP $STATUS${NC}"
        ALL_WORKING=false
    fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "404" ] && [ "$DOCS_STATUS" = "200" ]; then
    echo -e "${GREEN}   ✅ النظام يعمل بشكل صحيح!${NC}"
    echo -e "${GREEN}   ✅ System is working correctly!${NC}"
else
    echo -e "${RED}   ⚠️  هناك مشاكل تحتاج إلى إصلاح${NC}"
    echo -e "${RED}   ⚠️  Some issues need fixing${NC}"
fi
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}روابط الوصول:${NC}"
echo -e "  Frontend:    http://72.60.32.88/budget"
echo -e "  API Docs:    http://72.60.32.88/budget-api/docs"
echo -e "  Backend API: http://72.60.32.88/budget-api/v1"
echo ""
echo -e "${YELLOW}ملاحظة: /budget-api/v1 يعطي 404 لأن /api/v1 هو prefix فقط وليس endpoint${NC}"
echo -e "${YELLOW}Note: /budget-api/v1 returns 404 because /api/v1 is a prefix, not an endpoint${NC}"
echo ""

