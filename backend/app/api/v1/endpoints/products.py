"""
Products API Endpoints - نقاط نهاية API للمنتجات
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import ProductService

router = APIRouter()


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    إنشاء منتج جديد - Create a new product
    """
    return ProductService.create_product(db, product_data)


@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    الحصول على قائمة المنتجات - Get list of products
    """
    return ProductService.get_products(db, skip, limit, is_active)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    الحصول على منتج بالمعرف - Get product by ID
    """
    return ProductService.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    """
    تحديث منتج - Update product
    """
    return ProductService.update_product(db, product_id, product_data)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    حذف منتج - Delete product
    """
    ProductService.delete_product(db, product_id)
    return {"message": "Product deleted successfully", "message_ar": "تم حذف المنتج بنجاح"}

