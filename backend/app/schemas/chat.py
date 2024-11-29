# schemas/chat.py

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    sent_at: datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: int
    participants: List[int]
    created_at: datetime

    class Config:
        from_attributes = True
