#app/routers/invoice.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.invoice import InvoiceCreate, InvoiceOut
from app.models.invoice import Invoice as InvoiceModel, InvoiceItem as InvoiceItemModel
from app.models.order import Order
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole
from typing import List
from datetime import datetime
from app.core.email import FastMail, MessageSchema, conf
from fastapi.responses import StreamingResponse
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import func  # Добавлен импорт func для агрегационных функций


router = APIRouter(
    prefix="/invoices",
    tags=["invoices"]
)

@router.post("/", response_model=InvoiceOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.client]))])
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверяем, что заказ существует
    order = db.query(Order).filter(Order.id == invoice.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверяем права доступа
    if current_user.role == UserRole.client and current_user.id != invoice.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для создания счета для этого заказа")

    db_invoice = InvoiceModel(
        order_id=invoice.order_id,
        client_id=invoice.client_id,
        amount=invoice.amount,
        due_date=invoice.due_date,
        status='unpaid',
        tax=invoice.tax,
        discount=invoice.discount,
        notes=invoice.notes,
        created_at=datetime.utcnow()
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    # Добавление позиций счета
    for item in invoice.items:
        db_item = InvoiceItemModel(
            invoice_id=db_invoice.id,  # Используем id вместо invoice_id
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.total
        )
        db.add(db_item)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/", response_model=List[InvoiceOut], dependencies=[Depends(role_required([UserRole.admin]))])
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(InvoiceModel).all()
    return invoices

@router.get("/{id}", response_model=InvoiceOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.client]))])
def get_invoice(
    id: int,  # Заменили invoice_id на id
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == id).first()  # Обновлено
    if not invoice:
        raise HTTPException(status_code=404, detail="Счет не найден")

    # Проверка прав доступа
    if current_user.role == UserRole.client and current_user.id != invoice.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому счету")

    return invoice

@router.put("/{id}", response_model=InvoiceOut, dependencies=[Depends(role_required([UserRole.admin]))])
def update_invoice(
    id: int,  # Заменили invoice_id на id
    invoice_update: InvoiceCreate,
    db: Session = Depends(get_db)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == id).first()  # Обновлено
    if not invoice:
        raise HTTPException(status_code=404, detail="Счет не найден")

    # Обновление полей счета
    update_data = invoice_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(invoice, key, value)

    db.commit()
    db.refresh(invoice)
    return invoice

@router.post("/{id}/send_email", dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher]))])
async def send_invoice_email(id: int, db: Session = Depends(get_db)):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == id).first()  # Обновлено
    if not invoice:
        raise HTTPException(status_code=404, detail="Счет не найден")

    client = invoice.client
    if not client.email:
        raise HTTPException(status_code=400, detail="У клиента нет электронной почты")

    # Генерация HTML содержимого письма
    html = f"""
    <h3>Инвойс #{invoice.id}</h3>
    <p>Сумма: {invoice.amount}</p>
    <p>Срок оплаты: {invoice.due_date}</p>
    """

    message = MessageSchema(
        subject=f"Ваш инвойс #{invoice.id}",
        recipients=[client.email],
        body=html,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {"detail": "Инвойс отправлен по электронной почте"}

@router.get("/{id}/download_pdf", dependencies=[Depends(role_required([UserRole.admin, UserRole.client]))])
def download_invoice_pdf(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == id).first()  # Обновлено
    if not invoice:
        raise HTTPException(status_code=404, detail="Счет не найден")

    # Проверка прав доступа
    if current_user.role == UserRole.client and current_user.id != invoice.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому счету")

    env = Environment(loader=FileSystemLoader('app/templates'))
    template = env.get_template('invoice_template.html')
    html_content = template.render(invoice=invoice)

    pdf = HTML(string=html_content).write_pdf()

    return StreamingResponse(
        iter([pdf]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{invoice.id}.pdf"}
    )

@router.get("/reports/summary", dependencies=[Depends(role_required([UserRole.admin]))])
def get_invoice_summary(db: Session = Depends(get_db)):
    total_invoices = db.query(InvoiceModel).count()
    total_amount = db.query(func.sum(InvoiceModel.amount)).scalar()  # Используем func для агрегации
    paid_invoices = db.query(InvoiceModel).filter(InvoiceModel.status == 'paid').count()
    unpaid_invoices = db.query(InvoiceModel).filter(InvoiceModel.status == 'unpaid').count()

    return {
        "total_invoices": total_invoices,
        "total_amount": total_amount,
        "paid_invoices": paid_invoices,
        "unpaid_invoices": unpaid_invoices
    }
@router.get("/{invoice_id}", response_model=InvoiceOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.client]))])
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Счет не найден")

    # Проверка прав доступа
    if current_user.role == UserRole.client and current_user.id != invoice.client_id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому счету")

    return invoice