"""
Budget Model - نموذج الموازنة
"""
from sqlalchemy import Column, Integer, String, Float, Enum as SQLEnum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.base import Base


class BudgetType(str, Enum):
    """نوع الموازنة - Budget Type"""
    ESTIMATED = "estimated"  # تقريبية
    ACTUAL = "actual"  # فعلية


class Quarter(str, Enum):
    """الربع - Quarter"""
    Q1 = "Q1"  # الربع الأول
    Q2 = "Q2"  # الربع الثاني
    Q3 = "Q3"  # الربع الثالث
    Q4 = "Q4"  # الربع الرابع


class Budget(Base):
    """نموذج الموازنة - Budget Model"""
    __tablename__ = "budgets"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True, comment="رقم التسلسل")
    
    # Time Dimensions
    year = Column(Integer, nullable=False, index=True, comment="السنة")
    quarter = Column(SQLEnum(Quarter), nullable=False, index=True, comment="الربع")
    month = Column(Integer, nullable=False, index=True, comment="الشهر (1-12)")
    
    # Foreign Keys
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True, comment="معرف الشركة")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True, comment="معرف المنتج")
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True, index=True, comment="معرف الحساب")
    
    # Budget Type
    budget_type = Column(
        SQLEnum(BudgetType), 
        nullable=False, 
        index=True, 
        comment="نوع الموازنة (تقريبية/فعلية)"
    )
    
    # Financial Data
    quantity = Column(Float, nullable=False, default=0.0, comment="الكمية")
    price = Column(Float, nullable=False, default=0.0, comment="السعر")
    total = Column(Float, nullable=False, default=0.0, comment="الإجمالي")
    
    # Additional Information
    notes = Column(String(500), nullable=True, comment="ملاحظات")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, comment="تاريخ الإنشاء")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="تاريخ التحديث")
    
    # Relationships
    company = relationship("Company", back_populates="budgets")
    product = relationship("Product", back_populates="budgets")
    # account = relationship("Account", back_populates="budgets")  # Temporarily disabled
    
    def __repr__(self):
        return (
            f"<Budget(id={self.id}, year={self.year}, month={self.month}, "
            f"company_id={self.company_id}, type={self.budget_type}, total={self.total})>"
        )
    
    def calculate_total(self):
        """حساب الإجمالي - Calculate total"""
        self.total = self.quantity * self.price
        return self.total

