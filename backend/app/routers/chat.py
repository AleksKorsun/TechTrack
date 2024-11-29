# routers/chat.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, role_required
from app.schemas.chat import ConversationOut, MessageCreate, MessageOut
from typing import List
from datetime import datetime
from app.models.conversation import Conversation
from app.models.message import Message


router = APIRouter(
    prefix="/conversations",
    tags=["chat"]
)

@router.get("/", response_model=List[ConversationOut])
async def get_conversations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    conversations = db.query(Conversation).filter(
        Conversation.participants.any(id=current_user.id)
    ).all()
    return conversations

@router.get("/{conversation_id}", response_model=List[MessageOut])
async def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation or current_user.id not in [p.id for p in conversation.participants]:
        raise HTTPException(status_code=403, detail="Недостаточно прав доступа")
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).all()
    return messages

@router.post("/{conversation_id}/messages", response_model=MessageOut)
async def send_message(
    conversation_id: int,
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation or current_user.id not in [p.id for p in conversation.participants]:
        raise HTTPException(status_code=403, detail="Недостаточно прав доступа")
    new_message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message.content,
        sent_at=datetime.utcnow()
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message
