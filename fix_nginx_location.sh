#!/bin/bash

# Fix Nginx location - move config inside server block
# إصلاح موقع Nginx - نقل الإعداد داخل server block

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح موقع إعداد Nginx${NC}"
echo -e "${BLUE}   Fixing Nginx Config Location${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
echo -e "${YELLOW}[1/4] إنشاء نسخة احتياطية...${NC}"
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Remove old budget-system config from outside server block
echo -e "${YELLOW}[2/4] إزالة الإعداد القديم...${NC}"
# Remove lines between "#server {" and end of file that contain budget-system
sed -i '/^#server {/,${/budget-system/d; /location \/budget/d; /location \/budget-api/d}' "$MAIN_CONFIG" 2>/dev/null || true

# Also remove from end of file if not in server block
awk '
    BEGIN { in_server = 0; found_budget = 0 }
    /^[[:space:]]*server[[:space:]]*\{/ { in_server = 1 }
    in_server && /budget-system/ { found_budget = 1 }
    in_server && /^[[:space:]]*\}/ { 
        if (!found_budget) {
            print "    include /etc/nginx/snippets/budget-system.conf;"
        }
        in_server = 0
        found_budget = 0
    }
    !(/budget-system/ && !in_server) && !(/location \/budget/ && !in_server) && !(/location \/budget-api/ && !in_server) {
        print
    }
' "$MAIN_CONFIG" > "$MAIN_CONFIG.tmp" && mv "$MAIN_CONFIG.tmp" "$MAIN_CONFIG"

echo -e "${GREEN}✅ Old config removed${NC}"
echo ""

# Ensure snippet exists
echo -e "${YELLOW}[3/4] التأكد من وجود snippet...${NC}"
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
    echo -e "${GREEN}✅ Snippet created${NC}"
else
    echo -e "${GREEN}✅ Snippet exists${NC}"
fi
echo ""

# Add include inside server block
echo -e "${YELLOW}[4/4] إضافة snippet داخل server block...${NC}"
if ! grep -q "budget-system.conf" "$MAIN_CONFIG"; then
    # Find server block and add before closing brace
    awk '
        BEGIN { added = 0 }
        /^[[:space:]]*server[[:space:]]*\{/ { in_server = 1 }
        in_server && /^[[:space:]]*\}/ && !added {
            print "    include /etc/nginx/snippets/budget-system.conf;"
            added = 1
            in_server = 0
        }
        { print }
    ' "$MAIN_CONFIG" > "$MAIN_CONFIG.tmp" && mv "$MAIN_CONFIG.tmp" "$MAIN_CONFIG"
    
    echo -e "${GREEN}✅ Added to server block${NC}"
else
    # Check if it's inside server block
    if awk '/^[[:space:]]*server[[:space:]]*\{/,/^[[:space:]]*\}/ { if (/budget-system/) { print "inside"; exit } }' "$MAIN_CONFIG" | grep -q "inside"; then
        echo -e "${GREEN}✅ Already inside server block${NC}"
    else
        echo -e "${YELLOW}⚠️  Found but outside server block, fixing...${NC}"
        # Remove from outside
        sed -i '/budget-system.conf/d' "$MAIN_CONFIG"
        # Add inside server block
        awk '
            BEGIN { added = 0 }
            /^[[:space:]]*server[[:space:]]*\{/ { in_server = 1 }
            in_server && /^[[:space:]]*\}/ && !added {
                print "    include /etc/nginx/snippets/budget-system.conf;"
                added = 1
                in_server = 0
            }
            { print }
        ' "$MAIN_CONFIG" > "$MAIN_CONFIG.tmp" && mv "$MAIN_CONFIG.tmp" "$MAIN_CONFIG"
        echo -e "${GREEN}✅ Fixed location${NC}"
    fi
fi

# Test and restart
echo ""
echo -e "${YELLOW}اختبار إعداد Nginx...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
    systemctl restart nginx
    sleep 2
    
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

# Test
ENDPOINTS=(
    "/budget"
    "/budget-api/docs"
)

for endpoint in "${ENDPOINTS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost$endpoint" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "404" ]; then
        echo -e "${GREEN}✅ $endpoint: HTTP $STATUS${NC}"
    else
        echo -e "${RED}❌ $endpoint: HTTP $STATUS${NC}"
    fi
done

echo ""
echo -e "${GREEN}   ✅ تم الإصلاح!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

