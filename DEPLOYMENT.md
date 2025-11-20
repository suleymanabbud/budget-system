# دليل النشر على VPS - VPS Deployment Guide

## المتطلبات - Requirements

- VPS مع Ubuntu/Debian
- وصول Root
- اتصال بالإنترنت

---

## خطوات النشر - Deployment Steps

### 1. الاتصال بـ VPS

```bash
ssh root@72.60.32.88
```

### 2. استنساخ المشروع

```bash
cd /opt
git clone https://github.com/suleymanabbud/budget-system.git
cd budget-system
```

### 3. تشغيل سكريبت النشر

```bash
chmod +x deploy_vps.sh
./deploy_vps.sh
```

أو تنفيذ الخطوات يدوياً:

---

## النشر اليدوي - Manual Deployment

### الخطوة 1: تحديث النظام وتثبيت المتطلبات

```bash
apt-get update -y
apt-get upgrade -y

apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nodejs \
    npm \
    git \
    nginx \
    supervisor \
    sqlite3
```

### الخطوة 2: إعداد Backend

```bash
cd /opt/budget-system/backend

# إنشاء بيئة افتراضية
python3.11 -m venv venv

# تفعيل البيئة وتثبيت المكتبات
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# تهيئة قاعدة البيانات
python init_db.py
python init_users.py
```

### الخطوة 3: إعداد Frontend

```bash
cd /opt/budget-system/frontend

# تثبيت المكتبات
npm install

# بناء المشروع للإنتاج
npm run build
```

### الخطوة 4: إنشاء Systemd Services

#### Backend Service

```bash
nano /etc/systemd/system/budget-backend.service
```

أضف المحتوى التالي:

```ini
[Unit]
Description=Budget Management System Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/budget-system/backend
Environment="PATH=/opt/budget-system/backend/venv/bin"
ExecStart=/opt/budget-system/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Frontend Service

```bash
nano /etc/systemd/system/budget-frontend.service
```

أضف المحتوى التالي:

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
Environment="PORT=3000"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

### الخطوة 5: تفعيل الخدمات

```bash
systemctl daemon-reload
systemctl enable budget-backend
systemctl enable budget-frontend
systemctl start budget-backend
systemctl start budget-frontend
```

### الخطوة 6: إعداد Nginx

```bash
nano /etc/nginx/sites-available/budget-system
```

أضف التكوين التالي:

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

تفعيل الموقع:

```bash
ln -s /etc/nginx/sites-available/budget-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## الأوامر المفيدة - Useful Commands

### فحص حالة الخدمات

```bash
systemctl status budget-backend
systemctl status budget-frontend
systemctl status nginx
```

### عرض السجلات

```bash
# Backend logs
journalctl -u budget-backend -f

# Frontend logs
journalctl -u budget-frontend -f

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### إعادة تشغيل الخدمات

```bash
systemctl restart budget-backend
systemctl restart budget-frontend
systemctl restart nginx
```

### تحديث المشروع

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

---

## إعداد HTTPS (اختياري) - HTTPS Setup (Optional)

### تثبيت Certbot

```bash
apt-get install -y certbot python3-certbot-nginx
```

### الحصول على شهادة SSL

```bash
certbot --nginx -d your-domain.com
```

---

## استكشاف الأخطاء - Troubleshooting

### المشكلة: الخدمة لا تبدأ

```bash
# فحص السجلات
journalctl -u budget-backend -n 50
journalctl -u budget-frontend -n 50

# فحص المنافذ
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000
```

### المشكلة: قاعدة البيانات

```bash
cd /opt/budget-system/backend
source venv/bin/activate
python init_db.py
python init_users.py
```

### المشكلة: Frontend لا يبني

```bash
cd /opt/budget-system/frontend
rm -rf .next node_modules
npm install
npm run build
```

---

## الروابط - Links

بعد النشر، يمكنك الوصول إلى:

- **Frontend**: `http://YOUR_VPS_IP`
- **Backend API**: `http://YOUR_VPS_IP/api`
- **API Documentation**: `http://YOUR_VPS_IP/api/docs`

---

## حسابات تسجيل الدخول - Login Accounts

- **Admin**: `admin` / `admin`
- **Company Admin**: `admin1` / `admin`
- **Company User**: `user1` / `user`

