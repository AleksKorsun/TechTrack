from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InvoiceItemBase(BaseModel):
    description: str
    quantity: float
    unit_price: float
    total: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int

    class Config:
        orm_mode = True

class InvoiceBase(BaseModel):
    order_id: int
    client_id: int
    amount: float
    due_date: datetime
    items: List[InvoiceItemCreate]
    tax: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class Invoice(InvoiceBase):
    id: int
    status: str
    created_at: datetime
    items: List[InvoiceItem]

    class Config:
        orm_mode = True

# Добавление InvoiceOut на основе Invoice
class InvoiceOut(Invoice):
    pass

