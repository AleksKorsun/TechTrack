# app/enums.py

from enum import Enum

class UserRole(str, Enum):
    admin = 'admin'
    dispatcher = 'dispatcher'
    technician = 'technician'
    client = 'client'
    marketer = 'marketer'
