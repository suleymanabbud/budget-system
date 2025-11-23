#!/bin/bash

# Fix Backend API routing in Nginx
# إصلاح توجيه Backend API في Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح Backend API في Nginx${NC}"
echo -e "${BLUE}   Fixing Backend API in Nginx${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Update Nginx config with correct Backend routing
echo -e "${YELLOW}تحديث إعداد Nginx...${NC}"
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
    location /budget-api/ {
        proxy_pass http://localhost:8001/api/;
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
EOF

# Test and restart
echo -e "${YELLOW}اختبار وإعادة تشغيل Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    systemctl restart nginx
    sleep 2
    
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}❌ Nginx failed to restart${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}اختبار Backend API من خلال Nginx...${NC}"

# Test different endpoints
ENDPOINTS=(
    "/budget-api/docs"
    "/budget-api/v1"
    "/budget-api/v1/auth/login"
)

for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$endpoint" || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "404" ]; then
        echo -e "${GREEN}✅ $endpoint: HTTP $STATUS${NC}"
    else
        echo -e "${RED}❌ $endpoint: HTTP $STATUS${NC}"
    fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ تم إصلاح Backend API!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

