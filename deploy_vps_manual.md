# دليل النشر اليدوي على VPS مع نظام موجود

## الموقف
- يوجد نظام إدارة المشتريات يعمل على `http://72.60.32.88`
- نريد نشر نظام إدارة الموازنات على نفس VPS على مسار `/budget`

---

## الخطوات

### 1. استنساخ المشروع

```bash
cd /opt
git clone https://github.com/suleymanabbud/budget-system.git
cd budget-system
```

### 2. إعداد Backend

```bash
cd /opt/budget-system/backend

# إنشاء بيئة افتراضية
python3.11 -m venv venv
source venv/bin/activate

# تثبيت المكتبات
pip install --upgrade pip
pip install -r requirements.txt

# تهيئة قاعدة البيانات
python init_db.py
python init_users.py
```

### 3. إعداد Frontend

```bash
cd /opt/budget-system/frontend

# تثبيت المكتبات
npm install

# تعديل next.config.js لإضافة basePath
nano next.config.js
```

أضف/عدّل التالي في `next.config.js`:

```javascript
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
  // ... باقي الإعدادات
}
```

ثم:

```bash
npm run build
```

### 4. إنشاء Systemd Services

#### Backend Service

```bash
nano /etc/systemd/system/budget-backend.service
```

```ini
[Unit]
Description=Budget Management System Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/budget-system/backend
Environment="PATH=/opt/budget-system/backend/venv/bin"
ExecStart=/opt/budget-system/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Frontend Service

```bash
nano /etc/systemd/system/budget-frontend.service
```

```ini
[Unit]
Description=Budget Management System Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/budget-system/frontend
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment="PORT=3001"
Environment="NODE_ENV=production"
Environment="NEXT_PUBLIC_BASE_PATH=/budget"

[Install]
WantedBy=multi-user.target
```

### 5. إعداد Nginx

```bash
# إنشاء ملف snippet
nano /etc/nginx/snippets/budget-system.conf
```

أضف المحتوى التالي:

```nginx
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
```

ثم أضف السطر التالي في ملف nginx الرئيسي (عادة `/etc/nginx/sites-available/default`):

```bash
nano /etc/nginx/sites-available/default
```

أضف قبل `}` في `server` block:

```nginx
    include /etc/nginx/snippets/budget-system.conf;
```

### 6. تحديث Frontend API Base URL

تحتاج إلى تحديث ملفات Frontend لاستخدام `/budget-api` بدلاً من `/api`:

```bash
cd /opt/budget-system/frontend/src/services
```

في ملف `api.ts` أو الملفات المشابهة، غيّر:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/budget-api/v1';
```

### 7. تفعيل الخدمات

```bash
systemctl daemon-reload
systemctl enable budget-backend
systemctl enable budget-frontend
systemctl start budget-backend
systemctl start budget-frontend
systemctl restart nginx
```

### 8. التحقق

```bash
# فحص حالة الخدمات
systemctl status budget-backend
systemctl status budget-frontend

# فحص المنافذ
netstat -tulpn | grep :8001
netstat -tulpn | grep :3001

# فحص Nginx
nginx -t
```

---

## الروابط بعد النشر

- **Frontend**: `http://72.60.32.88/budget`
- **Backend API**: `http://72.60.32.88/budget-api/v1`
- **API Docs**: `http://72.60.32.88/budget-api/docs`

---

## تحديث المشروع

```bash
cd /opt/budget-system
git pull origin master

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
systemctl restart budget-backend

# Frontend
cd ../frontend
npm install
npm run build
systemctl restart budget-frontend
```

