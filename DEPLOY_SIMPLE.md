# نشر بسيط على VPS - Simple VPS Deployment

## خطوات النشر

### 1. على VPS، نفّذ:

```bash
cd /opt
git clone https://github.com/suleymanabbud/budget-system.git
cd budget-system
chmod +x deploy_vps_simple.sh
./deploy_vps_simple.sh
```

---

## السكريبت يقوم بـ:

1. ✅ استنساخ/تحديث المشروع
2. ✅ إعداد Backend (Python, venv, dependencies, database)
3. ✅ إعداد Frontend (Node.js, build مع basePath)
4. ✅ إنشاء systemd services
5. ✅ إعداد Nginx
6. ✅ تشغيل جميع الخدمات

---

## بعد النشر:

- **Frontend**: `http://YOUR_IP/budget`
- **Backend API**: `http://YOUR_IP/budget-api/v1`
- **API Docs**: `http://YOUR_IP/budget-api/docs`

---

## حسابات تسجيل الدخول:

- **System Admin**: `admin` / `admin`
- **Company 1**: `admin1` / `admin` | `company1` / `123456`
- **Company 2-5**: نفس النمط

---

## إدارة الخدمات:

```bash
# حالة الخدمات
systemctl status budget-backend
systemctl status budget-frontend

# إعادة تشغيل
systemctl restart budget-backend budget-frontend

# السجلات
journalctl -u budget-backend -n 50
journalctl -u budget-frontend -n 50
```

---

## إذا واجهت مشاكل:

1. تحقق من الخدمات:
   ```bash
   systemctl status budget-backend budget-frontend nginx
   ```

2. تحقق من المنافذ:
   ```bash
   netstat -tuln | grep -E ':(8001|3001)'
   ```

3. تحقق من السجلات:
   ```bash
   journalctl -u budget-backend -n 50 --no-pager
   journalctl -u budget-frontend -n 50 --no-pager
   ```

---

## تحديث المشروع:

```bash
cd /opt/budget-system
git pull origin master
cd backend && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm install && npm run build
systemctl restart budget-backend budget-frontend
```

---

**ملاحظة**: تأكد من أن Python 3 و Node.js مثبتان على VPS.

