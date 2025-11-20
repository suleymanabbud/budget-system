"""
Authentication endpoints - نقاط نهاية المصادقة
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserLogin, TokenResponse, UserResponse, PasswordChange
from app.services.user_service import UserService
from app.core.security import decode_access_token
from app.models.user import User, UserRole

router = APIRouter()
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """الحصول على المستخدم الحالي - Get current user"""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="رمز الوصول غير صحيح"
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="رمز الوصول غير صحيح"
        )
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="المستخدم غير موجود"
        )
    return user


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """تسجيل الدخول - Login"""
    user_service = UserService(db)
    result = user_service.login_user(login_data)
    return result


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """تسجيل مستخدم جديد - Register new user"""
    user_service = UserService(db)
    user = user_service.create_user(user_data.dict())
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """الحصول على معلومات المستخدم الحالي - Get current user info"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تحديث المستخدم الحالي - Update current user"""
    user_service = UserService(db)
    updated_user = user_service.update_user(current_user.id, user_data.dict(exclude_unset=True))
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستخدم غير موجود"
        )
    return updated_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تغيير كلمة المرور - Change password"""
    from app.core.security import verify_password
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="كلمة المرور الحالية غير صحيحة"
        )
    
    # Update password
    user_service = UserService(db)
    user_service.update_user(current_user.id, {"password": password_data.new_password})
    
    return {"message": "تم تغيير كلمة المرور بنجاح"}


@router.get("/users", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على قائمة المستخدمين - Get users list"""
    # Only admin can see all users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لعرض المستخدمين"
        )
    
    user_service = UserService(db)
    users = user_service.get_users_by_role(UserRole.COMPANY_USER)
    return users


@router.get("/company-users", response_model=List[UserResponse])
async def get_company_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على مستخدمي الشركة - Get company users"""
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="المستخدم غير مرتبط بشركة"
        )
    
    user_service = UserService(db)
    users = user_service.get_company_users(current_user.company_id)
    return users


@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تفعيل المستخدم - Activate user"""
    # Only admin or company admin can activate users
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لتفعيل المستخدمين"
        )
    
    user_service = UserService(db)
    success = user_service.activate_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستخدم غير موجود"
        )
    
    return {"message": "تم تفعيل المستخدم بنجاح"}


@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إلغاء تفعيل المستخدم - Deactivate user"""
    # Only admin or company admin can deactivate users
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لإلغاء تفعيل المستخدمين"
        )
    
    user_service = UserService(db)
    success = user_service.deactivate_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="المستخدم غير موجود"
        )
    
    return {"message": "تم إلغاء تفعيل المستخدم بنجاح"}
