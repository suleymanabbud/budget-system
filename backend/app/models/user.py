"""
User Model - نموذج المستخدم
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.base import Base


class UserRole(str, Enum):
    """أدوار المستخدم - User Roles"""
    ADMIN = "ADMIN"  # مدير النظام
    COMPANY_ADMIN = "COMPANY_ADMIN"  # مدير الشركة
    COMPANY_USER = "COMPANY_USER"  # مستخدم الشركة
    VIEWER = "VIEWER"  # مشاهد فقط


class User(Base):
    """نموذج المستخدم - User Model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True, comment="اسم المستخدم")
    email = Column(String(255), unique=True, nullable=False, index=True, comment="البريد الإلكتروني")
    full_name = Column(String(255), nullable=False, comment="الاسم الكامل")
    password_hash = Column(String(255), nullable=False, comment="كلمة المرور المشفرة")
    
    # Role and Permissions
    role = Column(SQLEnum(UserRole), default=UserRole.COMPANY_USER, comment="دور المستخدم")
    is_active = Column(Boolean, default=True, comment="نشط/غير نشط")
    is_verified = Column(Boolean, default=False, comment="متحقق/غير متحقق")
    
    # Company Association
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, comment="معرف الشركة")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True, comment="آخر تسجيل دخول")
    
    # Relationships
    company = relationship("Company", back_populates="users")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}', company_id={self.company_id})>"
    
    def has_permission(self, permission: str) -> bool:
        """فحص الصلاحيات - Check permissions"""
        if self.role == UserRole.ADMIN:
            return True
        
        if self.role == UserRole.COMPANY_ADMIN and self.company_id:
            return True
            
        if self.role == UserRole.COMPANY_USER and self.company_id:
            # صلاحيات محدودة للمستخدم العادي
            allowed_permissions = [
                "view_own_company",
                "edit_own_budget",
                "view_own_reports"
            ]
            return permission in allowed_permissions
            
        if self.role == UserRole.VIEWER:
            return permission in ["view_own_company", "view_own_reports"]
        
        return False
    
    def can_access_company(self, company_id: int) -> bool:
        """فحص إمكانية الوصول للشركة - Check company access"""
        if self.role == UserRole.ADMIN:
            return True
        
        return self.company_id == company_id
