#!/bin/bash

# Check and fix Nginx configuration
# فحص وإصلاح إعداد Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   فحص إعداد Nginx${NC}"
echo -e "${BLUE}   Checking Nginx Config${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Show server block
echo -e "${YELLOW}[1/4] عرض server block...${NC}"
echo ""
sed -n '/server {/,/}/p' "$MAIN_CONFIG"
echo ""

# Check snippet
echo -e "${YELLOW}[2/4] فحص snippet...${NC}"
echo ""
if [ -f /etc/nginx/snippets/budget-system.conf ]; then
    cat /etc/nginx/snippets/budget-system.conf
    echo -e "${GREEN}✅ Snippet exists${NC}"
else
    echo -e "${RED}❌ Snippet not found${NC}"
fi
echo ""

# Test services
echo -e "${YELLOW}[3/4] اختبار الخدمات مباشرة...${NC}"
echo ""
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/docs 2>/dev/null || echo "000")
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")
echo "Backend (8001): HTTP $BACKEND_TEST"
echo "Frontend (3001): HTTP $FRONTEND_TEST"
echo ""

# Test through Nginx
echo -e "${YELLOW}[4/4] اختبار من خلال Nginx...${NC}"
echo ""
NGINX_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget-api/docs 2>/dev/null || echo "000")
NGINX_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget 2>/dev/null || echo "000")
echo "Nginx /budget-api/docs: HTTP $NGINX_BACKEND"
echo "Nginx /budget: HTTP $NGINX_FRONTEND"
echo ""

# Check Nginx error log
echo -e "${YELLOW}فحص سجلات الأخطاء...${NC}"
echo ""
tail -20 /var/log/nginx/error.log 2>/dev/null | tail -10 || echo "No error log"
echo ""

# Check access log
echo -e "${YELLOW}فحص سجلات الوصول...${NC}"
echo ""
tail -10 /var/log/nginx/access.log 2>/dev/null | tail -5 || echo "No access log"
echo ""

# Test with verbose curl
echo -e "${YELLOW}اختبار تفصيلي...${NC}"
echo ""
echo "Testing /budget-api/docs with verbose:"
curl -v http://localhost/budget-api/docs 2>&1 | head -30
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"

