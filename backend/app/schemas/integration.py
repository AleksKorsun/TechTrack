# schemas/integration.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IntegrationBase(BaseModel):
    name: str

class IntegrationCreate(IntegrationBase):
    api_key: str

class IntegrationOut(IntegrationBase):
    id: int
    is_connected: bool
    connected_at: Optional[datetime]

    class Config:
        orm_mode = True
