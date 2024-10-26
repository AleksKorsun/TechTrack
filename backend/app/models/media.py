# app/models/media.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from datetime import datetime

class Media(Base):
    __tablename__ = 'media'

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False, index=True)
    file_type = Column(String, nullable=False)  # 'photo', 'video', 'voice'
    file_path = Column(String, nullable=False)  # Путь к файлу
    uploaded_at = Column(DateTime, default=datetime.utcnow)  # Дата загрузки

    # Связь с пользователем, который загрузил файл
    uploader_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    uploader = relationship('User', back_populates='media_files')

    # Связь с заказом
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    order = relationship('Order', back_populates='media_files')

    # Добавьте новое поле
    report_id = Column(Integer, ForeignKey('reports.id'), nullable=True)

    # Добавьте связи
    report_photos = relationship('Report', back_populates='photos', foreign_keys='Media.report_id')
    report_videos = relationship('Report', back_populates='videos', foreign_keys='Media.report_id')

