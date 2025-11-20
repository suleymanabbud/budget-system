"""
User Service - خدمة المستخدمين
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token
from datetime import datetime, timedelta


class UserService:
    """خدمة المستخدمين - User Service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: dict) -> User:
        """إنشاء مستخدم جديد - Create new user"""
        # Check if username exists
        if self.get_user_by_username(user_data['username']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="اسم المستخدم موجود بالفعل"
            )
        
        # Check if email exists
        if self.get_user_by_email(user_data['email']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="البريد الإلكتروني موجود بالفعل"
            )
        
        # Create user
        hashed_password = get_password_hash(user_data['password'])
        db_user = User(
            username=user_data['username'],
            email=user_data['email'],
            full_name=user_data['full_name'],
            password_hash=hashed_password,
            role=user_data.get('role', UserRole.COMPANY_USER),
            company_id=user_data.get('company_id'),
            is_active=user_data.get('is_active', True)
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """الحصول على مستخدم بالمعرف - Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """الحصول على مستخدم باسم المستخدم - Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """الحصول على مستخدم بالبريد الإلكتروني - Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """مصادقة المستخدم - Authenticate user"""
        user = self.get_user_by_username(username)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user
    
    def login_user(self, login_data: UserLogin) -> dict:
        """تسجيل دخول المستخدم - Login user"""
        user = self.authenticate_user(login_data.username, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="اسم المستخدم أو كلمة المرور غير صحيحة"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role, "company_id": user.company_id}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    
    def update_user(self, user_id: int, user_data: dict) -> Optional[User]:
        """تحديث المستخدم - Update user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        # Hash password if provided
        if "password" in user_data:
            user_data["password_hash"] = get_password_hash(user_data.pop("password"))
        
        for field, value in user_data.items():
            if value is not None:
                setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_company_users(self, company_id: int) -> List[User]:
        """الحصول على مستخدمي الشركة - Get company users"""
        return self.db.query(User).filter(
            and_(User.company_id == company_id, User.is_active == True)
        ).all()
    
    def get_users_by_role(self, role: UserRole) -> List[User]:
        """الحصول على المستخدمين حسب الدور - Get users by role"""
        return self.db.query(User).filter(
            and_(User.role == role, User.is_active == True)
        ).all()
    
    def deactivate_user(self, user_id: int) -> bool:
        """إلغاء تفعيل المستخدم - Deactivate user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def activate_user(self, user_id: int) -> bool:
        """تفعيل المستخدم - Activate user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.is_active = True
        user.updated_at = datetime.utcnow()
        self.db.commit()
        return True
