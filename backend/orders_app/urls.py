# orders_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_orders, name='get_orders'),  # GET-запрос для получения всех заказов
    path('create/', views.create_order, name='create_order'),  # POST-запрос для создания заказа
    path('search/', views.search_order, name='search_order'),  # GET-запрос для поиска заказа
    path('<int:order_id>/assign-technician/', views.assign_technician, name='assign_technician'),  # Назначение техника
    path('<int:order_id>/update-status/', views.update_order_status, name='update_order_status'),  # Обновление статуса заказа
    path('<int:order_id>/', views.get_order_detail, name='get_order_detail'),
]

