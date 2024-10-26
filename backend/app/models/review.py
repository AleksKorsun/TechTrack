from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Review(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    technician_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    client_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    rating = Column(Integer, nullable=False)  # Оценка от 1 до 5
    review_text = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    technician = relationship('User', foreign_keys=[technician_id], back_populates='reviews_received')
    client = relationship('User', foreign_keys=[client_id], back_populates='reviews_given')
    order = relationship('Order', back_populates='review')
