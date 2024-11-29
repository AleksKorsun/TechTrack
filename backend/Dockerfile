


FROM python:3.10

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем дополнительные зависимости для WeasyPrint
RUN apt-get update && apt-get install -y \
    libpango1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info

# Копируем файлы зависимостей
COPY requirements.txt /app/

# Обновляем pip и устанавливаем зависимости
RUN pip install --upgrade pip
RUN pip install bcrypt==3.2.0
RUN pip install -r requirements.txt

# Копируем остальной код
COPY . /app/

# Открываем порт
EXPOSE 8000

# Запуск сервера FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

