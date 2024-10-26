from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    order_id: int
    technician_id: int
    rating: int = Field(..., ge=1, le=5)  # Оценка от 1 до 5
    review_text: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewOut(ReviewBase):
    id: int
    client_id: int
    created_at: datetime

    class Config:
        orm_mode = True

