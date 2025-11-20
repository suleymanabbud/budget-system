"""
User Schemas - مخططات المستخدم
"""
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base User Schema"""
    username: str
    email: EmailStr
    full_name: str
    role: str = "company_user"
    company_id: Optional[int] = None
    is_active: bool = True


class UserCreate(UserBase):
    """Create User Schema"""
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 5:
            raise ValueError('كلمة المرور يجب أن تكون 5 أحرف على الأقل')
        return v


class UserUpdate(BaseModel):
    """Update User Schema"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
        return v


class UserResponse(UserBase):
    """User Response Schema"""
    id: int
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """User Login Schema"""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Token Response Schema"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PasswordChange(BaseModel):
    """Password Change Schema"""
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
        return v
