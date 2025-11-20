"""
Budgets API Endpoints - نقاط نهاية API للموازنات
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services.budget_service import BudgetService
from app.models.budget import BudgetType
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserRole

router = APIRouter()


@router.post("/", response_model=BudgetResponse, status_code=201)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    إنشاء موازنة جديدة - Create a new budget
    """
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لإنشاء موازنات"
        )
    
    # Company users can only create budgets for their own company
    if current_user.role == UserRole.COMPANY_USER and current_user.company_id != budget_data.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="يمكنك إنشاء موازنات لشركتك فقط"
        )
    
    return BudgetService.create_budget(db, budget_data)


@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    company_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    budget_type: Optional[BudgetType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    الحصول على قائمة الموازنات - Get list of budgets
    
    Filters:
    - company_id: معرف الشركة
    - year: السنة
    - month: الشهر
    - budget_type: نوع الموازنة (estimated/actual)
    """
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض الموازنات"
        )
    
    # Company users can only see their own company's budgets
    if current_user.role in [UserRole.COMPANY_USER, UserRole.VIEWER] and current_user.company_id:
        company_id = current_user.company_id
    
    return BudgetService.get_budgets(
        db, skip, limit, company_id, year, month, budget_type
    )


@router.get("/summary/{year}")
def get_budget_summary(
    year: int,
    company_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    الحصول على ملخص الموازنة - Get budget summary for a year
    
    Returns monthly comparison of estimated vs actual budgets
    """
    return BudgetService.get_budget_summary(db, year, company_id)


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db)
):
    """
    الحصول على موازنة بالمعرف - Get budget by ID
    """
    return BudgetService.get_budget(db, budget_id)


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db)
):
    """
    تحديث موازنة - Update budget
    """
    return BudgetService.update_budget(db, budget_id, budget_data)


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db)
):
    """
    حذف موازنة - Delete budget
    """
    BudgetService.delete_budget(db, budget_id)
    return {"message": "Budget deleted successfully", "message_ar": "تم حذف الموازنة بنجاح"}

