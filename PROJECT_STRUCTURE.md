# 📂 هيكل المشروع - Project Structure

```
budget-system/
├── 📁 backend/                    # Python FastAPI Backend
│   ├── 📁 app/                    # Application Core
│   │   ├── 📁 api/               # API Endpoints
│   │   │   └── 📁 v1/
│   │   │       ├── api.py        # Main API Router
│   │   │       └── 📁 endpoints/
│   │   │           ├── accounts.py    # Account Management
│   │   │           ├── auth.py        # Authentication
│   │   │           ├── budgets.py     # Budget Management
│   │   │           ├── companies.py  # Company Management
│   │   │           └── products.py   # Product Management
│   │   ├── 📁 core/              # Core Configuration
│   │   │   ├── config.py         # App Configuration
│   │   │   └── security.py       # Security & JWT
│   │   ├── 📁 db/                # Database Configuration
│   │   │   ├── base.py           # SQLAlchemy Base
│   │   │   └── session.py        # Database Session
│   │   ├── 📁 models/            # Database Models
│   │   │   ├── account.py        # Account Model
│   │   │   ├── budget.py         # Budget Model
│   │   │   ├── company.py        # Company Model
│   │   │   ├── product.py        # Product Model
│   │   │   └── user.py           # User Model
│   │   ├── 📁 schemas/           # Pydantic Schemas
│   │   │   ├── account.py        # Account Schemas
│   │   │   ├── budget.py         # Budget Schemas
│   │   │   ├── company.py        # Company Schemas
│   │   │   ├── product.py        # Product Schemas
│   │   │   └── user.py           # User Schemas
│   │   ├── 📁 services/          # Business Logic
│   │   │   ├── account_service.py    # Account Service
│   │   │   ├── budget_service.py     # Budget Service
│   │   │   ├── company_service.py    # Company Service
│   │   │   ├── product_service.py    # Product Service
│   │   │   └── user_service.py       # User Service
│   │   └── main.py               # FastAPI App Entry Point
│   ├── 📁 venv/                  # Python Virtual Environment
│   ├── init_accounts.py          # Initialize Chart of Accounts
│   ├── init_db.py                # Initialize Database
│   ├── init_users.py             # Initialize Users
│   ├── requirements.txt          # Python Dependencies
│   └── run.py                    # Server Entry Point
│
├── 📁 frontend/                  # Next.js Frontend
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js App Router
│   │   │   ├── 📁 (main)/        # Protected Routes
│   │   │   │   ├── 📁 budget-entry/
│   │   │   │   │   └── 📁 [companyId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── 📁 business-directory/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 companies/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 company-dashboard/
│   │   │   │   │   ├── 📁 budget-management/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 products/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── 📁 reports/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── 📁 login/
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── theme.ts
│   │   ├── 📁 components/        # React Components
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── 📁 Dashboard/
│   │   │   │   ├── BudgetChart.tsx
│   │   │   │   ├── ComparisonChart.tsx
│   │   │   │   └── RealtimeUpdates.tsx
│   │   │   └── 📁 Layout/
│   │   │       ├── Header.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── 📁 hooks/             # Custom Hooks
│   │   │   └── usePermissions.ts
│   │   ├── 📁 services/          # API Services
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── budgetService.ts
│   │   │   ├── companyService.ts
│   │   │   └── productService.ts
│   │   └── 📁 store/             # Redux Store
│   │       ├── 📁 slices/
│   │       │   ├── authSlice.ts
│   │       │   ├── budgetSlice.ts
│   │       │   ├── companySlice.ts
│   │       │   └── productSlice.ts
│   │       └── store.ts
│   ├── 📁 node_modules/          # Node.js Dependencies
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── 📄 .gitignore                 # Git Ignore Rules
├── 📄 LOGIN_INFO.txt             # Login Information
├── 📄 PROJECT_STRUCTURE.md       # This File
├── 📄 QUICK_START.md             # Quick Start Guide
├── 📄 README.md                  # Main Documentation
├── 📄 reset_users.bat            # Reset Users Script
├── 📄 run_system.bat             # Run Both Services
├── 📄 start_backend.bat          # Start Backend
└── 📄 start_frontend.bat         # Start Frontend
```

---

## 📋 وصف الملفات الرئيسية

### 🔧 Backend Files

| الملف | الوصف |
|-------|-------|
| `app/main.py` | نقطة دخول FastAPI الرئيسية |
| `app/core/config.py` | إعدادات التطبيق |
| `app/core/security.py` | الأمان والمصادقة |
| `app/models/` | نماذج قاعدة البيانات |
| `app/schemas/` | مخططات Pydantic |
| `app/services/` | منطق العمل |
| `app/api/` | نقاط نهاية API |
| `init_db.py` | تهيئة قاعدة البيانات |
| `init_users.py` | إنشاء المستخدمين |
| `init_accounts.py` | إنشاء شجرة الحسابات |
| `run.py` | تشغيل الخادم |

### 🎨 Frontend Files

| الملف | الوصف |
|-------|-------|
| `src/app/` | صفحات Next.js |
| `src/components/` | مكونات React |
| `src/services/` | خدمات API |
| `src/store/` | إدارة الحالة Redux |
| `src/hooks/` | Custom Hooks |
| `theme.ts` | إعدادات المظهر |
| `globals.css` | الأنماط العامة |

### 📄 Documentation Files

| الملف | الوصف |
|-------|-------|
| `README.md` | الدليل الرئيسي |
| `QUICK_START.md` | دليل البدء السريع |
| `LOGIN_INFO.txt` | معلومات تسجيل الدخول |
| `PROJECT_STRUCTURE.md` | هيكل المشروع (هذا الملف) |

### 🚀 Script Files

| الملف | الوصف |
|-------|-------|
| `run_system.bat` | تشغيل النظام كاملاً |
| `start_backend.bat` | تشغيل Backend فقط |
| `start_frontend.bat` | تشغيل Frontend فقط |
| `reset_users.bat` | إعادة تعيين المستخدمين |

---

## 🗂️ تنظيم الملفات

### ✅ الملفات المهمة
- **Backend:** `app/`, `init_*.py`, `run.py`
- **Frontend:** `src/`, `package.json`
- **Documentation:** `README.md`, `QUICK_START.md`

### ❌ الملفات المؤقتة (محذوفة)
- `__pycache__/` - ملفات Python المؤقتة
- `*.db` - قواعد البيانات المؤقتة
- `node_modules/` - مكتبات Node.js
- ملفات التوثيق المكررة

### 🔒 الملفات المحمية
- `.gitignore` - قواعد Git
- `venv/` - البيئة الافتراضية
- ملفات الإعدادات

---

## 📊 إحصائيات المشروع

- **📁 المجلدات:** 15+ مجلد
- **📄 الملفات:** 50+ ملف
- **🐍 Python Files:** 20+ ملف
- **⚛️ React/TypeScript Files:** 25+ ملف
- **📚 Documentation Files:** 5+ ملف

---

## 🎯 نصائح التنظيم

1. **احتفظ بالملفات الأساسية فقط**
2. **استخدم `.gitignore` لحماية الملفات المؤقتة**
3. **راجع `QUICK_START.md` للبدء السريع**
4. **راجع `LOGIN_INFO.txt` لمعلومات تسجيل الدخول**
5. **استخدم ملفات `.bat` للتشغيل السريع**

---

**📝 ملاحظة:** هذا الهيكل منظم ومحسن للاستخدام في بيئة الإنتاج والتطوير.
