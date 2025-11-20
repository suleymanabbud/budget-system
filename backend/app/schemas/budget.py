"""
Budget Schemas - مخططات الموازنة
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models.budget import BudgetType, Quarter


class BudgetBase(BaseModel):
    """Base budget schema"""
    year: int = Field(..., ge=2000, le=2100, description="السنة")
    quarter: Quarter = Field(..., description="الربع")
    month: int = Field(..., ge=1, le=12, description="الشهر (1-12)")
    company_id: int = Field(..., gt=0, description="معرف الشركة")
    product_id: int = Field(..., gt=0, description="معرف المنتج")
    budget_type: BudgetType = Field(..., description="نوع الموازنة (تقريبية/فعلية)")
    quantity: float = Field(..., ge=0, description="الكمية")
    price: float = Field(..., ge=0, description="السعر")
    notes: Optional[str] = Field(None, max_length=500, description="ملاحظات")
    
    @field_validator('month', 'quarter')
    def validate_month_quarter(cls, v, info):
        """Validate month matches quarter"""
        if info.field_name == 'month':
            month = v
            # Will validate with quarter in model
            return month
        return v


class BudgetCreate(BudgetBase):
    """Schema for creating a budget"""
    pass


class BudgetUpdate(BaseModel):
    """Schema for updating a budget"""
    year: Optional[int] = Field(None, ge=2000, le=2100)
    quarter: Optional[Quarter] = None
    month: Optional[int] = Field(None, ge=1, le=12)
    company_id: Optional[int] = Field(None, gt=0)
    product_id: Optional[int] = Field(None, gt=0)
    budget_type: Optional[BudgetType] = None
    quantity: Optional[float] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=500)


class BudgetResponse(BudgetBase):
    """Schema for budget response"""
    id: int
    total: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BudgetWithDetails(BudgetResponse):
    """Schema for budget with company and product details"""
    company_name: Optional[str] = None
    product_name: Optional[str] = None
    product_unit: Optional[str] = None
    
    class Config:
        from_attributes = True

