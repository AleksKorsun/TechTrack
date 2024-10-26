# schemas/finance.py

from pydantic import BaseModel
from datetime import datetime

class PayrollCreate(BaseModel):
    technician_id: int
    amount: float
    period_start: datetime
    period_end: datetime

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str
    date: datetime

class IncomeCreate(BaseModel):
    amount: float
    source: str
    description: str
    date: datetime
