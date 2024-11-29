# app/dependencies.py

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.models.user import User
from app.db.session import SessionLocal
from typing import List
from app.enums import UserRole
from app.core.security import get_user_from_token
from app.logging_config import logger  # Импорт логгера

# Получение сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Получение текущего пользователя по токену из куки
def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        logger.warning("Access token not found in cookies.")  # Логируем отсутствие токена
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user = get_user_from_token(token, db)
    if user is None:
        logger.warning("Invalid or expired token provided.")  # Логируем недействительный токен
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    logger.info(f"Authenticated user: {user.email} with role: {user.role}")  # Логируем успешную аутентификацию
    return user

# Проверка роли пользователя (декоратор)
def role_required(allowed_roles: List[UserRole]):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            logger.warning(
                f"User {user.email} with role {user.role} attempted to access a restricted route. Allowed roles: {allowed_roles}"
            )  # Логируем попытку доступа без разрешения
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to perform this action"
            )
        logger.info(f"Access granted to user: {user.email} for role: {user.role}")  # Логируем успешный доступ
        return user
    return role_checker

# Получение текущего администратора
def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        logger.warning(
            f"User {current_user.email} with role {current_user.role} attempted to access admin-only route."
        )  # Логируем попытку доступа неадминистратора
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to perform this action"
        )
    
    logger.info(f"Admin access granted to user: {current_user.email}")  # Логируем успешный доступ администратора
    return current_user






