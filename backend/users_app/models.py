from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('technician', 'Technician'),
        ('operator', 'Operator'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')

    # Поля для техников
    documents = models.FileField(upload_to='documents/', null=True, blank=True)
    qualification = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)  # координаты для техников
    longitude = models.FloatField(null=True, blank=True)  # координаты для техников
    rating = models.FloatField(default=0.0, null=True, blank=True)

    # Уникальные related_name для предотвращения конфликта
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True,
        help_text='Specific permissions for this user.'
    )

    def __str__(self):
        return self.username

