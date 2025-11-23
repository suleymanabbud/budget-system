#!/bin/bash

# Simple VPS Deployment Script
# سكريبت نشر بسيط على VPS

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   نشر نظام إدارة الموازنات${NC}"
echo -e "${BLUE}   Budget System Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

PROJECT_DIR="/opt/budget-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Step 1: Clone/Update project
echo -e "${YELLOW}[1/6] استنساخ/تحديث المشروع...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    cd /opt
    git clone https://github.com/suleymanabbud/budget-system.git
else
    cd "$PROJECT_DIR"
    git pull origin master
fi
echo -e "${GREEN}✅ Project ready${NC}"
echo ""

# Step 2: Setup Backend
echo -e "${YELLOW}[2/6] إعداد Backend...${NC}"
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
if [ ! -f "budget_system.db" ]; then
    python init_db.py
    python init_users.py
fi

echo -e "${GREEN}✅ Backend ready${NC}"
echo ""

# Step 3: Setup Frontend
echo -e "${YELLOW}[3/6] إعداد Frontend...${NC}"
cd "$FRONTEND_DIR"

# Update next.config.js for basePath
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
}

module.exports = nextConfig
EOF

npm install
npm run build

echo -e "${GREEN}✅ Frontend ready${NC}"
echo ""

# Step 4: Create systemd services
echo -e "${YELLOW}[4/6] إنشاء systemd services...${NC}"

# Backend service
cat > /etc/systemd/system/budget-backend.service << EOF
[Unit]
Description=Budget Management System Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
ExecStart=$BACKEND_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
cat > /etc/systemd/system/budget-frontend.service << EOF
[Unit]
Description=Budget Management System Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$FRONTEND_DIR
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment="PORT=3001"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable budget-backend budget-frontend
systemctl restart budget-backend budget-frontend

echo -e "${GREEN}✅ Services created and started${NC}"
echo ""

# Step 5: Configure Nginx
echo -e "${YELLOW}[5/6] إعداد Nginx...${NC}"
MAIN_CONFIG="/etc/nginx/sites-available/default"

# Remove old budget config
sed -i '/budget/d' "$MAIN_CONFIG" 2>/dev/null || true

# Add location blocks before location /
python3 << 'PYEOF'
import re

with open('/etc/nginx/sites-available/default', 'r') as f:
    content = f.read()

# Find location / block
match = re.search(r'(\s+)(location\s+/\s*\{)', content)
if not match:
    print("ERROR: Could not find location /")
    exit(1)

indent = match.group(1)
location_start = match.start()

# Budget config
budget_config = f'''{indent}# Budget Management System
{indent}location /budget {{
{indent}    proxy_pass http://localhost:3001/budget;
{indent}    proxy_http_version 1.1;
{indent}    proxy_set_header Upgrade $http_upgrade;
{indent}    proxy_set_header Connection 'upgrade';
{indent}    proxy_set_header Host $host;
{indent}    proxy_set_header X-Real-IP $remote_addr;
{indent}    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
{indent}    proxy_set_header X-Forwarded-Proto $scheme;
{indent}}}

{indent}location /budget-api {{
{indent}    rewrite ^/budget-api(.*)$ /api$1 break;
{indent}    proxy_pass http://localhost:8001;
{indent}    proxy_http_version 1.1;
{indent}    proxy_set_header Host $host;
{indent}    proxy_set_header X-Real-IP $remote_addr;
{indent}    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
{indent}    proxy_set_header X-Forwarded-Proto $scheme;
{indent}}}

{indent}'''

# Insert before location /
new_content = content[:location_start] + budget_config + content[location_start:]

with open('/etc/nginx/sites-available/default', 'w') as f:
    f.write(new_content)

print("Nginx config updated")
PYEOF

nginx -t && systemctl restart nginx

echo -e "${GREEN}✅ Nginx configured${NC}"
echo ""

# Step 6: Verify
echo -e "${YELLOW}[6/6] التحقق...${NC}"
sleep 2

echo "Services status:"
systemctl is-active budget-backend && echo "✅ Backend: running" || echo "❌ Backend: not running"
systemctl is-active budget-frontend && echo "✅ Frontend: running" || echo "❌ Frontend: not running"
systemctl is-active nginx && echo "✅ Nginx: running" || echo "❌ Nginx: not running"

echo ""
IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ تم النشر بنجاح!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Frontend:    http://$IP/budget"
echo "Backend API: http://$IP/budget-api/v1"
echo "API Docs:    http://$IP/budget-api/docs"
echo ""
echo "Login: admin / admin"
echo ""

