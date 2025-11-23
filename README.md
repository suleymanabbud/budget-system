# نظام إدارة الموازنات - Budget Management System

## النشر على VPS

### طريقة بسيطة:

```bash
cd /opt
rm -rf budget-system
git clone https://github.com/suleymanabbud/budget-system.git
cd budget-system
chmod +x deploy_fresh.sh
./deploy_fresh.sh
```

---

## بعد النشر:

- **Frontend**: `http://YOUR_IP/budget`
- **Backend API**: `http://YOUR_IP/budget-api/v1`
- **API Docs**: `http://YOUR_IP/budget-api/docs`

---

## حسابات تسجيل الدخول:

- **System Admin**: `admin` / `admin`
- **Company Admin**: `admin1` / `admin`
- **Company User**: `company1` / `123456`

---

## إدارة الخدمات:

```bash
systemctl status budget-backend budget-frontend
systemctl restart budget-backend budget-frontend
```

---

## التطوير المحلي:

### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python init_users.py
python run.py
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
