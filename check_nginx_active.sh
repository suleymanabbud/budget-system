#!/bin/bash

# Check active Nginx configuration
# فحص الإعداد الفعلي لـ Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   فحص الإعداد الفعلي لـ Nginx${NC}"
echo -e "${BLUE}   Check Active Nginx Config${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Show active config
echo -e "${YELLOW}[1/3] الإعداد الفعلي (nginx -T)...${NC}"
nginx -T 2>/dev/null | grep -A 20 "location /budget" | head -30
echo ""

# Check if location / comes first
echo -e "${YELLOW}[2/3] ترتيب location blocks في الإعداد الفعلي...${NC}"
nginx -T 2>/dev/null | grep -n "location" | grep -E "(budget|/ )" | head -5
echo ""

# Test with tcpdump or check what Nginx actually receives
echo -e "${YELLOW}[3/3] اختبار مع تفاصيل...${NC}"
echo "Request to /budget:"
curl -v http://localhost/budget 2>&1 | grep -E "HTTP|Host|GET|404|200|301|302" | head -10
echo ""
echo "Request to /budget-api/docs:"
curl -v http://localhost/budget-api/docs 2>&1 | grep -E "HTTP|Host|GET|404|200|301|302" | head -10
echo ""

# Check error log
echo -e "${YELLOW}سجلات الأخطاء...${NC}"
tail -20 /var/log/nginx/error.log 2>/dev/null | grep -i budget || echo "No budget errors"
echo ""

# Force reload
echo -e "${YELLOW}إعادة تحميل قسري...${NC}"
systemctl reload nginx
sleep 2

# Test again
echo ""
echo "Testing after reload:"
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost/budget
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost/budget-api/docs

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"

