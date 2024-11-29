# app/main.py

from fastapi import FastAPI, Request
from app.routers import auth, users, admin, order, media, technician, payment, invoice, chat, reports, reviews, estimate
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
from app.routers import ads, notifications, finance, integrations
from app.api import payments, webhooks
from fastapi.middleware.cors import CORSMiddleware
from app.logging_config import logger
from starlette.responses import Response
import time  # Для измерения времени обработки запросов

app = FastAPI()

# Настройка CORS
origins = [
    "http://localhost:3000",  # адрес вашего фронтенда
    "http://frontend:3000",   # имя сервиса фронтенда в Docker
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальное логирование запросов и ответов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Логируем входящий запрос
    start_time = time.time()
    logger.info(f"Request: {request.method} {request.url} - Headers: {dict(request.headers)}")
    
    # Обрабатываем запрос
    response: Response = await call_next(request)
    
    # Логируем исходящий ответ
    process_time = time.time() - start_time
    logger.info(
        f"Response: {response.status_code} for {request.method} {request.url} "
        f"- Processed in {process_time:.2f}s"
    )
    
    return response

# Подключение маршрутов
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(order.router)
app.include_router(media.router)
app.include_router(technician.router)
app.include_router(payment.router)
app.include_router(invoice.router)
app.include_router(chat.router)
app.include_router(reports.router, prefix="/api/reports")
app.include_router(reviews.router)
app.include_router(estimate.router)
app.include_router(ads.router)
app.include_router(notifications.router)
app.include_router(finance.router)
app.include_router(integrations.router)
app.include_router(payments.router)
app.include_router(webhooks.router)

# Подключение статических файлов
app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

# Базовый маршрут
@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}






