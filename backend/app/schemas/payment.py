# app/schemas/payment.py

from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class PaymentBase(BaseModel):
    order_id: int
    amount: float
    payment_method: str
    payment_details: Dict  # Детали платежа в зависимости от метода

class PaymentCreate(PaymentBase):
    pass

class PaymentOut(PaymentBase):
    id: int
    client_id: int
    status: str
    transaction_id: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

