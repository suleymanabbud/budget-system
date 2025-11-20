"""
Account Model - نموذج الحساب
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.base import Base


class AccountType(str, Enum):
    """نوع الحساب - Account Type"""
    ASSET = "asset"  # أصول
    LIABILITY = "liability"  # خصوم
    EQUITY = "equity"  # حقوق الملكية
    REVENUE = "revenue"  # إيرادات
    EXPENSE = "expense"  # مصروفات


class Account(Base):
    """نموذج الحساب - Account Model"""
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True, comment="كود الحساب")
    name = Column(String(255), nullable=False, comment="اسم الحساب")
    name_en = Column(String(255), nullable=True, comment="Account Name in English")
    description = Column(Text, nullable=True, comment="وصف الحساب")
    
    # Account Classification
    account_type = Column(SQLEnum(AccountType), nullable=False, comment="نوع الحساب")
    financial_statement = Column(String(100), nullable=True, comment="القائمة المالية")
    parent_id = Column(Integer, ForeignKey("accounts.id"), nullable=True, comment="الحساب الأب")
    level = Column(Integer, default=1, comment="مستوى الحساب في الشجرة")
    
    # Account Properties
    is_active = Column(Boolean, default=True, comment="نشط/غير نشط")
    is_leaf = Column(Boolean, default=True, comment="حساب نهائي/فرعي")
    is_budgetable = Column(Boolean, default=True, comment="يمكن إعداد موازنة له")
    
    # Company Association
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, comment="معرف الشركة (null للشركات العامة)")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = relationship("Account", remote_side=[id], back_populates="children")
    children = relationship("Account", back_populates="parent", cascade="all, delete-orphan")
    company = relationship("Company", back_populates="accounts")
    # budgets = relationship("Budget", back_populates="account")  # Temporarily disabled
    
    def __repr__(self):
        return f"<Account(id={self.id}, code='{self.code}', name='{self.name}', type='{self.account_type}')>"
    
    def get_full_path(self):
        """الحصول على المسار الكامل للحساب - Get full account path"""
        path = [self.name]
        current = self.parent
        while current:
            path.insert(0, current.name)
            current = current.parent
        return " > ".join(path)
    
    def get_code_path(self):
        """الحصول على مسار الكود - Get code path"""
        path = [self.code]
        current = self.parent
        while current:
            path.insert(0, current.code)
            current = current.parent
        return " > ".join(path)
    
    def is_root(self):
        """فحص إذا كان الحساب جذر - Check if account is root"""
        return self.parent_id is None
    
    def get_children_count(self):
        """عدد الحسابات الفرعية - Get children count"""
        return len(self.children)
    
    def get_all_children(self):
        """الحصول على جميع الحسابات الفرعية - Get all children accounts"""
        children = []
        for child in self.children:
            children.append(child)
            children.extend(child.get_all_children())
        return children
