// app/clients/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '../../utils/apiClient';
import { Client } from '../../../types';

const ClientDetailsPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await apiClient.get(`/clients/${id}/`);
        setClient(response.data);
      } catch (error: any) {
        setError('Ошибка при получении данных клиента');
      }
    };

    fetchClient();
  }, [id]);

  if (!client) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{client.name}</h1>
      <p>Email: {client.email}</p>
      <p>Телефон: {client.phone}</p>
      <p>Адрес: {client.address}</p>
      {/* Здесь можно добавить историю заказов и другие детали */}
    </div>
  );
};

export default ClientDetailsPage;
