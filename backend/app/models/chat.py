# models/chat.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

# Таблица для связи многие-ко-многим между пользователями и чатами
conversation_user_association = Table(
    'conversation_user_association',
    Base.metadata,
    Column('conversation_id', Integer, ForeignKey('conversations.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

