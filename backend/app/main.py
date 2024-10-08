from fastapi import FastAPI
from app.routers import auth
from app.database import SessionLocal, engine, Base

# Создаем все таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Маршрут для корневого URL
@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}

# Подключаем роутеры
app.include_router(auth.router)



