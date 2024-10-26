from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EstimateItem(Base):
    __tablename__ = 'estimate_items'

    id = Column(Integer, primary_key=True, index=True)
    estimate_id = Column(Integer, ForeignKey('estimates.id'), nullable=False)
    item_type = Column(String, nullable=False)  # Тип элемента: 'service' или 'material'
    item_id = Column(Integer, nullable=False)  # ID услуги или материала
    description = Column(String, nullable=False)  # Описание услуги или материала
    quantity = Column(Float, nullable=False, default=1)  # Количество
    unit_price = Column(Float, nullable=False)  # Цена за единицу
    total = Column(Float, nullable=False)  # Общая стоимость позиции

    estimate = relationship('Estimate', back_populates='items')  # Связь с таблицей estimates


