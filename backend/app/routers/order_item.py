from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.order_item import OrderItemCreate, OrderItemOut
from app.models.order_item import OrderItem
from app.models.order import Order
from app.db.session import get_db

router = APIRouter(prefix="/orders/{order_id}/items", tags=["Order Items"])

@router.post("/", response_model=OrderItemOut)
async def add_order_item(
    order_id: int,
    item: OrderItemCreate,
    db: Session = Depends(get_db)
):
    # Проверяем, что заказ существует
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Создаем новый элемент заказа
    db_item = OrderItem(
        order_id=order_id,
        item_type=item.item_type,
        item_id=item.item_id,
        description=item.description,
        quantity=item.quantity,
        unit_price=item.unit_price,
        total=item.quantity * item.unit_price
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=OrderItemOut)
async def update_order_item(
    order_id: int,
    item_id: int,
    item_data: OrderItemCreate,
    db: Session = Depends(get_db)
):
    # Проверяем, что элемент заказа существует
    db_item = db.query(OrderItem).filter(OrderItem.id == item_id, OrderItem.order_id == order_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")

    # Обновляем данные элемента заказа
    for field, value in item_data.dict(exclude_unset=True).items():
        setattr(db_item, field, value)
    db_item.total = db_item.quantity * db_item.unit_price
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
async def delete_order_item(
    order_id: int,
    item_id: int,
    db: Session = Depends(get_db)
):
    db_item = db.query(OrderItem).filter(OrderItem.id == item_id, OrderItem.order_id == order_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Order item deleted successfully"}
