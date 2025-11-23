#!/bin/bash

# Fix proxy_pass to include /budget path
# إصلاح proxy_pass ليشمل مسار /budget

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح proxy_pass${NC}"
echo -e "${BLUE}   Fixing proxy_pass${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Remove duplicate location /budget-api
sed -i '/location \/budget-api {/,/}/d' "$MAIN_CONFIG"

# Fix proxy_pass for /budget to include /budget path
sed -i 's|proxy_pass http://localhost:3001;|proxy_pass http://localhost:3001/budget;|g' "$MAIN_CONFIG"

# Test and restart
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
    systemctl restart nginx
    sleep 2
    
    # Test
    echo ""
    echo "Testing..."
    BUDGET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget)
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget-api/docs)
    
    echo "Frontend /budget: HTTP $BUDGET_STATUS"
    echo "Backend /budget-api/docs: HTTP $API_STATUS"
    
    if [ "$BUDGET_STATUS" = "200" ] && [ "$API_STATUS" = "200" ]; then
        echo ""
        echo -e "${GREEN}   ✅ تم الإصلاح بنجاح!${NC}"
    else
        echo ""
        echo -e "${YELLOW}   ⚠️  بعض endpoints تحتاج إلى فحص${NC}"
    fi
else
    echo -e "${RED}❌ Nginx config test failed${NC}"
    nginx -t
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"

