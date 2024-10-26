# routers/finance.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.finance import Payroll, Income
from app.schemas.finance import PayrollCreate, IncomeCreate
from app.models.user import User
from app.dependencies import get_db, role_required
from app.enums import UserRole
from datetime import datetime
from app.models.expense import Expense
from app.schemas.finance import ExpenseCreate



router = APIRouter(
    prefix="/finance",
    tags=["finance"]
)

@router.post("/payroll", dependencies=[Depends(role_required([UserRole.admin]))])
async def create_payroll(payroll: PayrollCreate, db: Session = Depends(get_db)):
    technician = db.query(User).filter(User.id == payroll.technician_id, User.role == UserRole.technician).first()
    if not technician:
        raise HTTPException(status_code=404, detail="Техник не найден")
    db_payroll = Payroll(**payroll.dict(), created_at=datetime.utcnow())
    db.add(db_payroll)
    db.commit()
    db.refresh(db_payroll)
    return {"detail": "Данные по зарплате отправлены"}

@router.post("/expenses", dependencies=[Depends(role_required([UserRole.admin]))])
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return {"detail": "Данные о расходах отправлены"}

@router.post("/income", dependencies=[Depends(role_required([UserRole.admin]))])
async def create_income(income: IncomeCreate, db: Session = Depends(get_db)):
    db_income = Income(**income.dict())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return {"detail": "Данные о доходах отправлены"}

@router.get("/reports", dependencies=[Depends(role_required([UserRole.admin]))])
async def get_financial_reports(db: Session = Depends(get_db)):
    # Реализуйте логику генерации финансовых отчётов
    return {"detail": "Финансовые отчёты"}
