# app/core/security.py

from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.core.config import settings
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.user import User
from app.logging_config import logger  # Импорт логгера

# Определение схемы OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Контекст для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Проверка пароля
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Хеширование пароля
def get_password_hash(password):
    hashed = pwd_context.hash(password)
    logger.info("Password hashed successfully.")  # Логируем успешное хеширование
    return hashed

# Создание access токена
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.info(
        f"Access token created for user: {data.get('sub')}, role: {data.get('role', 'unknown')} "
        f"with expiration: {expire.isoformat()}"
    )
    return encoded_jwt

# Создание refresh токена
def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.info(
        f"Refresh token created for user: {data.get('sub')} with expiration: {expire.isoformat()}"
    )
    return encoded_jwt

# Проверка токена и извлечение payload
def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        logger.info(f"Token successfully decoded for user: {payload.get('sub')}")
        return payload
    except JWTError as e:
        logger.error(f"Failed to decode token: {str(e)}")  # Логируем ошибку при декодировании
        return None

# Получение пользователя из токена
def get_user_from_token(token: str, db: Session):
    payload = decode_token(token)
    if payload is None:
        logger.warning("Token payload is invalid, user not found.")
        return None
    email: str = payload.get("sub")
    if email is None:
        logger.warning("Email not found in token payload.")
        return None
    user = db.query(User).filter(User.email == email).first()
    if user:
        logger.info(f"User {user.email} successfully retrieved from token.")
    else:
        logger.warning(f"User with email {email} not found in database.")
    return user

