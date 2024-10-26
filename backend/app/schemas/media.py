# app/schemas/media.py

from pydantic import BaseModel
from datetime import datetime

class MediaBase(BaseModel):
    filename: str
    file_type: str
    uploaded_at: datetime

class MediaCreate(MediaBase):
    pass

class MediaOut(MediaBase):
    id: int
    uploader_id: int
    order_id: int

    class Config:
        from_attributes = True
