#!/bin/bash

# Final Nginx check and fix
# فحص وإصلاح نهائي لـ Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   فحص وإصلاح نهائي${NC}"
echo -e "${BLUE}   Final Check and Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 1. Check direct access
echo -e "${YELLOW}[1/4] اختبار الوصول المباشر...${NC}"
BACKEND_DIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/docs)
FRONTEND_DIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/budget)
echo "Backend (8001/api/docs): HTTP $BACKEND_DIRECT"
echo "Frontend (3001/budget): HTTP $FRONTEND_DIRECT"
echo ""

# 2. Check Nginx config
echo -e "${YELLOW}[2/4] فحص إعداد Nginx...${NC}"
MAIN_CONFIG="/etc/nginx/sites-available/default"
echo "Location blocks:"
grep -n "location" "$MAIN_CONFIG" | grep -E "(budget|/ )" | head -5
echo ""
echo "Budget location blocks content:"
sed -n '/location \/budget/,/}/p' "$MAIN_CONFIG"
echo ""
sed -n '/location \/budget-api/,/}/p' "$MAIN_CONFIG"
echo ""

# 3. Check active Nginx config
echo -e "${YELLOW}[3/4] فحص الإعداد الفعلي (nginx -T)...${NC}"
nginx -T 2>/dev/null | grep -A 10 "location /budget" | head -15
echo ""

# 4. Test through Nginx
echo -e "${YELLOW}[4/4] اختبار من خلال Nginx...${NC}"
echo "Testing /budget:"
curl -v http://localhost/budget 2>&1 | grep -E "HTTP|Host|GET|404|200|301|302" | head -5
echo ""
echo "Testing /budget-api/docs:"
curl -v http://localhost/budget-api/docs 2>&1 | grep -E "HTTP|Host|GET|404|200|301|302" | head -5
echo ""

# 5. Check error log
echo -e "${YELLOW}سجلات الأخطاء...${NC}"
tail -10 /var/log/nginx/error.log 2>/dev/null | tail -5 || echo "No errors"
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"

