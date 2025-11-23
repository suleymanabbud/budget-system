#!/bin/bash

# Direct fix - write location blocks directly in config file
# إصلاح مباشر - كتابة location blocks مباشرة في الملف

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح مباشر${NC}"
echo -e "${BLUE}   Direct Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Remove ALL budget-system references
sed -i '/budget-system/d' "$MAIN_CONFIG"
sed -i '/location \/budget/d' "$MAIN_CONFIG"
sed -i '/location \/budget-api/d' "$MAIN_CONFIG"

# Use Python to insert location blocks BEFORE location /
python3 << 'PYEOF'
import re

with open('/etc/nginx/sites-available/default', 'r') as f:
    lines = f.readlines()

# Find location / line
location_idx = -1
for i, line in enumerate(lines):
    if re.match(r'^\s*location\s+/\s*\{', line):
        location_idx = i
        break

if location_idx == -1:
    print("ERROR: Could not find location /")
    exit(1)

# Insert location blocks BEFORE location /
budget_config = '''    # Budget Management System - Frontend
    location /budget {
        proxy_pass http://localhost:3001;
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
lines.insert(location_idx, budget_config)

with open('/etc/nginx/sites-available/default', 'w') as f:
    f.writelines(lines)

print("SUCCESS: Location blocks inserted before location /")
PYEOF

# Test and restart
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
    systemctl restart nginx
    sleep 2
    
    # Test
    echo ""
    echo "Testing..."
    curl -s -o /dev/null -w "Frontend: HTTP %{http_code}\n" http://localhost/budget
    curl -s -o /dev/null -w "Backend: HTTP %{http_code}\n" http://localhost/budget-api/docs
    
    echo ""
    echo -e "${GREEN}✅ Done!${NC}"
else
    echo -e "${RED}❌ Nginx config test failed${NC}"
    nginx -t
    exit 1
fi

