# orders_app/models.py
from django.db import models
from technicians_app.models import Technician
from django.utils import timezone

class Order(models.Model):
    title = models.CharField(max_length=100)  # Это обязательное поле для названия заказа
    client_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, default="000-000-0000")  # Временно устанавливаем значение по умолчанию
    email = models.EmailField(blank=True, null=True)
    address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)  # Широта
    longitude = models.FloatField(null=True, blank=True)  # Долгота
    qualification = models.CharField(max_length=100, default="General")  # Значение по умолчанию для квалификации
    start_date = models.DateField(default=timezone.now)  # Значение по умолчанию для даты
    start_time = models.TimeField(default=timezone.now)  # Значение по умолчанию для времени
    end_date = models.DateField(blank=True, null=True)
    end_time = models.TimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default="New")
    technician = models.ForeignKey(Technician, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title




