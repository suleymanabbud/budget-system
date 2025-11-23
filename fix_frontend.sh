#!/bin/bash

# Fix Frontend configuration and rebuild
# إصلاح إعداد Frontend وإعادة البناء

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح Frontend - Fixing Frontend${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

FRONTEND_DIR="/opt/budget-system/frontend"

cd "$FRONTEND_DIR"

# Step 1: Update next.config.js
echo -e "${YELLOW}[1/4] تحديث next.config.js...${NC}"
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/budget',
  assetPrefix: '/budget',
  async rewrites() {
    return [
      {
        source: '/budget-api/:path*',
        destination: 'http://localhost:8001/api/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/ws',
        headers: [
          { key: 'Upgrade', value: 'websocket' },
          { key: 'Connection', value: 'Upgrade' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
EOF

echo -e "${GREEN}✅ next.config.js updated${NC}"

# Step 2: Clean build
echo -e "${YELLOW}[2/4] تنظيف البناء السابق...${NC}"
rm -rf .next
echo -e "${GREEN}✅ Cleaned previous build${NC}"

# Step 3: Rebuild
echo -e "${YELLOW}[3/4] إعادة بناء Frontend...${NC}"
export NODE_ENV=production
export NEXT_PUBLIC_BASE_PATH=/budget
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Step 4: Restart service
echo -e "${YELLOW}[4/4] إعادة تشغيل Frontend service...${NC}"
systemctl restart budget-frontend
sleep 3

if systemctl is-active --quiet budget-frontend; then
    echo -e "${GREEN}✅ Frontend service restarted${NC}"
else
    echo -e "${RED}❌ Frontend service failed to start${NC}"
    systemctl status budget-frontend --no-pager -l
    exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ تم إصلاح Frontend بنجاح!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

