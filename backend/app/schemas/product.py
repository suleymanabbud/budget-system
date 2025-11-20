"""
Product Schemas - مخططات المنتج
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=1, max_length=255, description="اسم المنتج")
    name_en: Optional[str] = Field(None, max_length=255, description="Product Name")
    code: str = Field(..., min_length=1, max_length=50, description="كود المنتج")
    unit_of_measurement: str = Field(..., min_length=1, max_length=50, description="وحدة القياس")
    description: Optional[str] = Field(None, max_length=500, description="وصف المنتج")
    is_active: bool = Field(True, description="نشط/غير نشط")


class ProductCreate(ProductBase):
    """Schema for creating a product"""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    unit_of_measurement: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    """Schema for product response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

