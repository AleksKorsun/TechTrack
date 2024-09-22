import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from myapp import routing  # Замените 'myapp' на ваше приложение, которое отвечает за маршруты

# Устанавливаем настройки Django для techtrack
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techtrack.settings')

# Определяем приложение ASGI, поддерживающее HTTP и WebSocket
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns  # Здесь должны быть определены маршруты WebSocket
        )
    ),
})
