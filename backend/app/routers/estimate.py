

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.estimate import EstimateCreate, EstimateOut, EstimateUpdate
from app.models.estimate import Estimate
from app.models.estimate_item import EstimateItem
from app.models.user import User
from app.models.service import Service
from app.models.material import Material
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole
from typing import List
from datetime import datetime
from app.models.order_item import OrderItem  # Импортируем OrderItem для работы с позициями заказа


router = APIRouter(
    prefix="/estimates",
    tags=["estimates"]
)

# Эндпоинт для создания новой сметы (estimate).
# Этот эндпоинт доступен только для пользователей с ролью technician или admin.
# Он принимает данные сметы, проверяет их корректность, рассчитывает общую сумму с учетом налогов и скидок,
# сохраняет смету и связанные с ней элементы (услуги или материалы) в базу данных.
# После успешного создания возвращает созданную смету.
@router.post("/", response_model=EstimateOut, dependencies=[Depends(role_required([UserRole.technician, UserRole.admin]))])
async def create_estimate(
    estimate: EstimateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверяем, что клиент существует
    client = db.query(User).filter(User.id == estimate.client_id, User.role == UserRole.client).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Рассчитываем общую сумму сметы
    total_amount = 0.0
    for item in estimate.items:
        if item.item_type == 'service':
            # Проверяем, существует ли услуга с указанным ID
            service = db.query(Service).filter(Service.id == item.item_id).first()
            if not service:
                raise HTTPException(status_code=404, detail=f"Service with ID {item.item_id} not found")
            item.unit_price = service.price
        elif item.item_type == 'material':
            # Проверяем, существует ли материал с указанным ID
            material = db.query(Material).filter(Material.id == item.item_id).first()
            if not material:
                raise HTTPException(status_code=404, detail=f"Material with ID {item.item_id} not found")
            item.unit_price = material.price
        else:
            raise HTTPException(status_code=400, detail="Item type must be 'service' or 'material'")
        
        # Рассчитываем стоимость позиции
        total_amount += item.quantity * item.unit_price

    # Применяем скидку и налог к общей сумме
    total_amount -= estimate.discount
    total_amount += total_amount * (estimate.tax / 100)

    # Создаем новую смету (estimate)
    db_estimate = Estimate(
        client_id=estimate.client_id,
        technician_id=current_user.id,
        discount=estimate.discount,
        tax=estimate.tax,
        total=total_amount,
        status='draft',  # Статус сметы по умолчанию
        service_date=estimate.service_date,  # Новое поле: дата выполнения работы
        due_date=estimate.due_date,          # Новое поле: дата оплаты
        job_number=estimate.job_number,      # Новое поле: номер работы
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_estimate)
    db.commit()
    db.refresh(db_estimate)

    # Добавление позиций сметы (EstimateItems)
    for item in estimate.items:
        db_item = EstimateItem(
            estimate_id=db_estimate.id,
            item_type=item.item_type,
            item_id=item.item_id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.quantity * item.unit_price
        )
        db.add(db_item)
    db.commit()
    db.refresh(db_estimate)

    # Возвращаем созданную смету
    return db_estimate



# Эндпоинт для получения данных о смете (estimate).
# Этот эндпоинт возвращает информацию о конкретной смете по ее ID.
# Он доступен для пользователей с ролями client, technician и admin.
# Для клиентов и техников проверяются права доступа на смету:
# Клиент может просматривать только свои сметы, техник — только те, которые ему назначены.

@router.get("/{estimate_id}", response_model=EstimateOut)
async def get_estimate(
    estimate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ищем смету в базе данных по ID
    estimate = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")  # Переведено на английский

    # Проверка прав доступа для клиентов и техников
    if current_user.role == UserRole.client and estimate.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this estimate")  # Переведено на английский
    if current_user.role == UserRole.technician and estimate.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this estimate")  # Переведено на английский

    return estimate  # Возвращаем найденную смету


# Эндпоинт для обновления данных сметы (estimate).
# Доступен для пользователей с ролями technician и admin.
# Техник может обновлять только сметы, которые ему назначены.
# Обновляются только те поля, которые были переданы в запросе (partial update).
@router.put("/{estimate_id}", response_model=EstimateOut, dependencies=[Depends(role_required([UserRole.technician, UserRole.admin]))])
async def update_estimate(
    estimate_id: int,
    estimate_update: EstimateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ищем смету по ID
    estimate = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")  # Переведено на английский

    # Проверка прав доступа для техников
    if current_user.role == UserRole.technician and estimate.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this estimate")  # Переведено на английский

    # Обновление полей сметы (partial update)
    update_data = estimate_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(estimate, key, value)

    # Если обновляются элементы сметы, пересчитываем общую сумму
    if 'items' in update_data:
        # Удаляем старые элементы сметы
        db.query(EstimateItem).filter(EstimateItem.estimate_id == estimate.id).delete()

        total_amount = 0.0
        for item in estimate_update.items:
            if item.item_type == 'service':
                # Проверяем, существует ли услуга
                service = db.query(Service).filter(Service.id == item.item_id).first()
                if not service:
                    raise HTTPException(status_code=404, detail=f"Service with ID {item.item_id} not found")
                item.unit_price = service.price
            elif item.item_type == 'material':
                # Проверяем, существует ли материал
                material = db.query(Material).filter(Material.id == item.item_id).first()
                if not material:
                    raise HTTPException(status_code=404, detail=f"Material with ID {item.item_id} not found")
                item.unit_price = material.price
            else:
                raise HTTPException(status_code=400, detail="Item type must be 'service' or 'material'")
            
            total_amount += item.quantity * item.unit_price

            # Добавляем новые элементы сметы
            db_item = EstimateItem(
                estimate_id=estimate.id,
                item_type=item.item_type,
                item_id=item.item_id,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total=item.quantity * item.unit_price
            )
            db.add(db_item)
        
        # Применяем скидку и налог после обновления элементов сметы
        total_amount -= estimate.discount
        total_amount += total_amount * (estimate.tax / 100)
        estimate.total = total_amount

    # Сохраняем изменения
    db.commit()
    db.refresh(estimate)
    
    # Возвращаем обновленную смету
    return estimate
# Эндпоинт для удаления сметы (estimate).
# Доступен только для пользователей с ролью admin.
# Удаляет смету из базы данных, если она существует.
@router.delete("/{estimate_id}", dependencies=[Depends(role_required([UserRole.admin]))])
async def delete_estimate(
    estimate_id: int,
    db: Session = Depends(get_db)
):
    # Проверяем, существует ли смета
    estimate = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")  # Переведено на английский

    # Удаляем смету из базы данных
    db.delete(estimate)
    db.commit()
    return {"detail": "Estimate successfully deleted"}  # Переведено на английский

# Эндпоинт для одобрения сметы (estimate) клиентом.
# Доступен только для пользователей с ролью client.
# Проверяет, что смета принадлежит текущему клиенту и находится в статусе 'sent'.
# При успешном выполнении смета переводится в статус 'approved'.
@router.post("/{estimate_id}/approve", dependencies=[Depends(role_required([UserRole.client]))])
async def approve_estimate(
    estimate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверяем, существует ли смета
    estimate = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")  # Переведено на английский

    # Проверка прав доступа — клиент может одобрить только свои сметы
    if estimate.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this estimate")  # Переведено на английский

    # Проверяем, что смета имеет статус 'sent'
    if estimate.status != 'sent':
        raise HTTPException(status_code=400, detail="Estimate can only be approved if it is in 'sent' status")  # Переведено на английский

    # Обновляем статус сметы на 'approved'
    estimate.status = 'approved'
    db.commit()
    db.refresh(estimate)
    return {"detail": "Estimate approved"}  # Переведено на английский


# Эндпоинт для отклонения сметы (estimate) клиентом.
# Доступен только для пользователей с ролью client.
# Проверяет, что смета принадлежит текущему клиенту и находится в статусе 'sent'.
# При успешном выполнении смета переводится в статус 'rejected'.
@router.post("/{estimate_id}/reject", dependencies=[Depends(role_required([UserRole.client]))])
async def reject_estimate(
    estimate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверяем, существует ли смета
    estimate = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")  # Переведено на английский

    # Проверка прав доступа для клиента
    if estimate.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this estimate")  # Переведено на английский

    # Проверка статуса сметы
    if estimate.status != 'sent':
        raise HTTPException(status_code=400, detail="Estimate can only be rejected if it is in 'sent' status")  # Переведено на английский

    # Обновляем статус сметы на 'rejected'
    estimate.status = 'rejected'
    db.commit()
    db.refresh(estimate)
    return {"detail": "Estimate rejected"}  # Переведено на английский


# Эндпоинт для отправки сметы (estimate) клиенту.
# Доступен для пользователей с ролями technician и admin.
# Проверяет, что смета находится в статусе 'draft', и отправляет ее клиенту, меняя статус на 'sent'.
# Дополнительно можно настроить уведомление для клиента при отправке сметы.
@router.post("/{estimate_id}/send", dependencies=[Depends(role_required([UserRole.technician, UserRole.admin]))])
async def send_estimate(
    estimate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверяем, существует ли смета
    estimate = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")  # Переведено на английский

    # Проверка прав доступа для техника
    if current_user.role == UserRole.technician and estimate.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this estimate")  # Переведено на английский

    # Проверка статуса сметы
    if estimate.status != 'draft':
        raise HTTPException(status_code=400, detail="Estimate can only be sent if it is in 'draft' status")  # Переведено на английский

    # Обновляем статус сметы на 'sent'
    estimate.status = 'sent'
    db.commit()
    db.refresh(estimate)

    # Здесь можно добавить отправку уведомления клиенту
    return {"detail": "Estimate sent to client"}  # Переведено на английский


# Эндпоинт для преобразования сметы (estimate) в заказ (order).
# Доступен только для пользователей с ролью admin.
# Проверяет, что смета находится в статусе 'approved', и создает новый заказ на основе данных сметы.
# Эндпоинт для преобразования сметы (estimate) в заказ (order).
# Доступен только для пользователей с ролью admin.
# Проверяет, что смета находится в статусе 'approved', и создает новый заказ на основе данных сметы.

@router.post("/{estimate_id}/convert-to-order", dependencies=[Depends(role_required([UserRole.admin]))])
async def convert_estimate_to_order(
    estimate_id: int,
    db: Session = Depends(get_db)
):
    # Проверяем, существует ли смета
    estimate = db.query(Estimate).filter(Estimate.id == estimate_id).first()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")  # Переведено на английский

    # Проверка статуса сметы
    if estimate.status != 'approved':
        raise HTTPException(status_code=400, detail="Only an approved estimate can be converted to an order")  # Переведено на английский

    # Логика создания заказа на основе данных сметы
    from app.models.order import Order
    db_order = Order(
        client_id=estimate.client_id,
        technician_id=estimate.technician_id,
        service_type="Service from estimate",  # Укажите тип сервиса по необходимости
        description=estimate.description,
        address="Address if required",  # Укажите адрес, если нужен
        preferred_start_time=estimate.service_date,  # Соответствие с service_date
        status='pending',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        total_cost=estimate.total,  # Копируем общую стоимость из сметы
        job_number=estimate.job_number,  # Если нужен идентификатор работы
        # Добавьте другие поля при необходимости
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Копирование позиций сметы в заказ
    for item in estimate.items:
        db_order_item = OrderItem(
            order_id=db_order.id,
            item_type=item.item_type,
            item_id=item.item_id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.total
        )
        db.add(db_order_item)
    db.commit()

    return {"detail": "Estimate converted to order", "order_id": db_order.id}  


    

# Эндпоинт для получения списка смет (estimates).
# Доступен для всех ролей, но возвращает только те сметы, которые соответствуют роли пользователя:
# - Администратор видит все сметы.
# - Техник видит только те сметы, которые ему назначены.
# - Клиент видит только свои сметы.

@router.get("/", response_model=List[EstimateOut])
async def get_estimates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Выбираем сметы в зависимости от роли текущего пользователя
    if current_user.role == UserRole.admin:
        estimates = db.query(Estimate).all()
    elif current_user.role == UserRole.technician:
        estimates = db.query(Estimate).filter(Estimate.technician_id == current_user.id).all()
    elif current_user.role == UserRole.client:
        estimates = db.query(Estimate).filter(Estimate.client_id == current_user.id).all()
    else:
        estimates = []
    
    return estimates  # Возвращаем все доступные сметы для пользователя

