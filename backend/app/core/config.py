# app/core/config.py

from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Stripe API keys
    STRIPE_API_KEY: str = os.getenv('STRIPE_API_KEY')
    STRIPE_WEBHOOK_SECRET: str = os.getenv('STRIPE_WEBHOOK_SECRET')

    # PayPal API credentials
    PAYPAL_CLIENT_ID: str = os.getenv('PAYPAL_CLIENT_ID')
    PAYPAL_CLIENT_SECRET: str = os.getenv('PAYPAL_CLIENT_SECRET')

    # Email configuration
    MAIL_USERNAME: str = "your_email_username"
    MAIL_PASSWORD: str = "your_email_password"
    MAIL_FROM: str = "your_email@example.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"  # замените на SMTP-сервер вашего почтового провайдера
    MAIL_FROM_NAME: str = "Your App Name"

    # Путь к медиафайлам
    MEDIA_ROOT: str = "./media"

    class Config:
        env_file = ".env"

settings = Settings()


