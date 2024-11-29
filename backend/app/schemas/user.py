# app/schemas/user.py

from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime
from app.enums import UserRole

# Базовая схема пользователя
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

# Схема для создания нового пользователя
class UserCreate(UserBase):
    password: str

# Схема для обновления информации пользователя
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    qualification: Optional[str] = None
    rating: Optional[int] = None
    status: Optional[str] = None
    skills: Optional[str] = None
    profile_photo_url: Optional[str] = None

    @validator('password')
    def password_length(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError('Пароль должен быть не менее 6 символов')
        return v

# Схема для вывода информации о пользователе
class UserOut(UserBase):
    id: int
    role: UserRole
    qualification: Optional[str] = None
    rating: Optional[int] = None
    status: Optional[str] = None
    skills: Optional[str] = None
    profile_photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Схема для обновления роли пользователя
class UserRoleUpdate(BaseModel):
    role: UserRole


