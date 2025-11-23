#!/bin/bash

# Final fix for Backend API routing in Nginx
# الإصلاح النهائي لتوجيه Backend API في Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   الإصلاح النهائي لـ Backend API${NC}"
echo -e "${BLUE}   Final Backend API Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Test Backend directly first
echo -e "${YELLOW}[1/4] اختبار Backend مباشرة...${NC}"
BACKEND_DIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/docs || echo "000")
if [ "$BACKEND_DIRECT" = "200" ]; then
    echo -e "${GREEN}✅ Backend works directly on port 8001${NC}"
else
    echo -e "${RED}❌ Backend not responding on port 8001 (HTTP $BACKEND_DIRECT)${NC}"
    echo -e "${YELLOW}Checking Backend service...${NC}"
    systemctl status budget-backend --no-pager -l | head -20
    exit 1
fi

# Update Nginx config with correct routing
echo -e "${YELLOW}[2/4] تحديث إعداد Nginx...${NC}"
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
    # Map /budget-api/* to /api/*
    location ~ ^/budget-api/(.*)$ {
        proxy_pass http://localhost:8001/api/$1;
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

# Test Nginx config
echo -e "${YELLOW}[3/4] اختبار إعداد Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    systemctl restart nginx
    sleep 2
    
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}❌ Nginx failed to restart${NC}"
        systemctl status nginx --no-pager -l | head -20
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    nginx -t
    exit 1
fi

# Test endpoints
echo -e "${YELLOW}[4/4] اختبار نقاط النهاية...${NC}"
echo ""

ENDPOINTS=(
    "/budget-api/docs"
    "/budget-api/v1"
    "/budget-api/v1/auth/login"
)

for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$endpoint" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "405" ]; then
        echo -e "${GREEN}✅ $endpoint: HTTP $STATUS${NC}"
    elif [ "$STATUS" = "404" ]; then
        echo -e "${RED}❌ $endpoint: HTTP $STATUS (Not Found)${NC}"
    else
        echo -e "${YELLOW}⚠️  $endpoint: HTTP $STATUS${NC}"
    fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ تم الإصلاح!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
IP=$(hostname -I | awk '{print $1}')
echo -e "Frontend:    ${GREEN}http://$IP/budget${NC}"
echo -e "Backend API: ${GREEN}http://$IP/budget-api/v1${NC}"
echo -e "API Docs:    ${GREEN}http://$IP/budget-api/docs${NC}"
echo ""

