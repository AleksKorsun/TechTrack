from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Estimate(Base):
    __tablename__ = 'estimates'

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Связь с таблицей пользователей (клиенты)
    technician_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Связь с таблицей пользователей (техники)
    
    discount = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    
    status = Column(String, default='draft')  # Статус сметы: 'draft', 'sent', 'approved', 'rejected'
    description = Column(Text)
    payment_terms = Column(Text)
    
    # Новые поля
    service_date = Column(DateTime, nullable=True)  # Дата выполнения работы
    due_date = Column(DateTime, nullable=True)  # Дата оплаты
    job_number = Column(String, nullable=True)  # Номер работы

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    items = relationship('EstimateItem', back_populates='estimate', cascade='all, delete-orphan')  # Связь с позициями сметы
    client = relationship('User', foreign_keys=[client_id])  # Связь с клиентом
    technician = relationship('User', foreign_keys=[technician_id])  # Связь с техником
