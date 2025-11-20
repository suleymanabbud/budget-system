"""
Accounts API Endpoints - نقاط نهاية API للحسابات
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.account import (
    AccountCreate, 
    AccountUpdate, 
    AccountResponse, 
    AccountTree, 
    AccountBudget, 
    AccountBudgetResponse
)
from app.services.account_service import AccountService
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserRole
from app.models.account import AccountType

router = APIRouter()


@router.post("/", response_model=AccountResponse, status_code=201)
def create_account(
    account_data: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إنشاء حساب جديد - Create new account"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لإنشاء الحسابات"
        )
    
    # Set company_id based on user role
    if current_user.role == UserRole.ADMIN:
        # Admin can create accounts for any company, default to company 1 if not specified
        if not account_data.company_id:
            account_data.company_id = 1
    elif current_user.role == UserRole.COMPANY_ADMIN and current_user.company_id:
        account_data.company_id = current_user.company_id
    
    account_service = AccountService(db)
    return account_service.create_account(account_data)


@router.get("/", response_model=List[AccountResponse])
def get_accounts(
    account_type: Optional[AccountType] = Query(None),
    company_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على قائمة الحسابات - Get accounts list"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض الحسابات"
        )
    
    # Unified chart of accounts: always serve company 1's chart for all users
    company_id = 1
    
    account_service = AccountService(db)
    
    if account_type:
        return account_service.get_accounts_by_type(account_type, company_id)
    else:
        return account_service.get_accounts_tree(company_id)


@router.get("/tree", response_model=List[AccountTree])
def get_accounts_tree(
    company_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على شجرة الحسابات - Get accounts tree"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض شجرة الحسابات"
        )
    
    # Unified chart of accounts: always serve company 1's chart
    company_id = 1
    
    account_service = AccountService(db)
    return account_service.get_accounts_tree(company_id)


@router.get("/budgetable", response_model=List[AccountResponse])
def get_budgetable_accounts(
    company_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على الحسابات القابلة للموازنة - Get budgetable accounts"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض الحسابات القابلة للموازنة"
        )
    
    # Company users can only see their company's accounts
    if current_user.role in [UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER] and current_user.company_id:
        company_id = current_user.company_id
    
    account_service = AccountService(db)
    return account_service.get_budgetable_accounts(company_id)


@router.get("/statistics")
def get_account_statistics(
    company_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على إحصائيات الحسابات - Get account statistics"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض إحصائيات الحسابات"
        )
    
    # Company users can only see their company's statistics
    if current_user.role in [UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER] and current_user.company_id:
        company_id = current_user.company_id
    
    # Admin without company_id should default to company 1
    if current_user.role == UserRole.ADMIN and not company_id:
        company_id = 1
    
    account_service = AccountService(db)
    return account_service.get_account_statistics(company_id)


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على حساب محدد - Get specific account"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض الحسابات"
        )
    
    account_service = AccountService(db)
    account = account_service.get_account_by_id(account_id)
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الحساب غير موجود"
        )
    
    # Company users can only see their company's accounts
    if current_user.role in [UserRole.COMPANY_USER, UserRole.VIEWER]:
        if not current_user.company_id or account.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك صلاحية لعرض هذا الحساب"
            )
    
    return account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    account_data: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تحديث الحساب - Update account"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لتحديث الحسابات"
        )
    
    account_service = AccountService(db)
    account = account_service.get_account_by_id(account_id)
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الحساب غير موجود"
        )
    
    # Company admins can only update their company's accounts
    if current_user.role == UserRole.COMPANY_ADMIN:
        if not current_user.company_id or account.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك صلاحية لتحديث هذا الحساب"
            )
    
    updated_account = account_service.update_account(account_id, account_data)
    if not updated_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الحساب غير موجود"
        )
    
    return updated_account


@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    force: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """حذف الحساب - Delete account"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لحذف الحسابات"
        )
    
    account_service = AccountService(db)
    account = account_service.get_account_by_id(account_id)
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الحساب غير موجود"
        )
    
    # Company admins can only delete their company's accounts
    if current_user.role == UserRole.COMPANY_ADMIN:
        if not current_user.company_id or account.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك صلاحية لحذف هذا الحساب"
            )
    
    try:
        success = account_service.delete_account(account_id, force_delete=force)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="الحساب غير موجود"
            )
        
        message = "تم حذف الحساب بنجاح"
        if force:
            message += " (مع جميع الحسابات الفرعية والموازنات)"
        
        return {"message": message}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/clear-all")
def clear_all_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """حذف جميع الحسابات - Clear all accounts"""
    # Check permissions - only admin can clear all accounts
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لحذف جميع الحسابات"
        )
    
    try:
        account_service = AccountService(db)
        
        # Get all accounts
        all_accounts = db.query(Account).all()
        deleted_count = 0
        
        # Delete all accounts (cascade will handle children and budgets)
        for account in all_accounts:
            db.delete(account)
            deleted_count += 1
        
        db.commit()
        
        return {
            "message": f"تم حذف {deleted_count} حساب بنجاح",
            "deleted_count": deleted_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"خطأ في حذف الحسابات: {str(e)}"
        )


@router.delete("/clear-leaf-accounts")
def clear_leaf_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """حذف الحسابات النهائية فقط - Delete only leaf accounts"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لحذف الحسابات"
        )
    
    try:
        account_service = AccountService(db)
        
        # Determine company_id based on user role
        company_id = None
        if current_user.role == UserRole.COMPANY_ADMIN:
            company_id = current_user.company_id
        
        deleted_count = account_service.delete_leaf_accounts_only(company_id)
        
        return {
            "message": f"تم حذف {deleted_count} حساب نهائي بنجاح",
            "deleted_count": deleted_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"خطأ في حذف الحسابات النهائية: {str(e)}"
        )


@router.post("/update-leaf-status")
def update_leaf_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تحديث حالة is_leaf لجميع الحسابات - Update is_leaf status for all accounts"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لتحديث الحسابات"
        )
    
    try:
        account_service = AccountService(db)
        updated_count = account_service.update_all_leaf_status()
        
        return {
            "message": f"تم تحديث {updated_count} حساب بنجاح",
            "updated_count": updated_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"خطأ في تحديث الحسابات: {str(e)}"
        )


@router.get("/{account_id}/hierarchy", response_model=List[AccountResponse])
def get_account_hierarchy(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على التسلسل الهرمي للحساب - Get account hierarchy"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض التسلسل الهرمي"
        )
    
    account_service = AccountService(db)
    hierarchy = account_service.get_account_hierarchy(account_id)
    
    if not hierarchy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الحساب غير موجود"
        )
    
    return hierarchy


@router.get("/search", response_model=List[AccountResponse])
def search_accounts(
    q: str = Query(..., description="Search term"),
    company_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """البحث في الحسابات - Search accounts"""
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.COMPANY_USER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية للبحث في الحسابات"
        )
    
    # Company users can only search their company's accounts
    if current_user.role in [UserRole.COMPANY_USER, UserRole.VIEWER] and current_user.company_id:
        company_id = current_user.company_id
    
    account_service = AccountService(db)
    return account_service.search_accounts(q, company_id)
