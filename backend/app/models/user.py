# models/user.py

from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime
from app.enums import UserRole

class User(Base):
    __tablename__ = 'users'

    # Поля
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.client, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Отношения
    # Если пользователь связан с профилем клиента
    client_profile = relationship('Client', back_populates='user', uselist=False)

    # Отношения с заказами как техник
    orders_as_technician = relationship("Order", back_populates="technician", foreign_keys="[Order.technician_id]")

    # Дополнительные отношения, специфичные для пользователя системы
    reports = relationship('Report', back_populates='technician')
    notifications = relationship('Notification', back_populates='user')
    devices = relationship('UserDevice', back_populates='user')
    payrolls = relationship('Payroll', back_populates='technician')
    media_files = relationship('Media', back_populates='uploader')

    # Поля, специфичные для техники
    qualification = Column(String, nullable=True)
    rating = Column(Integer, default=0, nullable=True)
    status = Column(String, nullable=True)
    skills = Column(String, nullable=True)  # Изменено на String для простоты
    profile_photo_url = Column(String, nullable=True)

    # Метод обновления рейтинга (если требуется)
    # def update_rating(self, db: Session):
    #     # Реализация метода обновления рейтинга




