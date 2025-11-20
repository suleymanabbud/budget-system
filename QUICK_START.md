# 🚀 دليل البدء السريع - Quick Start Guide

## ⚡ البدء السريع في 3 خطوات

### 1️⃣ إعداد Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python init_users.py
python run.py
```

✅ Backend جاهز على: http://localhost:8000

---

### 2️⃣ إعداد Frontend

```bash
# في terminal جديد
cd frontend
npm install
npm run dev
```

✅ Frontend جاهز على: http://localhost:3000

---

### 3️⃣ تسجيل الدخول

افتح المتصفح على: http://localhost:3000/login

**جرّب أحد هذه الحسابات:**
- `admin` / `admin` - مدير النظام
- `company1` / `123456` - مستخدم الشركة الأولى
- `admin1` / `admin` - مدير الشركة الأولى

📄 **لجميع الحسابات:** راجع ملف `LOGIN_INFO.txt`

---

## 🔧 استخدام الملفات الجاهزة (Windows)

### تشغيل سريع:
```
run_system.bat
```
سيشغل Backend و Frontend معاً!

### إعادة تعيين المستخدمين:
```
reset_users.bat
```

---

## 🎯 الصفحات الرئيسية

بعد تسجيل الدخول، جرّب:

1. **لوحة التحكم:** `/dashboard`
   - إحصائيات شاملة
   - رسوم بيانية

2. **لوحة الشركة:** `/company-dashboard`
   - إدارة الموازنات
   - شجرة الحسابات

3. **إدارة الموازنات:** `/company-dashboard/budget-management`
   - إدخال الموازنات
   - شجرة الحسابات التفاعلية

---

## 🆘 حل المشاكل السريع

### مشكلة تسجيل الدخول؟
```bash
cd backend
python init_users.py
```

### Backend لا يعمل؟
```bash
cd backend
venv\Scripts\activate
python run.py
```

### Frontend لا يعمل؟
```bash
cd frontend
npm run dev
```

---

## ✅ التحقق من النظام

### تحقق من Backend:
افتح: http://localhost:8000/api/docs

### تحقق من Frontend:
افتح: http://localhost:3000

---

**🎉 مبروك! النظام جاهز للاستخدام!**

للمزيد من التفاصيل، راجع:
- `README.md` - الدليل الكامل
- `LOGIN_INFO.txt` - معلومات تسجيل الدخول
- `PROJECT_STRUCTURE.md` - هيكل المشروع

