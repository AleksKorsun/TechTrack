# models/integration.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.base_class import Base
from datetime import datetime

class Integration(Base):
    __tablename__ = 'integrations'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    api_key = Column(String)
    is_connected = Column(Boolean, default=False)
    connected_at = Column(DateTime)
