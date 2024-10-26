from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Report(Base):
    __tablename__ = 'reports'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    technician_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    report_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связи
    order = relationship('Order', back_populates='report')
    technician = relationship('User', back_populates='reports')
    expenses = relationship('Expense', back_populates='report', cascade='all, delete-orphan')
    photos = relationship('Media', back_populates='report_photos')
    videos = relationship('Media', back_populates='report_videos')
