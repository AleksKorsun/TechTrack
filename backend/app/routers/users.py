# app/routers/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.user import UserOut, UserUpdate
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole
from app.core.security import get_password_hash  # Добавляем импорт функции

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Получить информацию о текущем пользователе
@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    logger.info("Fetching current user info for email: %s", current_user.email)
    return current_user

# Обновить информацию о текущем пользователе
@router.put("/me", response_model=UserOut)
async def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = user_update.dict(exclude_unset=True)

    # Проверка на уникальность email, если пользователь пытается его изменить
    if 'email' in update_data and update_data['email'] != current_user.email:
        existing_user = db.query(User).filter(User.email == update_data['email']).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email уже используется")

    for key, value in update_data.items():
        if key == 'password':
            current_user.password_hash = get_password_hash(value)
        else:
            setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    logger.info("User info updated for email: %s", current_user.email)
    return current_user

# Получить список всех пользователей (для администратора)
@router.get("/", response_model=List[UserOut], dependencies=[Depends(role_required([UserRole.admin]))])
async def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users




# Дополнительные маршруты для управления пользователями (CRUD) могут быть добавлены по необходимости


