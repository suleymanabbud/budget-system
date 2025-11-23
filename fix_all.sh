#!/bin/bash

# Complete fix for Budget System deployment
# إصلاح شامل لنشر نظام إدارة الموازنات

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   إصلاح شامل للنظام${NC}"
echo -e "${BLUE}   Complete System Fix${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

cd /opt/budget-system

# Step 1: Pull latest changes
echo -e "${YELLOW}[1/5] جلب آخر التحديثات...${NC}"
git pull origin master
echo -e "${GREEN}✅ Updated from Git${NC}"
echo ""

# Step 2: Fix Backend
echo -e "${YELLOW}[2/5] إصلاح Backend...${NC}"
chmod +x fix_backend.sh
./fix_backend.sh
echo ""

# Step 3: Fix Frontend
echo -e "${YELLOW}[3/5] إصلاح Frontend...${NC}"
chmod +x fix_frontend.sh
./fix_frontend.sh
echo ""

# Step 4: Fix Nginx
echo -e "${YELLOW}[4/5] إصلاح Nginx...${NC}"
chmod +x fix_nginx.sh
./fix_nginx.sh
echo ""

# Step 5: Verify
echo -e "${YELLOW}[5/5] التحقق من النظام...${NC}"
chmod +x verify_deployment.sh
./verify_deployment.sh

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ تم إصلاح النظام بالكامل!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

