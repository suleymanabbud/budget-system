# نظام إدارة الموازنات - صرح القابضة
# Budget Management System - Sareh Holding

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

نظام متكامل لإدارة الموازنات التقريبية والفعلية مع لوحة تحكم حية ودليل أعمال شامل.

---

## 📋 نظرة عامة - Overview

نظام إدارة موازنات احترافي مصمم خصيصاً لـ **صرح القابضة** لإدارة:
- ✅ **5 شركات** بواجهات إدخال منفصلة
- ✅ **موازنات تقريبية وفعلية** شهرية
- ✅ **لوحة تحكم حية** مع تحديثات Real-time
- ✅ **تقارير شاملة** وإحصائيات تفصيلية
- ✅ **دليل أعمال** متكامل

---

## 🏗️ البنية التقنية - Tech Stack

### Backend
- **Python 3.11+** - لغة البرمجة
- **FastAPI** - Framework سريع وحديث
- **SQLAlchemy** - ORM للتعامل مع قاعدة البيانات
- **Pydantic** - التحقق من البيانات
- **SQLite** - قاعدة بيانات (قابلة للترقية لـ PostgreSQL)
- **WebSocket** - التحديثات الحية

### Frontend
- **Next.js 14** - React Framework مع App Router
- **TypeScript** - للأمان والجودة
- **Material-UI (MUI)** - مكتبة المكونات
- **Redux Toolkit** - إدارة الحالة
- **Recharts** - الرسوم البيانية التفاعلية
- **Socket.io** - التحديثات الحية
- **Axios** - HTTP Client

---

## 🚀 التثبيت والتشغيل - Installation

### المتطلبات - Requirements
- Python 3.11 أو أحدث
- Node.js 18 أو أحدث
- npm أو yarn

### 1️⃣ Backend Setup

```bash
# انتقل لمجلد Backend
cd backend

# إنشاء بيئة افتراضية
python -m venv venv

# تفعيل البيئة
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# تثبيت المكتبات
pip install -r requirements.txt

# إنشاء قاعدة البيانات
python init_db.py

# إنشاء المستخدمين
python init_users.py

# تشغيل الخادم
python run.py
```

✅ **Backend يعمل على:** `http://localhost:8000`
📚 **API Docs:** `http://localhost:8000/api/docs`

---

### 2️⃣ Frontend Setup

```bash
# انتقل لمجلد Frontend (في terminal جديد)
cd frontend

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm run dev
```

✅ **Frontend يعمل على:** `http://localhost:3000`

---

## 📱 الصفحات والميزات - Features

### 🔐 تسجيل الدخول
- **المسار:** `/login`
- **📄 لمعلومات تسجيل الدخول الكاملة:** راجع ملف `LOGIN_INFO.txt`

**حسابات النظام:**
- مدير النظام: `admin` / `admin`
- مدراء الشركات: `admin1` إلى `admin5` / `admin`
- مستخدمو الشركات: `company1` إلى `company5` / `123456`

### 📊 لوحة التحكم
- **المسار:** `/dashboard`
- إحصائيات شاملة
- رسوم بيانية تفاعلية
- مقارنة الموازنات التقريبية بالفعلية
- تحديثات حية Real-time

### 📚 دليل الأعمال
- **المسار:** `/business-directory`
- عرض جميع الشركات
- الوصول السريع للموازنات

### 🏢 إدارة الشركات
- **المسار:** `/companies`
- إضافة وتعديل وحذف الشركات

### 📦 إدارة المنتجات
- **المسار:** `/products`
- إدارة المنتجات ووحدات القياس

### 💰 إدخال الموازنات
- **المسار:** `/budget-entry/[companyId]`
- واجهة منفصلة لكل شركة
- إدخال موازنات تقريبية وفعلية

### 📈 التقارير
- **المسار:** `/reports`
- تقارير شاملة مع فلترة
- طباعة وتصدير

---

## 🎨 الهوية البصرية - Branding

### ألوان صرح القابضة:
- **#708472** - الأخضر الرئيسي (PANTONE 5625 C)
- **#A3B1A4** - أخضر فاتح (PANTONE 5645 C)
- **#1D1D1B** - أسود (PANTONE Black C)
- **#3D3935** - رمادي غامق
- **#898A8D** - رمادي
- **#C8C8C8** - رمادي فاتح

للمزيد: راجع `BRAND_COLORS.md`

---

## 📂 هيكل المشروع - Project Structure

```
budget-system/
├── backend/              # Python FastAPI
│   ├── app/
│   │   ├── api/         # API Endpoints
│   │   ├── core/        # Configuration
│   │   ├── models/      # Database Models
│   │   ├── schemas/     # Pydantic Schemas
│   │   ├── services/    # Business Logic
│   │   └── db/          # Database Config
│   ├── init_db.py       # Database Initialization
│   ├── run.py           # Server Entry Point
│   └── requirements.txt # Dependencies
│
├── frontend/            # Next.js TypeScript
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   ├── components/  # React Components
│   │   ├── services/    # API Services
│   │   └── store/       # Redux Store
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                # Documentation
    ├── README.md
    ├── INSTALLATION.md
    ├── PROJECT_STRUCTURE.md
    └── BRAND_COLORS.md
```

للمزيد: راجع `PROJECT_STRUCTURE.md`

---

## 🔒 الأمان - Security

- نظام مصادقة كامل
- حماية جميع الصفحات
- Token-based authentication
- Validation شامل للبيانات

---

## 📊 قاعدة البيانات - Database

### الجداول الرئيسية:
1. **Companies** - بيانات الشركات
2. **Products** - المنتجات ووحدات القياس
3. **Budgets** - الموازنات (تقريبية/فعلية)

### الحقول الأساسية للموازنة:
- رقم التسلسل
- السنة / الربع / الشهر
- الشركة
- المنتج
- نوع الموازنة (تقريبية/فعلية)
- الكمية / السعر / الإجمالي

---

## 🛠️ التطوير - Development

### Backend Development
```bash
cd backend
venv\Scripts\activate
python run.py
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### إنشاء Build للإنتاج
```bash
cd frontend
npm run build
npm start
```

---

## 📚 التوثيق - Documentation

- **INSTALLATION.md** - دليل التثبيت التفصيلي
- **PROJECT_STRUCTURE.md** - شرح هيكل المشروع
- **BRAND_COLORS.md** - الهوية البصرية
- **PAGES_LIST.md** - قائمة الصفحات والميزات

---

## 🐛 استكشاف الأخطاء - Troubleshooting

### Backend لا يعمل
```bash
pip install -r requirements.txt
python init_db.py
python run.py
```

### Frontend لا يعمل
```bash
rm -rf node_modules
npm install
npm run dev
```

### قاعدة البيانات فارغة
```bash
cd backend
python init_db.py
python init_users.py
```

### مشاكل تسجيل الدخول
```bash
# قم بإعادة تعيين المستخدمين
cd backend
python init_users.py

# أو استخدم الملف الجاهز
reset_users.bat
```

---

## ✨ الميزات الإضافية - Additional Features

- ✅ دعم كامل للغة العربية (RTL)
- ✅ تصميم متجاوب (Responsive)
- ✅ تحديثات حية (Real-time)
- ✅ رسوم بيانية تفاعلية
- ✅ فلترة وبحث متقدم
- ✅ تصدير وطباعة التقارير

---

## 📞 الدعم - Support

للمزيد من المعلومات أو الدعم، راجع ملفات التوثيق أو تواصل مع فريق التطوير.

---

## 📝 الترخيص - License

© 2025 صرح القابضة - Sareh Holding. جميع الحقوق محفوظة.

---

## 🎉 الإصدار - Version

**الإصدار الحالي:** 1.0.0
**تاريخ الإصدار:** أكتوبر 2025

---

**🚀 مبروك! النظام جاهز للاستخدام!**
