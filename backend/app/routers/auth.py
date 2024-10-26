# app/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut, Token, UserLogin, RefreshToken
from app.models.user import User
from app.models.client import Client  # Добавляем импорт модели Client
from app.dependencies import get_db, get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from datetime import timedelta
from jose import JWTError, jwt
import logging
from app.enums import UserRole

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Регистрация нового пользователя-клиента
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
        role=UserRole.client,  # По умолчанию роль клиента
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info("User with email %s successfully registered", user.email)

    # Создание профиля клиента и связывание с пользователем
    new_client = Client(
        name=user.name,
        email=user.email,
        phone=user.phone,
        user_id=db_user.id
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    return db_user

# Логин пользователя
@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    logger.info("Attempting to log in user with email: %s", user_data.email)
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if not db_user or not verify_password(user_data.password, db_user.password_hash):
        logger.warning("Failed login attempt for email: %s", user_data.email)
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role.value})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    logger.info("User with email %s successfully logged in", user_data.email)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user
    }

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
        logger.error("Invalid refresh token")
        raise HTTPException(status_code=400, detail="Недействительный токен")
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        logger.warning("User with email %s not found during token refresh", email)
        raise HTTPException(status_code=400, detail="Пользователь не найден")
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role.value})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    logger.info("Token refreshed for user with email: %s", email)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": db_user
    }


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
    # Здесь можно добавить токен в черный список или реализовать логику для аннулирования токена
    return {"message": "Вы успешно вышли из системы."}
