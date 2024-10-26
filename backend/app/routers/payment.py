from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.payment import PaymentCreate, PaymentOut
from app.models.payment import Payment as PaymentModel
from app.models.order import Order
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole
from typing import List
import uuid
import json
from datetime import datetime

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

@router.post("/", response_model=PaymentOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.client]))])
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверяем, что заказ существует
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверяем права доступа
    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для создания платежа для этого заказа")

    transaction_id = str(uuid.uuid4())  # Генерация уникального идентификатора транзакции
    db_payment = PaymentModel(
        order_id=payment.order_id,
        client_id=current_user.id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_details=json.dumps(payment.payment_details),
        status='successful',  # Предположим, что платеж успешен
        transaction_id=transaction_id,
        created_at=datetime.utcnow()
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/{payment_id}", response_model=PaymentOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.client]))])
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")

    # Проверка прав доступа
    if current_user.role == UserRole.client and current_user.id != payment.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому платежу")

    return payment

@router.get("/orders/{order_id}/payments", response_model=List[PaymentOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.client]))])
def get_payments_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверка прав доступа
    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому заказу")

    payments = db.query(PaymentModel).filter(PaymentModel.order_id == order_id).all()
    return payments

