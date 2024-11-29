from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List

from app.schemas.report import (
    ReportCreate,
    ReportOut,
    KPIReportOut,
    EmployeePerformanceOut,
    FinancialReportOut,
    WorkloadReportOut,
    ClientReportOut,
    OrderReportOut
)
from app.schemas.user import UserOut
from app.models.report import Report
from app.models.expense import Expense
from app.models.order import Order
from app.models.media import Media
from app.models.user import User
from app.models.client import Client
from app.models.estimate import Estimate
from app.dependencies import get_db, get_current_user, role_required
from app.enums import UserRole

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)



#1. GET /api/employees — Получить список сотрудников
@router.get("/employees", response_model=List[UserOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_employees(db: Session = Depends(get_db)):
    employees = db.query(User).filter(User.role == UserRole.technician).all()
    return employees

#2. GET /api/reports/employee-performance — Производительность сотрудников
@router.get("/employee-performance", response_model=List[EmployeePerformanceOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_employee_performance(
    employee_id: int = None,
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        User.id.label('employee_id'),
        User.name.label('employee_name'),
        func.count(Order.id).label('completed_tasks'),
        func.avg(func.julianday(Order.actual_end_time) - func.julianday(Order.actual_start_time)).label('average_completion_time')
    ).join(Order, Order.technician_id == User.id).filter(Order.status == 'completed')

    if employee_id:
        query = query.filter(User.id == employee_id)

    if start_date and end_date:
        query = query.filter(
            and_(
                Order.actual_end_time >= start_date,
                Order.actual_end_time <= end_date
            )
        )

    query = query.group_by(User.id)
    results = query.all()

    performance_data = [
        EmployeePerformanceOut(
            employee_id=row.employee_id,
            employee_name=row.employee_name,
            completed_tasks=row.completed_tasks,
            average_completion_time=row.average_completion_time or 0
        )
        for row in results
    ]

    return performance_data

# 3. GET /api/reports/financial — Финансовые отчёты
@router.get("/financial", response_model=FinancialReportOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_financial_reports(
    period: str = 'monthly',
    db: Session = Depends(get_db)
):
    end_date = datetime.utcnow()
    if period == 'daily':
        start_date = end_date - timedelta(days=1)
    elif period == 'weekly':
        start_date = end_date - timedelta(weeks=1)
    elif period == 'monthly':
        start_date = end_date - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    total_revenue = db.query(func.sum(Order.total_cost)).filter(Order.created_at.between(start_date, end_date)).scalar() or 0

    paid_orders = db.query(func.count(Order.id)).filter(
        Order.status == 'paid',
        Order.created_at.between(start_date, end_date)
    ).scalar() or 0

    overdue_orders = db.query(func.count(Order.id)).filter(
        Order.status == 'overdue',
        Order.created_at.between(start_date, end_date)
    ).scalar() or 0

    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status == 'pending',
        Order.created_at.between(start_date, end_date)
    ).scalar() or 0

    financial_data = FinancialReportOut(
        total_revenue=total_revenue,
        paid_orders=paid_orders,
        overdue_orders=overdue_orders,
        pending_orders=pending_orders
    )

    return financial_data

#4. GET /api/reports/workload — Анализ загруженности
@router.get("/workload", response_model=List[WorkloadReportOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_workload_analysis(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        User.id.label('employee_id'),
        User.name.label('employee_name'),
        func.count(Order.id).label('task_count'),
        func.avg(func.julianday(Order.actual_end_time) - func.julianday(Order.actual_start_time)).label('average_completion_time')
    ).join(Order, Order.technician_id == User.id)

    if start_date and end_date:
        query = query.filter(
            Order.created_at.between(start_date, end_date)
        )

    query = query.group_by(User.id)
    results = query.all()

    workload_data = [
        WorkloadReportOut(
            employee_id=row.employee_id,
            employee_name=row.employee_name,
            task_count=row.task_count,
            average_completion_time=row.average_completion_time or 0
        )
        for row in results
    ]

    return workload_data

#5. GET /api/reports/clients — Отчётность по клиентам
@router.get("/clients", response_model=List[ClientReportOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_client_reports(db: Session = Depends(get_db)):
    total_clients = db.query(func.count(Client.id)).scalar() or 0

    new_clients = db.query(func.count(Client.id)).filter(
        Client.created_at >= datetime.utcnow() - timedelta(days=30)
    ).scalar() or 0

    # Предполагаем, что частые клиенты — те, у кого более 5 заказов
    frequent_clients = db.query(func.count(Client.id)).join(Order).group_by(Client.id).having(func.count(Order.id) > 5).count()

    client_data = [
        {"client_category": "Всего клиентов", "count": total_clients},
        {"client_category": "Новые клиенты", "count": new_clients},
        {"client_category": "Постоянные клиенты", "count": frequent_clients}
    ]

    return client_data

#6. GET /api/reports/orders — Отчёты по заказам
@router.get("/orders", response_model=OrderReportOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_order_reports(db: Session = Depends(get_db)):
    completed = db.query(func.count(Order.id)).filter(Order.status == 'completed').scalar() or 0
    active = db.query(func.count(Order.id)).filter(Order.status == 'active').scalar() or 0
    cancelled = db.query(func.count(Order.id)).filter(Order.status == 'cancelled').scalar() or 0

    average_order_value = db.query(func.avg(Order.total_cost)).scalar() or 0.0

    total_orders = completed + active + cancelled
    cancellation_rate = (cancelled / total_orders) * 100 if total_orders > 0 else 0.0

    order_data = OrderReportOut(
        completed=completed,
        active=active,
        cancelled=cancelled,
        average_order_value=average_order_value,
        cancellation_rate=cancellation_rate
    )

    return order_data

#7. GET /api/reports/kpi — Аналитика и KPI
@router.get("/kpi", response_model=KPIReportOut, dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_kpi(db: Session = Depends(get_db)):
    # Средний доход на сотрудника
    total_revenue = db.query(func.sum(Order.total_cost)).scalar() or 0.0
    technician_count = db.query(func.count(User.id)).filter(User.role == UserRole.technician).scalar() or 1
    avg_revenue_per_employee = total_revenue / technician_count

    # Показатель удержания клиентов
    total_clients = db.query(func.count(Client.id)).scalar() or 1
    clients_with_orders = db.query(Client).join(Order).filter(
        Order.created_at >= datetime.utcnow() - timedelta(days=30)
    ).distinct().count()
    client_retention = (clients_with_orders / total_clients) * 100

    # Коэффициент конверсии (например, одобренные сметы к общему числу смет)
    total_estimates = db.query(func.count(Estimate.id)).scalar() or 1
    approved_estimates = db.query(func.count(Estimate.id)).filter(Estimate.status == 'approved').scalar() or 0
    conversion_rate = (approved_estimates / total_estimates) * 100

    kpi_data = KPIReportOut(
        avg_revenue_per_employee=avg_revenue_per_employee,
        client_retention=client_retention,
        conversion_rate=conversion_rate
    )

    return kpi_data


@router.post("/orders/{order_id}/report", response_model=ReportOut, dependencies=[Depends(role_required([UserRole.technician]))])
async def create_report(
    order_id: int,
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверка существования заказа
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Проверка прав доступа
    if order.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="Вы не назначены на этот заказ")

    # Создание отчёта
    db_report = Report(
        order_id=order_id,
        technician_id=current_user.id,
        report_text=report.report_text,
        created_at=datetime.utcnow()
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Добавление расходов
    for expense in report.expenses:
        db_expense = Expense(
            report_id=db_report.id,
            amount=expense.amount,
            category=expense.category,
            receipt_photo_url=expense.receipt_photo_url
        )
        db.add(db_expense)

    db.commit()
    db.refresh(db_report)

    # Связывание медиафайлов (фото и видео)
    media_files = db.query(Media).filter(Media.uploader_id == current_user.id, Media.file_url.in_(report.photos + report.videos)).all()
    for media in media_files:
        media.report_id = db_report.id

    db.commit()
    return db_report

@router.get("/", response_model=List[ReportOut], dependencies=[Depends(role_required([UserRole.admin, UserRole.marketer]))])
async def get_reports(
    db: Session = Depends(get_db)
):
    reports = db.query(Report).all()
    return reports

@router.post("/export", dependencies=[Depends(role_required([UserRole.admin]))])
async def export_reports(
    db: Session = Depends(get_db)
):
    # Логика экспорта отчётов (например, генерация CSV или PDF)
    return {"message": "Экспорт отчётов выполнен успешно"}
