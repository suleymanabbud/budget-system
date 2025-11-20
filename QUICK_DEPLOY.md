# نشر سريع على VPS - Quick VPS Deployment

## ⚡ النشر السريع (موصى به)

### على VPS، نفّذ:

```bash
# 1. استنساخ المشروع
cd /opt
git clone https://github.com/suleymanabbud/budget-system.git
cd budget-system

# 2. رفع ملف deploy_vps.sh وتشغيله
# (أو استخدم الطريقة اليدوية أدناه)
chmod +x deploy_vps.sh
./deploy_vps.sh
```

---

## 📝 النشر اليدوي (خطوة بخطوة)

### 1️⃣ استنساخ المشروع

```bash
cd /opt
git clone https://github.com/suleymanabbud/budget-system.git
cd budget-system
```

### 2️⃣ إعداد Backend (منفذ 8001)

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python init_db.py
python init_users.py
```

### 3️⃣ إعداد Frontend (منفذ 3001)

```bash
cd ../frontend
npm install

# تعديل next.config.js
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

npm run build
```

### 4️⃣ إنشاء Systemd Services

#### Backend Service

```bash
cat > /etc/systemd/system/budget-backend.service << 'EOF'
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
EOF
```

#### Frontend Service

```bash
cat > /etc/systemd/system/budget-frontend.service << 'EOF'
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
EOF
```

### 5️⃣ إعداد Nginx

```bash
# إنشاء snippet
cat > /etc/nginx/snippets/budget-system.conf << 'EOF'
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
EOF

# إضافة إلى nginx config
echo "    include /etc/nginx/snippets/budget-system.conf;" >> /etc/nginx/sites-available/default

# اختبار وإعادة تشغيل
nginx -t
systemctl restart nginx
```

### 6️⃣ تفعيل الخدمات

```bash
systemctl daemon-reload
systemctl enable budget-backend budget-frontend
systemctl start budget-backend budget-frontend
```

### 7️⃣ التحقق

```bash
# فحص الخدمات
systemctl status budget-backend
systemctl status budget-frontend

# فحص المنافذ
netstat -tulpn | grep -E ':(8001|3001)'

# فحص السجلات
journalctl -u budget-backend -n 20
journalctl -u budget-frontend -n 20
```

---

## 🌐 الروابط

بعد النشر:

- ✅ **Frontend**: `http://72.60.32.88/budget`
- ✅ **Backend API**: `http://72.60.32.88/budget-api/v1`
- ✅ **API Docs**: `http://72.60.32.88/budget-api/docs`

---

## 🔄 تحديث المشروع

```bash
cd /opt/budget-system
git pull origin master

# Backend
cd backend && source venv/bin/activate
pip install -r requirements.txt
systemctl restart budget-backend

# Frontend
cd ../frontend
npm install && npm run build
systemctl restart budget-frontend
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الخدمة لا تبدأ

```bash
journalctl -u budget-backend -n 50
journalctl -u budget-frontend -n 50
```

### المشكلة: Nginx لا يعمل

```bash
nginx -t
tail -f /var/log/nginx/error.log
```

### المشكلة: المنافذ مستخدمة

```bash
netstat -tulpn | grep -E ':(8001|3001)'
# إذا كان منفذ مستخدم، غيّر المنفذ في service file
```

---

## 📞 الدعم

إذا واجهت مشاكل، تحقق من:
1. السجلات: `journalctl -u budget-backend -f`
2. حالة الخدمات: `systemctl status budget-backend`
3. Nginx: `nginx -t && systemctl status nginx`

