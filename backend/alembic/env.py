#env.py

import os
from alembic import context
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig
from dotenv import load_dotenv

# Загрузка переменных окружения из файла .env
load_dotenv()

# Настройки Alembic
config = context.config
fileConfig(config.config_file_name)

# Установите URL базы данных из переменной окружения
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# Импорт моделей и MetaData
from app.db.base_class import Base
from app.models.ad import Ad
from app.models.client import Client
from app.models.conversation import Conversation
from app.models.estimate_item import EstimateItem
from app.models.estimate import Estimate
from app.models.expense import Expense
from app.models.invoice import Invoice
from app.models.integration import Integration
from app.models.material import Material
from app.models.media import Media
from app.models.message import Message
from app.models.notification import Notification
from app.models.order_item import OrderItem
from app.models.order import Order
from app.models.payment import Payment
from app.models.report import Report
from app.models.review import Review
from app.models.service import Service
from app.models.user_device import UserDevice
from app.models.user import User
from app.models.finance import Payroll, Income


# Укажите метаданные
target_metadata = Base.metadata

def run_migrations_offline():
    """Запуск миграций в 'offline' режиме."""
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Запуск миграций в 'online' режиме."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()



