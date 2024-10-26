# app/routers/order.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
from uuid import uuid4

from app.dependencies import get_db, get_current_user, role_required
from app.models.media import Media
from app.models.order import Order
from app.models.user import User
from app.models.client import Client  # Добавляем импорт модели Client
from app.schemas.order import OrderCreate, OrderUpdate, OrderOut, StatusUpdate
from app.schemas.media import MediaOut
from app.enums import UserRole
from app.schemas.order_item import OrderItemCreate  # Импорт OrderItemCreate
from app.models.order_item import OrderItem  # Импортируем OrderItem для работы с позициями заказа


router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

MEDIA_STORAGE_PATH = "media_storage/"
os.makedirs(MEDIA_STORAGE_PATH, exist_ok=True)

# 1. Создание нового заказа
@router.post("/", response_model=OrderOut, dependencies=[Depends(role_required([UserRole.client]))])
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Получаем профиль клиента по текущему пользователю
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client:
            raise HTTPException(status_code=400, detail="Профиль клиента не найден")

        # Создаем новый заказ
        new_order = Order(
            client_id=client.id,
            service_type=order.service_type,
            description=order.description,
            address=order.address,
            preferred_start_time=order.preferred_start_time,
            estimated_duration_hours=order.estimated_duration_hours,
            status='pending'
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        # Добавляем позиции (OrderItem) в заказ
        for item_data in order.items:
            db_item = OrderItem(
                order_id=new_order.id,
                item_type=item_data.item_type,
                item_id=item_data.item_id,
                description=item_data.description,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total=item_data.quantity * item_data.unit_price
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(new_order)
        return new_order
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Не удалось создать заказ: {str(e)}")

# 2.  Получение списка всех заказов (администратор и диспетчер)
@router.get("/", response_model=List[OrderOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher]))])
async def get_all_orders(
    status: str = None,
    technician_id: int = None,
    client_id: int = None,
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    orders_query = db.query(Order)

    if technician_id:
        orders_query = orders_query.filter(Order.technician_id == technician_id)
    if client_id:
        orders_query = orders_query.filter(Order.client_id == client_id)
    if status:
        orders_query = orders_query.filter(Order.status == status)
    if start_date:
        orders_query = orders_query.filter(Order.preferred_start_time >= start_date)
    if end_date:
        orders_query = orders_query.filter(Order.preferred_start_time <= end_date)

    orders = orders_query.all()
    return orders

# Получение заказов для техника
@router.get("/assigned", response_model=List[OrderOut], dependencies=[Depends(role_required([UserRole.technician]))])
async def get_assigned_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(Order.technician_id == current_user.id).all()
    return orders

# Получение заказов для клиента
@router.get("/my", response_model=List[OrderOut], dependencies=[Depends(role_required([UserRole.client]))])
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Получаем профиль клиента
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=400, detail="Client profile not found")  # Переведено на английский

    orders = db.query(Order).filter(Order.client_id == client.id).all()
    return orders

# 3. Получение деталей заказа
@router.get("/{order_id}", response_model=OrderOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.technician, UserRole.client]))])
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")  # Переведено на английский

    # Проверка прав доступа
    if current_user.role == UserRole.admin:
        pass  # Админ имеет доступ ко всем заказам
    elif current_user.role == UserRole.technician and current_user.id != order.technician_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this order")  # Переведено на английский
    elif current_user.role == UserRole.client:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client or client.id != order.client_id:
            raise HTTPException(status_code=403, detail="You do not have permission to view this order")  # Переведено на английский

    return order

# 4. Обновление заказа
@router.put("/{order_id}", response_model=OrderOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.technician]))])
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")  # Переведено на английский

    # Проверка прав доступа
    if current_user.role == UserRole.admin:
        pass  # Админ может обновлять любой заказ
    elif current_user.role == UserRole.technician:
        if current_user.id != order.technician_id:
            raise HTTPException(status_code=403, detail="You do not have permission to update this order")  # Переведено на английский
        # Техник может обновлять только определенные поля
        allowed_fields = {'status', 'actual_start_time', 'actual_end_time'}
        update_data = order_update.dict(exclude_unset=True)
        for key in update_data:
            if key not in allowed_fields:
                raise HTTPException(status_code=403, detail=f"Technician cannot update the field '{key}'")  # Переведено на английский
    else:
        raise HTTPException(status_code=403, detail="You do not have permission to update this order")  # Переведено на английский

    # Обновление полей заказа
    for key, value in order_update.dict(exclude_unset=True).items():
        setattr(order, key, value)

    # Обновление total_cost при изменении стоимости
    if any(field in order_update.dict(exclude_unset=True) for field in ['materials_cost', 'labor_cost', 'equipment_cost']):
        order.total_cost = (order.materials_cost or 0) + (order.labor_cost or 0) + (order.equipment_cost or 0)

    db.commit()
    db.refresh(order)
    return order

# 5. Отмена заказа клиентом
@router.put("/{order_id}/cancel", response_model=OrderOut, dependencies=[Depends(role_required([UserRole.client]))])
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")  # Переведено на английский

    # Проверка, что заказ принадлежит текущему клиенту
    client = db.query(Client).filter(Client.user_id == current_user.id).first()
    if not client or client.id != order.client_id:
        raise HTTPException(status_code=403, detail="You cannot cancel this order")  # Переведено на английский

    if order.status in ['completed', 'cancelled']:
        raise HTTPException(status_code=400, detail="This order cannot be cancelled")  # Переведено на английский

    order.status = 'cancelled'
    db.commit()
    db.refresh(order)
    return order


# 6. Обновление статуса заказа
@router.put("/{order_id}/status", response_model=OrderOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.technician]))])
async def update_order_status(
    order_id: int,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")  # Переведено на английский

    # Проверка прав доступа
    if current_user.role == UserRole.admin:
        pass  # Админ может обновлять статус любого заказа
    elif current_user.role == UserRole.technician:
        if current_user.id != order.technician_id:
            raise HTTPException(status_code=403, detail="You do not have permission to update this order")  # Переведено на английский
    else:
        raise HTTPException(status_code=403, detail="You do not have permission to update this order")  # Переведено на английский

    # Обновление статуса заказа
    order.status = status_update.status

    if status_update.status == 'in_progress':
        order.actual_start_time = status_update.actual_start_time or datetime.utcnow()
    elif status_update.status == 'completed':
        order.actual_end_time = status_update.actual_end_time or datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order

# 7. Назначение техника на заказ
@router.post("/{order_id}/assign-technician", response_model=OrderOut, dependencies=[Depends(role_required([UserRole.admin]))])
async def assign_technician(
    order_id: int,
    technician_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    technician = db.query(User).filter(User.id == technician_id, User.role == UserRole.technician).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")  # Переведено на английский
    if not technician:
        raise HTTPException(status_code=404, detail="Technician not found")  # Переведено на английский

    order.technician_id = technician_id
    order.status = "assigned"
    db.commit()
    db.refresh(order)

    return order

# 8. Загрузка медиафайлов с улучшенной обработкой ошибок
@router.post("/{order_id}/upload", response_model=MediaOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.technician, UserRole.client]))])
async def upload_media(
    order_id: int,
    file_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_mime_types = {
        'photo': ['image/jpeg', 'image/png', 'image/gif'],
        'video': ['video/mp4', 'video/mpeg'],
        'voice': ['audio/mpeg', 'audio/mp3', 'audio/wav']
    }

    if file_type not in allowed_mime_types:
        raise HTTPException(status_code=400, detail="Invalid file type")  # Переведено на английский

    if file.content_type not in allowed_mime_types[file_type]:
        raise HTTPException(status_code=400, detail="Invalid file MIME type")  # Переведено на английский

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    # Проверяем, что заказ существует
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")  # Переведено на английский

    # Проверка прав доступа
    if current_user.role == UserRole.client:
        client = db.query(Client).filter(Client.user_id == current_user.id).first()
        if not client or client.id != order.client_id:
            raise HTTPException(status_code=403, detail="You cannot upload files for this order")  # Переведено на английский
    if current_user.role == UserRole.technician and current_user.id != order.technician_id:
        raise HTTPException(status_code=403, detail="You cannot upload files for this order")  # Переведено на английский

    # Обработка сохранения файла с улучшенной обработкой ошибок
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds the allowed limit")  # Переведено на английский

        # Логика сохранения файла
        file_extension = file.filename.split(".")[-1]
        file_name = f"{uuid4()}.{file_extension}"
        file_path = os.path.join(MEDIA_STORAGE_PATH, file_name)

        # Проверка на наличие '../' в имени файла
        if '..' in file_name or file_name.startswith('/'):
            raise HTTPException(status_code=400, detail="Invalid file name")  # Переведено на английский

        # Сохранение файла с обработкой ошибок
        try:
            with open(file_path, "wb") as f:
                f.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")  # Переведено на английский

        # Создание записи в базе данных
        new_media = Media(order_id=order_id, file_type=file_type, file_path=file_path)
        db.add(new_media)
        db.commit()
        db.refresh(new_media)

        return new_media
    except HTTPException as he:
        raise he  # Перебрасываем HTTPException
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the file: {str(e)}")  # Переведено на английский
