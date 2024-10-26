# app/main.py

from fastapi import FastAPI
from app.routers import auth, users, admin, order, media, technician, payment, invoice, chat, reports, reviews, estimate
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
from app.routers import ads, notifications, finance, integrations
from app.api import payments, webhooks

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}





