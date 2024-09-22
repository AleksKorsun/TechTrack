# users_app/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('verify_technician/<int:technician_id>/', views.verify_technician, name='verify_technician'),
]
