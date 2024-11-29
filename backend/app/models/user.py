# models/user.py

from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime
from app.enums import UserRole

class User(Base):
    __tablename__ = 'users'

    # Основные поля пользователя
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.client, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Отношения
    client_profile = relationship('Client', back_populates='user', uselist=False)
    orders_as_technician = relationship("Order", back_populates="technician", foreign_keys="[Order.technician_id]")
    reports = relationship('Report', back_populates='technician')
    notifications = relationship('Notification', back_populates='user')
    devices = relationship('UserDevice', back_populates='user')
    payrolls = relationship('Payroll', back_populates='technician')
    media_files = relationship('Media', back_populates='uploader')
    conversations = relationship('Conversation', back_populates='user')
    messages = relationship('Message', back_populates='sender')

    # Новые отношения для отзывов
    reviews_received = relationship('Review', foreign_keys='Review.technician_id', back_populates='technician')
    reviews_given = relationship('Review', foreign_keys='Review.client_id', back_populates='client')

    qualification = Column(String, nullable=True)
    rating = Column(Integer, default=0, nullable=True)
    status = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    profile_photo_url = Column(String, nullable=True)




    # Метод обновления рейтинга (если требуется)
    # def update_rating(self, db: Session):
    #     # Реализация метода обновления рейтинга




