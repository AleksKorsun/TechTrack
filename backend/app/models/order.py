# models/order.py

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime
from app.models.order_item import OrderItem

class Order(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    technician_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    service_type = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    preferred_start_time = Column(DateTime, nullable=True)
    scheduled_start_time = Column(DateTime, nullable=True)
    scheduled_end_time = Column(DateTime, nullable=True)
    actual_start_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    estimated_duration_hours = Column(DECIMAL(5, 2), nullable=True)
    materials_cost = Column(DECIMAL(10, 2), nullable=True)
    labor_cost = Column(DECIMAL(10, 2), nullable=True)
    equipment_cost = Column(DECIMAL(10, 2), nullable=True)
    total_cost = Column(DECIMAL(10, 2), nullable=True)
    status = Column(String(20), default="pending", nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Отношения
    client = relationship('Client', back_populates='orders')
    technician = relationship('User', back_populates='orders_as_technician', foreign_keys=[technician_id])
    media_files = relationship('Media', back_populates='order')
    payments = relationship("Payment", back_populates="order")
    invoices = relationship("Invoice", back_populates="order")
    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')
    report = relationship('Report', back_populates='order')  # Добавлено отношение к отчету
    review = relationship('Review', back_populates='order', uselist=False)
