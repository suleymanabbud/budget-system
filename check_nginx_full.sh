#!/bin/bash

# Check full Nginx configuration
# فحص إعداد Nginx بالكامل

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   فحص إعداد Nginx بالكامل${NC}"
echo -e "${BLUE}   Full Nginx Config Check${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Show full server block
echo -e "${YELLOW}[1/4] عرض server block بالكامل...${NC}"
sed -n '/server {/,/^}/p' "$MAIN_CONFIG"
echo ""

# Check location blocks order
echo -e "${YELLOW}[2/4] ترتيب location blocks...${NC}"
grep -n "location" "$MAIN_CONFIG" | head -10
echo ""

# Test with nginx -T (full config)
echo -e "${YELLOW}[3/4] إعداد Nginx الكامل (nginx -T)...${NC}"
nginx -T 2>/dev/null | grep -A 15 "location /budget" | head -20
echo ""

# Check if location / comes before location /budget
echo -e "${YELLOW}[4/4] فحص ترتيب location blocks...${NC}"
BUDGET_LINE=$(grep -n "location /budget" "$MAIN_CONFIG" | head -1 | cut -d: -f1)
LOCATION_LINE=$(grep -n "location / {" "$MAIN_CONFIG" | head -1 | cut -d: -f1)

if [ -n "$BUDGET_LINE" ] && [ -n "$LOCATION_LINE" ]; then
    if [ "$BUDGET_LINE" -lt "$LOCATION_LINE" ]; then
        echo -e "${GREEN}✅ location /budget comes before location / (correct)${NC}"
    else
        echo -e "${RED}❌ location / comes before location /budget (WRONG!)${NC}"
        echo "Budget line: $BUDGET_LINE, Location / line: $LOCATION_LINE"
    fi
fi
echo ""

# Test with curl verbose
echo -e "${YELLOW}اختبار تفصيلي...${NC}"
echo "Testing /budget:"
curl -v http://localhost/budget 2>&1 | grep -E "HTTP|Host|Location|404|200|301|302" | head -10
echo ""
echo "Testing /budget-api/docs:"
curl -v http://localhost/budget-api/docs 2>&1 | grep -E "HTTP|Host|Location|404|200|301|302" | head -10
echo ""

echo -e "${BLUE}════════════════════════════════════════${NC}"

