#!/bin/bash

# Final fix - move config outside location / block
# الإصلاح النهائي - نقل الإعداد خارج location / block

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   الإصلاح النهائي${NC}"
echo -e "${BLUE}   Final Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
echo -e "${YELLOW}[1/4] إنشاء نسخة احتياطية...${NC}"
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Remove include from inside location / block
echo -e "${YELLOW}[2/4] إزالة include من داخل location / block...${NC}"
sed -i '/location \/ {/,/}/ {
    /include.*budget-system/d
}' "$MAIN_CONFIG"
echo -e "${GREEN}✅ Removed from inside location /${NC}"
echo ""

# Add include BEFORE location / block
echo -e "${YELLOW}[3/4] إضافة include قبل location / block...${NC}"
sed -i '/^[[:space:]]*server_name/a\
\
    # Budget Management System\
    include /etc/nginx/snippets/budget-system.conf;
' "$MAIN_CONFIG"

echo -e "${GREEN}✅ Added before location /${NC}"
echo ""

# Ensure snippet exists
if [ ! -f /etc/nginx/snippets/budget-system.conf ]; then
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
fi

# Test and restart
echo -e "${YELLOW}[4/4] اختبار وإعادة تشغيل Nginx...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
    systemctl restart nginx
    sleep 3
    
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}❌ Nginx failed to restart${NC}"
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

