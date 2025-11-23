#!/bin/bash

# Fresh deployment - clean and deploy from scratch
# نشر جديد - تنظيف ونشر من الصفر

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   نشر جديد من الصفر${NC}"
echo -e "${BLUE}   Fresh Deployment from Scratch${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

PROJECT_DIR="/opt/budget-system"

# Step 1: Stop services
echo -e "${YELLOW}[1/7] إيقاف الخدمات...${NC}"
systemctl stop budget-backend budget-frontend 2>/dev/null || true
echo -e "${GREEN}✅ Services stopped${NC}"
echo ""

# Step 2: Remove old project
echo -e "${YELLOW}[2/7] حذف المشروع القديم...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    rm -rf "$PROJECT_DIR"
    echo -e "${GREEN}✅ Old project removed${NC}"
else
    echo -e "${YELLOW}⚠️  Project directory not found${NC}"
fi
echo ""

# Step 3: Clone fresh project
echo -e "${YELLOW}[3/7] استنساخ المشروع من GitHub...${NC}"
cd /opt
git clone https://github.com/suleymanabbud/budget-system.git
cd budget-system
echo -e "${GREEN}✅ Project cloned${NC}"
echo ""

# Step 4: Setup Backend
echo -e "${YELLOW}[4/7] إعداد Backend...${NC}"
cd backend

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
python init_db.py
python init_users.py

echo -e "${GREEN}✅ Backend ready${NC}"
echo ""

# Step 5: Setup Frontend
echo -e "${YELLOW}[5/7] إعداد Frontend...${NC}"
cd ../frontend

# Update next.config.js
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

# Step 6: Create systemd services
echo -e "${YELLOW}[6/7] إنشاء systemd services...${NC}"

# Backend service
cat > /etc/systemd/system/budget-backend.service << EOF
[Unit]
Description=Budget Management System Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR/backend
Environment="PATH=$PROJECT_DIR/backend/venv/bin"
ExecStart=$PROJECT_DIR/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
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
WorkingDirectory=$PROJECT_DIR/frontend
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
systemctl start budget-backend budget-frontend

echo -e "${GREEN}✅ Services created and started${NC}"
echo ""

# Step 7: Configure Nginx
echo -e "${YELLOW}[7/7] إعداد Nginx...${NC}"
MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Remove old budget config
sed -i '/budget/d' "$MAIN_CONFIG" 2>/dev/null || true
sed -i '/proxy_pass.*3001/d' "$MAIN_CONFIG" 2>/dev/null || true
sed -i '/proxy_pass.*8001/d' "$MAIN_CONFIG" 2>/dev/null || true

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

# Verify
echo -e "${YELLOW}التحقق...${NC}"
sleep 3

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

