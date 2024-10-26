from pydantic import BaseModel
from typing import Optional

class EstimateItemBase(BaseModel):
    item_type: str  # 'service' или 'material'
    item_id: int
    description: str
    quantity: float
    unit_price: float

    @property
    def total(self):
        return self.quantity * self.unit_price

class EstimateItemCreate(EstimateItemBase):
    pass

class EstimateItemUpdate(BaseModel):
    item_type: Optional[str]
    item_id: Optional[int]
    description: Optional[str]
    quantity: Optional[float]
    unit_price: Optional[float]

class EstimateItemOut(EstimateItemBase):
    id: int
    total: float

    class Config:
        orm_mode = True
