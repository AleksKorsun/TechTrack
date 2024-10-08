# technicians_app/urls.py
from django.urls import path
from .views import TechnicianListView, TechnicianDetailView

urlpatterns = [
    path('', TechnicianListView.as_view(), name='technicians_list'),  # Путь для списка техников
    path('<int:pk>/', TechnicianDetailView.as_view(), name='technician_detail'),  # Путь для детальной информации
]


