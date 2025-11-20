"""
Companies API Endpoints - نقاط نهاية API للشركات
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.services.company_service import CompanyService

router = APIRouter()


@router.post("/", response_model=CompanyResponse, status_code=201)
def create_company(
    company_data: CompanyCreate,
    db: Session = Depends(get_db)
):
    """
    إنشاء شركة جديدة - Create a new company
    """
    return CompanyService.create_company(db, company_data)


@router.get("/", response_model=List[CompanyResponse])
def get_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    الحصول على قائمة الشركات - Get list of companies
    """
    return CompanyService.get_companies(db, skip, limit, is_active)


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    الحصول على شركة بالمعرف - Get company by ID
    """
    return CompanyService.get_company(db, company_id)


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    db: Session = Depends(get_db)
):
    """
    تحديث شركة - Update company
    """
    return CompanyService.update_company(db, company_id, company_data)


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    حذف شركة - Delete company
    """
    CompanyService.delete_company(db, company_id)
    return {"message": "Company deleted successfully", "message_ar": "تم حذف الشركة بنجاح"}

