#orders_app/views.py
from technicians_app.utils import find_best_technician
from .models import Order
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
from technicians_app.models import Technician
from timezonefinder import TimezoneFinder
from pytz import timezone
import pytz

@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Приведение широты и долготы к типу float
            order_latitude = float(data.get('latitude'))
            order_longitude = float(data.get('longitude'))

            # Определяем часовой пояс на основе координат
            tf = TimezoneFinder()
            order_timezone_str = tf.timezone_at(lng=order_longitude, lat=order_latitude)

            if not order_timezone_str:
                return JsonResponse({"error": "Не удалось определить часовой пояс для указанных координат."}, status=400)

            order_timezone = timezone(order_timezone_str)

            # Преобразуем время начала и окончания с учетом часового пояса
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            start_time = datetime.strptime(data['start_time'], '%H:%M:%S').time()
            start_datetime_naive = datetime.combine(start_date, start_time)
            start_datetime = order_timezone.localize(start_datetime_naive)

            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None
            end_time = datetime.strptime(data.get('end_time'), '%H:%M:%S').time() if data.get('end_time') else None

            if end_date and end_time:
                end_datetime_naive = datetime.combine(end_date, end_time)
                end_datetime = order_timezone.localize(end_datetime_naive)
            else:
                end_datetime = None

            qualification = data.get('qualification')

            # Получаем ID техника, если оператор выбрал его вручную
            manual_technician_id = data.get('technician_id')

            # Назначаем техника вручную, если оператор указал ID
            if manual_technician_id:
                best_technician = Technician.objects.get(id=manual_technician_id)
            else:
                # Назначаем техника автоматически, если координаты и квалификация переданы
                best_technician = None
                if order_latitude and order_longitude and qualification:
                    target_time = start_datetime
                    best_technician = find_best_technician(order_latitude, order_longitude, qualification, target_time)

            # Создаем заказ
            new_order = Order.objects.create(
                title=data['title'],
                client_name=data['client_name'],
                phone=data['phone'],
                email=data.get('email'),
                address=data['address'],
                latitude=order_latitude,
                longitude=order_longitude,
                qualification=data.get('qualification'),
                start_date=start_datetime.date(),
                start_time=start_datetime.time(),
                end_date=end_datetime.date() if end_datetime else None,
                end_time=end_datetime.time() if end_datetime else None,
                notes=data.get('notes'),
                status=data.get('status', 'New'),
                technician=best_technician  # Назначаем техника, будь то вручную или автоматически
            )

            return JsonResponse({"message": "Order created", "order_id": new_order.id}, status=201)

        except Technician.DoesNotExist:
            return JsonResponse({"error": "Technician not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": "Failed to create order", "details": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def update_order_status(request, order_id):
    if request.method == 'PATCH':
        try:
            data = json.loads(request.body)
            new_status = data.get('status')

            order = Order.objects.get(id=order_id)
            if new_status:
                order.status = new_status
                order.save()

                return JsonResponse({"message": "Order status updated", "order_id": order.id, "new_status": order.status}, status=200)
            else:
                return JsonResponse({"error": "No status provided"}, status=400)

        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found"}, status=404)
    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def assign_technician(request, order_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            technician_id = data.get('technician_id')

            if not technician_id:
                return JsonResponse({"error": "Technician ID is required"}, status=400)

            order = Order.objects.get(id=order_id)
            technician = Technician.objects.get(id=technician_id)

            order.technician = technician
            order.status = "Assigned"
            order.save()

            return JsonResponse({
                "message": f"Technician {technician_id} assigned to order {order_id}",
                "order_id": order.id,
                "technician_id": technician.id,
                "status": order.status
            }, status=200)
        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found"}, status=404)
        except Technician.DoesNotExist:
            return JsonResponse({"error": "Technician not found"}, status=404)

    return JsonResponse({"error": "Invalid request method"}, status=400)

def get_orders(request):
    orders = Order.objects.all()
    order_list = [{
        "id": order.id,
        "title": order.title,
        "client_name": order.client_name,
        "phone": order.phone,
        "email": order.email,
        "address": order.address,
        "start_date": order.start_date.isoformat(),
        "start_time": order.start_time.strftime('%H:%M:%S'),
        "end_date": order.end_date.isoformat() if order.end_date else None,
        "end_time": order.end_time.strftime('%H:%M:%S') if order.end_time else None,
        "notes": order.notes,
        "status": order.status,
        "technician_id": order.technician.id if order.technician else None
    } for order in orders]

    return JsonResponse(order_list, safe=False)

def search_order(request):
    order_id = request.GET.get('order_id')
    address = request.GET.get('address')

    if order_id:
        order = Order.objects.filter(id=order_id).first()
    elif address:
        order = Order.objects.filter(address=address).first()
    else:
        return JsonResponse({"error": "Invalid search parameters"}, status=400)

    if not order:
        return JsonResponse({"error": "Order not found"}, status=404)

    return JsonResponse({
        "id": order.id,
        "title": order.title,
        "client_name": order.client_name,
        "phone": order.phone,
        "email": order.email,
        "address": order.address,
        "start_date": order.start_date.isoformat(),
        "start_time": order.start_time.strftime('%H:%M:%S'),
        "end_date": order.end_date.isoformat() if order.end_date else None,
        "end_time": order.end_time.strftime('%H:%M:%S') if order.end_time else None,
        "notes": order.notes,
        "status": order.status
    })
def get_order_detail(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        order_data = {
            "id": order.id,
            "title": order.title,
            "client_name": order.client_name,
            "phone": order.phone,
            "email": order.email,
            "address": order.address,
            "start_date": order.start_date.isoformat(),
            "start_time": order.start_time.strftime('%H:%M:%S'),
            "end_date": order.end_date.isoformat() if order.end_date else None,
            "end_time": order.end_time.strftime('%H:%M:%S') if order.end_time else None,
            "notes": order.notes,
            "status": order.status,
            "technician_id": order.technician.id if order.technician else None,
        }
        return JsonResponse(order_data, safe=False)
    except Order.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=404)

