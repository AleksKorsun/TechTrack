# schemas/ad.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str]
    start_date: datetime
    end_date: datetime

class AdCreate(AdBase):
    pass

class AdUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    image_url: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: Optional[bool]

class AdOut(AdBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True
