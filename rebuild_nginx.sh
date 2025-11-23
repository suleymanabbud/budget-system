#!/bin/bash

# Rebuild Nginx config from scratch
# إعادة بناء إعداد Nginx من الصفر

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إعادة بناء إعداد Nginx من الصفر${NC}"
echo -e "${BLUE}   Rebuild Nginx Config from Scratch${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Remove ALL budget references
echo -e "${YELLOW}[1/3] حذف جميع الإعدادات القديمة...${NC}"
sed -i '/budget/d' "$MAIN_CONFIG"
sed -i '/proxy_pass.*3001/d' "$MAIN_CONFIG"
sed -i '/proxy_pass.*8001/d' "$MAIN_CONFIG"
echo -e "${GREEN}✅ تم الحذف${NC}"
echo ""

# Rebuild config properly
echo -e "${YELLOW}[2/3] إعادة كتابة الإعدادات من الصفر...${NC}"
python3 << 'PYEOF'
import re

with open('/etc/nginx/sites-available/default', 'r') as f:
    content = f.read()

# Find location / block
location_match = re.search(r'(\s+)(location\s+/\s*\{)', content)
if not location_match:
    print("ERROR: Could not find location /")
    exit(1)

indent = location_match.group(1)
location_start = location_match.start()

# Budget location blocks
budget_config = f'''{indent}# Budget Management System - Frontend
{indent}location /budget {{
{indent}    proxy_pass http://localhost:3001/budget;
{indent}    proxy_http_version 1.1;
{indent}    proxy_set_header Upgrade $http_upgrade;
{indent}    proxy_set_header Connection 'upgrade';
{indent}    proxy_set_header Host $host;
{indent}    proxy_set_header X-Real-IP $remote_addr;
{indent}    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
{indent}    proxy_set_header X-Forwarded-Proto $scheme;
{indent}    proxy_cache_bypass $http_upgrade;
{indent}    proxy_redirect off;
{indent}}}

{indent}# Budget Management System - Backend API
{indent}location /budget-api {{
{indent}    rewrite ^/budget-api(.*)$ /api$1 break;
{indent}    proxy_pass http://localhost:8001;
{indent}    proxy_http_version 1.1;
{indent}    proxy_set_header Host $host;
{indent}    proxy_set_header X-Real-IP $remote_addr;
{indent}    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
{indent}    proxy_set_header X-Forwarded-Proto $scheme;
{indent}    proxy_cache_bypass $http_upgrade;
{indent}    proxy_redirect off;
{indent}}}

{indent}'''

# Insert before location /
new_content = content[:location_start] + budget_config + content[location_start:]

with open('/etc/nginx/sites-available/default', 'w') as f:
    f.write(new_content)

print("SUCCESS: Config rebuilt from scratch")
PYEOF

echo -e "${GREEN}✅ تم إعادة الكتابة${NC}"
echo ""

# Test and restart
echo -e "${YELLOW}[3/3] اختبار وإعادة تشغيل...${NC}"
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
        echo -e "${RED}   ❌ Frontend: $BUDGET, Backend: $API${NC}"
        echo ""
        echo "Direct access test:"
        curl -s -o /dev/null -w "Direct Frontend: %{http_code}\n" http://localhost:3001/budget
        curl -s -o /dev/null -w "Direct Backend: %{http_code}\n" http://localhost:8001/api/docs
    fi
else
    echo -e "${RED}❌ Nginx config test failed${NC}"
    nginx -t
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"

