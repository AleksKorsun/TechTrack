# app/core/config.py

from pydantic import BaseSettings
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
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD")
    MAIL_FROM: str = os.getenv("MAIL_FROM")
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"  # Замените на ваш SMTP сервер
    MAIL_FROM_NAME: str = "Your App Name"

    class Config:
        env_file = ".env"

settings = Settings()


