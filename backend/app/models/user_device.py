# models/user_device.py

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class UserDevice(Base):
    __tablename__ = 'user_devices'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    device_id = Column(String, nullable=False)
    push_token = Column(String, nullable=False)

    user = relationship('User', back_populates='devices')
