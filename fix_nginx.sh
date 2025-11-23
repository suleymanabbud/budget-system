#!/bin/bash

# Comprehensive Nginx fix for Budget System
# إصلاح شامل لـ Nginx لنظام إدارة الموازنات

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح Nginx - Fixing Nginx${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Check if services are running
echo -e "${YELLOW}[1/5] فحص الخدمات...${NC}"
if ! systemctl is-active --quiet budget-backend; then
    echo -e "${RED}❌ Backend service is not running!${NC}"
    echo -e "${YELLOW}Starting Backend...${NC}"
    systemctl start budget-backend
    sleep 2
fi

if ! systemctl is-active --quiet budget-frontend; then
    echo -e "${RED}❌ Frontend service is not running!${NC}"
    echo -e "${YELLOW}Starting Frontend...${NC}"
    systemctl start budget-frontend
    sleep 3
fi

# Step 2: Check ports
echo -e "${YELLOW}[2/5] فحص المنافذ...${NC}"
if ! netstat -tuln | grep -q ":8001"; then
    echo -e "${RED}❌ Port 8001 (Backend) is not listening!${NC}"
    exit 1
fi

if ! netstat -tuln | grep -q ":3001"; then
    echo -e "${RED}❌ Port 3001 (Frontend) is not listening!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All ports are listening${NC}"

# Step 3: Create improved Nginx config
echo -e "${YELLOW}[3/5] إنشاء إعداد Nginx محسّن...${NC}"
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
        
        # Important: Don't rewrite, let Next.js handle basePath
        proxy_redirect off;
    }

    # Budget Management System - Backend API
    location /budget-api {
        rewrite ^/budget-api/(.*)$ /api/$1 break;
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
EOF

# Step 4: Add to main config
echo -e "${YELLOW}[4/5] إضافة إلى إعداد Nginx الرئيسي...${NC}"
MAIN_CONFIG="/etc/nginx/sites-available/default"

if [ ! -f "$MAIN_CONFIG" ]; then
    MAIN_CONFIG="/etc/nginx/nginx.conf"
fi

# Remove old include if exists
sed -i '/budget-system.conf/d' "$MAIN_CONFIG" 2>/dev/null || true

# Add include inside server block
if grep -q "server {" "$MAIN_CONFIG"; then
    # Find the server block and add include before closing brace
    sed -i '/^[[:space:]]*server[[:space:]]*{/,/^[[:space:]]*}/ {
        /^[[:space:]]*}/i\
    include /etc/nginx/snippets/budget-system.conf;
    }' "$MAIN_CONFIG" 2>/dev/null || \
    sed -i '/^[[:space:]]*server[[:space:]]*{/,/^[[:space:]]*}/ {
        /^[[:space:]]*}/i\    include /etc/nginx/snippets/budget-system.conf;
    }' "$MAIN_CONFIG"
else
    # If no server block, add to http block
    sed -i '/^[[:space:]]*http[[:space:]]*{/,/^[[:space:]]*}/ {
        /^[[:space:]]*}/i\    include /etc/nginx/snippets/budget-system.conf;
    }' "$MAIN_CONFIG" || \
    echo "    include /etc/nginx/snippets/budget-system.conf;" >> "$MAIN_CONFIG"
fi

# Ensure it's added (fallback)
if ! grep -q "budget-system.conf" "$MAIN_CONFIG"; then
    # Add at the end of server block or http block
    if grep -q "server {" "$MAIN_CONFIG"; then
        sed -i '/^[[:space:]]*server[[:space:]]*{/,/^[[:space:]]*}/ {
            /^[[:space:]]*}/i\    include /etc/nginx/snippets/budget-system.conf;
        }' "$MAIN_CONFIG"
    else
        echo "    include /etc/nginx/snippets/budget-system.conf;" >> "$MAIN_CONFIG"
    fi
fi

# Step 5: Test and restart
echo -e "${YELLOW}[5/5] اختبار وإعادة تشغيل Nginx...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    systemctl restart nginx
    sleep 2
    
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}❌ Nginx failed to restart${NC}"
        systemctl status nginx --no-pager -l
        exit 1
    fi
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   اختبار الوصول - Testing Access${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Test Backend
echo -e "${YELLOW}اختبار Backend...${NC}"
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/docs || echo "000")
if [ "$BACKEND_TEST" = "200" ]; then
    echo -e "${GREEN}✅ Backend: OK (http://localhost:8001)${NC}"
else
    echo -e "${RED}❌ Backend: FAILED (HTTP $BACKEND_TEST)${NC}"
fi

# Test Frontend
echo -e "${YELLOW}اختبار Frontend...${NC}"
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "000")
if [ "$FRONTEND_TEST" = "200" ] || [ "$FRONTEND_TEST" = "404" ]; then
    echo -e "${GREEN}✅ Frontend: OK (http://localhost:3001)${NC}"
else
    echo -e "${RED}❌ Frontend: FAILED (HTTP $FRONTEND_TEST)${NC}"
fi

# Test through Nginx
echo -e "${YELLOW}اختبار من خلال Nginx...${NC}"
NGINX_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget-api/docs || echo "000")
NGINX_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget || echo "000")

if [ "$NGINX_BACKEND" = "200" ]; then
    echo -e "${GREEN}✅ Nginx Backend: OK${NC}"
else
    echo -e "${RED}❌ Nginx Backend: FAILED (HTTP $NGINX_BACKEND)${NC}"
fi

if [ "$NGINX_FRONTEND" = "200" ] || [ "$NGINX_FRONTEND" = "404" ]; then
    echo -e "${GREEN}✅ Nginx Frontend: OK${NC}"
else
    echo -e "${RED}❌ Nginx Frontend: FAILED (HTTP $NGINX_FRONTEND)${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   روابط الوصول - Access Links${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
IP=$(hostname -I | awk '{print $1}')
echo -e "Frontend:    ${GREEN}http://$IP/budget${NC}"
echo -e "Backend API: ${GREEN}http://$IP/budget-api/v1${NC}"
echo -e "API Docs:    ${GREEN}http://$IP/budget-api/docs${NC}"
echo ""

