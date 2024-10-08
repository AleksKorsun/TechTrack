from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework_simplejwt.tokens import RefreshToken

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            password = data['password']
            email = data['email']
            role = data['role']

            if role not in ['admin', 'technician', 'client']:
                return JsonResponse({"error": "Invalid role"}, status=400)

            # Создаем пользователя
            user = User.objects.create_user(username=username, password=password, email=email)
            
            # Присваиваем группу в зависимости от роли
            if role == 'admin':
                admin_group, _ = Group.objects.get_or_create(name='Admin')
                user.groups.add(admin_group)
            elif role == 'technician':
                technician_group, _ = Group.objects.get_or_create(name='Technician')
                user.groups.add(technician_group)
            elif role == 'client':
                client_group, _ = Group.objects.get_or_create(name='Client')
                user.groups.add(client_group)

            user.save()

            return JsonResponse({"message": "User created successfully", "user_id": user.id}, status=201)
        except Exception as e:
            return JsonResponse({"error": "Failed to register user", "details": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def verify_technician(request, technician_id):
    if request.method == 'POST':
        try:
            user = User.objects.get(id=technician_id)

            # Проверяем, что пользователь состоит в группе "Technician"
            if not user.groups.filter(name='Technician').exists():
                return JsonResponse({"error": "User is not a technician"}, status=400)

            # Логика проверки документов
            # (реализуйте в зависимости от вашей логики)
            user.is_verified = True  # Добавьте это поле в модель или настройте флаг
            user.save()

            return JsonResponse({"message": "Technician verified successfully"}, status=200)
        except User.DoesNotExist:
            return JsonResponse({"error": "Technician not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": "Failed to verify technician", "details": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data['username']
            password = data['password']
            print(f"Attempting to authenticate user: {username}")

            user = authenticate(username=username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                print(f"Authentication successful for user: {user.username}")
                return JsonResponse({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_id': user.id,
                    'groups': [group.name for group in user.groups.all()]  # Возвращаем список групп
                }, status=200)
            else:
                print(f"Authentication failed for user: {username}")
                return JsonResponse({"error": "Invalid credentials"}, status=400)
        except Exception as e:
            print(f"Login error: {e}")
            return JsonResponse({"error": "Login failed", "details": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=400)


