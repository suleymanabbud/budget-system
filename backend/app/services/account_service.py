"""
Account Service - خدمة الحسابات
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from app.models.account import Account, AccountType
from app.schemas.account import AccountCreate, AccountUpdate
from datetime import datetime


class AccountService:
    """خدمة الحسابات - Account Service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_account(self, account_data: AccountCreate) -> Account:
        """إنشاء حساب جديد - Create new account"""
        # Check if code exists
        if self.get_account_by_code(account_data.code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="كود الحساب موجود بالفعل"
            )
        
        # Validate parent account
        if account_data.parent_id:
            parent = self.get_account_by_id(account_data.parent_id)
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="الحساب الأب غير موجود"
                )
            # لا نتحقق من is_leaf هنا لأننا سنقوم بتحديثه لاحقاً
        
        # Create account
        db_account = Account(
            code=account_data.code,
            name=account_data.name,
            name_en=account_data.name_en,
            description=account_data.description,
            account_type=account_data.account_type,
            parent_id=account_data.parent_id,
            level=account_data.level,
            is_active=account_data.is_active,
            is_leaf=account_data.is_leaf,
            is_budgetable=account_data.is_budgetable,
            company_id=account_data.company_id
        )
        
        self.db.add(db_account)
        self.db.commit()
        self.db.refresh(db_account)
        
        # Update parent account if needed
        if account_data.parent_id:
            parent = self.get_account_by_id(account_data.parent_id)
            if parent:
                parent.is_leaf = False
                self.db.commit()
        
        return db_account
    
    def get_account_by_id(self, account_id: int) -> Optional[Account]:
        """الحصول على حساب بالمعرف - Get account by ID"""
        return self.db.query(Account).filter(Account.id == account_id).first()
    
    def get_account_by_code(self, code: str) -> Optional[Account]:
        """الحصول على حساب بالكود - Get account by code"""
        return self.db.query(Account).filter(Account.code == code).first()
    
    def get_accounts_tree(self, company_id: Optional[int] = None) -> List[Account]:
        """الحصول على شجرة الحسابات - Get accounts tree"""
        # الحصول على جميع الحسابات للشركة المحددة
        query = self.db.query(Account)
        
        if company_id:
            query = query.filter(Account.company_id == company_id)
        else:
            query = query.filter(Account.company_id.is_(None))
        
        return query.filter(Account.is_active == True).all()
    
    def get_accounts_by_type(self, account_type: AccountType, company_id: Optional[int] = None) -> List[Account]:
        """الحصول على الحسابات حسب النوع - Get accounts by type"""
        query = self.db.query(Account).filter(Account.account_type == account_type)
        
        if company_id:
            query = query.filter(Account.company_id == company_id)
        else:
            query = query.filter(Account.company_id.is_(None))
        
        return query.filter(Account.is_active == True).all()
    
    def get_budgetable_accounts(self, company_id: Optional[int] = None) -> List[Account]:
        """الحصول على الحسابات القابلة للموازنة - Get budgetable accounts"""
        query = self.db.query(Account).filter(
            and_(
                Account.is_budgetable == True,
                Account.is_leaf == True,
                Account.is_active == True
            )
        )
        
        if company_id:
            query = query.filter(Account.company_id == company_id)
        else:
            query = query.filter(Account.company_id.is_(None))
        
        return query.all()
    
    def update_account(self, account_id: int, account_data: AccountUpdate) -> Optional[Account]:
        """تحديث الحساب - Update account"""
        account = self.get_account_by_id(account_id)
        if not account:
            return None
        
        update_data = account_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(account, field, value)
        
        account.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(account)
        return account
    
    def delete_account(self, account_id: int, force_delete: bool = False) -> bool:
        """حذف الحساب - Delete account"""
        account = self.get_account_by_id(account_id)
        if not account:
            return False
        
        # Check if account has children - always prevent deletion of parent accounts
        if account.children:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="لا يمكن حذف حساب رئيسي له حسابات فرعية. يجب حذف الحسابات الفرعية أولاً"
            )
        
        # Only allow deletion of leaf accounts (accounts without children)
        if not account.is_leaf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="لا يمكن حذف حساب غير نهائي. يجب حذف الحسابات الفرعية أولاً"
            )
        
        # Store parent_id before deletion
        parent_id = account.parent_id
        
        # Delete the account
        self.db.delete(account)
        self.db.commit()
        
        # Update parent's is_leaf status if it has no more children
        if parent_id:
            parent = self.get_account_by_id(parent_id)
            if parent:
                # Check if parent has any remaining children
                remaining_children = self.db.query(Account).filter(Account.parent_id == parent_id).count()
                if remaining_children == 0:
                    parent.is_leaf = True
                    self.db.commit()
        
        return True
    
    def delete_leaf_accounts_only(self, company_id: Optional[int] = None) -> int:
        """حذف الحسابات النهائية فقط - Delete only leaf accounts"""
        # Get all leaf accounts (accounts without children)
        query = self.db.query(Account).filter(Account.is_leaf == True)
        
        if company_id:
            query = query.filter(Account.company_id == company_id)
        
        leaf_accounts = query.all()
        deleted_count = 0
        
        for account in leaf_accounts:
            # Double check - only delete if no children
            if not account.children:
                self.db.delete(account)
                deleted_count += 1
        
        self.db.commit()
        return deleted_count
    
    def update_all_leaf_status(self) -> int:
        """تحديث حالة is_leaf لجميع الحسابات - Update is_leaf status for all accounts"""
        updated_count = 0
        
        # Get all accounts
        all_accounts = self.db.query(Account).all()
        
        for account in all_accounts:
            # Check if account has children
            children_count = self.db.query(Account).filter(Account.parent_id == account.id).count()
            
            # Update is_leaf status
            if children_count == 0 and not account.is_leaf:
                account.is_leaf = True
                updated_count += 1
            elif children_count > 0 and account.is_leaf:
                account.is_leaf = False
                updated_count += 1
        
        self.db.commit()
        return updated_count
    
    def deactivate_account(self, account_id: int) -> bool:
        """إلغاء تفعيل الحساب - Deactivate account"""
        account = self.get_account_by_id(account_id)
        if not account:
            return False
        
        account.is_active = False
        account.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def get_account_hierarchy(self, account_id: int) -> List[Account]:
        """الحصول على التسلسل الهرمي للحساب - Get account hierarchy"""
        account = self.get_account_by_id(account_id)
        if not account:
            return []
        
        hierarchy = [account]
        current = account.parent
        
        while current:
            hierarchy.insert(0, current)
            current = current.parent
        
        return hierarchy
    
    def search_accounts(self, search_term: str, company_id: Optional[int] = None) -> List[Account]:
        """البحث في الحسابات - Search accounts"""
        query = self.db.query(Account).filter(
            or_(
                Account.name.contains(search_term),
                Account.code.contains(search_term),
                Account.name_en.contains(search_term)
            )
        )
        
        if company_id:
            query = query.filter(Account.company_id == company_id)
        else:
            query = query.filter(Account.company_id.is_(None))
        
        return query.filter(Account.is_active == True).all()
    
    def get_account_statistics(self, company_id: Optional[int] = None) -> Dict[str, Any]:
        """الحصول على إحصائيات الحسابات - Get account statistics"""
        query = self.db.query(Account)
        
        if company_id:
            query = query.filter(Account.company_id == company_id)
        else:
            query = query.filter(Account.company_id.is_(None))
        
        total_accounts = query.filter(Account.is_active == True).count()
        leaf_accounts = query.filter(
            and_(Account.is_active == True, Account.is_leaf == True)
        ).count()
        budgetable_accounts = query.filter(
            and_(Account.is_active == True, Account.is_budgetable == True)
        ).count()
        
        return {
            "total_accounts": total_accounts,
            "leaf_accounts": leaf_accounts,
            "budgetable_accounts": budgetable_accounts,
            "non_leaf_accounts": total_accounts - leaf_accounts
        }
