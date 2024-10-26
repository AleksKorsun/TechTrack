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

class Conversation(Base):
    __tablename__ = 'conversations'

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    participants = relationship('User', secondary=conversation_user_association, back_populates='conversations')

class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))
    sender_id = Column(Integer, ForeignKey('users.id'))
    content = Column(String, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship('Conversation', back_populates='messages')
    sender = relationship('User')
