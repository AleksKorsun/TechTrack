from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Expense(Base):
    __tablename__ = 'expenses'

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey('reports.id'), nullable=False)  # Если нужна связь с reports
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String)  # Добавлено из второй версии
    date = Column(DateTime, nullable=False)  # Добавлено из второй версии
    receipt_photo_url = Column(String)  # Поле из первой версии

    # Связи
    report = relationship('Report', back_populates='expenses')  # Связь с моделью Report
