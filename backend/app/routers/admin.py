# admin.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut, UserUpdate, UserRoleUpdate
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.core.security import get_password_hash
from typing import List
from app.enums import UserRole
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(role_required([UserRole.admin]))]  # Доступ только для администраторов
)

# Получить список всех пользователей
@router.get("/users", response_model=List[UserOut])
async def get_users(db: Session = Depends(get_db)):
    logger.info("Admin is fetching all users")
    users = db.query(User).all()
    return users

# Получить пользователя по ID
@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    logger.info("Fetching user info for user ID: %d", user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        logger.warning("User with ID %d not found", user_id)
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

# Создать нового пользователя
@router.post("/users", response_model=UserOut)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    logger.info("Admin is attempting to create a new user with email: %s", user.email)
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        logger.warning("User with email %s already exists", user.email)
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        name=user.name,
        phone=user.phone,
        password_hash=hashed_password,
        role=user.role or UserRole.client
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info("User with email %s successfully created", user.email)
    return new_user

# Обновить информацию о пользователе
@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    logger.info("Admin is attempting to update user with ID: %d", user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning("User with ID %d not found", user_id)
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    logger.info("User with ID %d successfully updated", user_id)
    return user

# Удаление пользователя
@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    logger.info("Admin is attempting to delete user with ID: %d", user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning("User with ID %d not found", user_id)
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(user)
    db.commit()
    logger.info("User with ID %d successfully deleted", user_id)
    return {"message": "Пользователь успешно удалён"}

# Обновление роли пользователя
@router.put("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db)
):
    logger.info(f"Admin is attempting to update role for user with ID: {user_id} to {role_update.new_role}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning(f"User with ID {user_id} not found")
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.role = role_update.new_role
    db.commit()
    db.refresh(user)
    logger.info(f"Role for user with ID {user_id} successfully updated to {role_update.new_role}")
    return user
