#!/bin/bash

# Setup Nginx for Budget System
# إعداد Nginx لنظام إدارة الموازنات

echo "Setting up Nginx for Budget System..."
echo "إعداد Nginx لنظام إدارة الموازنات..."

# Create nginx snippet
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

# Find the main nginx config file
if [ -f /etc/nginx/sites-available/default ]; then
    MAIN_CONFIG="/etc/nginx/sites-available/default"
elif [ -f /etc/nginx/nginx.conf ]; then
    MAIN_CONFIG="/etc/nginx/nginx.conf"
else
    echo "Error: Could not find nginx config file"
    exit 1
fi

# Check if already added
if ! grep -q "budget-system.conf" "$MAIN_CONFIG" 2>/dev/null; then
    # Add include before closing brace of server block
    sed -i '/^}$/i\    include /etc/nginx/snippets/budget-system.conf;' "$MAIN_CONFIG" 2>/dev/null || \
    echo "    include /etc/nginx/snippets/budget-system.conf;" >> "$MAIN_CONFIG"
    echo "Added budget-system.conf to nginx config"
else
    echo "budget-system.conf already in nginx config"
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid. Restarting nginx..."
    systemctl restart nginx
    echo "✅ Nginx configured successfully!"
    echo "✅ تم إعداد Nginx بنجاح!"
else
    echo "❌ Nginx configuration test failed!"
    echo "❌ فشل اختبار إعداد Nginx!"
    exit 1
fi

echo ""
echo "Access the application at:"
echo "  Frontend: http://$(hostname -I | awk '{print $1}')/budget"
echo "  Backend API: http://$(hostname -I | awk '{print $1}')/budget-api/v1"
echo "  API Docs: http://$(hostname -I | awk '{print $1}')/budget-api/docs"

