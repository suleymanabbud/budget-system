#!/bin/bash

# Script to fix backend service issues
# سكريبت لإصلاح مشاكل خدمة Backend

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}إصلاح Backend Service...${NC}"
echo -e "${GREEN}Fixing Backend Service...${NC}"

BACKEND_DIR="/opt/budget-system/backend"
VENV_DIR="$BACKEND_DIR/venv"

cd "$BACKEND_DIR"

# Activate virtual environment
echo -e "${YELLOW}تفعيل البيئة الافتراضية...${NC}"
source "$VENV_DIR/bin/activate"

# Upgrade pip
echo -e "${YELLOW}تحديث pip...${NC}"
pip install --upgrade pip

# Install/Reinstall all requirements
echo -e "${YELLOW}تثبيت جميع المتطلبات...${NC}"
pip install -r requirements.txt --force-reinstall --no-cache-dir

# Verify email-validator installation
echo -e "${YELLOW}التحقق من تثبيت email-validator...${NC}"
python -c "import email_validator; print('✅ email-validator installed')" || {
    echo -e "${RED}❌ email-validator not found, installing...${NC}"
    pip install email-validator
}

# Test backend import
echo -e "${YELLOW}اختبار استيراد Backend...${NC}"
python -c "from app.main import app; print('✅ Backend import OK')" || {
    echo -e "${RED}❌ Backend import failed${NC}"
    exit 1
}

# Restart service
echo -e "${YELLOW}إعادة تشغيل Backend service...${NC}"
systemctl restart budget-backend

# Wait a moment
sleep 2

# Check status
echo -e "${YELLOW}فحص حالة الخدمة...${NC}"
systemctl status budget-backend --no-pager -l

echo -e "${GREEN}✅ تم إصلاح Backend!${NC}"
echo -e "${GREEN}✅ Backend fixed!${NC}"

