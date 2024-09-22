# my_housecall_pro/urls.py
from django.contrib import admin
from django.urls import path, include
from users_app.views import register_user, login_user, verify_technician

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Пользовательские маршруты
    path('api/register/', register_user, name='register_user'),
    path('api/login/', login_user, name='login_user'),
    path('api/verify_technician/<int:technician_id>/', verify_technician, name='verify_technician'),

    # Маршруты для заказов
    path('api/orders/', include('orders_app.urls')),  # Это обеспечит доступ к /api/orders/

    # Маршруты для техников
    path('api/technicians/', include('technicians_app.urls')),  # Это обеспечит доступ к /api/technicians/
]

