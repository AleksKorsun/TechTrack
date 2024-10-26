#app/routers/technicians.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from geopy.distance import geodesic
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.order import Order
from app.schemas.user import UserUpdate, UserOut
from datetime import datetime
from typing import List
from pydantic import BaseModel
from app.enums import UserRole
from app.dependencies import get_current_user, role_required

router = APIRouter(
    prefix="/technicians",
    tags=["technicians"]
)

class TechnicianLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    updated_at: datetime

@router.get("/", response_model=List[UserOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher]))])
async def list_technicians(
    db: Session = Depends(get_db)
):
    # Доступ только для админа и диспетчера
    technicians = db.query(User).filter(User.role == UserRole.technician).all()
    return technicians

@router.get("/{technician_id}", response_model=UserOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher, UserRole.technician]))])
async def get_technician(
    technician_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    technician = db.query(User).filter(User.id == technician_id, User.role == UserRole.technician).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Техник не найден")

    # Техник может видеть только себя, админ и диспетчер - любого
    if current_user.role == UserRole.technician and current_user.id != technician_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для просмотра этого профиля")

    return technician

@router.put("/{technician_id}", response_model=UserOut, dependencies=[Depends(role_required([UserRole.technician]))])
async def update_technician(
    technician_id: int,
    technician_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != technician_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для обновления профиля этого техника")

    technician = db.query(User).filter(User.id == technician_id, User.role == UserRole.technician).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Техник не найден")

    for key, value in technician_update.dict(exclude_unset=True).items():
        setattr(technician, key, value)
    
    db.commit()
    db.refresh(technician)
    return technician

@router.post("/{technician_id}/location", response_model=dict, dependencies=[Depends(role_required([UserRole.technician]))])
async def update_technician_location(
    technician_id: int,
    location_update: TechnicianLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != technician_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для обновления местоположения этого техника")
    
    technician = db.query(User).filter(User.id == technician_id, User.role == UserRole.technician).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Техник не найден")
    
    technician.latitude = location_update.latitude
    technician.longitude = location_update.longitude
    technician.location_updated_at = location_update.updated_at
    
    db.commit()
    db.refresh(technician)
    
    return {
        "message": "Местоположение обновлено.",
        "location": {
            "technician_id": technician.id,
            "latitude": technician.latitude,
            "longitude": technician.longitude,
            "updated_at": technician.location_updated_at.isoformat()
        }
    }

@router.get("/{technician_id}/location", response_model=dict, dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher, UserRole.technician]))])
async def get_technician_location(
    technician_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    technician = db.query(User).filter(User.id == technician_id, User.role == UserRole.technician).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Техник не найден")

    # Техник может видеть только свою локацию, админ и диспетчер - любую
    if current_user.role == UserRole.technician and current_user.id != technician_id:
        raise HTTPException(status_code=403, detail="У вас нет прав для просмотра местоположения этого техника")
    
    return {
        "technician_id": technician.id,
        "latitude": technician.latitude,
        "longitude": technician.longitude,
        "updated_at": technician.location_updated_at.isoformat()
    }
@router.get("/orders/{order_id}/technician-location", dependencies=[Depends(role_required([UserRole.client]))])
async def get_technician_location_for_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    if order.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="У вас нет прав доступа к этому заказу")
    if not order.technician_id:
        raise HTTPException(status_code=400, detail="К заказу не назначен техник")
    
    technician = db.query(User).filter(User.id == order.technician_id).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Техник не найден")
    
    return {
        "technician_id": technician.id,
        "latitude": technician.latitude,
        "longitude": technician.longitude,
        "updated_at": technician.location_updated_at.isoformat()
    }

