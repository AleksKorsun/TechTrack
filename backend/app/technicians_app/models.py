from django.db import models

class Technician(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    availability_time = models.DateTimeField()  # Когда техник доступен
    qualification = models.CharField(max_length=255)
    rating = models.FloatField(default=0.0)
    current_order = models.ForeignKey(
        'orders_app.Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_technicians'
    )

    def __str__(self):
        return self.name

    def is_available(self, target_time):
        """
        Проверка, доступен ли техник в указанное время.
        """
        return self.availability_time <= target_time

    def distance_to(self, target_latitude, target_longitude):
        """
        Рассчёт расстояния от текущего местоположения до точки заказа.
        """
        from geopy.distance import geodesic
        technician_location = (self.latitude, self.longitude)
        target_location = (target_latitude, target_longitude)
        return geodesic(technician_location, target_location).km
