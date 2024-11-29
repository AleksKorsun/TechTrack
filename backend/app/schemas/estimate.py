from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .estimate_item import EstimateItemCreate, EstimateItemOut

class EstimateBase(BaseModel):
    client_id: int
    discount: Optional[float] = 0.0
    tax: Optional[float] = 0.0
    items: List[EstimateItemCreate]

class EstimateCreate(EstimateBase):
    pass

class EstimateUpdate(BaseModel):
    discount: Optional[float]
    tax: Optional[float]
    status: Optional[str]
    items: Optional[List[EstimateItemCreate]]

class EstimateOut(EstimateBase):
    id: int
    technician_id: int
    total: float
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[EstimateItemOut]

    class Config:
        from_attributes = True
