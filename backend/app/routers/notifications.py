from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationOut
from app.dependencies import get_db, get_current_user
from typing import List

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

# Получить все уведомления текущего пользователя
@router.get("/", response_model=List[NotificationOut])
async def get_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).all()
    return notifications

# Пометить уведомление как прочитанное
@router.put("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Уведомление не найдено")
    notification.is_read = True
    db.commit()
    db.refresh(notification)  # Возвращаем обновленное уведомление
    return notification

# Регистрация токена для push-уведомлений
from app.models.user_device import UserDevice
from app.schemas.user_device import UserDeviceCreate

@router.post("/token")
async def register_push_token(
    device: UserDeviceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_device = db.query(UserDevice).filter(UserDevice.user_id == current_user.id, UserDevice.device_id == device.device_id).first()
    if db_device:
        db_device.push_token = device.push_token
    else:
        db_device = UserDevice(user_id=current_user.id, **device.dict())
        db.add(db_device)
    db.commit()
    return {"detail": "Токен зарегистрирован"}

