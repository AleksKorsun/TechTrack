from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.schemas.user import UserOut
from app.schemas.media import MediaOut
from app.schemas.order_item import OrderItemCreate, OrderItemOut  # Импорт схемы OrderItem


class OrderBase(BaseModel):
    service_type: str
    description: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_start_time: Optional[datetime] = None
    scheduled_start_time: Optional[datetime] = None
    scheduled_end_time: Optional[datetime] = None
    estimated_duration_hours: Optional[Decimal] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = []  # Добавляем список позиций в заказ

class OrderUpdate(OrderBase):
    status: Optional[str] = Field(None, description="Статус заказа")
    technician_id: Optional[int] = Field(None, description="ID техника, назначенного на заказ")
    materials_cost: Optional[Decimal] = None
    labor_cost: Optional[Decimal] = None
    equipment_cost: Optional[Decimal] = None

class OrderOut(OrderBase):
    id: int
    client_id: int
    technician_id: Optional[int] = None
    client: UserOut
    technician: Optional[UserOut] = None
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime
    materials_cost: Optional[Decimal] = None
    labor_cost: Optional[Decimal] = None
    equipment_cost: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    media_files: List[MediaOut] = []
    items: List[OrderItemOut] = []  # Добавляем список позиций для отображения


    class Config:
        from_attributes = True
class StatusUpdate(BaseModel):
    status: str = Field(..., description="Статус заказа")