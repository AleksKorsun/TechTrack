import React from 'react';
import { Service } from '../../types'; // Импортируем интерфейс Service

interface TotalSummaryProps {
  services: Service[];
  discount: number;
  tax: number;
}

const TotalSummary: React.FC<TotalSummaryProps> = ({ services, discount, tax }) => {
  const subtotal = services.reduce(
    (acc, service) => acc + service.quantity * service.unitPrice,
    0
  );
  const totalWithDiscount = subtotal - discount;
  const totalWithTax = totalWithDiscount + tax;

  return (
    <div>
      <h3>Сумма по квоте</h3>
      <p>Подытог: {subtotal.toFixed(2)}</p>
      <p>Скидка: {discount.toFixed(2)}</p>
      <p>Налог: {tax.toFixed(2)}</p>
      <p>Итого: {totalWithTax.toFixed(2)}</p>
    </div>
  );
};

export default TotalSummary;
