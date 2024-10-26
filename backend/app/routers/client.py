# routers/clients.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.client import ClientCreate, ClientUpdate, ClientOut
from app.models.client import Client
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole

router = APIRouter(
    prefix="/clients",
    tags=["clients"]
)

# Получить список клиентов
@router.get("/", response_model=List[ClientOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher]))])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clients = db.query(Client).all()
    return clients

# Создать нового клиента
@router.post("/", response_model=ClientOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher]))])
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_client = Client(**client_in.dict())
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

# Получить информацию о клиенте
@router.get("/{client_id}", response_model=ClientOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher]))])
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client

# Обновить информацию о клиенте
@router.put("/{client_id}", response_model=ClientOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.dispatcher]))])
def update_client(
    client_id: int,
    client_in: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    for key, value in client_in.dict(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client

# Удалить клиента
@router.delete("/{client_id}", dependencies=[Depends(role_required([UserRole.admin]))])
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    db.delete(client)
    db.commit()
    return {"detail": "Клиент удалён"}


