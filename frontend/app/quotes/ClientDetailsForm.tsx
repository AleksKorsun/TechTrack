//quotes/ClientDetailsForm.tsx

import React, { useState, useEffect } from 'react'; // Добавлен импорт useEffect

interface ClientDetailsFormProps {
  onChange: (clientData: any) => void;
}

const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({ onChange }) => {
  const [clientName, setClientName] = useState('');
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
  });

  // Здесь вы можете реализовать автозаполнение из базы данных клиентов
  useEffect(() => {
    const fetchClients = async () => {
      const response = await fetch('/api/clients');
      const clients = await response.json();
      // Установить список клиентов в состояние, если нужно
      console.log(clients); // Это просто для примера
    };
    fetchClients();
  }, []);

  const handleClientChange = () => {
    onChange({ clientName, contactInfo });
  };

  return (
    <div>
      <h3>Данные клиента</h3>
      {/* Поля ввода для имени, контактов и адреса */}
      <input
        type="text"
        placeholder="Имя клиента"
        value={clientName}
        onChange={(e) => {
          setClientName(e.target.value);
          handleClientChange();
        }}
      />
      {/* Дополнительные поля для контактной информации */}
    </div>
  );
};

export default ClientDetailsForm;

