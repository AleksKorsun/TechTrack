from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.review import ReviewCreate, ReviewOut
from app.models.review import Review
from app.models.order import Order
from app.models.user import User
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)

@router.post("/", response_model=ReviewOut, dependencies=[Depends(role_required([UserRole.client]))])
async def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверка существования заказа
    order = db.query(Order).filter(Order.id == review.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверка прав доступа
    if order.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Вы не являетесь владельцем этого заказа")

    # Проверка, что заказ завершён
    if order.status != 'completed':
        raise HTTPException(status_code=400, detail="Отзыв можно оставить только после завершения заказа")

    # Проверка, что отзыв уже не оставлен
    existing_review = db.query(Review).filter(Review.order_id == review.order_id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="Отзыв для этого заказа уже существует")

    # Создание отзыва
    db_review = Review(
        order_id=review.order_id,
        technician_id=review.technician_id,
        client_id=current_user.id,
        rating=review.rating,
        review_text=review.review_text,
        created_at=datetime.utcnow()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    # Обновление рейтинга техники
    technician = db.query(User).filter(User.id == review.technician_id).first()
    if technician:
        technician.update_rating(db)

    return db_review

@router.get("/", response_model=List[ReviewOut])
async def get_reviews(
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).all()
    return reviews

@router.get("/{review_id}", response_model=ReviewOut)
async def get_review(
    review_id: int,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    return review

@router.put("/{review_id}", response_model=ReviewOut, dependencies=[Depends(role_required([UserRole.admin]))])
async def update_review(
    review_id: int,
    review_update: ReviewCreate,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")

    # Обновление полей
    review.rating = review_update.rating
    review.review_text = review_update.review_text
    review.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(review)
    return review

@router.delete("/{review_id}", dependencies=[Depends(role_required([UserRole.admin]))])
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Отзыв не найден")
    db.delete(review)
    db.commit()
    return {"detail": "Отзыв успешно удалён"}
