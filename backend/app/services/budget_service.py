"""
Budget Service - خدمة الموازنات
Business logic for budget operations
"""
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.budget import Budget, BudgetType, Quarter
from app.models.company import Company
from app.models.product import Product
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetWithDetails


class BudgetService:
    """خدمة الموازنات - Budget Service"""
    
    @staticmethod
    def create_budget(db: Session, budget_data: BudgetCreate) -> Budget:
        """إنشاء موازنة جديدة - Create new budget"""
        # Verify company exists
        company = db.query(Company).filter(Company.id == budget_data.company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with id {budget_data.company_id} not found"
            )
        
        # Verify product exists
        product = db.query(Product).filter(Product.id == budget_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {budget_data.product_id} not found"
            )
        
        # Create budget
        budget = Budget(**budget_data.model_dump())
        budget.calculate_total()
        
        db.add(budget)
        db.commit()
        db.refresh(budget)
        
        return budget
    
    @staticmethod
    def get_budget(db: Session, budget_id: int) -> Optional[Budget]:
        """الحصول على موازنة - Get budget by ID"""
        budget = db.query(Budget).options(
            joinedload(Budget.company),
            joinedload(Budget.product)
        ).filter(Budget.id == budget_id).first()
        
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Budget with id {budget_id} not found"
            )
        
        return budget
    
    @staticmethod
    def get_budgets(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        company_id: Optional[int] = None,
        year: Optional[int] = None,
        month: Optional[int] = None,
        budget_type: Optional[BudgetType] = None
    ) -> List[Budget]:
        """الحصول على قائمة الموازنات - Get list of budgets"""
        query = db.query(Budget).options(
            joinedload(Budget.company),
            joinedload(Budget.product)
        )
        
        if company_id:
            query = query.filter(Budget.company_id == company_id)
        if year:
            query = query.filter(Budget.year == year)
        if month:
            query = query.filter(Budget.month == month)
        if budget_type:
            query = query.filter(Budget.budget_type == budget_type)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_budget(db: Session, budget_id: int, budget_data: BudgetUpdate) -> Budget:
        """تحديث موازنة - Update budget"""
        budget = db.query(Budget).filter(Budget.id == budget_id).first()
        
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Budget with id {budget_id} not found"
            )
        
        # Update fields
        update_data = budget_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(budget, field, value)
        
        # Recalculate total
        budget.calculate_total()
        
        db.commit()
        db.refresh(budget)
        
        return budget
    
    @staticmethod
    def delete_budget(db: Session, budget_id: int) -> bool:
        """حذف موازنة - Delete budget"""
        budget = db.query(Budget).filter(Budget.id == budget_id).first()
        
        if not budget:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Budget with id {budget_id} not found"
            )
        
        db.delete(budget)
        db.commit()
        
        return True
    
    @staticmethod
    def get_budget_summary(
        db: Session,
        year: int,
        company_id: Optional[int] = None
    ) -> dict:
        """الحصول على ملخص الموازنة - Get budget summary"""
        from sqlalchemy import func
        
        query = db.query(
            Budget.month,
            Budget.budget_type,
            func.sum(Budget.total).label('total')
        ).filter(Budget.year == year)
        
        if company_id:
            query = query.filter(Budget.company_id == company_id)
        
        query = query.group_by(Budget.month, Budget.budget_type)
        
        results = query.all()
        
        summary = {
            "year": year,
            "company_id": company_id,
            "monthly_data": {}
        }
        
        for month in range(1, 13):
            summary["monthly_data"][month] = {
                "estimated": 0.0,
                "actual": 0.0,
                "variance": 0.0
            }
        
        for result in results:
            month, budget_type, total = result
            if budget_type == BudgetType.ESTIMATED:
                summary["monthly_data"][month]["estimated"] = float(total)
            elif budget_type == BudgetType.ACTUAL:
                summary["monthly_data"][month]["actual"] = float(total)
            
            # Calculate variance
            estimated = summary["monthly_data"][month]["estimated"]
            actual = summary["monthly_data"][month]["actual"]
            summary["monthly_data"][month]["variance"] = actual - estimated
        
        return summary

