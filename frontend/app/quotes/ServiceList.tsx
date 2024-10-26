import React from 'react';
import QuoteItem from './QuoteItem';
import { Service } from '../../types'; // Импорт интерфейса Service

interface ServiceListProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, setServices }) => {
  const addService = () => {
    setServices([
      ...services,
      {
        itemType: 'service', // добавляем значение по умолчанию для itemType
        itemId: Date.now(), // генерируем временный уникальный itemId, замените по мере необходимости
        description: '',
        quantity: 1,
        unitPrice: 0
      }
    ]);
  };

  return (
    <div>
      <h3>Список услуг и товаров</h3>
      {services.map((service, index) => (
        <QuoteItem
          key={index}
          index={index}
          service={service}
          onChange={(updatedService) => {
            const newServices = [...services];
            newServices[index] = updatedService;
            setServices(newServices);
          }}
          onRemove={() => {
            const newServices = services.filter((_, i) => i !== index);
            setServices(newServices);
          }}
        />
      ))}
      <button type="button" onClick={addService}>
        Добавить услугу
      </button>
    </div>
  );
};

export default ServiceList;


