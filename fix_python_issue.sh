#!/bin/bash

# Fix Python version issue on VPS
# إصلاح مشكلة إصدار Python على VPS

echo "========================================"
echo "   Fixing Python Installation"
echo "   إصلاح تثبيت Python"
echo "========================================"
echo ""

# Update the project first
cd /opt/budget-system
git pull origin master

# Install Python 3 (general version)
apt-get update -y
apt-get install -y \
    python3 \
    python3-venv \
    python3-pip \
    nodejs \
    npm \
    git \
    nginx \
    supervisor \
    sqlite3 \
    curl \
    wget

echo ""
echo "Python version check:"
python3 --version

echo ""
echo "Now you can run: ./deploy_vps.sh"
echo "أو يمكنك تشغيل: ./deploy_vps.sh"

