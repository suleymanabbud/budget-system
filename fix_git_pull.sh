#!/bin/bash

# Fix git pull issue on VPS
# حل مشكلة git pull على VPS

echo "Fixing git pull issue..."
echo "حل مشكلة git pull..."

cd /opt/budget-system

# Backup the local deploy_vps.sh if it exists
if [ -f deploy_vps.sh ]; then
    echo "Backing up local deploy_vps.sh..."
    mv deploy_vps.sh deploy_vps.sh.backup
fi

# Now pull the updates
echo "Pulling updates from GitHub..."
git pull origin master

# If there are conflicts, use the remote version
if [ $? -ne 0 ]; then
    echo "Resolving conflicts by using remote version..."
    git checkout --theirs deploy_vps.sh 2>/dev/null || true
    git pull origin master
fi

echo "Done! Now you can run: cd frontend && npm run build"
echo "تم! الآن يمكنك تشغيل: cd frontend && npm run build"

