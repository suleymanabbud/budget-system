"""
Product Service - خدمة المنتجات
Business logic for product operations
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """خدمة المنتجات - Product Service"""
    
    @staticmethod
    def create_product(db: Session, product_data: ProductCreate) -> Product:
        """إنشاء منتج جديد - Create new product"""
        # Check if product with same code exists
        existing = db.query(Product).filter(Product.code == product_data.code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with code {product_data.code} already exists"
            )
        
        product = Product(**product_data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        
        return product
    
    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        """الحصول على منتج - Get product by ID"""
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found"
            )
        
        return product
    
    @staticmethod
    def get_products(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[Product]:
        """الحصول على قائمة المنتجات - Get list of products"""
        query = db.query(Product)
        
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def update_product(db: Session, product_id: int, product_data: ProductUpdate) -> Product:
        """تحديث منتج - Update product"""
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found"
            )
        
        # Update fields
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        db.commit()
        db.refresh(product)
        
        return product
    
    @staticmethod
    def delete_product(db: Session, product_id: int) -> bool:
        """حذف منتج - Delete product"""
        product = db.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found"
            )
        
        db.delete(product)
        db.commit()
        
        return True

