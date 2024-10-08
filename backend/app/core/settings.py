import os
from pathlib import Path
from datetime import timedelta
from app.core.config import settings  # Импортируем настройки из config.py

BASE_DIR = Path(__file__).resolve().parent.parent

# Используем переменные из config.py для настройки SECRET_KEY и JWT
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

# Подключаем базу данных через DATABASE_URL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # Используем PostgreSQL
        'NAME': settings.DATABASE_URL.split('/')[-1],
        'USER': settings.DATABASE_URL.split('//')[1].split(':')[0],
        'PASSWORD': settings.DATABASE_URL.split(':')[2].split('@')[0],
        'HOST': settings.DATABASE_URL.split('@')[1].split(':')[0],
        'PORT': settings.DATABASE_URL.split(':')[-1],
    }
}

DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'orders_app',
    'technicians_app',
    'users_app',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'channels',
    'myapp',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'my_housecall_pro.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'my_housecall_pro.wsgi.application'

# JWT Настройки
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Настройки CORS
CORS_ALLOW_ALL_ORIGINS = True

