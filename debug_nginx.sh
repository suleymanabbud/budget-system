#!/bin/bash

# Debug and fix Nginx configuration
# تصحيح وإصلاح إعداد Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   تصحيح إعداد Nginx${NC}"
echo -e "${BLUE}   Debugging Nginx Configuration${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Check current Nginx config
echo -e "${YELLOW}[1/6] فحص إعداد Nginx الحالي...${NC}"
echo ""
echo "=== /etc/nginx/snippets/budget-system.conf ==="
cat /etc/nginx/snippets/budget-system.conf 2>/dev/null || echo "File not found!"
echo ""

# Step 2: Check if included in main config
echo -e "${YELLOW}[2/6] فحص إضافة snippet إلى الإعداد الرئيسي...${NC}"
MAIN_CONFIG="/etc/nginx/sites-available/default"
if [ ! -f "$MAIN_CONFIG" ]; then
    MAIN_CONFIG="/etc/nginx/nginx.conf"
fi

if grep -q "budget-system.conf" "$MAIN_CONFIG"; then
    echo -e "${GREEN}✅ budget-system.conf is included${NC}"
    echo "Location in config:"
    grep -n "budget-system.conf" "$MAIN_CONFIG"
else
    echo -e "${RED}❌ budget-system.conf is NOT included!${NC}"
fi
echo ""

# Step 3: Test Backend directly
echo -e "${YELLOW}[3/6] اختبار Backend مباشرة...${NC}"
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/docs || echo "000")
echo "Backend on port 8001: HTTP $BACKEND_TEST"
if [ "$BACKEND_TEST" = "200" ]; then
    echo -e "${GREEN}✅ Backend works directly${NC}"
else
    echo -e "${RED}❌ Backend not working${NC}"
fi
echo ""

# Step 4: Test through Nginx
echo -e "${YELLOW}[4/6] اختبار من خلال Nginx...${NC}"
NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget-api/docs 2>/dev/null || echo "000")
echo "Nginx proxy: HTTP $NGINX_TEST"
if [ "$NGINX_TEST" = "200" ]; then
    echo -e "${GREEN}✅ Nginx proxy works${NC}"
else
    echo -e "${RED}❌ Nginx proxy not working${NC}"
fi
echo ""

# Step 5: Check Nginx error logs
echo -e "${YELLOW}[5/6] فحص سجلات أخطاء Nginx...${NC}"
echo "Last 10 lines of error log:"
tail -10 /var/log/nginx/error.log 2>/dev/null || echo "Error log not found"
echo ""

# Step 6: Create correct config
echo -e "${YELLOW}[6/6] إنشاء إعداد صحيح...${NC}"
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
    # Use exact match for /budget-api/docs first
    location = /budget-api/docs {
        proxy_pass http://localhost:8001/api/docs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Then regex for other paths
    location ~ ^/budget-api/(.*)$ {
        proxy_pass http://localhost:8001/api/$1$is_args$args;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
EOF

# Ensure it's included in main config
if ! grep -q "budget-system.conf" "$MAIN_CONFIG"; then
    echo -e "${YELLOW}Adding budget-system.conf to main config...${NC}"
    # Try to add inside server block
    if grep -q "server {" "$MAIN_CONFIG"; then
        # Add before closing brace of server block
        sed -i '/^[[:space:]]*server[[:space:]]*{/,/^[[:space:]]*}/ {
            /^[[:space:]]*}/i\
    include /etc/nginx/snippets/budget-system.conf;
        }' "$MAIN_CONFIG"
    else
        # Add to end of file
        echo "    include /etc/nginx/snippets/budget-system.conf;" >> "$MAIN_CONFIG"
    fi
fi

# Test and restart
if nginx -t; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
    systemctl restart nginx
    sleep 2
    
    # Test again
    echo ""
    echo -e "${YELLOW}اختبار بعد الإصلاح...${NC}"
    NEW_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/budget-api/docs 2>/dev/null || echo "000")
    if [ "$NEW_TEST" = "200" ]; then
        echo -e "${GREEN}✅ SUCCESS! Backend API now works through Nginx${NC}"
    else
        echo -e "${RED}❌ Still not working (HTTP $NEW_TEST)${NC}"
        echo "Testing with verbose curl:"
        curl -v http://localhost/budget-api/docs 2>&1 | head -30
    fi
else
    echo -e "${RED}❌ Nginx config test failed${NC}"
    nginx -t
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"

