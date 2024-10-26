// quotes/QuoteItem.tsx

import React from 'react';
import { Service } from '../../types'; // Импорт интерфейса Service

interface QuoteItemProps {
  index: number;
  service: Service;
  onChange: (service: Service) => void;
  onRemove: () => void;
}

const QuoteItem: React.FC<QuoteItemProps> = ({ service, onChange, onRemove }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Если поле `quantity` или `unitPrice`, мы преобразуем значение в число
    const updatedValue = name === 'quantity' || name === 'unitPrice' ? parseFloat(value) : value;

    onChange({ ...service, [name]: updatedValue });
  };

  return (
    <div>
      <input
        type="text"
        name="description"
        placeholder="Описание услуги"
        value={service.description}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="quantity"
        placeholder="Количество"
        value={service.quantity}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="unitPrice"
        placeholder="Цена за единицу"
        value={service.unitPrice}
        onChange={handleInputChange}
      />
      <span>Итого: {service.quantity * service.unitPrice}</span>
      <button type="button" onClick={onRemove}>
        Удалить
      </button>
    </div>
  );
};

export default QuoteItem;

