#!/bin/bash

# Complete Nginx fix - comprehensive solution
# إصلاح شامل لـ Nginx

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح شامل لـ Nginx${NC}"
echo -e "${BLUE}   Complete Nginx Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Step 1: Check services
echo -e "${YELLOW}[1/6] فحص الخدمات...${NC}"
if ! systemctl is-active --quiet budget-backend; then
    echo -e "${RED}❌ Backend service not running${NC}"
    systemctl start budget-backend
    sleep 2
fi

if ! systemctl is-active --quiet budget-frontend; then
    echo -e "${RED}❌ Frontend service not running${NC}"
    systemctl start budget-frontend
    sleep 3
fi

echo -e "${GREEN}✅ Services are running${NC}"
echo ""

# Step 2: Test direct access
echo -e "${YELLOW}[2/6] اختبار الوصول المباشر...${NC}"
BACKEND_DIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/docs 2>/dev/null || echo "000")
FRONTEND_DIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")

echo "Backend (8001): HTTP $BACKEND_DIRECT"
echo "Frontend (3001): HTTP $FRONTEND_DIRECT"

if [ "$BACKEND_DIRECT" != "200" ]; then
    echo -e "${RED}❌ Backend not responding directly${NC}"
    exit 1
fi

if [ "$FRONTEND_DIRECT" != "200" ] && [ "$FRONTEND_DIRECT" != "404" ]; then
    echo -e "${RED}❌ Frontend not responding directly${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Direct access works${NC}"
echo ""

# Step 3: Find main Nginx config
echo -e "${YELLOW}[3/6] البحث عن إعداد Nginx الرئيسي...${NC}"
MAIN_CONFIG=""
if [ -f /etc/nginx/sites-available/default ]; then
    MAIN_CONFIG="/etc/nginx/sites-available/default"
elif [ -f /etc/nginx/nginx.conf ]; then
    MAIN_CONFIG="/etc/nginx/nginx.conf"
else
    echo -e "${RED}❌ Cannot find Nginx config file${NC}"
    exit 1
fi

echo "Using config: $MAIN_CONFIG"
echo ""

# Step 4: Create correct Nginx snippet
echo -e "${YELLOW}[4/6] إنشاء snippet صحيح...${NC}"
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

# Step 5: Ensure snippet is included
echo -e "${YELLOW}[5/6] التأكد من إضافة snippet...${NC}"
if ! grep -q "budget-system.conf" "$MAIN_CONFIG"; then
    echo -e "${YELLOW}Adding budget-system.conf to $MAIN_CONFIG...${NC}"
    
    # Try to add inside server block
    if grep -q "server {" "$MAIN_CONFIG"; then
        # Find server block and add before closing brace
        awk '
            /server \{/ { in_server = 1; print; next }
            in_server && /^\s*\}/ { 
                print "    include /etc/nginx/snippets/budget-system.conf;"
                in_server = 0
            }
            { print }
        ' "$MAIN_CONFIG" > "$MAIN_CONFIG.tmp" && mv "$MAIN_CONFIG.tmp" "$MAIN_CONFIG"
    else
        # Add to end of file
        echo "    include /etc/nginx/snippets/budget-system.conf;" >> "$MAIN_CONFIG"
    fi
    
    echo -e "${GREEN}✅ Added to config${NC}"
else
    echo -e "${GREEN}✅ Already included${NC}"
fi
echo ""

# Step 6: Test and restart
echo -e "${YELLOW}[6/6] اختبار وإعادة تشغيل Nginx...${NC}"
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
echo -e "${YELLOW}اختبار بعد الإصلاح...${NC}"
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
echo -e "Backend API: ${GREEN}http://$IP/budget-api/v1/auth/login${NC}"
echo ""

