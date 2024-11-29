# models/message.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))  # Ссылка на разговор
    sender_id = Column(Integer, ForeignKey('users.id'))  # Ссылка на отправителя сообщения
    content = Column(String, nullable=False)  # Содержимое сообщения
    sent_at = Column(DateTime, default=datetime.utcnow)  # Дата и время отправки сообщения

    conversation = relationship('Conversation', back_populates='messages')  # Связь с разговором
    sender = relationship('User', back_populates='messages')  # Связь с отправителем (User)
