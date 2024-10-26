# app/models/payment.py

from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class Payment(Base):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)  # 'stripe' или 'paypal'
    payment_details = Column(JSON)  # Хранит детали платежа в формате JSON
    status = Column(String, default='pending')  # 'successful', 'failed', etc.
    transaction_id = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Связи
    order = relationship("Order", back_populates="payments")
    client = relationship("Client", back_populates="payments")

