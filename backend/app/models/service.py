from sqlalchemy import Column, Integer, Float, String
from app.db.base_class import Base

class Service(Base):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
