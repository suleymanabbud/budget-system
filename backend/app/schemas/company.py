"""
Company Schemas - مخططات الشركة
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CompanyBase(BaseModel):
    """Base company schema"""
    name: str = Field(..., min_length=1, max_length=255, description="اسم الشركة")
    name_en: Optional[str] = Field(None, max_length=255, description="Company Name")
    code: str = Field(..., min_length=1, max_length=50, description="كود الشركة")
    description: Optional[str] = Field(None, max_length=500, description="وصف الشركة")
    is_active: bool = Field(True, description="نشط/غير نشط")


class CompanyCreate(CompanyBase):
    """Schema for creating a company"""
    pass


class CompanyUpdate(BaseModel):
    """Schema for updating a company"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    """Schema for company response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

