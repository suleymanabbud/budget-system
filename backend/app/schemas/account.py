"""
Account Schemas - مخططات الحسابات
"""
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from app.models.account import AccountType


class AccountBase(BaseModel):
    """Base Account Schema"""
    code: str
    name: str
    name_en: Optional[str] = None
    description: Optional[str] = None
    account_type: AccountType
    financial_statement: Optional[str] = None
    parent_id: Optional[int] = None
    level: int = 1
    is_active: bool = True
    is_leaf: bool = True
    is_budgetable: bool = True
    company_id: Optional[int] = None


class AccountCreate(AccountBase):
    """Create Account Schema"""
    pass


class AccountUpdate(BaseModel):
    """Update Account Schema"""
    code: Optional[str] = None
    name: Optional[str] = None
    name_en: Optional[str] = None
    description: Optional[str] = None
    account_type: Optional[AccountType] = None
    financial_statement: Optional[str] = None
    parent_id: Optional[int] = None
    level: Optional[int] = None
    is_active: Optional[bool] = None
    is_leaf: Optional[bool] = None
    is_budgetable: Optional[bool] = None
    company_id: Optional[int] = None


class AccountResponse(AccountBase):
    """Account Response Schema"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AccountWithChildren(AccountResponse):
    """Account with children accounts"""
    children: List['AccountWithChildren'] = []
    parent: Optional['AccountWithChildren'] = None
    
    class Config:
        from_attributes = True


class AccountTree(BaseModel):
    """Account Tree Structure"""
    id: int
    code: str
    name: str
    name_en: Optional[str] = None
    account_type: AccountType
    financial_statement: Optional[str] = None
    parent_id: Optional[int] = None
    level: int
    is_active: bool
    is_leaf: bool
    is_budgetable: bool
    children: List['AccountTree'] = []
    
    class Config:
        from_attributes = True


class AccountBudget(BaseModel):
    """Account Budget Entry"""
    account_id: int
    year: int
    month: int
    estimated_amount: float = 0.0
    actual_amount: float = 0.0
    notes: Optional[str] = None


class AccountBudgetResponse(AccountBudget):
    """Account Budget Response"""
    id: int
    account_code: str
    account_name: str
    account_type: AccountType
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
