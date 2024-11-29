// app/clients/[id]/edit/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '../../../utils/apiClient';
import { TextField, Button } from '@mui/material';
import { Client } from '../../../../types';

const EditClientPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await apiClient.get(`/clients/${id}/`);
        setFormData(response.data);
      } catch (error: any) {
        setError('Ошибка при получении данных клиента');
      }
    };

    fetchClient();
  }, [id]);

  if (!formData) {
    return <div>Загрузка...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => prev && { ...prev, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/clients/${id}/`, formData);
      router.push('/clients');
    } catch (error: any) {
      setError('Ошибка при обновлении данных клиента');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Редактировать клиента</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Телефон"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Адрес"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Сохранить
        </Button>
      </form>
    </div>
  );
};

export default EditClientPage;
