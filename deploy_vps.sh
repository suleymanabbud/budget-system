#!/bin/bash

# ========================================
# Budget Management System - VPS Deployment Script
# نظام إدارة الموازنات - سكريبت النشر على VPS
# ========================================

set -e  # Exit on error

echo "========================================"
echo "   Budget Management System"
echo "   نظام إدارة الموازنات"
echo "   VPS Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/opt/budget-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/venv"

# Step 1: Update system
echo -e "${GREEN}[1/10]${NC} Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Step 2: Install required packages
echo -e "${GREEN}[2/10]${NC} Installing required packages..."
apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nodejs \
    npm \
    git \
    nginx \
    supervisor \
    sqlite3 \
    curl \
    wget

# Step 3: Verify installations
echo -e "${GREEN}[3/10]${NC} Verifying installations..."
python3.11 --version
node --version
npm --version

# Step 4: Setup Backend
echo -e "${GREEN}[4/10]${NC} Setting up Backend..."
cd $BACKEND_DIR

# Create virtual environment
if [ ! -d "$VENV_DIR" ]; then
    python3.11 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Step 5: Initialize database
echo -e "${GREEN}[5/10]${NC} Initializing database..."
python init_db.py
python init_users.py

# Step 6: Setup Frontend
echo -e "${GREEN}[6/10]${NC} Setting up Frontend..."
cd $FRONTEND_DIR
npm install

# Step 7: Configure Frontend for subpath deployment
echo -e "${GREEN}[7/10]${NC} Configuring Frontend for /budget path..."
# Update next.config.js for base path
cat > $FRONTEND_DIR/next.config.js << 'NEXTEOF'
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
NEXTEOF

# Build Frontend for production
npm run build

# Step 8: Create systemd service for Backend
echo -e "${GREEN}[8/10]${NC} Creating systemd service for Backend..."
cat > /etc/systemd/system/budget-backend.service << EOF
[Unit]
Description=Budget Management System Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Step 9: Create systemd service for Frontend
echo -e "${GREEN}[9/10]${NC} Creating systemd service for Frontend..."
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
Environment="NEXT_PUBLIC_BASE_PATH=/budget"

[Install]
WantedBy=multi-user.target
EOF

# Step 10: Configure Nginx (as additional location blocks)
echo -e "${GREEN}[10/10]${NC} Configuring Nginx for /budget path..."
# Check if main nginx config exists
if [ -f /etc/nginx/sites-available/default ]; then
    MAIN_CONFIG="/etc/nginx/sites-available/default"
else
    # Find the active nginx config
    MAIN_CONFIG="/etc/nginx/sites-available/default"
    if [ ! -f "$MAIN_CONFIG" ]; then
        MAIN_CONFIG="/etc/nginx/nginx.conf"
    fi
fi

# Create budget system nginx config snippet
cat > /etc/nginx/snippets/budget-system.conf << 'EOF'
    # Budget Management System - Frontend
    location /budget {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle Next.js static files
        rewrite ^/budget/_next/static/(.*)$ /_next/static/$1 break;
        rewrite ^/budget/(.*)$ /$1 break;
    }

    # Budget Management System - Backend API
    location /budget-api {
        rewrite ^/budget-api/(.*)$ /api/$1 break;
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Budget Management System - WebSocket
    location /budget-ws {
        rewrite ^/budget-ws/(.*)$ /ws/$1 break;
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
EOF

# Add include to main nginx config if not already present
if ! grep -q "budget-system.conf" $MAIN_CONFIG 2>/dev/null; then
    # Add include before closing brace of server block
    sed -i '/^}$/i\    include /etc/nginx/snippets/budget-system.conf;' $MAIN_CONFIG 2>/dev/null || \
    echo "    include /etc/nginx/snippets/budget-system.conf;" >> $MAIN_CONFIG
fi

# Note: We're adding to existing nginx config, not replacing it

# Test Nginx configuration
nginx -t

# Step 11: Enable and start services
echo -e "${GREEN}[11/11]${NC} Enabling and starting services..."
systemctl daemon-reload
systemctl enable budget-backend
systemctl enable budget-frontend
systemctl enable nginx

systemctl start budget-backend
systemctl start budget-frontend
systemctl restart nginx

# Step 12: Check service status
echo ""
echo -e "${GREEN}========================================"
echo "   Deployment Complete!"
echo "   النشر مكتمل!"
echo "========================================${NC}"
echo ""
echo "Service Status:"
systemctl status budget-backend --no-pager -l
echo ""
systemctl status budget-frontend --no-pager -l
echo ""
echo -e "${YELLOW}Access the application at:${NC}"
echo "  Frontend: http://$(hostname -I | awk '{print $1}')"
echo "  Backend API: http://$(hostname -I | awk '{print $1}')/api"
echo "  API Docs: http://$(hostname -I | awk '{print $1}')/api/docs"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  Check Backend: systemctl status budget-backend"
echo "  Check Frontend: systemctl status budget-frontend"
echo "  View Backend logs: journalctl -u budget-backend -f"
echo "  View Frontend logs: journalctl -u budget-frontend -f"
echo "  Restart Backend: systemctl restart budget-backend"
echo "  Restart Frontend: systemctl restart budget-frontend"
echo ""

