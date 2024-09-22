# technicians_app/views.py

from geopy.distance import geodesic
from django.http import JsonResponse
from technicians_app.models import Technician
from orders_app.models import Order
import json
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from rest_framework import viewsets
from rest_framework import generics
from .models import Technician
from .serializers import TechnicianSerializer

# Представление для списка техников
class TechnicianListView(generics.ListCreateAPIView):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer

# Представление для детального отображения информации о технике
class TechnicianDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer


# Представление для списка техников
class TechnicianListView(generics.ListCreateAPIView):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer

# Представление для детального отображения информации о технике
class TechnicianDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer

# Проверка широты и долготы у заказа
def assign_technician_automatically(order):
    # Проверка широты и долготы
    if not order.latitude or not order.longitude:
        return None

    order_latitude = order.latitude
    order_longitude = order.longitude
    qualification = order.qualification  # Поле квалификации в модели Order

    # Фильтрация техников по квалификации и доступности
    available_technicians = Technician.objects.filter(
        qualification=qualification
    ).filter(
        availability_time__lte=datetime.now()  # Техники, которые доступны сейчас
    )

    # Если нет доступных техников
    if not available_technicians.exists():
        return None

    # Сортировка по расстоянию и рейтингу
    sorted_technicians = sorted(
        available_technicians,
        key=lambda technician: (
            geodesic(
                (order_latitude, order_longitude),
                (technician.latitude, technician.longitude)
            ).kilometers,  # Сортировка по расстоянию
            -technician.rating  # Сортировка по рейтингу (от большего к меньшему)
        )
    )

    # Если есть отсортированные техники, возвращаем ближайшего
    if sorted_technicians:
        return sorted_technicians[0]
    else:
        return None

@csrf_exempt
def assign_technician(request, order_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            manual_technician_id = data.get('technician_id')

            order = Order.objects.get(id=order_id)

            # Если оператор прислал ID техника вручную
            if manual_technician_id:
                technician = Technician.objects.get(id=manual_technician_id)
            else:
                # Иначе автоматический подбор техники
                technician = assign_technician_automatically(order)

            if technician:
                order.technician = technician
                order.status = "Assigned"
                order.save()

                return JsonResponse({
                    "message": f"Technician {technician.id} assigned to order {order.id}",
                    "order_id": order.id,
                    "technician_id": technician.id,
                    "status": order.status
                }, status=200)
            else:
                return JsonResponse({"error": "No technicians available"}, status=404)

        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found"}, status=404)
        except Technician.DoesNotExist:
            return JsonResponse({"error": "Technician not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=400)



