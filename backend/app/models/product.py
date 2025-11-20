"""
Product Model - نموذج المنتج
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Product(Base):
    """نموذج المنتج - Product Model"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True, comment="اسم المنتج")
    name_en = Column(String(255), nullable=True, comment="Product Name in English")
    code = Column(String(50), unique=True, nullable=False, comment="كود المنتج")
    unit_of_measurement = Column(String(50), nullable=False, comment="وحدة القياس")
    description = Column(String(500), nullable=True, comment="وصف المنتج")
    is_active = Column(Boolean, default=True, comment="نشط/غير نشط")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    budgets = relationship("Budget", back_populates="product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', unit='{self.unit_of_measurement}')>"

