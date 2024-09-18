# backend/Dockerfile
FROM python:3.10

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY requirements.txt /app/

# Устанавливаем зависимости
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Копируем всё остальное
COPY . /app/

# Запуск сервера Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

