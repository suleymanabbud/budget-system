"""
Company Service - خدمة الشركات
Business logic for company operations
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate


class CompanyService:
    """خدمة الشركات - Company Service"""
    
    @staticmethod
    def create_company(db: Session, company_data: CompanyCreate) -> Company:
        """إنشاء شركة جديدة - Create new company"""
        # Check if company with same code exists
        existing = db.query(Company).filter(Company.code == company_data.code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Company with code {company_data.code} already exists"
            )
        
        company = Company(**company_data.model_dump())
        db.add(company)
        db.commit()
        db.refresh(company)
        
        return company
    
    @staticmethod
    def get_company(db: Session, company_id: int) -> Optional[Company]:
        """الحصول على شركة - Get company by ID"""
        company = db.query(Company).filter(Company.id == company_id).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with id {company_id} not found"
            )
        
        return company
    
    @staticmethod
    def get_companies(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[Company]:
        """الحصول على قائمة الشركات - Get list of companies"""
        query = db.query(Company)
        
        if is_active is not None:
            query = query.filter(Company.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_company(db: Session, company_id: int, company_data: CompanyUpdate) -> Company:
        """تحديث شركة - Update company"""
        company = db.query(Company).filter(Company.id == company_id).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with id {company_id} not found"
            )
        
        # Update fields
        update_data = company_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(company, field, value)
        
        db.commit()
        db.refresh(company)
        
        return company
    
    @staticmethod
    def delete_company(db: Session, company_id: int) -> bool:
        """حذف شركة - Delete company"""
        company = db.query(Company).filter(Company.id == company_id).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with id {company_id} not found"
            )
        
        db.delete(company)
        db.commit()
        
        return True

