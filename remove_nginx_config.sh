#!/bin/bash

# Remove Nginx budget system configuration
# إزالة إعدادات Nginx لنظام الموازنات

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}إزالة إعدادات Nginx...${NC}"

MAIN_CONFIG="/etc/nginx/sites-available/default"

# Backup
cp "$MAIN_CONFIG" "$MAIN_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Remove budget config
sed -i '/budget/d' "$MAIN_CONFIG" 2>/dev/null || true
sed -i '/proxy_pass.*3001/d' "$MAIN_CONFIG" 2>/dev/null || true
sed -i '/proxy_pass.*8001/d' "$MAIN_CONFIG" 2>/dev/null || true

# Test and reload
if nginx -t 2>&1; then
    systemctl reload nginx
    echo -e "${GREEN}✅ تم إزالة إعدادات Nginx${NC}"
else
    echo "❌ Error in Nginx config"
    exit 1
fi

