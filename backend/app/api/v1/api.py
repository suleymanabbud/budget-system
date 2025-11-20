"""
API Router - موجه API
Combines all API endpoints
"""
from fastapi import APIRouter

from app.api.v1.endpoints import companies, products, budgets, auth, accounts, excel

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication - المصادقة"]
)

api_router.include_router(
    companies.router,
    prefix="/companies",
    tags=["Companies - الشركات"]
)

api_router.include_router(
    products.router,
    prefix="/products",
    tags=["Products - المنتجات"]
)

api_router.include_router(
    budgets.router,
    prefix="/budgets",
    tags=["Budgets - الموازنات"]
)

api_router.include_router(
    accounts.router,
    prefix="/accounts",
    tags=["Accounts - الحسابات"]
)

api_router.include_router(
    excel.router,
    prefix="/excel",
    tags=["Excel Upload - رفع ملفات Excel"]
)

