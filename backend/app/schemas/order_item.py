from pydantic import BaseModel
from typing import Optional

class OrderItemBase(BaseModel):
    item_type: str  # 'service' или 'material'
    item_id: int
    description: str
    quantity: float
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int
    total: float

    class Config:
        orm_mode = True
