"""
Company Model - نموذج الشركة
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Company(Base):
    """نموذج الشركة - Company Model"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True, comment="اسم الشركة")
    name_en = Column(String(255), nullable=True, comment="Company Name in English")
    code = Column(String(50), unique=True, nullable=False, comment="كود الشركة")
    description = Column(String(500), nullable=True, comment="وصف الشركة")
    is_active = Column(Boolean, default=True, comment="نشط/غير نشط")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    budgets = relationship("Budget", back_populates="company", cascade="all, delete-orphan")
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.name}', code='{self.code}')>"

