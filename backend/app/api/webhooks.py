# app/api/webhooks.py

import stripe
from fastapi import APIRouter, Request, HTTPException, Depends
from app.core.config import settings
from app.dependencies import get_db
from sqlalchemy.orm import Session
from app.models.payment import Payment as PaymentModel
from app.models.order import Order
import json
from datetime import datetime

router = APIRouter(
    prefix="/webhooks",
    tags=["webhooks"]
)

@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Недопустимое тело запроса
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Недопустимая подпись
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Обработка события
    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        order_id = intent['metadata']['order_id']
        client_id = intent['metadata']['client_id']
        amount = intent['amount_received'] / 100

        # Сохраняем информацию о платеже в базе данных
        payment = PaymentModel(
            order_id=order_id,
            client_id=client_id,
            amount=amount,
            payment_method='stripe',
            payment_details=intent,
            status='successful',
            transaction_id=intent['id'],
            created_at=datetime.utcnow()
        )
        db.add(payment)
        db.commit()

        # Обновляем статус заказа
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = 'paid'
            db.commit()

    return {"status": "success"}

@router.post("/paypal")
async def paypal_webhook(request: Request, db: Session = Depends(get_db)):
    # Здесь вы можете обработать события от PayPal
    event_body = await request.json()
    event_type = event_body['event_type']

    if event_type == 'PAYMENT.CAPTURE.COMPLETED':
        capture = event_body['resource']
        order_id = int(capture['custom_id'])
        transaction_id = capture['id']
        amount = float(capture['amount']['value'])

        # Обновление платежа в базе данных
        payment = PaymentModel(
            order_id=order_id,
            client_id=None,  # Определите client_id, если возможно
            amount=amount,
            payment_method='paypal',
            payment_details=capture,
            status='successful',
            transaction_id=transaction_id,
            created_at=datetime.utcnow()
        )
        db.add(payment)
        db.commit()

        # Обновляем статус заказа
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = 'paid'
            db.commit()

    return {"status": "success"}