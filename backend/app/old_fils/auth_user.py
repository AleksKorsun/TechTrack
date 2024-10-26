from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut, UserUpdate, Token, UserLogin, RefreshToken
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from datetime import timedelta
from jose import JWTError, jwt
from typing import List
import logging
from pydantic import BaseModel
from app.enums import UserRole

class UserRoleUpdate(BaseModel):
    new_role: UserRole

    
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Функция для проверки роли пользователя
def role_required(allowed_roles: List[str]):
    def decorator(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            logger.warning("User with email %s attempted to access a resource without the required role", user.email)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав доступа"
            )
        return user
    return decorator

# Регистрация нового пользователя
@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    logger.info("Attempting to register a new user with email: %s", user.email)
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        logger.warning("User with email %s already exists", user.email)
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    hashed_password = get_password_hash(user.password)
    db_user = User(
    email=user.email,
    name=user.name,
    phone=user.phone,
    role=user.role if user.role else "client",  # По умолчанию роль клиента
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info("User with email %s successfully registered", user.email)
    return db_user

# Логин пользователя
@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    logger.info("Attempting to log in user with email: %s", user_data.email)
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if not db_user or not verify_password(user_data.password, db_user.password_hash):
        logger.warning("Failed login attempt for email: %s", user_data.email)
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    logger.info("User with email %s successfully logged in", user_data.email)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Обновление JWT-токена
@router.post("/refresh", response_model=Token)
def refresh_token(refresh_data: RefreshToken, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(refresh_data.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            logger.error("Invalid refresh token: missing subject")
            raise HTTPException(status_code=400, detail="Недействительный токен")
    except JWTError:
        logger.error("Invalid refresh token for email: %s", refresh_data.refresh_token)
        raise HTTPException(status_code=400, detail="Недействительный токен")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        logger.warning("User with email %s not found during token refresh", email)
        raise HTTPException(status_code=400, detail="Пользователь не найден")
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    logger.info("Token refreshed for user with email: %s", email)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

# Запрос на сброс пароля
@router.post("/reset-password-request")
def reset_password_request(email: str, db: Session = Depends(get_db)):
    logger.info("Password reset requested for email: %s", email)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning("Password reset requested for non-existent email: %s", email)
        raise HTTPException(status_code=400, detail="Пользователь с таким email не найден")
    reset_token = create_access_token({"sub": user.email}, expires_delta=timedelta(hours=1))
    send_reset_email(user.email, reset_token)
    logger.info("Password reset email sent to: %s", email)
    return {"message": "Ссылка для восстановления пароля отправлена на вашу почту."}

# Сброс пароля
@router.post("/update-password")
def reset_password(data: dict, db: Session = Depends(get_db)):
    token = data.get("token")
    new_password = data.get("new_password")
    if not token or not new_password:
        logger.error("Password reset attempt with missing token or new password")
        raise HTTPException(status_code=400, detail="Токен и новый пароль обязательны")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            logger.error("Invalid token during password reset: missing subject")
            raise HTTPException(status_code=400, detail="Недействительный токен")
    except JWTError:
        logger.error("Invalid token provided for password reset")
        raise HTTPException(status_code=400, detail="Недействительный токен")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning("User with email %s not found during password reset", email)
        raise HTTPException(status_code=400, detail="Пользователь не найден")
    user.password_hash = get_password_hash(new_password)
    db.commit()
    logger.info("Password successfully updated for user with email: %s", email)
    return {"message": "Пароль успешно обновлен."}

# Отправка письма для сброса пароля (заглушка)
def send_reset_email(email: str, token: str):
    logger.info(f"Sending reset password email to {email} with token: {token}")
    print(f"Sending reset password email to {email} with token: {token}")

# Выход из системы
@router.post("/logout")
def logout_user(current_user: User = Depends(get_current_user)):
    logger.info("User with email %s logged out", current_user.email)
    # Здесь можно добавить токен в черный список или сделать другую логику для аннулирования токена
    return {"message": "Вы успешно вышли из системы."}

# Получить информацию о текущем пользователе
@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    logger.info("Fetching current user info for email: %s", current_user.email)
    return current_user

# Обновить информацию о текущем пользователе
@router.put("/me", response_model=UserOut)
async def update_current_user(user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("Updating current user info for email: %s", current_user.email)
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    logger.info("User info updated for email: %s", current_user.email)
    return current_user

# Получить список всех пользователей (доступно только для администратора)
@router.get("/", response_model=List[UserOut])
async def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role_required(['admin'])(current_user)
    logger.info("Admin with email %s is fetching all users", current_user.email)
    users = db.query(User).all()
    return users

# Получить пользователя по ID (доступно для администратора и самого пользователя)
@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role_required(['admin', 'client', 'technician'])(current_user)
    logger.info("Fetching user info for user ID: %d by current user: %s", user_id, current_user.email)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        logger.warning("User with ID %d not found", user_id)
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if current_user.role != 'admin' and current_user.id != user_id:
        logger.warning("User with email %s attempted unauthorized access to user ID %d", current_user.email, user_id)
        raise HTTPException(status_code=403, detail="Недостаточно прав доступа")
    return user

# Создать нового пользователя (доступно только для администратора)
@router.post("/", response_model=UserOut)
async def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(role_required(['admin']))):
    logger.info("Admin with email %s is attempting to create a new user with email: %s", current_user.email, user.email)
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
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info("User with email %s successfully created", user.email)
    return new_user

# Обновить информацию о пользователе (администратор может обновить любого, пользователь - только себя)
@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info("User with email %s is attempting to update user with ID: %d", current_user.email, user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning("User with ID %d not found", user_id)
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if current_user.role != 'admin' and current_user.id != user_id:
        logger.warning("User with email %s attempted to update user with ID %d without permission", current_user.email, user_id)
        raise HTTPException(status_code=403, detail="Недостаточно прав доступа")
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    logger.info("User with ID %d successfully updated by user: %s", user_id, current_user.email)
    return user

# Удаление пользователя (доступно только для администратора)
@router.delete("/{user_id}", response_model=dict)
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(role_required(['admin']))):
    logger.info("Admin with email %s is attempting to delete user with ID: %d", current_user.email, user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning("User with ID %d not found", user_id)
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(user)
    db.commit()
    logger.info("User with ID %d successfully deleted by admin: %s", user_id, current_user.email)
    return {"message": "Пользователь успешно удалён"}

# Обновление роли пользователя (доступно только для администратора)
@router.put("/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,  # Используем схему для валидации
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(['admin']))  # Доступ только для администратора
):
    logger.info(f"Admin with email {current_user.email} is attempting to update role for user with ID: {user_id} to {role_update.new_role}")
    
    # Получаем пользователя по ID
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning(f"User with ID {user_id} not found")
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Обновляем роль пользователя
    user.role = role_update.new_role
    db.commit()
    db.refresh(user)
    
    logger.info(f"Role for user with ID {user_id} successfully updated to {role_update.new_role} by admin {current_user.email}")
    return user