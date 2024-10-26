FROM python:3.10

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY requirements.txt /app/

# Устанавливаем правильную версию bcrypt, затем остальные зависимости
RUN pip install --upgrade pip
RUN pip install bcrypt==3.2.0
RUN pip install -r requirements.txt

# Копируем остальной код
COPY . /app/

# Открываем порт
EXPOSE 8000

# Запуск сервера FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]



