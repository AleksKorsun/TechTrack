# technicians_app/utils.py

from geopy.distance import geodesic
from technicians_app.models import Technician
from datetime import datetime

def find_best_technician(order_latitude, order_longitude, qualification, target_time):
    # Фильтрация по квалификации и доступности
    available_technicians = Technician.objects.filter(
        qualification=qualification
    ).filter(
        availability_time__lte=target_time
    )

    # Сортировка по расстоянию и рейтингу
    sorted_technicians = sorted(
        available_technicians,
        key=lambda technician: (
            geodesic((order_latitude, order_longitude), (technician.latitude, technician.longitude)).kilometers,  # Расстояние
            -technician.rating  # Рейтинг (от большего к меньшему)
        )
    )

    if sorted_technicians:
        return sorted_technicians[0]  # Возвращаем ближайшего техника
    else:
        return None
