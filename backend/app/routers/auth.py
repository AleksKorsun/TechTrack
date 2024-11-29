# app/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import UserLogin, PasswordResetRequest, PasswordReset
from app.models.user import User
# from app.models.client import Client  # Отключено, так как клиентская часть не используется
from app.dependencies import get_db, get_current_user
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from datetime import timedelta
import logging
from app.enums import UserRole

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Регистрация нового пользователя
@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    logger.info("Attempting to register a new user with email: %s", user.email)
    
    # Проверяем, существует ли пользователь с таким email
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        logger.warning("User with email %s already exists", user.email)
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    # Хеширование пароля
    hashed_password = get_password_hash(user.password)
    
    # Создание нового пользователя
    db_user = User(
        email=user.email,
        name=user.name,
        phone=user.phone,
        role=UserRole.user,  # По умолчанию роль обычного пользователя
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Если необходимо, можно создать профиль клиента и связать с пользователем
    # new_client = Client(
    #     name=user.name,
    #     email=user.email,
    #     phone=user.phone,
    #     user_id=db_user.id
    # )
    # db.add(new_client)
    # db.commit()
    # db.refresh(new_client)
    
    logger.info("User with email %s successfully registered", user.email)
    
    # Создание токенов
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role.value})
    refresh_token = create_refresh_token(data={"sub": db_user.email, "role": db_user.role.value})  # Роль добавлена в refresh_token
    
    # Установка токенов в куки
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax")  # secure=True для безопасности
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax")  # secure=True для безопасности
    logger.info("Access and refresh tokens set in cookies for user: %s", user.email)
    
    return db_user

# Логин пользователя
@router.post("/login")
def login_user(user_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    logger.info("Attempting to log in user with email: %s", user_data.email)
    # Поиск пользователя в базе данных
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if not db_user or not verify_password(user_data.password, db_user.password_hash):
        logger.warning("Failed login attempt for email: %s", user_data.email)
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Создание токенов
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role.value})
    refresh_token = create_refresh_token(data={"sub": db_user.email, "role": db_user.role.value})  # Роль добавлена в refresh_token
    
    # Установка токенов в куки
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax")  # secure=True для безопасности
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax")  # secure=True для безопасности
    logger.info("User with email %s successfully logged in", user_data.email)
    
    return {"message": "Login successful", "user": db_user}

# Обновление JWT-токена
@router.post("/refresh")
def refresh_access_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        logger.warning("No refresh token provided in request cookies.")
        raise HTTPException(status_code=400, detail="Refresh token not provided")
    
    # Расшифровка refresh токена
    payload = decode_token(refresh_token)
    if payload is None:
        logger.warning("Invalid refresh token provided.")
        raise HTTPException(status_code=400, detail="Invalid token")
    
    # Извлечение email и роли из токена
    email = payload.get("sub")
    role = payload.get("role")
    if email is None or role is None:
        logger.error("Invalid refresh token: missing subject or role.")
        raise HTTPException(status_code=400, detail="Invalid token")
    
    # Проверяем, существует ли пользователь
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        logger.warning("User with email %s not found while refreshing token.", email)
        raise HTTPException(status_code=400, detail="User not found")
    
    # Создание нового access токена
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role.value})
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax")  # secure=True для безопасности
    logger.info("Access token refreshed for user with email: %s", email)
    
    return {"message": "Token refreshed"}

# Запрос на сброс пароля
@router.post("/reset-password-request")
def reset_password_request(data: PasswordResetRequest, db: Session = Depends(get_db)):
    email = data.email
    logger.info("Password reset requested for email: %s", email)
    # Поиск пользователя по email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning("Password reset requested for non-existent email: %s", email)
        raise HTTPException(status_code=400, detail="User with this email not found")
    
    # Создание токена для сброса пароля
    reset_token = create_access_token({"sub": user.email}, expires_delta=timedelta(hours=1))
    # Отправка письма со ссылкой для сброса пароля
    send_reset_email(user.email, reset_token)
    logger.info("Password reset email sent to: %s", email)
    
    return {"message": "Password reset link has been sent to your email."}

# Сброс пароля
@router.post("/update-password")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    token = data.token
    new_password = data.new_password
    if not token or not new_password:
        logger.error("Password reset attempt with missing token or new password")
        raise HTTPException(status_code=400, detail="Token and new password are required")
    
    # Расшифровка токена
    payload = decode_token(token)
    if payload is None:
        logger.error("Invalid token provided for password reset")
        raise HTTPException(status_code=400, detail="Invalid token")
    
    # Извлечение email из токена
    email = payload.get("sub")
    if email is None:
        logger.error("Invalid token during password reset: missing subject")
        raise HTTPException(status_code=400, detail="Invalid token")
    
    # Поиск пользователя по email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning("User with email %s not found during password reset", email)
        raise HTTPException(status_code=400, detail="User not found")
    
    # Обновление пароля
    user.password_hash = get_password_hash(new_password)
    db.commit()
    logger.info("Password successfully updated for user with email: %s", email)
    
    return {"message": "Password has been updated successfully."}

# Отправка письма для сброса пароля (заглушка)
def send_reset_email(email: str, token: str):
    logger.info(f"Sending reset password email to {email} with token: {token}")
    # Здесь можно реализовать отправку письма
    print(f"Sending reset password email to {email} with token: {token}")

# Выход из системы
@router.post("/logout")
def logout_user(response: Response, current_user: User = Depends(get_current_user)):
    logger.info("User with email %s logged out", current_user.email)
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "You have successfully logged out."}




