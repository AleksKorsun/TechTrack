# routers/ads.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.ad import Ad
from app.schemas.ad import AdCreate, AdUpdate, AdOut
from app.dependencies import get_db, role_required
from app.enums import UserRole
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/ads",
    tags=["ads"]
)

@router.get("/", response_model=List[AdOut])
async def get_ads(db: Session = Depends(get_db)):
    ads = db.query(Ad).filter(Ad.is_active == True).all()
    return ads

@router.post("/", response_model=AdOut, dependencies=[Depends(role_required([UserRole.admin]))])
async def create_ad(ad: AdCreate, db: Session = Depends(get_db)):
    db_ad = Ad(**ad.dict(), created_at=datetime.utcnow())
    db.add(db_ad)
    db.commit()
    db.refresh(db_ad)
    return db_ad

@router.put("/{ad_id}", response_model=AdOut, dependencies=[Depends(role_required([UserRole.admin]))])
async def update_ad(ad_id: int, ad_update: AdUpdate, db: Session = Depends(get_db)):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Реклама не найдена")
    for key, value in ad_update.dict(exclude_unset=True).items():
        setattr(ad, key, value)
    db.commit()
    db.refresh(ad)
    return ad

@router.delete("/{ad_id}", dependencies=[Depends(role_required([UserRole.admin]))])
async def delete_ad(ad_id: int, db: Session = Depends(get_db)):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Реклама не найдена")
    db.delete(ad)
    db.commit()
    return {"detail": "Реклама удалена"}
