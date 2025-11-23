#!/bin/bash

# Simple and direct Nginx fix
# إصلاح بسيط ومباشر لـ Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح بسيط لـ Nginx${NC}"
echo -e "${BLUE}   Simple Nginx Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
echo -e "${YELLOW}[1/5] إنشاء نسخة احتياطية...${NC}"
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Create snippet
echo -e "${YELLOW}[2/5] إنشاء snippet...${NC}"
mkdir -p /etc/nginx/snippets
cat > /etc/nginx/snippets/budget-system.conf << 'EOF'
    # Budget Management System - Frontend
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
EOF
echo -e "${GREEN}✅ Snippet created${NC}"
echo ""

# Remove all old budget-system references
echo -e "${YELLOW}[3/5] إزالة الإعدادات القديمة...${NC}"
sed -i '/budget-system/d' "$MAIN_CONFIG"
sed -i '/location \/budget/d' "$MAIN_CONFIG"
sed -i '/location \/budget-api/d' "$MAIN_CONFIG"
echo -e "${GREEN}✅ Old config removed${NC}"
echo ""

# Add include inside server block using Python for reliability
echo -e "${YELLOW}[4/5] إضافة snippet داخل server block...${NC}"
python3 << 'PYTHON_SCRIPT'
import re

config_file = "/etc/nginx/sites-available/default"

with open(config_file, 'r') as f:
    content = f.read()

# Check if already included
if 'include /etc/nginx/snippets/budget-system.conf;' in content:
    # Check if it's inside server block
    lines = content.split('\n')
    in_server = False
    found_include = False
    include_inside = False
    
    for i, line in enumerate(lines):
        if re.match(r'^\s*server\s*\{', line):
            in_server = True
        if in_server and 'budget-system.conf' in line:
            include_inside = True
            break
        if in_server and re.match(r'^\s*\}', line):
            in_server = False
        if 'budget-system.conf' in line:
            found_include = True
    
    if include_inside:
        print("Already inside server block")
    elif found_include:
        # Remove from outside
        content = re.sub(r'.*budget-system\.conf.*\n', '', content)
        # Add inside server block
        pattern = r'(server\s*\{[^}]*)(\})'
        replacement = r'\1    include /etc/nginx/snippets/budget-system.conf;\n\2'
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    else:
        # Add inside server block
        pattern = r'(server\s*\{[^}]*)(\})'
        replacement = r'\1    include /etc/nginx/snippets/budget-system.conf;\n\2'
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
else:
    # Add inside server block
    pattern = r'(server\s*\{[^}]*)(\})'
    replacement = r'\1    include /etc/nginx/snippets/budget-system.conf;\n\2'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open(config_file, 'w') as f:
    f.write(content)

print("Config updated")
PYTHON_SCRIPT

echo -e "${GREEN}✅ Config updated${NC}"
echo ""

# Test and restart
echo -e "${YELLOW}[5/5] اختبار وإعادة تشغيل Nginx...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
    systemctl restart nginx
    sleep 3
    
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}❌ Nginx failed to restart${NC}"
        systemctl status nginx --no-pager -l | head -20
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx config test failed${NC}"
    nginx -t
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${YELLOW}اختبار النهائي...${NC}"
echo ""

# Test endpoints
ENDPOINTS=(
    "/budget"
    "/budget-api/docs"
    "/budget-api/v1/auth/login"
)

ALL_OK=true
for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$endpoint" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "404" ] || [ "$STATUS" = "405" ] || [ "$STATUS" = "401" ]; then
        echo -e "${GREEN}✅ $endpoint: HTTP $STATUS${NC}"
    else
        echo -e "${RED}❌ $endpoint: HTTP $STATUS${NC}"
        ALL_OK=false
    fi
done

echo ""
if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}   ✅ تم الإصلاح بنجاح!${NC}"
else
    echo -e "${YELLOW}   ⚠️  بعض endpoints تحتاج إلى فحص${NC}"
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
IP=$(hostname -I | awk '{print $1}')
echo -e "Frontend:    ${GREEN}http://$IP/budget${NC}"
echo -e "API Docs:    ${GREEN}http://$IP/budget-api/docs${NC}"
echo ""

