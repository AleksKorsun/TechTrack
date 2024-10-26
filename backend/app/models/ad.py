# models/ad.py

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.db.base_class import Base
from datetime import datetime

class Ad(Base):
    __tablename__ = 'ads'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
