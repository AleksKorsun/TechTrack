# create_admin.py
from app.models.user import User
from app.core.security import get_password_hash
from app.enums import UserRole
from app.dependencies import get_db

def create_admin():
    db = next(get_db())
    admin_email = "admin@example.com"
    admin_password = "admin123"
    admin_name = "Admin User"  # Убедитесь, что имя указывается

    # Проверка, существует ли уже админ
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if admin_user:
        print("Администратор уже существует.")
        return

    # Создание нового администратора
    new_admin = User(
        name=admin_name,  # Добавляем имя администратора
        email=admin_email,
        password_hash=get_password_hash(admin_password),
        role=UserRole.admin  # Роль администратора
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    print(f"Администратор создан: {admin_email}")

if __name__ == "__main__":
    create_admin()
