#!/bin/bash

# Complete final fix - rebuild nginx config from scratch
# إصلاح نهائي شامل - إعادة بناء إعداد Nginx من الصفر

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح نهائي شامل${NC}"
echo -e "${BLUE}   Complete Final Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Remove ALL budget references
sed -i '/budget/d' "$MAIN_CONFIG"

# Use Python to rebuild config properly
python3 << 'PYEOF'
import re

with open('/etc/nginx/sites-available/default', 'r') as f:
    content = f.read()

# Find location / block
location_match = re.search(r'(location\s+/\s*\{[^}]*\})', content, re.DOTALL)
if not location_match:
    print("ERROR: Could not find location / block")
    exit(1)

location_block = location_match.group(1)
location_start = location_match.start()

# Insert budget location blocks BEFORE location /
budget_config = '''    # Budget Management System - Frontend
    location /budget {
        proxy_pass http://localhost:3001/budget;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # Budget Management System - Backend API
    location /budget-api {
        rewrite ^/budget-api(.*)$ /api$1 break;
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

'''

# Insert before location /
new_content = content[:location_start] + budget_config + content[location_start:]

with open('/etc/nginx/sites-available/default', 'w') as f:
    f.write(new_content)

print("SUCCESS: Config rebuilt")
PYEOF

# Verify config
echo ""
echo -e "${YELLOW}التحقق من الإعداد...${NC}"
grep -A 5 "location /budget" "$MAIN_CONFIG" | head -10

# Test and restart
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
    systemctl restart nginx
    sleep 3
    
    # Test
    echo ""
    echo -e "${YELLOW}اختبار...${NC}"
    BUDGET=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget 2>/dev/null || echo "000")
    API=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget-api/docs 2>/dev/null || echo "000")
    
    echo "Frontend /budget: HTTP $BUDGET"
    echo "Backend /budget-api/docs: HTTP $API"
    
    if [ "$BUDGET" = "200" ] && [ "$API" = "200" ]; then
        echo ""
        echo -e "${GREEN}   ✅ ✅ ✅ تم الإصلاح بنجاح! ✅ ✅ ✅${NC}"
    else
        echo ""
        echo -e "${YELLOW}   ⚠️  Frontend: $BUDGET, Backend: $API${NC}"
        echo ""
        echo "Testing direct access:"
        curl -s -o /dev/null -w "Direct Frontend (3001/budget): %{http_code}\n" http://localhost:3001/budget
        curl -s -o /dev/null -w "Direct Backend (8001/api/docs): %{http_code}\n" http://localhost:8001/api/docs
    fi
else
    echo -e "${RED}❌ Nginx config test failed${NC}"
    nginx -t
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"

