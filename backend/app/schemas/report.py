from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.enums import UserRole

# Схемы для Expenses
class ExpenseBase(BaseModel):
    amount: float
    category: str
    receipt_photo_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseOut(ExpenseBase):
    id: int

    class Config:
        orm_mode = True

# Схемы для Reports
class ReportBase(BaseModel):
    report_text: str
    photos: Optional[List[str]] = []
    videos: Optional[List[str]] = []
    expenses: Optional[List[ExpenseCreate]] = []

class ReportCreate(ReportBase):
    pass

class ReportOut(ReportBase):
    id: int
    order_id: int
    technician_id: int
    created_at: datetime
    expenses: List[ExpenseOut] = []

    class Config:
        orm_mode = True

# Схема для пользователей (User)
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: UserRole

    class Config:
        orm_mode = True

# Схемы для различных отчётов

# Employee Performance Report
class EmployeePerformanceOut(BaseModel):
    employee_id: int
    employee_name: str
    completed_tasks: int
    average_completion_time: float  # Время выполнения задач, в случае отсутствия - 0

    class Config:
        orm_mode = True

# Financial Report
class FinancialReportOut(BaseModel):
    total_revenue: float            # Общая выручка
    paid_orders: int                # Количество оплаченных заказов
    overdue_orders: int             # Количество просроченных заказов
    pending_orders: int             # Количество ожидающих заказов

    class Config:
        orm_mode = True

# Workload Analysis Report
class WorkloadReportOut(BaseModel):
    employee_id: int
    employee_name: str
    task_count: int                  # Количество задач у сотрудника
    average_completion_time: float   # Среднее время выполнения задачи

    class Config:
        orm_mode = True

# Client Statistics Report
class ClientReportOut(BaseModel):
    client_category: str            # Категория клиента
    count: int                      # Количество клиентов в категории

    class Config:
        orm_mode = True

# Order Statistics Report
class OrderReportOut(BaseModel):
    completed: int                  # Завершённые заказы
    active: int                     # Активные заказы
    cancelled: int                  # Отменённые заказы
    average_order_value: float      # Средняя стоимость заказа
    cancellation_rate: float        # Процент отмен заказов

    class Config:
        orm_mode = True

# KPI Report
class KPIReportOut(BaseModel):
    avg_revenue_per_employee: float # Средняя выручка на сотрудника
    client_retention: float         # Удержание клиентов
    conversion_rate: float          # Конверсия

    class Config:
        orm_mode = True
