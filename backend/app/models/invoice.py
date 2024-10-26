from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class Invoice(Base):
    __tablename__ = 'invoices'

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String, default='unpaid')  # Например, 'unpaid', 'paid'
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Связи
    items = relationship("InvoiceItem", back_populates="invoice")
    order = relationship("Order", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")


class InvoiceItem(Base):
    __tablename__ = 'invoice_items'

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    description = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    # Связи
    invoice = relationship("Invoice", back_populates="items")


