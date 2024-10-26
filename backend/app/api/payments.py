# app/api/payments.py

import stripe
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.schemas.payment import PaymentCreate, PaymentOut
from app.models.payment import Payment as PaymentModel
from app.models.order import Order
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole
from datetime import datetime
from app.core.config import settings
from app.core.email import send_receipt
import paypalrestsdk

# Настройка Stripe API ключа
stripe.api_key = settings.STRIPE_API_KEY

# Настройка PayPal SDK
paypalrestsdk.configure({
    "mode": "sandbox",  # Для боевого режима измените на "live"
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

# Создание платежного намерения для Stripe
@router.post("/stripe/create-payment-intent")
def create_stripe_payment_intent(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверка существования заказа
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Проверка прав доступа
    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="You do not have permission to perform this action")

    try:
        # Создание PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=int(payment.amount * 100),  # Сумма в центах
            currency='usd',
            metadata={'order_id': payment.order_id, 'client_id': current_user.id}
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Создание заказа в PayPal
@router.post("/paypal/create-order")
def create_paypal_order(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверка существования заказа
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Проверка прав доступа
    if current_user.role == UserRole.client and current_user.id != order.client_id:
        raise HTTPException(status_code=403, detail="You do not have permission to perform this action")

    # Создание заказа через PayPal SDK
    paypal_order = paypalrestsdk.Payment({
        "intent": "sale",
        "payer": {"payment_method": "paypal"},
        "transactions": [{
            "amount": {"total": str(payment.amount), "currency": "USD"},
            "description": f"Payment for order #{payment.order_id}"
        }],
        "redirect_urls": {
            "return_url": "http://localhost:8000/payments/execute",
            "cancel_url": "http://localhost:8000/"
        }
    })

    if paypal_order.create():
        return {"id": paypal_order.id}
    else:
        raise HTTPException(status_code=500, detail=str(paypal_order.error))

# Захват заказа в PayPal
@router.post("/paypal/capture-order")
def capture_paypal_order(
    order_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    paypal_order = paypalrestsdk.Payment.find(order_id)

    if paypal_order.execute({"payer_id": current_user.id}):
        capture = paypal_order.transactions[0].related_resources[0].sale

        # Сохранение информации о платеже в базе данных
        payment = PaymentModel(
            order_id=int(paypal_order.transactions[0].invoice_number),
            client_id=current_user.id,
            amount=float(capture.amount["total"]),
            payment_method='paypal',
            payment_details=paypal_order.to_dict(),
            status='successful' if capture.state == 'completed' else 'failed',
            transaction_id=capture.id,
            created_at=datetime.utcnow()
        )
        db.add(payment)
        db.commit()

        # Обновление статуса заказа
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order and capture.state == 'completed':
            order.status = 'paid'
            db.commit()

        # Отправка квитанции по электронной почте
        background_tasks.add_task(
            send_receipt,
            email_to=current_user.email,
            subject="Payment Receipt",
            body=f"Thank you for your payment for order #{order_id}. Amount: ${capture.amount['total']}"
        )

        return {"status": capture.state}
    else:
        raise HTTPException(status_code=500, detail=str(paypal_order.error))


