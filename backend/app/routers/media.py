from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user, role_required
from app.models.media import Media
from app.models.order import Order
from app.core.config import settings
from app.schemas.media import MediaOut
from app.enums import UserRole
import os
import shutil
from typing import List
from starlette.responses import FileResponse

router = APIRouter(
    prefix="/media",
    tags=["media"],
)

# Получение всех медиафайлов, связанных с заказом
@router.get("/order/{order_id}", response_model=List[MediaOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.client, UserRole.technician]))])
def get_order_media(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Получение всех медиафайлов, связанных с заказом.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверяем права доступа
    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="Вы не можете просматривать медиафайлы для этого заказа")
    if current_user.role == UserRole.technician and current_user.id != order.technician_id:
        raise HTTPException(status_code=403, detail="Вы не можете просматривать медиафайлы для этого заказа")
    
    # Получаем медиафайлы для заказа
    media_files = db.query(Media).filter(Media.order_id == order_id).all()
    return media_files

# Загрузка медиафайла для заказа
@router.post("/upload", dependencies=[Depends(role_required([UserRole.admin, UserRole.client, UserRole.technician]))])
async def upload_media(
    order_id: int,
    file_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Загрузка медиафайла для определенного заказа.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="Вы не можете загружать файлы для этого заказа")
    if current_user.role == UserRole.technician and current_user.id != order.technician_id:
        raise HTTPException(status_code=403, detail="Вы не можете загружать файлы для этого заказа")
    
    allowed_types = ['photo', 'video', 'voice']
    if file_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Недопустимый тип файла")

    order_media_path = os.path.join(settings.MEDIA_ROOT, f'order_{order_id}')
    os.makedirs(order_media_path, exist_ok=True)

    file_location = os.path.join(order_media_path, file.filename)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    media = Media(
        filename=file.filename,
        file_type=file_type,
        uploader_id=current_user.id,
        order_id=order_id,
    )
    db.add(media)
    db.commit()
    db.refresh(media)

    return {"filename": file.filename, "media_id": media.id}

# Получение медиафайла по ID
@router.get("/{media_id}", response_model=MediaOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.client, UserRole.technician]))])
async def get_media_by_id(
    media_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Медиафайл не найден")

    order = db.query(Order).filter(Order.id == media.order_id).first()
    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому медиафайлу")
    if current_user.role == UserRole.technician and current_user.id != order.technician_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому медиафайлу")

    file_path = media.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл не найден")
    return FileResponse(path=file_path, filename=media.filename, media_type='application/octet-stream')

# Удаление медиафайла по ID
@router.delete("/{media_id}", dependencies=[Depends(role_required([UserRole.admin, UserRole.client, UserRole.technician]))])
async def delete_media_by_id(
    media_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Медиафайл не найден")

    order = db.query(Order).filter(Order.id == media.order_id).first()
    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для удаления этого медиафайла")
    if current_user.role == UserRole.technician and current_user.id != order.technician_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для удаления этого медиафайла")

    file_path = media.file_path
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(media)
    db.commit()
    return {"detail": "Медиафайл успешно удалён"}

