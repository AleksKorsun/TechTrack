from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class OrderItem(Base):
    __tablename__ = 'order_items'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)  # Ссылка на заказ
    item_type = Column(String, nullable=False)  # Например, 'service' или 'material'
    item_id = Column(Integer, nullable=False)  # ID услуги или материала
    description = Column(String, nullable=False)  # Описание элемента
    quantity = Column(Float, nullable=False)  # Количество
    unit_price = Column(Float, nullable=False)  # Цена за единицу
    total = Column(Float, nullable=False)  # Общая стоимость элемента (quantity * unit_price)

    # Связь с заказом
    order = relationship('Order', back_populates='items')

