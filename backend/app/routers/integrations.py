# routers/integrations.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.integration import Integration
from app.schemas.integration import IntegrationCreate, IntegrationOut
from app.dependencies import get_db, role_required
from app.enums import UserRole
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/integrations",
    tags=["integrations"]
)

@router.get("/", response_model=List[IntegrationOut], dependencies=[Depends(role_required([UserRole.admin]))])
async def get_integrations(db: Session = Depends(get_db)):
    integrations = db.query(Integration).all()
    return integrations

@router.post("/", response_model=IntegrationOut, dependencies=[Depends(role_required([UserRole.admin]))])
async def connect_integration(integration: IntegrationCreate, db: Session = Depends(get_db)):
    db_integration = Integration(**integration.dict(), is_connected=True, connected_at=datetime.utcnow())
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    return db_integration

@router.delete("/{integration_id}", dependencies=[Depends(role_required([UserRole.admin]))])
async def disconnect_integration(integration_id: int, db: Session = Depends(get_db)):
    integration = db.query(Integration).filter(Integration.id == integration_id).first()
    if not integration:
        raise HTTPException(status_code=404, detail="Интеграция не найдена")
    integration.is_connected = False
    integration.api_key = None
    integration.connected_at = None
    db.commit()
    return {"detail": "Интеграция отключена"}
